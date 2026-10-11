const fs = require('fs');
const path = require('path');

let cachedLogoDataUri = null;

function getCompanyLogoDataUri() {
  if (cachedLogoDataUri !== null) return cachedLogoDataUri;
  try {
    const logoPath = path.join(__dirname, '../../../client/public/company_logo.png');
    const buffer = fs.readFileSync(logoPath);
    cachedLogoDataUri = `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    cachedLogoDataUri = '';
  }
  return cachedLogoDataUri;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_LABELS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

function formatStatus(status) {
  return STATUS_LABELS[status] || String(status || '');
}

function statusTone(status) {
  switch (status) {
    case 'APPROVED':
      return { bg: '#e6f6ec', color: '#0f6b3d', border: '#b7e0c5' };
    case 'REJECTED':
      return { bg: '#fdecec', color: '#b42318', border: '#f0b4b0' };
    case 'PENDING_APPROVAL':
      return { bg: '#e8f2fb', color: '#245b8a', border: '#b7d0e8' };
    default:
      return { bg: '#f3f6f4', color: '#5d6f66', border: '#d5e0da' };
  }
}

function buildVoucherHtml(voucher) {
  const tone = statusTone(voucher.status);
  const logoDataUri = getCompanyLogoDataUri();
  const logoHtml = logoDataUri
    ? `<img class="company-logo" src="${logoDataUri}" alt="Prachay Securities Private Limited logo" />`
    : '';
  const employeeSignature = voucher.employee_signature_url
    ? `<img class="signature-img" src="${escapeHtml(voucher.employee_signature_url)}" alt="Employee signature" />`
    : '<div class="signature-empty">Not available</div>';
  const directorSignature = voucher.director_signature_url
    ? `<img class="signature-img" src="${escapeHtml(voucher.director_signature_url)}" alt="Director signature" />`
    : '<div class="signature-empty">Not available</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(voucher.voucher_number)} — Expense Voucher</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #e8eee9;
      color: #1c2b24;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      box-shadow: 0 18px 40px rgba(28, 43, 36, 0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #155338 0%, #1f6b4a 48%, #163d2c 100%);
      color: #ffffff;
      padding: 22mm 18mm 16mm;
      position: relative;
    }

    .header::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 4px;
      background: linear-gradient(90deg, #7dcea0, #d9efe4, #7dcea0);
    }

    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .brand-left {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .company-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      background: #ffffff;
      border-radius: 12px;
      padding: 6px;
      flex-shrink: 0;
    }

    .brand-kicker {
      margin: 0;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      opacity: 0.8;
      font-weight: 600;
    }

    .brand-name {
      margin: 6px 0 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      max-width: 28ch;
      line-height: 1.2;
    }

    .doc-title {
      margin: 18px 0 0;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    .voucher-no {
      margin: 4px 0 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      margin-top: 12px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: ${tone.bg};
      color: ${tone.color};
      border: 1px solid ${tone.border};
    }

    .date-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: -8px 18mm 0;
      position: relative;
      z-index: 1;
    }

    .date-card {
      background: #ffffff;
      border: 1px solid #d5e0da;
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 10px 24px rgba(28, 43, 36, 0.08);
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 76px;
    }

    .date-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(145deg, #e8f5ee, #d9efe4);
      color: #155338;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.1;
      text-align: center;
      border: 1px solid #cfe5d8;
    }

    .date-card .label {
      margin: 0;
      display: block;
      color: #5d6f66;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .date-card .value {
      margin: 4px 0 0;
      display: block;
      color: #1c2b24;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .content {
      flex: 1;
      padding: 14px 18mm 12mm;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .amount-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
      border-radius: 12px;
      background: #f3f8f5;
      border: 1px solid #d5e0da;
    }

    .amount-banner .label {
      margin: 0;
      color: #5d6f66;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    .amount-banner .value {
      margin: 4px 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #155338;
      letter-spacing: -0.02em;
    }

    .amount-banner .title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      text-align: right;
      max-width: 34ch;
    }

    .section {
      border: 1px solid #d5e0da;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
    }

    .section-head {
      margin: 0;
      padding: 10px 14px;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #155338;
      background: #eef6f1;
      border-bottom: 1px solid #d5e0da;
    }

    .section-body {
      padding: 12px 14px 14px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 18px;
    }

    .field .label {
      display: block;
      color: #5d6f66;
      font-size: 11px;
      margin-bottom: 3px;
    }

    .field .value {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
      word-break: break-word;
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .signature-box {
      border: 1px dashed #c5d4cb;
      border-radius: 10px;
      padding: 12px;
      min-height: 120px;
      background: #fbfcfb;
    }

    .signature-box h3 {
      margin: 0 0 8px;
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #5d6f66;
    }

    .signature-img {
      max-width: 100%;
      max-height: 70px;
      object-fit: contain;
      display: block;
    }

    .signature-empty {
      color: #8a9a92;
      font-size: 13px;
      margin-top: 28px;
    }

    .footer {
      margin-top: auto;
      padding: 10mm 18mm 12mm;
      border-top: 1px solid #d5e0da;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      color: #5d6f66;
      font-size: 11px;
    }

    .footer strong {
      color: #1c2b24;
    }

    @media screen and (max-width: 860px) {
      body { padding: 0; background: #fff; }
      .page {
        width: 100%;
        min-height: auto;
        box-shadow: none;
      }
      .header, .content, .footer { padding-left: 20px; padding-right: 20px; }
      .date-strip { margin-left: 20px; margin-right: 20px; }
      .grid-2, .signatures, .brand-row, .amount-banner, .date-strip {
        grid-template-columns: 1fr;
        display: grid;
      }
      .amount-banner .title { text-align: left; }
    }
  </style>
</head>
<body>
  <article class="page">
    <header class="header">
      <div class="brand-row">
        <div class="brand-left">
          ${logoHtml}
          <div>
            <p class="brand-kicker">Expense Voucher</p>
            <h1 class="brand-name">Prachay Securities Private Limited</h1>
            <p class="doc-title">Official reimbursement document</p>
            <p class="voucher-no">${escapeHtml(voucher.voucher_number)}</p>
            <span class="status-pill">${escapeHtml(formatStatus(voucher.status))}</span>
          </div>
        </div>
      </div>
    </header>

    <section class="date-strip" aria-label="Voucher dates">
      <div class="date-card">
        <div class="date-icon">VCH<br/>DATE</div>
        <div>
          <span class="label">Voucher Date</span>
          <span class="value">${escapeHtml(formatDate(voucher.voucher_date))}</span>
        </div>
      </div>
      <div class="date-card">
        <div class="date-icon">EXP<br/>DATE</div>
        <div>
          <span class="label">Expense Date</span>
          <span class="value">${escapeHtml(formatDate(voucher.expense_date))}</span>
        </div>
      </div>
    </section>

    <main class="content">
      <section class="amount-banner">
        <div>
          <p class="label">Claim Amount</p>
          <p class="value">${escapeHtml(formatMoney(voucher.amount))}</p>
        </div>
        <p class="title">${escapeHtml(voucher.expense_title)}</p>
      </section>

      <section class="section">
        <h2 class="section-head">Expense Details</h2>
        <div class="section-body grid-2">
          <div class="field">
            <span class="label">Department</span>
            <div class="value">${escapeHtml(voucher.department)}</div>
          </div>
          <div class="field">
            <span class="label">Category</span>
            <div class="value">${escapeHtml(voucher.expense_category)}</div>
          </div>
          <div class="field full">
            <span class="label">Description</span>
            <div class="value">${escapeHtml(voucher.expense_description || '—')}</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-head">Employee Information</h2>
        <div class="section-body grid-2">
          <div class="field">
            <span class="label">Employee Name</span>
            <div class="value">${escapeHtml(voucher.employee_name)}</div>
          </div>
          <div class="field">
            <span class="label">Employee ID</span>
            <div class="value">${escapeHtml(voucher.employee_code || '—')}</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-head">Approval Information</h2>
        <div class="section-body grid-2">
          <div class="field">
            <span class="label">Director</span>
            <div class="value">${escapeHtml(voucher.director_name || '—')}</div>
          </div>
          <div class="field">
            <span class="label">Approval Date</span>
            <div class="value">${escapeHtml(formatDate(voucher.approval_date))}</div>
          </div>
          <div class="field full">
            <span class="label">Rejection Reason</span>
            <div class="value">${escapeHtml(voucher.rejection_reason || '—')}</div>
          </div>
        </div>
      </section>

      <section class="signatures">
        <div class="signature-box">
          <h3>Employee Signature</h3>
          ${employeeSignature}
        </div>
        <div class="signature-box">
          <h3>Director Signature</h3>
          ${directorSignature}
        </div>
      </section>
    </main>

    <footer class="footer">
      <div>
        <div><strong>Created:</strong> ${escapeHtml(formatDate(voucher.created_at))}</div>
        <div><strong>Last Updated:</strong> ${escapeHtml(formatDate(voucher.updated_at))}</div>
      </div>
      <div style="text-align:right">
        <div>Generated for Accounts review</div>
        <div>Confidential</div>
      </div>
    </footer>
  </article>
</body>
</html>`;
}

module.exports = { buildVoucherHtml };
