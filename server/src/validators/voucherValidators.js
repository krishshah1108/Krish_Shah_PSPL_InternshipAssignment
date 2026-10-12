const { body, param, query } = require('express-validator');
const { DEPARTMENTS, EXPENSE_CATEGORIES } = require('../utils/constants');

function todayIsoDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const createValidators = [
  body('department')
    .notEmpty()
    .withMessage('Department is required.')
    .isIn(DEPARTMENTS)
    .withMessage('Invalid department.'),
  body('expenseTitle').trim().notEmpty().withMessage('Expense title is required.'),
  body('expenseCategory')
    .notEmpty()
    .withMessage('Expense category is required.')
    .isIn(EXPENSE_CATEGORIES)
    .withMessage('Invalid expense category.'),
  body('expenseDate')
    .notEmpty()
    .withMessage('Expense date is required.')
    .isISO8601()
    .withMessage('Expense date is invalid.'),
  body('voucherDate')
    .notEmpty()
    .withMessage('Voucher date is required.')
    .isISO8601()
    .withMessage('Voucher date is invalid.')
    .custom((value) => {
      if (!(String(value).slice(0, 10) <= todayIsoDate())) {
        throw new Error('Voucher date cannot be in the future.');
      }
      return true;
    }),
  body('expenseDate').custom((value, { req }) => {
    const expenseDate = String(value).slice(0, 10);
    const voucherDate = req.body.voucherDate
      ? String(req.body.voucherDate).slice(0, 10)
      : null;
    if (!voucherDate) return true;
    if (!(expenseDate <= voucherDate)) {
      throw new Error('Expense date must be on or before the voucher date.');
    }
    return true;
  }),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required.')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero.'),
  body('expenseDescription').optional({ nullable: true }).isString(),
];

const listValidators = [
  query('search').optional().isString(),
  query('searchBy')
    .optional()
    .isIn(['all', 'voucherNumber', 'expenseTitle', 'employeeName']),
  query('employeeName').optional().isString(),
  query('department').optional().isString(),
  query('expenseCategory').optional().isString(),
  query('status').optional().isString(),
  query('expenseDateFrom').optional().isISO8601(),
  query('expenseDateTo').optional().isISO8601(),
  query('amountMin').optional().isFloat(),
  query('amountMax').optional().isFloat(),
  query('sortBy')
    .optional()
    .isIn([
      'voucherNumber',
      'expenseDate',
      'amount',
      'status',
      'department',
      'createdAt',
      'employeeName',
      'expenseTitle',
    ]),
  query('sortOrder').optional().isIn(['asc', 'desc', 'ASC', 'DESC']),
];

const idParam = param('id').isUUID();

const submitValidators = [
  idParam,
  body('employeeSignatureUrl')
    .trim()
    .notEmpty()
    .withMessage('Employee signature is mandatory before submission.')
    .isString()
    .withMessage('Employee signature URL is invalid.'),
];

const approveValidators = [
  idParam,
  body('directorSignatureUrl')
    .trim()
    .notEmpty()
    .withMessage('Director signature is mandatory before approval.')
    .isString()
    .withMessage('Director signature URL is invalid.'),
];

const rejectValidators = [
  idParam,
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is mandatory if a voucher is rejected.'),
];

module.exports = {
  createValidators,
  listValidators,
  idParam,
  submitValidators,
  approveValidators,
  rejectValidators,
};
