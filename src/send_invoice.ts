import dotenv from 'dotenv';
dotenv.config();

import { extractInvoiceFromText } from './services/geminiService.js';
import { processExtractedInvoice } from './services/invoiceService.js';
import { generateInvoicePdf } from './services/pdfService.js';
import { sendTextMessage, sendDocumentMessage } from './services/whatsappService.js';

// ✏️  EDIT THIS to test any invoice prompt:
const TEST_PHONE = '2347036886069';
const TEST_MESSAGE = process.argv[2] || 'Create invoice for Acme Corp. App Development ₦500,000. Due Friday.';

async function run() {
  console.log(`\nProcessing: "${TEST_MESSAGE}"\n`);

  await sendTextMessage(TEST_PHONE, `Processing your invoice request...\n\n"${TEST_MESSAGE}"`);

  const rawData = await extractInvoiceFromText(TEST_MESSAGE);
  const invoice = processExtractedInvoice(rawData);
  const pdf = await generateInvoicePdf(invoice);

  const caption =
    `📄 *Invoice Generated Successfully!*\n\n` +
    `*Invoice #:* ${invoice.invoiceNumber}\n` +
    `*Customer:* ${invoice.customerName}\n` +
    `*Total Amount:* ${invoice.currencySymbol}${invoice.totalAmount.toLocaleString()}\n` +
    `*Due Date:* ${invoice.dueDate}`;

  await sendDocumentMessage(TEST_PHONE, pdf, `${invoice.invoiceNumber}.pdf`, caption);
  console.log(`✅ Done! Invoice ${invoice.invoiceNumber} sent to WhatsApp!`);
}

run().catch(console.error);
