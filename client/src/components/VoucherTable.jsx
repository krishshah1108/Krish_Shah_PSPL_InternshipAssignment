import { FiCalendar, FiChevronRight, FiEye, FiInbox, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, formatStatus, statusClass } from '../utils/format';

function VoucherCard({ voucher, showEmployee }) {
  return (
    <article className="voucher-card">
      <div className="voucher-card-top">
        <span className="voucher-no">{voucher.voucherNumber}</span>
        <span className={statusClass(voucher.status)}>{formatStatus(voucher.status)}</span>
      </div>

      <h3 className="voucher-card-title">{voucher.expenseTitle || 'Untitled expense'}</h3>

      <div className="voucher-card-amount-row">
        <span className="voucher-card-amount">{formatCurrency(voucher.amount)}</span>
        <span className="category-chip">{voucher.expenseCategory}</span>
      </div>

      <dl className="voucher-card-meta">
        <div>
          <dt>
            <FiCalendar aria-hidden="true" />
            Expense date
          </dt>
          <dd>{formatDate(voucher.expenseDate)}</dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>{voucher.department}</dd>
        </div>
        {showEmployee ? (
          <div className="voucher-card-meta-full">
            <dt>
              <FiUser aria-hidden="true" />
              Employee
            </dt>
            <dd>{voucher.employeeName}</dd>
          </div>
        ) : null}
      </dl>

      <Link className="voucher-card-action" to={`/vouchers/${voucher.id}`}>
        <span>
          <FiEye aria-hidden="true" />
          View details
        </span>
        <FiChevronRight aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function VoucherTable({ vouchers, showEmployee = true, emptyMessage }) {
  if (!vouchers.length) {
    return (
      <div className="empty-state results-empty">
        <span className="empty-state-icon" aria-hidden="true">
          <FiInbox />
        </span>
        <p className="empty-state-title">No vouchers found</p>
        <p>{emptyMessage || 'Try adjusting your search or filters.'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrap voucher-table-wrap voucher-desktop-list">
        <table className="voucher-table">
          <thead>
            <tr>
              <th>Voucher No.</th>
              <th>Title</th>
              {showEmployee && <th>Employee</th>}
              <th>Department</th>
              <th>Category</th>
              <th>Expense Date</th>
              <th className="col-amount">Amount</th>
              <th>Status</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.id}>
                <td>
                  <span className="voucher-no">{voucher.voucherNumber}</span>
                </td>
                <td className="cell-title" title={voucher.expenseTitle || ''}>
                  {voucher.expenseTitle || '—'}
                </td>
                {showEmployee && (
                  <td>
                    <span className="employee-cell">{voucher.employeeName}</span>
                  </td>
                )}
                <td>{voucher.department}</td>
                <td>
                  <span className="category-chip">{voucher.expenseCategory}</span>
                </td>
                <td className="cell-muted">{formatDate(voucher.expenseDate)}</td>
                <td className="col-amount cell-amount">{formatCurrency(voucher.amount)}</td>
                <td>
                  <span className={statusClass(voucher.status)}>
                    {formatStatus(voucher.status)}
                  </span>
                </td>
                <td className="col-action">
                  <Link
                    className="btn btn-ghost btn-sm btn-view"
                    to={`/vouchers/${voucher.id}`}
                  >
                    <FiEye aria-hidden="true" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="voucher-card-list" aria-label="Voucher list">
        {vouchers.map((voucher) => (
          <VoucherCard key={voucher.id} voucher={voucher} showEmployee={showEmployee} />
        ))}
      </div>
    </>
  );
}
