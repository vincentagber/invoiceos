export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
    timestamp: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type QuotationStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CRYPTO' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'DISPUTED' | 'REFUNDED' | 'CHARGED_BACK';

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  businessId: string;
  clientId: string;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  discountAmount: number;
  taxRate: number;
  applyWht: boolean;
  isTaxInclusive: boolean;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItemDTO[];
  client?: { id: string; name: string; email: string };
}

export interface InvoiceItemDTO {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientDTO {
  id: string;
  businessId: string;
  name: string;
  contactName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  _count?: { invoices: number };
}

export interface BusinessDTO {
  id: string;
  name: string;
  ownerId: string;
  country: string;
  currency: string;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  brandColor: string | null;
  _count?: { clients: number; invoices: number };
}

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  businesses: Array<{ id: string; name: string }>;
}
