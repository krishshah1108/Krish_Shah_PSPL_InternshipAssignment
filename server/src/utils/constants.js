const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Administration',
];

const EXPENSE_CATEGORIES = [
  'Travel',
  'Food & Lodging',
  'Office Supplies',
  'Client Entertainment',
  'Training',
  'Communication',
  'Miscellaneous',
];

const SORTABLE_COLUMNS = {
  voucherNumber: 'v.voucher_number',
  expenseDate: 'v.expense_date',
  amount: 'v.amount',
  status: 'v.status',
  department: 'v.department',
  createdAt: 'v.created_at',
  employeeName: 'u.name',
  expenseTitle: 'v.expense_title',
};

module.exports = { DEPARTMENTS, EXPENSE_CATEGORIES, SORTABLE_COLUMNS };
