export interface ComplianceAdapter {
  countryCode: string;
  countryName: string;
  currency: string;
  governingBody: string;
  taxRules: {
    vatRate: number;
    whtRate: number;
    devLevyRate?: number;
    corporateTaxRate: number;
  };
  invoicingRules: {
    formatPrefix: string;
    qrRequired: boolean;
    electronicSignatureRequired: boolean;
    portalName: string;
  };
  deadlines: Array<{
    name: string;
    frequency: string;
    dateDescription: string;
    governingBody: string;
  }>;
}

export interface ComplianceStatus {
  countryCode: string;
  countryName: string;
  currency: string;
  governingBody: string;
  complianceScore: number;
  taxReadinessScore: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  missingRequirements: string[];
  deadlines: ComplianceAdapter['deadlines'];
  invoicingRules: ComplianceAdapter['invoicingRules'];
  taxRules: ComplianceAdapter['taxRules'];
  metrics: {
    hasTaxNumber: boolean;
    hasAddress: boolean;
    hasEmail: boolean;
    totalInvoicesCount: number;
  };
}

export interface ComplianceCountry {
  countryCode: string;
  countryName: string;
  currency: string;
  governingBody: string;
  defaultVatRate: number;
  defaultCorporateRate: number;
  qrRequired: boolean;
  continuousTransmission: boolean;
  portalName: string;
}
