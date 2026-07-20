export interface CreateInvoiceDTO {
  businessId: string;
  clientId: string;
  invoiceNumber?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  discountAmount?: number;
  applyWht?: boolean;
  whtRateOverride?: number;
  isTaxInclusive?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface UpdateInvoiceDTO {
  invoiceNumber?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  discountAmount?: number;
  applyWht?: boolean;
  whtRateOverride?: number;
  isTaxInclusive?: boolean;
}

export interface InvoiceFilter {
  businessId: string;
  clientId?: string;
  status?: 'DRAFT' | 'SENT' | 'VIEWED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
}

export interface InvoicePublicResponse {
  id: string;
  invoice_number: string;
  total: number;
  currency: string;
  due_date: string;
  issue_date: string;
  status: string;
  notes: string | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  business: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
}
