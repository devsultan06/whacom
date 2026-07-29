export interface RawInvoiceItem {
  description: string;
  quantity?: number;
  unitPrice: number;
}

export interface ExtractedInvoiceData {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: RawInvoiceItem[];
  dueDate?: string;
  currency?: string;
  notes?: string;
}

export interface CalculatedInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ProcessedInvoice {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: CalculatedInvoiceItem[];
  currency: string;
  currencySymbol: string;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
}
