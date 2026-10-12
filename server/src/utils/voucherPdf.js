const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const COMPANY_NAME = 'Prachay Securities Private Limited';
const PAGE = { width: 595.28, height: 841.89, margin: 42 };
const COLORS = {
  ink: '#1c2b24',
  muted: '#5d6f66',
  line: '#d5e0da',
  brand: '#1f6b4a',
  brandSoft: '#e8f5ee',
  surface: '#f7fbf8',
  white: '#ffffff',
};

const STATUS_LABELS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

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

function loadLogoBuffer() {
  try {
    return fs.readFileSync(path.join(__dirname, '../../../client/public/company_logo.png'));
  } catch {
    return null;
  }
}

async function loadImageBuffer(url) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function drawLabeledValue(doc, x, y, label, value, width) {
  doc
    .fillColor(COLORS.muted)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(String(label).toUpperCase(), x, y, { width, lineGap: 1 });
  doc
    .fillColor(COLORS.ink)
    .font('Helvetica')
    .fontSize(11)
    .text(value || '—', x, y + 12, { width });
}

function drawSectionTitle(doc, title, y) {
  doc
    .fillColor(COLORS.brand)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(title, PAGE.margin, y);
  const lineY = y + 16;
  doc
    .moveTo(PAGE.margin, lineY)
    .lineTo(PAGE.width - PAGE.margin, lineY)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();
  return lineY + 12;
}

function drawSignatureBox(doc, x, y, width, height, title, imageBuffer) {
  doc
    .roundedRect(x, y, width, height, 8)
    .fillAndStroke(COLORS.white, COLORS.line);

  doc
    .fillColor(COLORS.muted)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(title.toUpperCase(), x + 10, y + 10, { width: width - 20 });

  if (imageBuffer) {
    try {
      doc.image(imageBuffer, x + 14, y + 28, {
        fit: [width - 28, height - 42],
        align: 'center',
        valign: 'center',
      });
      return;
    } catch {
      // fall through to placeholder text
    }
  }

  doc
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(10)
    .text('Not available', x + 10, y + height / 2, {
      width: width - 20,
      align: 'center',
    });
}

async function buildVoucherPdf(voucher) {
  const logoBuffer = loadLogoBuffer();
  const [employeeSignature, directorSignature] = await Promise.all([
    loadImageBuffer(voucher.employee_signature_url),
    loadImageBuffer(voucher.director_signature_url),
  ]);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: PAGE.margin,
      info: {
        Title: `${voucher.voucher_number} — Expense Voucher`,
        Author: COMPANY_NAME,
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const contentWidth = PAGE.width - PAGE.margin * 2;
    let y = PAGE.margin;

    // Header band
    doc.rect(0, 0, PAGE.width, 118).fill(COLORS.brandSoft);
    doc.rect(0, 114, PAGE.width, 4).fill(COLORS.brand);

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, PAGE.margin, 28, { fit: [54, 54] });
      } catch {
        // continue without logo
      }
    }

    const headerX = PAGE.margin + (logoBuffer ? 68 : 0);
    doc
      .fillColor(COLORS.muted)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('EXPENSE VOUCHER', headerX, 30);
    doc
      .fillColor(COLORS.ink)
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(COMPANY_NAME, headerX, 44, { width: contentWidth - 80 });
    doc
      .fillColor(COLORS.brand)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(String(voucher.voucher_number || ''), headerX, 72);
    doc
      .fillColor(COLORS.ink)
      .font('Helvetica')
      .fontSize(10)
      .text(`Status: ${STATUS_LABELS[voucher.status] || voucher.status || '—'}`, headerX, 90);

    y = 140;

    // Date cards
    const cardGap = 12;
    const cardWidth = (contentWidth - cardGap) / 2;
    const cardHeight = 58;

    [
      { label: 'Voucher Date', value: formatDate(voucher.voucher_date), x: PAGE.margin },
      {
        label: 'Expense Date',
        value: formatDate(voucher.expense_date),
        x: PAGE.margin + cardWidth + cardGap,
      },
    ].forEach((card) => {
      doc
        .roundedRect(card.x, y, cardWidth, cardHeight, 10)
        .fillAndStroke(COLORS.white, COLORS.line);
      doc.rect(card.x, y, 4, cardHeight).fill(COLORS.brand);
      drawLabeledValue(doc, card.x + 16, y + 14, card.label, card.value, cardWidth - 28);
    });

    y += cardHeight + 18;

    // Amount banner
    doc.roundedRect(PAGE.margin, y, contentWidth, 64, 10).fillAndStroke(COLORS.surface, COLORS.line);
    drawLabeledValue(doc, PAGE.margin + 16, y + 14, 'Claim Amount', formatMoney(voucher.amount), 180);
    doc
      .fillColor(COLORS.ink)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(voucher.expense_title || '—', PAGE.margin + 210, y + 22, {
        width: contentWidth - 230,
        align: 'right',
      });

    y += 84;
    y = drawSectionTitle(doc, 'Expense Details', y);

    const col = contentWidth / 2;
    drawLabeledValue(doc, PAGE.margin, y, 'Department', voucher.department, col - 12);
    drawLabeledValue(
      doc,
      PAGE.margin + col,
      y,
      'Category',
      voucher.expense_category,
      col - 12
    );
    y += 36;
    drawLabeledValue(doc, PAGE.margin, y, 'Description', voucher.expense_description || '—', contentWidth);
    y += voucher.expense_description ? 52 : 36;

    y = drawSectionTitle(doc, 'Employee', y);
    drawLabeledValue(doc, PAGE.margin, y, 'Name', voucher.employee_name, col - 12);
    drawLabeledValue(
      doc,
      PAGE.margin + col,
      y,
      'Employee ID',
      voucher.employee_code || '—',
      col - 12
    );
    y += 40;

    y = drawSectionTitle(doc, 'Approval', y);
    drawLabeledValue(doc, PAGE.margin, y, 'Director', voucher.director_name || '—', col - 12);
    drawLabeledValue(
      doc,
      PAGE.margin + col,
      y,
      'Approval Date',
      formatDate(voucher.approval_date),
      col - 12
    );
    y += 36;
    if (voucher.rejection_reason) {
      drawLabeledValue(doc, PAGE.margin, y, 'Rejection Reason', voucher.rejection_reason, contentWidth);
      y += 40;
    }

    y = drawSectionTitle(doc, 'Signatures', y);
    const boxWidth = (contentWidth - cardGap) / 2;
    const boxHeight = 110;
    drawSignatureBox(
      doc,
      PAGE.margin,
      y,
      boxWidth,
      boxHeight,
      'Employee Signature',
      employeeSignature
    );
    drawSignatureBox(
      doc,
      PAGE.margin + boxWidth + cardGap,
      y,
      boxWidth,
      boxHeight,
      'Director Signature',
      directorSignature
    );
    y += boxHeight + 28;

    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(9)
      .text(
        `Created: ${formatDate(voucher.created_at)}   ·   Updated: ${formatDate(voucher.updated_at)}`,
        PAGE.margin,
        Math.min(y, PAGE.height - 48),
        { width: contentWidth, align: 'left' }
      );

    doc
      .fillColor(COLORS.muted)
      .fontSize(8)
      .text(
        'Generated for Accounts · Official reimbursement document',
        PAGE.margin,
        PAGE.height - 36,
        { width: contentWidth, align: 'center' }
      );

    doc.end();
  });
}

module.exports = { buildVoucherPdf };
