import { FiArrowDown, FiArrowUp } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created' },
  { value: 'expenseDate', label: 'Expense Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' },
  { value: 'voucherNumber', label: 'Voucher No.' },
  { value: 'expenseTitle', label: 'Title' },
  { value: 'employeeName', label: 'Employee' },
];

export default function VoucherSortControl({
  sortBy,
  sortOrder,
  onChange,
  showEmployeeOption = true,
}) {
  const options = showEmployeeOption
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((option) => option.value !== 'employeeName');

  const ascending = sortOrder === 'asc';

  return (
    <div className="sort-control" role="group" aria-label="Sort vouchers">
      <span className="sort-control-label" id="sort-by-label">
        Sort by
      </span>
      <select
        id="sort-by-select"
        name="sortBy"
        className="sort-control-select"
        value={sortBy}
        onChange={(e) => onChange({ sortBy: e.target.value, sortOrder })}
        aria-labelledby="sort-by-label"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={`sort-order-btn ${ascending ? 'is-asc' : 'is-desc'}`}
        onClick={() => onChange({ sortBy, sortOrder: ascending ? 'desc' : 'asc' })}
        aria-label={ascending ? 'Sort ascending' : 'Sort descending'}
        title={ascending ? 'Ascending' : 'Descending'}
      >
        {ascending ? <FiArrowUp aria-hidden="true" /> : <FiArrowDown aria-hidden="true" />}
      </button>
    </div>
  );
}
