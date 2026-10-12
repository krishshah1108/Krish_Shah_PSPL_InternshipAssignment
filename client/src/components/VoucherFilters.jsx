import { FiRefreshCw } from 'react-icons/fi';
import VoucherSortControl from './VoucherSortControl';

export default function VoucherFilters({
  filters,
  onChange,
  onReset,
  departments = [],
  expenseCategories = [],
  showEmployeeOption = true,
  validationError = '',
  activeCount = 0,
}) {
  function handleChange(e) {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  }

  return (
    <section className="filter-bar" aria-label="Voucher filters">
      <div className="filter-bar-head">
        <div>
          <h2 className="filter-bar-title">
            Filters
            {activeCount > 0 ? <span className="filter-count">{activeCount}</span> : null}
          </h2>
          <p className="filter-bar-sub">Updates automatically</p>
        </div>
        <div className="filter-bar-actions">
          <VoucherSortControl
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onChange={({ sortBy, sortOrder }) => onChange({ ...filters, sortBy, sortOrder })}
            showEmployeeOption={showEmployeeOption}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            <FiRefreshCw aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <div className="filter-grid">
        <label>
          Department
          <select name="department" value={filters.department} onChange={handleChange}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            name="expenseCategory"
            value={filters.expenseCategory}
            onChange={handleChange}
          >
            <option value="">All categories</option>
            {expenseCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>
      </div>

      <div className="filter-section-row">
        <div className="filter-pair" aria-label="Expense date range">
          <label>
            From date
            <input
              type="date"
              name="expenseDateFrom"
              value={filters.expenseDateFrom}
              onChange={handleChange}
              max={filters.expenseDateTo || undefined}
            />
          </label>
          <span className="filter-pair-sep" aria-hidden="true">
            –
          </span>
          <label>
            To date
            <input
              type="date"
              name="expenseDateTo"
              value={filters.expenseDateTo}
              onChange={handleChange}
              min={filters.expenseDateFrom || undefined}
            />
          </label>
        </div>

        <div className="filter-pair" aria-label="Amount range">
          <label>
            Min amount
            <input
              type="number"
              name="amountMin"
              min="0"
              step="0.01"
              value={filters.amountMin}
              onChange={handleChange}
              placeholder="0.00"
            />
          </label>
          <span className="filter-pair-sep" aria-hidden="true">
            –
          </span>
          <label>
            Max amount
            <input
              type="number"
              name="amountMax"
              min="0"
              step="0.01"
              value={filters.amountMax}
              onChange={handleChange}
              placeholder="0.00"
            />
          </label>
        </div>
      </div>

      {validationError ? (
        <p className="filter-validation" role="alert">
          {validationError}
        </p>
      ) : null}
    </section>
  );
}
