export function getFilterValidationError({
  expenseDateFrom,
  expenseDateTo,
  amountMin,
  amountMax,
}) {
  if (expenseDateFrom && expenseDateTo && expenseDateFrom > expenseDateTo) {
    return 'From date cannot be after To date.';
  }

  const min = amountMin === '' ? null : Number(amountMin);
  const max = amountMax === '' ? null : Number(amountMax);

  if (min != null && max != null && Number.isFinite(min) && Number.isFinite(max) && min > max) {
    return 'Minimum amount cannot be greater than maximum amount.';
  }

  return '';
}

export function countActiveFilters(filters, presetStatus = '', defaults = {}) {
  const datesChanged =
    (filters.expenseDateFrom || '') !== (defaults.expenseDateFrom || '') ||
    (filters.expenseDateTo || '') !== (defaults.expenseDateTo || '');

  return [
    filters.search?.trim(),
    filters.department,
    filters.expenseCategory,
    filters.status && filters.status !== presetStatus ? filters.status : '',
    datesChanged ? 'dates' : '',
    filters.amountMin !== '' || filters.amountMax !== '' ? 'amount' : '',
  ].filter(Boolean).length;
}
