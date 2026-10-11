const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const Response = require('../utils/response');

const getDashboard = asyncHandler(async (req, res) => {
  if (req.user.role === 'EMPLOYEE') {
    const stats = await db.query(
      `SELECT
         COUNT(*)::int AS total_vouchers,
         COUNT(*) FILTER (WHERE status = 'DRAFT')::int AS draft_vouchers,
         COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL')::int AS pending_approval,
         COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved_vouchers,
         COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected_vouchers,
         COALESCE(SUM(amount), 0)::float AS total_amount_claimed
       FROM vouchers
       WHERE employee_id = $1`,
      [req.user.id]
    );

    return Response.success(
      'Dashboard data fetched successfully.',
      {
        totalVouchers: stats.rows[0].total_vouchers,
        draftVouchers: stats.rows[0].draft_vouchers,
        pendingApproval: stats.rows[0].pending_approval,
        approvedVouchers: stats.rows[0].approved_vouchers,
        rejectedVouchers: stats.rows[0].rejected_vouchers,
        totalAmountClaimed: Number(stats.rows[0].total_amount_claimed),
      },
      res
    );
  }

  if (req.user.role === 'DIRECTOR') {
    const stats = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL')::int AS pending_approval_count,
         COUNT(*) FILTER (
           WHERE status = 'APPROVED' AND approval_date::date = CURRENT_DATE
         )::int AS approved_today,
         COUNT(*) FILTER (
           WHERE status = 'REJECTED' AND updated_at::date = CURRENT_DATE
         )::int AS rejected_today,
         COALESCE(
           SUM(amount) FILTER (WHERE status = 'PENDING_APPROVAL'), 0
         )::float AS total_pending_amount
       FROM vouchers`
    );

    const recent = await db.query(
      `SELECT v.id, v.voucher_number, v.amount, v.status, u.name AS employee_name
       FROM vouchers v
       JOIN users u ON u.id = v.employee_id
       ORDER BY v.updated_at DESC
       LIMIT 8`
    );

    return Response.success(
      'Dashboard data fetched successfully.',
      {
        pendingApprovalCount: stats.rows[0].pending_approval_count,
        approvedToday: stats.rows[0].approved_today,
        rejectedToday: stats.rows[0].rejected_today,
        totalPendingAmount: Number(stats.rows[0].total_pending_amount),
        recentActivity: recent.rows.map((row) => ({
          id: row.id,
          voucherNumber: row.voucher_number,
          amount: Number(row.amount),
          status: row.status,
          employeeName: row.employee_name,
        })),
      },
      res
    );
  }

  const stats = await db.query(
    `SELECT
       COUNT(*)::int AS total_vouchers,
       COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL')::int AS pending_approval,
       COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved_vouchers,
       COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected_vouchers,
       COALESCE(SUM(amount) FILTER (WHERE status = 'APPROVED'), 0)::float AS total_approved_amount
     FROM vouchers`
  );

  const recentApproved = await db.query(
    `SELECT v.id, v.voucher_number, v.amount, v.approval_date, u.name AS employee_name
     FROM vouchers v
     JOIN users u ON u.id = v.employee_id
     WHERE v.status = 'APPROVED'
     ORDER BY v.approval_date DESC NULLS LAST
     LIMIT 8`
  );

  return Response.success(
    'Dashboard data fetched successfully.',
    {
      totalVouchers: stats.rows[0].total_vouchers,
      pendingApproval: stats.rows[0].pending_approval,
      approvedVouchers: stats.rows[0].approved_vouchers,
      rejectedVouchers: stats.rows[0].rejected_vouchers,
      totalApprovedExpenseAmount: Number(stats.rows[0].total_approved_amount),
      recentApprovedVouchers: recentApproved.rows.map((row) => ({
        id: row.id,
        voucherNumber: row.voucher_number,
        amount: Number(row.amount),
        employeeName: row.employee_name,
        approvalDate: row.approval_date,
      })),
    },
    res
  );
});

module.exports = { getDashboard };
