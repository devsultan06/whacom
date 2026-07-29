import { extractedInvoiceSchema } from '../schemas/invoiceSchema.js';
import { ExtractedInvoiceData, ProcessedInvoice, CalculatedInvoiceItem } from '../types/invoice.js';

export function processExtractedInvoice(
  rawData: ExtractedInvoiceData,
  taxRatePercent = 0
): ProcessedInvoice {
  // Validate raw data with Zod
  const validated = extractedInvoiceSchema.parse(rawData);

  const issueDate = new Date().toISOString().split('T')[0];
  
  // Default due date: 7 days from today if not specified
  let dueDate = validated.dueDate;
  if (!dueDate) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    dueDate = d.toISOString().split('T')[0];
  }

  // Calculate items line total
  const items: CalculatedInvoiceItem[] = validated.items.map((item) => {
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const lineTotal = qty * item.unitPrice;
    return {
      description: item.description,
      quantity: qty,
      unitPrice: item.unitPrice,
      lineTotal,
    };
  });

  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const taxAmount = (subtotal * taxRatePercent) / 100;
  const totalAmount = subtotal + taxAmount;

  // Currency symbol mapping
  let currencySymbol = '₦';
  if (validated.currency?.toUpperCase() === 'USD' || validated.currency === '$') {
    currencySymbol = '$';
  } else if (validated.currency?.toUpperCase() === 'EUR' || validated.currency === '€') {
    currencySymbol = '€';
  } else if (validated.currency?.toUpperCase() === 'GBP' || validated.currency === '£') {
    currencySymbol = '£';
  }

  // Generate random invoice reference number
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const dateStr = issueDate.replace(/-/g, '');
  const invoiceNumber = `INV-${dateStr}-${randomId}`;

  return {
    invoiceNumber,
    issueDate,
    dueDate,
    customerName: validated.customerName,
    customerEmail: validated.customerEmail,
    customerPhone: validated.customerPhone,
    items,
    currency: validated.currency || 'NGN',
    currencySymbol,
    subtotal,
    taxRatePercent,
    taxAmount,
    totalAmount,
    notes: validated.notes,
  };
}
