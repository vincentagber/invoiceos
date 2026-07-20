import { z } from 'zod';

export const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
});

export const CreateInvoiceSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  invoiceNumber: z.string().optional(),
  currency: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  discountAmount: z.number().nonnegative().optional(),
  applyWht: z.boolean().optional(),
  whtRateOverride: z.number().nonnegative().optional(),
  isTaxInclusive: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.string().optional(),
  items: z.array(InvoiceItemSchema).optional(),
});

export const UpdateInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  currency: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.string().optional(),
  items: z.array(InvoiceItemSchema).optional(),
  discountAmount: z.number().nonnegative().optional(),
  applyWht: z.boolean().optional(),
  whtRateOverride: z.number().nonnegative().optional(),
  isTaxInclusive: z.boolean().optional(),
  version: z.number().optional(),
});

export const StatusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED']),
});

export const PaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'OTHER']),
  transactionId: z.string().optional(),
});

export const InvoiceQuerySchema = z.object({
  businessId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'issueDate', 'dueDate', 'totalAmount', 'status', 'invoiceNumber']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
