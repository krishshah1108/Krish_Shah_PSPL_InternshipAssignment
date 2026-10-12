import { useEffect, useMemo, useState } from 'react';
import { FiFilePlus } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import LogoLoader from '../components/LogoLoader';
import VoucherFilters from '../components/VoucherFilters';
import VoucherSearchBar from '../components/VoucherSearchBar';
import VoucherTable from '../components/VoucherTable';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { defaultExpenseDateRange } from '../utils/dates';
import { countActiveFilters, getFilterValidationError } from '../utils/filterValidation';

const REVIEWER_ROLES = new Set(['DIRECTOR', 'ACCOUNTS']);

function createDefaultFilters(status = '', isReviewer = false) {
  return {
    search: '',
    searchBy: 'all',
    department: '',
    expenseCategory: '',
    status,
    expenseDateFrom: '',
    expenseDateTo: '',
    amountMin: '',
    amountMax: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...(isReviewer ? defaultExpenseDateRange() : {}),
  };
}

export default function VoucherListPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const presetStatus = searchParams.get('status') || '';
  const isReviewer = REVIEWER_ROLES.has(user.role);

  const [filters, setFilters] = useState(() =>
    createDefaultFilters(presetStatus, isReviewer)
  );
  const [vouchers, setVouchers] = useState([]);
  const [options, setOptions] = useState({ departments: [], expenseCategories: [] });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebouncedValue(filters.search, 350);
  const debouncedAmountMin = useDebouncedValue(filters.amountMin, 350);
  const debouncedAmountMax = useDebouncedValue(filters.amountMax, 350);
  const dateDefaults = defaultExpenseDateRange();

  const queryFilters = useMemo(() => {
    const params = {
      search: debouncedSearch.trim(),
      searchBy: filters.searchBy,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (!isReviewer) return params;

    return {
      ...params,
      department: filters.department,
      expenseCategory: filters.expenseCategory,
      status: filters.status,
      expenseDateFrom: filters.expenseDateFrom,
      expenseDateTo: filters.expenseDateTo,
      amountMin: debouncedAmountMin,
      amountMax: debouncedAmountMax,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
  }, [
    isReviewer,
    debouncedSearch,
    debouncedAmountMin,
    debouncedAmountMax,
    filters.searchBy,
    filters.department,
    filters.expenseCategory,
    filters.status,
    filters.expenseDateFrom,
    filters.expenseDateTo,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const validationError = isReviewer ? getFilterValidationError(queryFilters) : '';
  const activeFilterCount = isReviewer
    ? countActiveFilters(queryFilters, presetStatus, dateDefaults)
    : 0;

  useEffect(() => {
    if (!isReviewer) return;
    api.getOptions().then(setOptions).catch(() => {});
  }, [isReviewer]);

  useEffect(() => {
    setFilters((prev) =>
      prev.status === presetStatus ? prev : createDefaultFilters(presetStatus, isReviewer)
    );
  }, [presetStatus, isReviewer]);

  useEffect(() => {
    if (validationError) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    api
      .listVouchers(queryFilters)
      .then((data) => {
        if (active) setVouchers(data);
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
  }, [queryFilters, validationError, toast]);

  const title =
    user.role === 'EMPLOYEE'
      ? 'My Vouchers'
      : filters.status === 'PENDING_APPROVAL'
        ? 'Pending Approvals'
        : 'All Vouchers';

  const resultCount = validationError ? 0 : vouchers.length;

  return (
    <div className="stack voucher-list-page">
      <header className="page-header surface-header">
        <div>
          <p className="page-eyebrow">Vouchers</p>
          <h1>{title}</h1>
          <p>
            {user.role === 'EMPLOYEE'
              ? 'Track and manage vouchers you created.'
              : 'Search, filter, and review vouchers across the organization.'}
          </p>
        </div>
        {user.role === 'EMPLOYEE' && (
          <Link to="/vouchers/new" className="btn btn-primary">
            <FiFilePlus aria-hidden="true" />
            Create Voucher
          </Link>
        )}
      </header>

      <section className="list-controls" aria-label="Search and filters">
        <VoucherSearchBar
          value={filters.search}
          searchBy={filters.searchBy}
          showEmployeeOption={isReviewer}
          onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          onSearchByChange={(searchBy) => setFilters((prev) => ({ ...prev, searchBy }))}
        />

        {isReviewer ? (
          <VoucherFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(createDefaultFilters(presetStatus, true))}
            departments={options.departments}
            expenseCategories={options.expenseCategories}
            showEmployeeOption={isReviewer}
            validationError={validationError}
            activeCount={activeFilterCount}
          />
        ) : null}
      </section>

      <section className="results-panel" aria-live="polite">
        <div className="results-panel-head">
          <div>
            <h2>Results</h2>
            <p className="results-meta">
              {loading
                ? 'Updating list…'
                : `${resultCount} voucher${resultCount === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        {loading ? (
          <LogoLoader label="Loading vouchers…" />
        ) : (
          <VoucherTable
            vouchers={validationError ? [] : vouchers}
            showEmployee={isReviewer}
            emptyMessage={
              validationError
                ? 'Fix the filter values above to see results.'
                : 'No vouchers match your search or filters.'
            }
          />
        )}
      </section>
    </div>
  );
}
