import { useEffect, useState } from 'react';
import {
  FiArrowLeft,
  FiCheck,
  FiDownload,
  FiEdit2,
  FiSend,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import LogoLoader from '../components/LogoLoader';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, formatStatus, statusClass } from '../utils/format';

export default function VoucherDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [directorFile, setDirectorFile] = useState(null);
  const [directorPreview, setDirectorPreview] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [employeeFile, setEmployeeFile] = useState(null);
  const [employeePreview, setEmployeePreview] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setVoucher(null);
    api
      .getVoucher(id)
      .then((data) => {
        if (!active) return;
        setVoucher(data);
        setEmployeePreview(data.employeeSignatureUrl || '');
        setEmployeeFile(null);
      })
      .catch((err) => {
        if (active) toast.error(err.message || 'Voucher not found.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, toast]);

  useEffect(() => {
    return () => {
      if (employeePreview?.startsWith('blob:')) URL.revokeObjectURL(employeePreview);
      if (directorPreview?.startsWith('blob:')) URL.revokeObjectURL(directorPreview);
    };
  }, [employeePreview, directorPreview]);

  function handleEmployeeFile(e) {
    const file = e.target.files?.[0] || null;
    setEmployeeFile(file);
    if (employeePreview?.startsWith('blob:')) URL.revokeObjectURL(employeePreview);
    if (file) {
      setEmployeePreview(URL.createObjectURL(file));
    } else {
      setEmployeePreview(voucher?.employeeSignatureUrl || '');
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.deleteVoucher(id);
      toast.success('Draft voucher deleted.');
      setDeleteOpen(false);
      navigate('/vouchers', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Unable to delete draft.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    setBusy(true);
    try {
      let signatureUrl = voucher.employeeSignatureUrl;
      if (employeeFile) {
        const uploaded = await api.uploadSignature(employeeFile);
        signatureUrl = uploaded.signatureUrl;
      }
      if (!signatureUrl) {
        toast.error('Employee signature is required before submission.');
        return;
      }
      const updated = await api.submitVoucher(id, signatureUrl);
      setVoucher(updated);
      setEmployeeFile(null);
      setEmployeePreview(updated.employeeSignatureUrl || '');
      toast.success('Voucher submitted for approval.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    setBusy(true);
    try {
      if (!directorFile) {
        toast.error('Director signature is required before approval.');
        return;
      }
      const uploaded = await api.uploadSignature(directorFile);
      const updated = await api.approveVoucher(id, uploaded.signatureUrl);
      setVoucher(updated);
      setDirectorFile(null);
      if (directorPreview?.startsWith('blob:')) URL.revokeObjectURL(directorPreview);
      setDirectorPreview('');
      toast.success('Voucher approved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    try {
      if (!rejectionReason.trim()) {
        toast.error('Rejection reason is required.');
        return;
      }
      const updated = await api.rejectVoucher(id, rejectionReason.trim());
      setVoucher(updated);
      toast.success('Voucher rejected.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    setBusy(true);
    try {
      await api.downloadVoucher(id);
      toast.success('Voucher download started.');
    } catch (err) {
      toast.error(err.message || 'Download failed.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LogoLoader fullPage label="Loading voucher…" />;
  }

  if (!voucher) {
    return (
      <div className="stack">
        <p className="meta">Voucher not found.</p>
        <Link to="/vouchers" className="btn btn-ghost">
          Back to list
        </Link>
      </div>
    );
  }

  const canEmployeeAct =
    user.role === 'EMPLOYEE' &&
    voucher.employeeId === user.id &&
    voucher.status === 'DRAFT';
  const canDirectorAct =
    user.role === 'DIRECTOR' && voucher.status === 'PENDING_APPROVAL';
  const canAccountsExport = user.role === 'ACCOUNTS';
  const signaturePreviewSrc = employeePreview || voucher.employeeSignatureUrl;

  return (
    <div className="stack detail-page">
      {busy && !deleteOpen && (
        <div className="busy-overlay">
          <LogoLoader label="Working…" />
        </div>
      )}

      <header className="detail-hero">
        <div className="detail-hero-copy">
          <p className="page-eyebrow">Voucher detail</p>
          <h1>{voucher.voucherNumber}</h1>
          <p className="detail-hero-title">{voucher.expenseTitle}</p>
          <div className="detail-hero-meta">
            <span className={statusClass(voucher.status)}>
              {formatStatus(voucher.status)}
            </span>
            <span className="meta-pill">{voucher.department}</span>
            <span className="meta-pill">{voucher.expenseCategory}</span>
          </div>
        </div>
        <div className="detail-hero-aside">
          <p className="page-eyebrow">Amount</p>
          <p className="detail-hero-amount">{formatCurrency(voucher.amount)}</p>
          <div className="form-actions">
            {canAccountsExport && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={handleDownload}
              >
                <FiDownload aria-hidden="true" />
                Download PDF
              </button>
            )}
            <Link to="/vouchers" className="btn btn-ghost">
              <FiArrowLeft aria-hidden="true" />
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="detail-layout">
        <section className="panel detail-card">
          <h2>Basic Information</h2>
          <dl className="detail-list detail-list-grid">
            <div>
              <dt>Voucher Date</dt>
              <dd>{formatDate(voucher.voucherDate)}</dd>
            </div>
            <div>
              <dt>Expense Date</dt>
              <dd>{formatDate(voucher.expenseDate)}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{voucher.department}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{voucher.expenseCategory}</dd>
            </div>
            <div className="full">
              <dt>Title</dt>
              <dd>{voucher.expenseTitle}</dd>
            </div>
            <div className="full">
              <dt>Description</dt>
              <dd>{voucher.expenseDescription || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="panel detail-card">
          <h2>Employee</h2>
          <dl className="detail-list detail-list-grid">
            <div>
              <dt>Name</dt>
              <dd>{voucher.employeeName}</dd>
            </div>
            <div>
              <dt>Employee ID</dt>
              <dd>{voucher.employeeCode || '—'}</dd>
            </div>
          </dl>
          <div className="signature-box">
            <p>Employee Signature</p>
            {voucher.employeeSignatureUrl ? (
              <img src={voucher.employeeSignatureUrl} alt="Employee signature" />
            ) : (
              <span className="meta">Not uploaded</span>
            )}
          </div>
        </section>

        <section className="panel detail-card">
          <h2>Approval</h2>
          <dl className="detail-list detail-list-grid">
            <div>
              <dt>Status</dt>
              <dd>{formatStatus(voucher.status)}</dd>
            </div>
            <div>
              <dt>Director</dt>
              <dd>{voucher.directorName || '—'}</dd>
            </div>
            <div>
              <dt>Approval Date</dt>
              <dd>{formatDate(voucher.approvalDate)}</dd>
            </div>
            <div className="full">
              <dt>Rejection Reason</dt>
              <dd>{voucher.rejectionReason || '—'}</dd>
            </div>
          </dl>
          <div className="signature-box">
            <p>Director Signature</p>
            {voucher.directorSignatureUrl ? (
              <img src={voucher.directorSignatureUrl} alt="Director signature" />
            ) : (
              <span className="meta">Not available</span>
            )}
          </div>
        </section>

        <section className="panel detail-card">
          <h2>Audit</h2>
          <dl className="detail-list detail-list-grid">
            <div>
              <dt>Created</dt>
              <dd>{formatDate(voucher.createdAt)}</dd>
            </div>
            <div>
              <dt>Last Updated</dt>
              <dd>{formatDate(voucher.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {canEmployeeAct && (
        <section className="panel action-panel action-panel-elevated">
          <h2>Draft Actions</h2>
          <label>
            <span className="field-label">
              Upload signature<span className="required-mark">*</span>
            </span>
            <input type="file" accept="image/*" onChange={handleEmployeeFile} />
          </label>
          {signaturePreviewSrc ? (
            <div className="signature-preview">
              <p>
                {employeeFile
                  ? 'Signature preview'
                  : 'Saved signature preview'}
              </p>
              <img src={signaturePreviewSrc} alt="Employee signature preview" />
            </div>
          ) : (
            <p className="meta">No signature selected yet. Upload one to preview before submitting.</p>
          )}
          <div className="form-actions">
            <Link to={`/vouchers/${id}/edit`} className="btn btn-secondary">
              <FiEdit2 aria-hidden="true" />
              Edit Draft
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={handleSubmit}
            >
              <FiSend aria-hidden="true" />
              Submit for Approval
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={() => setDeleteOpen(true)}
            >
              <FiTrash2 aria-hidden="true" />
              Delete Draft
            </button>
          </div>
        </section>
      )}

      {canDirectorAct && (
        <section className="panel action-panel action-panel-elevated">
          <h2>Director Decision</h2>
          <p className="meta">Voucher details cannot be modified. Approve or reject only.</p>
          <label>
            <span className="field-label">
              Director Signature<span className="required-mark">*</span>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (directorPreview?.startsWith('blob:')) URL.revokeObjectURL(directorPreview);
                setDirectorFile(file || null);
                setDirectorPreview(file ? URL.createObjectURL(file) : '');
              }}
            />
          </label>
          {directorPreview ? (
            <div className="signature-preview">
              <p>Director signature preview</p>
              <img src={directorPreview} alt="Director signature preview" />
            </div>
          ) : (
            <p className="meta">Director signature is required before approval.</p>
          )}
          <label>
            <span className="field-label">
              Rejection Reason<span className="required-mark">*</span>
            </span>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this voucher is rejected"
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !directorFile}
              onClick={handleApprove}
            >
              <FiCheck aria-hidden="true" />
              Approve
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={handleReject}
            >
              <FiX aria-hidden="true" />
              Reject
            </button>
          </div>
        </section>
      )}

      <ConfirmModal
        open={deleteOpen}
        title="Delete draft voucher?"
        message={`This will permanently delete ${voucher.voucherNumber}. This action cannot be undone.`}
        confirmLabel="Delete Draft"
        cancelLabel="Keep Draft"
        busy={busy}
        onCancel={() => {
          if (!busy) setDeleteOpen(false);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
