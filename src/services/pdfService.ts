import PDFDocument from 'pdfkit';
import { ProcessedInvoice } from '../types/invoice.js';

export function generateInvoicePdf(invoice: ProcessedInvoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const primaryColor = '#1A365D';
    const secondaryColor = '#4A5568';
    const accentColor = '#2B6CB0';
    const borderColor = '#E2E8F0';

    // Header Title
    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('INVOICE', 40, 40);

    doc
      .fillColor(secondaryColor)
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice #: ${invoice.invoiceNumber}`, 40, 70)
      .text(`Date: ${invoice.issueDate}`, 40, 84)
      .text(`Due Date: ${invoice.dueDate}`, 40, 98);

    // Bill To Section
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('BILL TO:', 320, 40);

    doc
      .fillColor(secondaryColor)
      .fontSize(11)
      .font('Helvetica')
      .text(invoice.customerName, 320, 58);

    if (invoice.customerEmail) {
      doc.text(invoice.customerEmail, 320, 74);
    }
    if (invoice.customerPhone) {
      doc.text(invoice.customerPhone, 320, 90);
    }

    // Divider Line
    doc
      .strokeColor(borderColor)
      .lineWidth(1)
      .moveTo(40, 125)
      .lineTo(555, 125)
      .stroke();

    // Table Header
    let yPos = 145;
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold');

    doc.text('DESCRIPTION', 40, yPos);
    doc.text('QTY', 340, yPos, { width: 50, align: 'center' });
    doc.text('UNIT PRICE', 400, yPos, { width: 70, align: 'right' });
    doc.text('AMOUNT', 485, yPos, { width: 70, align: 'right' });

    yPos += 18;
    doc
      .strokeColor(borderColor)
      .lineWidth(1)
      .moveTo(40, yPos)
      .lineTo(555, yPos)
      .stroke();

    // Table Items
    yPos += 10;
    doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);

    invoice.items.forEach((item) => {
      doc.text(item.description, 40, yPos, { width: 280 });
      doc.text(item.quantity.toString(), 340, yPos, { width: 50, align: 'center' });
      doc.text(`${invoice.currencySymbol}${item.unitPrice.toLocaleString()}`, 400, yPos, {
        width: 70,
        align: 'right',
      });
      doc.text(`${invoice.currencySymbol}${item.lineTotal.toLocaleString()}`, 485, yPos, {
        width: 70,
        align: 'right',
      });

      yPos += 24;
    });

    // Summary Section
    yPos += 10;
    doc
      .strokeColor(borderColor)
      .lineWidth(1)
      .moveTo(40, yPos)
      .lineTo(555, yPos)
      .stroke();

    yPos += 15;
    doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);

    // Subtotal
    doc.text('Subtotal:', 380, yPos, { width: 90, align: 'right' });
    doc.text(`${invoice.currencySymbol}${invoice.subtotal.toLocaleString()}`, 485, yPos, {
      width: 70,
      align: 'right',
    });

    if (invoice.taxAmount > 0) {
      yPos += 18;
      doc.text(`Tax (${invoice.taxRatePercent}%):`, 380, yPos, { width: 90, align: 'right' });
      doc.text(`${invoice.currencySymbol}${invoice.taxAmount.toLocaleString()}`, 485, yPos, {
        width: 70,
        align: 'right',
      });
    }

    // Total Amount Highlight
    yPos += 22;
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor(primaryColor);

    doc.text('Total Due:', 380, yPos, { width: 90, align: 'right' });
    doc.text(`${invoice.currencySymbol}${invoice.totalAmount.toLocaleString()}`, 485, yPos, {
      width: 70,
      align: 'right',
    });

    // Notes Footer
    if (invoice.notes) {
      yPos += 45;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(primaryColor)
        .text('Notes / Payment Terms:', 40, yPos);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(secondaryColor)
        .text(invoice.notes, 40, yPos + 15, { width: 500 });
    }

    // Thank you message
    doc
      .font('Helvetica-Oblique')
      .fontSize(9)
      .fillColor(accentColor)
      .text('Thank you for your business!', 40, 780, { align: 'center', width: 515 });

    doc.end();
  });
}
