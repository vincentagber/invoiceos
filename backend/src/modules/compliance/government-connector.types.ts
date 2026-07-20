/**
 * Government Integration Layer
 *
 * Abstract connector interfaces for integrating with government APIs.
 * These interfaces serve as contracts for future adapter implementations.
 * When a government API becomes available, implement the appropriate interface.
 */

export type ConnectorType =
  | 'TAX_FILING'
  | 'INVOICE_VALIDATION'
  | 'BUSINESS_REGISTRATION'
  | 'IDENTITY_VERIFICATION'
  | 'DIGITAL_CERTIFICATES'
  | 'PAYMENT_INFRASTRUCTURE'
  | 'NATIONAL_DIGITAL_SERVICES';

export type AuthMethod =
  | 'API_KEY'
  | 'OAUTH2'
  | 'BEARER'
  | 'MUTUAL_TLS'
  | 'DIGITAL_SIGNATURE'
  | 'BASIC';

export interface ConnectorConfig {
  provider: string;
  baseUrl: string;
  apiVersion: string;
  authType: AuthMethod;
  credentials?: Record<string, string>;
  options?: Record<string, unknown>;
}

export interface ConnectorHealth {
  status: 'available' | 'unavailable' | 'degraded';
  latency: number;
  lastChecked: Date;
  message?: string;
}

export interface TaxFilingRequest {
  businessId: string;
  taxPeriod: { start: Date; end: Date };
  returnType: string;
  data: Record<string, unknown>;
  attachments?: Array<{ name: string; content: string; mimeType: string }>;
}

export interface TaxFilingResponse {
  submissionId: string;
  status: 'accepted' | 'rejected' | 'pending' | 'error';
  message: string;
  referenceNumber?: string;
  assessmentAmount?: number;
  filedAt: Date;
}

export interface InvoiceValidationRequest {
  invoiceNumber: string;
  businessTaxId: string;
  customerTaxId?: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  issueDate: Date;
  items: Array<{ description: string; quantity: number; unitPrice: number; taxRate: number }>;
}

export interface InvoiceValidationResponse {
  valid: boolean;
  validationId: string;
  qrCode?: string;
  authorizationCode?: string;
  errors?: string[];
  validatedAt: Date;
}

// ─── Abstract Connector Interface ─────────────────────────────

export interface GovernmentConnector {
  readonly provider: string;
  readonly type: ConnectorType;
  readonly isAvailable: boolean;

  /** Check if the connector can reach its endpoint */
  healthCheck(): Promise<ConnectorHealth>;

  /** Initialize the connector with configuration */
  initialize(config: ConnectorConfig): Promise<void>;
}

export interface TaxFilingConnector extends GovernmentConnector {
  type: 'TAX_FILING';

  /** Submit a tax return */
  fileReturn(request: TaxFilingRequest): Promise<TaxFilingResponse>;

  /** Check the status of a previously filed return */
  checkStatus(submissionId: string): Promise<TaxFilingResponse>;

  /** Get filing history */
  getFilingHistory(businessTaxId: string, from: Date, to: Date): Promise<TaxFilingResponse[]>;
}

export interface InvoiceValidationConnector extends GovernmentConnector {
  type: 'INVOICE_VALIDATION';

  /** Validate an invoice with the government system */
  validateInvoice(request: InvoiceValidationRequest): Promise<InvoiceValidationResponse>;

  /** Cancel a previously validated invoice */
  cancelInvoice(validationId: string, reason: string): Promise<{ success: boolean }>;
}

export interface BusinessRegistrationConnector extends GovernmentConnector {
  type: 'BUSINESS_REGISTRATION';

  /** Register a new business */
  register(data: Record<string, unknown>): Promise<{ registrationNumber: string; status: string }>;

  /** Verify business registration status */
  verify(taxId: string): Promise<{ registered: boolean; name: string; status: string }>;
}

// ─── Placeholder Connector Implementation ─────────────────────
// Used when a government API is not yet available.
// These provide graceful fallback behavior.

export class PlaceholderConnector implements GovernmentConnector {
  readonly provider: string;
  readonly type: ConnectorType;
  readonly isAvailable = false;

  constructor(provider: string, type: ConnectorType) {
    this.provider = provider;
    this.type = type;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    return {
      status: 'unavailable',
      latency: 0,
      lastChecked: new Date(),
      message: `${this.provider} ${this.type} connector is not yet available. Configure API credentials when the government makes them available.`,
    };
  }

  async initialize(_config: ConnectorConfig): Promise<void> {
    // No-op: will initialize when API becomes available
  }
}
