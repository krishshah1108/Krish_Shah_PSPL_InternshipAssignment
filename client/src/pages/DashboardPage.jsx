import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFilePlus,
  FiFileText,
  FiInbox,
  FiXCircle,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import LogoLoader from '../components/LogoLoader';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, formatStatus, statusClass } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .dashboard()
      .then((result) => {
        if (active) setData(result);
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
  }, [toast]);

  if (loading) {
    return <LogoLoader fullPage label="Loading dashboard…" />;
  }

  return (
    <div className="stack dashboard-page">
      <header className="page-header surface-header">
        <div>
          <p className="page-eyebrow">Dashboard</p>
          <h1>Welcome, {user.name}</h1>
          <p>Overview of voucher activity for your role.</p>
        </div>
        {user.role === 'EMPLOYEE' && (
          <Link to="/vouchers/new" className="btn btn-primary">
            <FiFilePlus aria-hidden="true" />
            Create Voucher
          </Link>
        )}
      </header>

      {user.role === 'EMPLOYEE' && data && (
        <div className="dashboard-layout">
          <div className="stat-grid">
            <StatCard label="Total Vouchers" value={data.totalVouchers} icon={FiFileText} />
            <StatCard label="Draft" value={data.draftVouchers} accent="muted" icon={FiInbox} />
            <StatCard
              label="Pending"
              value={data.pendingApproval}
              accent="warn"
              icon={FiClock}
            />
            <StatCard
              label="Approved"
              value={data.approvedVouchers}
              accent="ok"
              icon={FiCheckCircle}
            />
            <StatCard
              label="Rejected"
              value={data.rejectedVouchers}
              accent="danger"
              icon={FiXCircle}
            />
            <StatCard
              label="Total Amount Claimed"
              value={formatCurrency(data.totalAmountClaimed)}
            />
          </div>
          {data.draftVouchers > 0 && (
            <section className="tip-banner">
              <p>
                You have <strong>{data.draftVouchers}</strong> draft voucher
                {data.draftVouchers === 1 ? '' : 's'}. Open{' '}
                <Link to="/vouchers" className="link">
                  My Vouchers
                </Link>{' '}
                to edit or submit for approval.
              </p>
            </section>
          )}
        </div>
      )}

      {user.role === 'DIRECTOR' && data && (
        <div className="dashboard-layout dashboard-split">
          <div className="stat-grid stats-compact">
            <StatCard
              label="Pending"
              value={data.pendingApprovalCount}
              accent="warn"
              icon={FiClock}
            />
            <StatCard
              label="Approved Today"
              value={data.approvedToday}
              accent="ok"
              icon={FiCheckCircle}
            />
            <StatCard
              label="Rejected Today"
              value={data.rejectedToday}
              accent="danger"
              icon={FiXCircle}
            />
            <StatCard
              label="Total Pending Amount"
              value={formatCurrency(data.totalPendingAmount)}
            />
          </div>
          <section className="panel activity-panel">
            <div className="panel-head">
              <h2>Recent Voucher Activity</h2>
              <Link to="/vouchers?status=PENDING_APPROVAL" className="link">
                View pending <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
            {!data.recentActivity?.length ? (
              <div className="empty-state results-empty">
                <span className="empty-state-icon" aria-hidden="true">
                  <FiInbox />
                </span>
                <p className="empty-state-title">No recent activity</p>
                <p>Pending vouchers will appear here.</p>
              </div>
            ) : (
              <ul className="activity-list">
                {data.recentActivity.map((item) => (
                  <li key={item.id}>
                    <div>
                      <Link to={`/vouchers/${item.id}`} className="link">
                        {item.voucherNumber}
                      </Link>
                      <p>
                        {item.employeeName} · {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <span className={statusClass(item.status)}>
                      {formatStatus(item.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {user.role === 'ACCOUNTS' && data && (
        <div className="dashboard-layout dashboard-split">
          <div className="stat-grid stats-compact">
            <StatCard label="Total Vouchers" value={data.totalVouchers} icon={FiFileText} />
            <StatCard
              label="Pending"
              value={data.pendingApproval}
              accent="warn"
              icon={FiClock}
            />
            <StatCard
              label="Approved"
              value={data.approvedVouchers}
              accent="ok"
              icon={FiCheckCircle}
            />
            <StatCard
              label="Rejected"
              value={data.rejectedVouchers}
              accent="danger"
              icon={FiXCircle}
            />
            <StatCard
              label="Total Approved Expense"
              value={formatCurrency(data.totalApprovedExpenseAmount)}
            />
          </div>
          <section className="panel activity-panel">
            <div className="panel-head">
              <h2>Recent Approved Vouchers</h2>
              <Link to="/vouchers" className="link">
                View all <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
            {!data.recentApprovedVouchers?.length ? (
              <div className="empty-state results-empty">
                <span className="empty-state-icon" aria-hidden="true">
                  <FiInbox />
                </span>
                <p className="empty-state-title">No approved vouchers yet</p>
                <p>Approved claims will show up here for review.</p>
              </div>
            ) : (
              <ul className="activity-list">
                {data.recentApprovedVouchers.map((item) => (
                  <li key={item.id}>
                    <div>
                      <Link to={`/vouchers/${item.id}`} className="link">
                        {item.voucherNumber}
                      </Link>
                      <p>
                        {item.employeeName} · {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <span className="meta">{formatDate(item.approvalDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
