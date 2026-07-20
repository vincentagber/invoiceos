export const Permissions = {
  // Invoices
  InvoiceCreate: 'invoice.create',
  InvoiceRead: 'invoice.read',
  InvoiceUpdate: 'invoice.update',
  InvoiceDelete: 'invoice.delete',
  InvoiceSend: 'invoice.send',
  InvoiceApprove: 'invoice.approve',
  InvoiceRefund: 'invoice.refund',
  InvoicePaymentRecord: 'invoice.payment.record',
  InvoicePaymentRefund: 'invoice.payment.refund',
  InvoiceViewPublic: 'invoice.view.public',

  // Clients
  ClientCreate: 'client.create',
  ClientRead: 'client.read',
  ClientUpdate: 'client.update',
  ClientDelete: 'client.delete',

  // Quotations
  QuotationCreate: 'quotation.create',
  QuotationRead: 'quotation.read',
  QuotationUpdate: 'quotation.update',
  QuotationDelete: 'quotation.delete',
  QuotationConvert: 'quotation.convert',

  // Expenses
  ExpenseCreate: 'expense.create',
  ExpenseRead: 'expense.read',
  ExpenseUpdate: 'expense.update',
  ExpenseDelete: 'expense.delete',
  ExpenseBulkImport: 'expense.bulk.import',

  // Analytics
  AnalyticsView: 'analytics.view',
  AnalyticsExport: 'analytics.export',

  // Settings
  SettingsRead: 'settings.read',
  SettingsUpdate: 'settings.update',
  SettingsBranding: 'settings.branding',
  SettingsEmail: 'settings.email',
  SettingsWorkflow: 'settings.workflow',
  SettingsDeleteBusiness: 'settings.delete.business',

  // Billing & Subscription
  SubscriptionRead: 'subscription.read',
  SubscriptionManage: 'subscription.manage',

  // Compliance
  ComplianceView: 'compliance.view',
  ComplianceConfigure: 'compliance.configure',
  ComplianceAdmin: 'compliance.admin',

  // Tax
  TaxView: 'tax.view',
  TaxConfigure: 'tax.configure',
  TaxAdmin: 'tax.admin',

  // Documents
  DocumentUpload: 'document.upload',
  DocumentRead: 'document.read',
  DocumentDelete: 'document.delete',

  // Reconciliation
  ReconciliationView: 'reconciliation.view',
  ReconciliationMatch: 'reconciliation.match',
  ReconciliationMarkPaid: 'reconciliation.mark.paid',

  // Organization & Users
  OrganizationManage: 'organization.manage',
  OrganizationMemberInvite: 'organization.member.invite',
  OrganizationMemberRemove: 'organization.member.remove',
  OrganizationRolesManage: 'organization.roles.manage',

  // Business
  BusinessCreate: 'business.create',
  BusinessUpdate: 'business.update',
  BusinessDelete: 'business.delete',

  // Branches & Departments
  BranchManage: 'branch.manage',
  DepartmentManage: 'department.manage',
  TeamManage: 'team.manage',
} as const;

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions];

export const PermissionGroups: Record<string, { key: string; name: string; description: string }[]> = {};

export interface PolicyEvaluation {
  allowed: boolean;
  rule?: string;
  reason?: string;
}

export type PolicyEffect = 'GRANT' | 'DENY';
