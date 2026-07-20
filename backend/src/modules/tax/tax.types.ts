export interface TaxLine {
  name: string;
  code: string;
  rate: number;
  amount: number;
  type: string;
  isWithholding: boolean;
  reportingCode?: string;
}

export interface TaxCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxLines: TaxLine[];
  totalTax: number;
  totalAmount: number;
  currency: string;
}

export interface TaxCalculationInput {
  countryCode: string;
  currency?: string;
  items: Array<{
    quantity: number;
    unitPrice: number;
    description?: string;
    taxCategory?: string;
    isExempt?: boolean;
    exemptionCode?: string;
  }>;
  discountAmount?: number;
  applyWht?: boolean;
  whtRateOverride?: number;
  isTaxInclusive?: boolean;
  customerType?: 'BUSINESS' | 'CONSUMER';
  documentType?: 'INVOICE' | 'QUOTATION' | 'CREDIT_NOTE';
  itemType?: 'GOODS' | 'SERVICES';
}

export interface TaxRuleConfig {
  id: string;
  name: string;
  code: string;
  type: string;
  method: string;
  application: string;
  rate: number;
  priority: number;
  isStackable: boolean;
  isWithholding: boolean;
  minimumThreshold: number | null;
  maximumThreshold: number | null;
  exemptionCodes: string | null;
  appliesTo: string | null;
  customerType: string | null;
  compoundOnParentId: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reportingCode?: string | null;
}
