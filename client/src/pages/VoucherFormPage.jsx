import { useEffect, useState } from 'react';
import { FiArrowLeft, FiFileText, FiSave } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import LogoLoader from '../components/LogoLoader';
import { useToast } from '../context/ToastContext';
import { todayIso } from '../utils/dates';

const INITIAL = {
  expenseDate: '',
  department: '',
  expenseTitle: '',
  expenseCategory: '',
  expenseDescription: '',
  amount: '',
  voucherDate: todayIso(),
};

export default function VoucherFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(INITIAL);
  const [options, setOptions] = useState({ departments: [], expenseCategories: [] });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api
      .getVoucher(id)
      .then((voucher) => {
        if (!active) return;
        if (voucher.status !== 'DRAFT') {
          toast.error('Only draft vouchers can be edited.');
          return;
        }
        setForm({
          expenseDate: String(voucher.expenseDate).slice(0, 10),
          department: voucher.department,
          expenseTitle: voucher.expenseTitle,
          expenseCategory: voucher.expenseCategory,
          expenseDescription: voucher.expenseDescription || '',
          amount: String(voucher.amount),
          voucherDate: String(voucher.voucherDate).slice(0, 10),
        });
      })
      .catch((err) => {
        if (active) toast.error(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEdit, toast]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!form.department) {
      toast.error('Department is required.');
      return false;
    }
    if (!form.expenseTitle.trim()) {
      toast.error('Expense title is required.');
      return false;
    }
    if (!form.expenseCategory) {
      toast.error('Expense category is required.');
      return false;
    }
    if (!form.expenseDate) {
      toast.error('Expense date is required.');
      return false;
    }
    if (!form.voucherDate) {
      toast.error('Voucher date must be selected.');
      return false;
    }
    if (form.amount === '' || form.amount === null || form.amount === undefined) {
      toast.error('Amount is required.');
      return false;
    }
    if (Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error('Amount must be greater than zero.');
      return false;
    }
    if (!(form.voucherDate <= todayIso())) {
      toast.error('Voucher date cannot be in the future.');
      return false;
    }
    if (!(form.expenseDate <= form.voucherDate)) {
      toast.error('Expense date must be on or before the voucher date.');
      return false;
    }
    return true;
  }

  async function persist() {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        expenseDate: form.expenseDate,
        department: form.department,
        expenseTitle: form.expenseTitle.trim(),
        expenseCategory: form.expenseCategory,
        expenseDescription: form.expenseDescription,
        amount: Number(form.amount),
        voucherDate: form.voucherDate,
      };

      const voucher = isEdit
        ? await api.updateVoucher(id, payload)
        : await api.createVoucher(payload);

      toast.success(
        isEdit
          ? 'Draft updated successfully.'
          : 'Voucher saved as Draft. You can submit it from the details page.'
      );
      navigate(`/vouchers/${voucher.id}`);
    } catch (err) {
      toast.error(err.message || 'Unable to save voucher.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LogoLoader fullPage label="Loading draft…" />;
  }

  const maxVoucherDate = todayIso();
  const maxExpenseDate = form.voucherDate || maxVoucherDate;

  return (
    <div className="stack form-page">
      {saving && (
        <div className="busy-overlay">
          <LogoLoader label="Saving draft…" />
        </div>
      )}

      <header className="page-header surface-header">
        <div>
          <p className="page-eyebrow">
            <FiFileText aria-hidden="true" />
            {isEdit ? 'Edit draft' : 'New voucher'}
          </p>
          <h1>{isEdit ? 'Edit Draft Voucher' : 'Create Voucher'}</h1>
        </div>
        <Link to="/vouchers" className="btn btn-ghost">
          <FiArrowLeft aria-hidden="true" />
          Back
        </Link>
      </header>

      <form
        className="voucher-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          persist();
        }}
      >
        <div className="voucher-form-grid">
          <label>
            <span className="field-label">
              Voucher Date<span className="required-mark">*</span>
            </span>
            <input
              type="date"
              name="voucherDate"
              value={form.voucherDate}
              onChange={handleChange}
              max={maxVoucherDate}
            />
          </label>

          <label>
            <span className="field-label">
              Expense Date<span className="required-mark">*</span>
            </span>
            <input
              type="date"
              name="expenseDate"
              value={form.expenseDate}
              onChange={handleChange}
              max={maxExpenseDate}
            />
          </label>

          <label>
            <span className="field-label">
              Department<span className="required-mark">*</span>
            </span>
            <select name="department" value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              {options.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="field-label">
              Expense Category<span className="required-mark">*</span>
            </span>
            <select
              name="expenseCategory"
              value={form.expenseCategory}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {options.expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="voucher-form-span-2">
            <span className="field-label">
              Expense Title<span className="required-mark">*</span>
            </span>
            <input
              name="expenseTitle"
              value={form.expenseTitle}
              onChange={handleChange}
              maxLength={200}
              placeholder="e.g. Client visit travel"
            />
          </label>

          <label className="voucher-form-span-2">
            <span className="field-label">Expense Description</span>
            <textarea
              name="expenseDescription"
              value={form.expenseDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes"
            />
          </label>

          <label className="voucher-form-amount">
            <span className="field-label">
              Amount (INR)<span className="required-mark">*</span>
            </span>
            <div className="amount-input">
              <span className="amount-prefix" aria-hidden="true">
                ₹
              </span>
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </label>
        </div>

        <div className="voucher-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FiSave aria-hidden="true" />
            {saving ? 'Saving…' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
