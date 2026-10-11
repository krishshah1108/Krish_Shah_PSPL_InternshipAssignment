const db = require('../config/db');

async function generateVoucherNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `VCH-${yyyy}${mm}${dd}-`;

  const result = await db.query(
    `SELECT voucher_number FROM vouchers
     WHERE voucher_number LIKE $1
     ORDER BY voucher_number DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  let next = 1;
  if (result.rows.length > 0) {
    const last = result.rows[0].voucher_number;
    const seq = parseInt(last.split('-').pop(), 10);
    if (!Number.isNaN(seq)) next = seq + 1;
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
}

module.exports = { generateVoucherNumber };
