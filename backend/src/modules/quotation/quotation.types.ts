export interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuotationDTO {
  businessId: string;
  clientId: string;
  items: QuotationItem[];
  currency?: string;
  notes?: string;
  validUntil?: string;
  title?: string;
  quotationNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  taxRate?: number;
  discountAmount?: number;
  totalAmount?: number;
}

export interface UpdateQuotationDTO extends Partial<CreateQuotationDTO> {
  status?: string;
}
