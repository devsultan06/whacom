import { z } from 'zod';

export const rawInvoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative('Unit price must be zero or positive'),
});

export const extractedInvoiceSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  items: z.array(rawInvoiceItemSchema).min(1, 'At least one invoice item is required'),
  dueDate: z.string().optional(),
  currency: z.string().default('NGN'),
  notes: z.string().optional(),
});

export type ExtractedInvoiceInput = z.infer<typeof extractedInvoiceSchema>;
