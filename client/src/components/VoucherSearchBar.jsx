import { FiSearch, FiX } from 'react-icons/fi';

const SEARCH_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'voucherNumber', label: 'Voucher number' },
  { value: 'expenseTitle', label: 'Title' },
  { value: 'employeeName', label: 'Employee' },
];

const PLACEHOLDERS = {
  all: 'Search voucher number, title, or employee',
  voucherNumber: 'Search voucher number',
  expenseTitle: 'Search expense title',
  employeeName: 'Search employee name',
};

export default function VoucherSearchBar({
  value,
  searchBy,
  onChange,
  onSearchByChange,
  showEmployeeOption = true,
}) {
  const options = showEmployeeOption
    ? SEARCH_OPTIONS
    : SEARCH_OPTIONS.filter((option) => option.value !== 'employeeName');

  const placeholder =
    searchBy === 'all' && !showEmployeeOption
      ? 'Search voucher number or title'
      : PLACEHOLDERS[searchBy] || PLACEHOLDERS.all;

  return (
    <div className="search-control" role="group" aria-label="Search vouchers">
      <span className="search-control-label" id="search-by-label">
        Search by
      </span>
      <select
        id="search-by-select"
        name="searchBy"
        className="search-control-select"
        value={searchBy}
        onChange={(e) => onSearchByChange(e.target.value)}
        aria-labelledby="search-by-label"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="search-control-input">
        <FiSearch aria-hidden="true" />
        <input
          id="voucher-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Search text"
        />
        {value ? (
          <button
            type="button"
            className="search-clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <FiX aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
