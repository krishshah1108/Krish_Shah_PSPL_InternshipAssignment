const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { generateVoucherNumber } = require('../utils/voucherNumber');
const { buildVoucherPdf } = require('../utils/voucherPdf');
const Response = require('../utils/response');
const {
  DEPARTMENTS,
  EXPENSE_CATEGORIES,
  SORTABLE_COLUMNS,
} = require('../utils/constants');

const voucherSelect = `
  SELECT v.*,
         u.name AS employee_name,
         u.employee_id AS employee_code,
         d.name AS director_name
  FROM vouchers v
  JOIN users u ON u.id = v.employee_id
  LEFT JOIN users d ON d.id = v.director_id
`;

function mapVoucher(row) {
  return {
    id: row.id,
    voucherNumber: row.voucher_number,
    voucherDate: row.voucher_date,
    expenseDate: row.expense_date,
    department: row.department,
    expenseTitle: row.expense_title,
    expenseCategory: row.expense_category,
    expenseDescription: row.expense_description,
    amount: Number(row.amount),
    status: row.status,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    employeeCode: row.employee_code,
    employeeSignatureUrl: row.employee_signature_url,
    directorId: row.director_id,
    directorName: row.director_name,
    directorSignatureUrl: row.director_signature_url,
    approvalDate: row.approval_date,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchVoucherById(id) {
  const result = await db.query(`${voucherSelect} WHERE v.id = $1`, [id]);
  return result.rows[0] || null;
}

const getOptions = (req, res) =>
  Response.success(
    'Options fetched successfully.',
    { departments: DEPARTMENTS, expenseCategories: EXPENSE_CATEGORIES },
    res
  );

const listVouchers = asyncHandler(async (req, res) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (req.user.role === 'EMPLOYEE') {
    conditions.push(`v.employee_id = $${idx++}`);
    params.push(req.user.id);
  }

  if (req.query.search) {
    const term = `%${req.query.search}%`;
    const searchBy = req.query.searchBy || 'all';

    if (searchBy === 'voucherNumber') {
      conditions.push(`v.voucher_number ILIKE $${idx++}`);
      params.push(term);
    } else if (searchBy === 'expenseTitle') {
      conditions.push(`v.expense_title ILIKE $${idx++}`);
      params.push(term);
    } else if (searchBy === 'employeeName') {
      conditions.push(`u.name ILIKE $${idx++}`);
      params.push(term);
    } else {
      conditions.push(
        `(v.voucher_number ILIKE $${idx} OR v.expense_title ILIKE $${idx} OR u.name ILIKE $${idx})`
      );
      params.push(term);
      idx += 1;
    }
  }
  if (req.query.employeeName) {
    conditions.push(`u.name ILIKE $${idx++}`);
    params.push(`%${req.query.employeeName}%`);
  }
  if (req.query.department) {
    conditions.push(`v.department = $${idx++}`);
    params.push(req.query.department);
  }
  if (req.query.expenseCategory) {
    conditions.push(`v.expense_category = $${idx++}`);
    params.push(req.query.expenseCategory);
  }
  if (req.query.status) {
    conditions.push(`v.status = $${idx++}`);
    params.push(req.query.status);
  }
  if (req.query.expenseDateFrom) {
    conditions.push(`v.expense_date >= $${idx++}`);
    params.push(req.query.expenseDateFrom);
  }
  if (req.query.expenseDateTo) {
    conditions.push(`v.expense_date <= $${idx++}`);
    params.push(req.query.expenseDateTo);
  }
  if (req.query.amountMin) {
    conditions.push(`v.amount >= $${idx++}`);
    params.push(req.query.amountMin);
  }
  if (req.query.amountMax) {
    conditions.push(`v.amount <= $${idx++}`);
    params.push(req.query.amountMax);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortColumn = SORTABLE_COLUMNS[req.query.sortBy] || SORTABLE_COLUMNS.createdAt;
  const sortOrder = String(req.query.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const result = await db.query(
    `${voucherSelect} ${where} ORDER BY ${sortColumn} ${sortOrder}`,
    params
  );

  return Response.success('Vouchers fetched successfully.', result.rows.map(mapVoucher), res);
});

const getVoucher = asyncHandler(async (req, res) => {
  const voucher = await fetchVoucherById(req.params.id);
  if (!voucher) {
    return Response.error('Voucher not found.', res, Response.code.notFound);
  }

  if (req.user.role === 'EMPLOYEE' && voucher.employee_id !== req.user.id) {
    return Response.error('You can only view your own vouchers.', res, Response.code.forbidden);
  }

  return Response.success('Voucher fetched successfully.', mapVoucher(voucher), res);
});

const createVoucher = asyncHandler(async (req, res) => {
  const voucherNumber = await generateVoucherNumber();
  const {
    expenseDate,
    department,
    expenseTitle,
    expenseCategory,
    expenseDescription,
    amount,
    voucherDate,
  } = req.body;

  const result = await db.query(
    `INSERT INTO vouchers (
       voucher_number, voucher_date, expense_date, department,
       expense_title, expense_category, expense_description, amount,
       status, employee_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT', $9)
     RETURNING id`,
    [
      voucherNumber,
      voucherDate,
      expenseDate,
      department,
      expenseTitle.trim(),
      expenseCategory,
      expenseDescription ?? null,
      amount,
      req.user.id,
    ]
  );

  const createdVoucher = await fetchVoucherById(result.rows[0].id);
  return Response.success(
    'Voucher saved as draft successfully.',
    mapVoucher(createdVoucher),
    res,
    Response.code.created
  );
});

const updateVoucher = asyncHandler(async (req, res) => {
  const existing = await db.query('SELECT * FROM vouchers WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) {
    return Response.error('Voucher not found.', res, Response.code.notFound);
  }

  const voucher = existing.rows[0];
  if (voucher.employee_id !== req.user.id) {
    return Response.error('You can only edit your own vouchers.', res, Response.code.forbidden);
  }
  if (voucher.status !== 'DRAFT') {
    return Response.error('Only draft vouchers can be edited.', res);
  }

  const {
    expenseDate,
    department,
    expenseTitle,
    expenseCategory,
    expenseDescription,
    amount,
    voucherDate,
  } = req.body;

  await db.query(
    `UPDATE vouchers SET
       voucher_date = $1,
       expense_date = $2,
       department = $3,
       expense_title = $4,
       expense_category = $5,
       expense_description = $6,
       amount = $7,
       updated_at = NOW()
     WHERE id = $8`,
    [
      voucherDate,
      expenseDate,
      department,
      expenseTitle.trim(),
      expenseCategory,
      expenseDescription ?? null,
      amount,
      req.params.id,
    ]
  );

  const updated = await fetchVoucherById(req.params.id);
  return Response.success('Draft voucher updated successfully.', mapVoucher(updated), res);
});

const deleteVoucher = asyncHandler(async (req, res) => {
  const existing = await db.query('SELECT * FROM vouchers WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) {
    return Response.error('Voucher not found.', res, Response.code.notFound);
  }

  const voucher = existing.rows[0];
  if (voucher.employee_id !== req.user.id) {
    return Response.error('You can only delete your own vouchers.', res, Response.code.forbidden);
  }
  if (voucher.status !== 'DRAFT') {
    return Response.error('Only draft vouchers can be deleted.', res);
  }

  await db.query('DELETE FROM vouchers WHERE id = $1', [req.params.id]);
  return Response.success('Voucher deleted successfully.', null, res);
});

const submitVoucher = asyncHandler(async (req, res) => {
  const existing = await db.query('SELECT * FROM vouchers WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) {
    return Response.error('Voucher not found.', res, Response.code.notFound);
  }

  const voucher = existing.rows[0];
  if (voucher.employee_id !== req.user.id) {
    return Response.error('You can only submit your own vouchers.', res, Response.code.forbidden);
  }
  if (voucher.status !== 'DRAFT') {
    return Response.error('Only draft vouchers can be submitted.', res);
  }

  const { employeeSignatureUrl } = req.body;

  await db.query(
    `UPDATE vouchers SET
       status = 'PENDING_APPROVAL',
       employee_signature_url = $1,
       updated_at = NOW()
     WHERE id = $2`,
    [employeeSignatureUrl, req.params.id]
  );

  const updated = await fetchVoucherById(req.params.id);
  return Response.success('Voucher submitted for approval.', mapVoucher(updated), res);
});

const approveVoucher = asyncHandler(async (req, res) => {
  const existing = await db.query('SELECT * FROM vouchers WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) {
    return Response.error('Voucher not found.', res, Response.code.notFound);
  }

  const voucher = existing.rows[0];
  if (voucher.status !== 'PENDING_APPROVAL') {
    return Response.error('Only vouchers pending approval can be approved.', res);
  }

  const { directorSignatureUrl } = req.body;

  await db.query(
    `UPDATE vouchers SET
       status = 'APPROVED',
       director_id = $1,
       director_signature_url = $2,
       approval_date = NOW(),
       rejection_reason = NULL,
       updated_at = NOW()
     WHERE id = $3`,
    [req.user.id, directorSignatureUrl, req.params.id]
  );

  const updated = await fetchVoucherById(req.params.id);
  return Response.success('Voucher approved successfully.', mapVoucher(updated), res);
});

const rejectVoucher = asyncHandler(async (req, res) => {
  const existing = await db.query('SELECT * FROM vouchers WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) {
    return Response.error('Voucher not found.', res, Response.code.notFound);
  }

  const voucher = existing.rows[0];
  if (voucher.status !== 'PENDING_APPROVAL') {
    return Response.error('Only vouchers pending approval can be rejected.', res);
  }

  const { rejectionReason } = req.body;

  await db.query(
    `UPDATE vouchers SET
       status = 'REJECTED',
       director_id = $1,
       rejection_reason = $2,
       director_signature_url = NULL,
       approval_date = NULL,
       updated_at = NOW()
     WHERE id = $3`,
    [req.user.id, rejectionReason.trim(), req.params.id]
  );

  const updated = await fetchVoucherById(req.params.id);
  return Response.success('Voucher rejected successfully.', mapVoucher(updated), res);
});

const downloadVoucher = asyncHandler(async (req, res) => {
  const voucher = await fetchVoucherById(req.params.id);
  if (!voucher) {
    return Response.error('Voucher not found.', res, Response.code.notFound);
  }

  const pdf = await buildVoucherPdf(voucher);
  return Response.download(res, pdf, `${voucher.voucher_number}.pdf`, 'application/pdf');
});

module.exports = {
  getOptions,
  listVouchers,
  getVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
  downloadVoucher,
};
