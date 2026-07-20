import prisma from '../../lib/prisma';
import { Permissions } from './authz.types';
import { logger } from '../../utils/logger';

const PERMISSION_DEFINITIONS = [
  { key: Permissions.InvoiceCreate, name: 'Create Invoices', group: 'invoices' },
  { key: Permissions.InvoiceRead, name: 'View Invoices', group: 'invoices' },
  { key: Permissions.InvoiceUpdate, name: 'Update Invoices', group: 'invoices' },
  { key: Permissions.InvoiceDelete, name: 'Delete Invoices', group: 'invoices' },
  { key: Permissions.InvoiceSend, name: 'Send Invoices', group: 'invoices' },
  { key: Permissions.InvoiceApprove, name: 'Approve Invoices', group: 'invoices' },
  { key: Permissions.InvoiceRefund, name: 'Refund Invoices', group: 'invoices' },
  { key: Permissions.InvoicePaymentRecord, name: 'Record Payments', group: 'invoices' },
  { key: Permissions.InvoicePaymentRefund, name: 'Refund Payments', group: 'invoices' },
  { key: Permissions.InvoiceViewPublic, name: 'View Public Invoices', group: 'invoices' },
  { key: Permissions.ClientCreate, name: 'Create Clients', group: 'clients' },
  { key: Permissions.ClientRead, name: 'View Clients', group: 'clients' },
  { key: Permissions.ClientUpdate, name: 'Update Clients', group: 'clients' },
  { key: Permissions.ClientDelete, name: 'Delete Clients', group: 'clients' },
  { key: Permissions.QuotationCreate, name: 'Create Quotations', group: 'quotations' },
  { key: Permissions.QuotationRead, name: 'View Quotations', group: 'quotations' },
  { key: Permissions.QuotationUpdate, name: 'Update Quotations', group: 'quotations' },
  { key: Permissions.QuotationDelete, name: 'Delete Quotations', group: 'quotations' },
  { key: Permissions.QuotationConvert, name: 'Convert to Invoice', group: 'quotations' },
  { key: Permissions.ExpenseCreate, name: 'Create Expenses', group: 'expenses' },
  { key: Permissions.ExpenseRead, name: 'View Expenses', group: 'expenses' },
  { key: Permissions.ExpenseUpdate, name: 'Update Expenses', group: 'expenses' },
  { key: Permissions.ExpenseDelete, name: 'Delete Expenses', group: 'expenses' },
  { key: Permissions.ExpenseBulkImport, name: 'Bulk Import Expenses', group: 'expenses' },
  { key: Permissions.AnalyticsView, name: 'View Analytics', group: 'analytics' },
  { key: Permissions.AnalyticsExport, name: 'Export Analytics', group: 'analytics' },
  { key: Permissions.SettingsRead, name: 'View Settings', group: 'settings' },
  { key: Permissions.SettingsUpdate, name: 'Update Settings', group: 'settings' },
  { key: Permissions.SettingsBranding, name: 'Manage Branding', group: 'settings' },
  { key: Permissions.SettingsEmail, name: 'Manage Email Settings', group: 'settings' },
  { key: Permissions.SettingsWorkflow, name: 'Manage Workflow', group: 'settings' },
  { key: Permissions.SettingsDeleteBusiness, name: 'Delete Business', group: 'settings' },
  { key: Permissions.SubscriptionRead, name: 'View Subscription', group: 'billing' },
  { key: Permissions.SubscriptionManage, name: 'Manage Subscription', group: 'billing' },
  { key: Permissions.ComplianceView, name: 'View Compliance', group: 'compliance' },
  { key: Permissions.ComplianceConfigure, name: 'Configure Compliance', group: 'compliance' },
  { key: Permissions.ComplianceAdmin, name: 'Admin Compliance', group: 'compliance' },
  { key: Permissions.TaxView, name: 'View Tax', group: 'tax' },
  { key: Permissions.TaxConfigure, name: 'Configure Tax', group: 'tax' },
  { key: Permissions.TaxAdmin, name: 'Admin Tax', group: 'tax' },
  { key: Permissions.DocumentUpload, name: 'Upload Documents', group: 'documents' },
  { key: Permissions.DocumentRead, name: 'View Documents', group: 'documents' },
  { key: Permissions.DocumentDelete, name: 'Delete Documents', group: 'documents' },
  { key: Permissions.ReconciliationView, name: 'View Reconciliation', group: 'reconciliation' },
  { key: Permissions.ReconciliationMatch, name: 'Match Payments', group: 'reconciliation' },
  { key: Permissions.ReconciliationMarkPaid, name: 'Mark as Paid', group: 'reconciliation' },
  { key: Permissions.OrganizationManage, name: 'Manage Organization', group: 'organization' },
  { key: Permissions.OrganizationMemberInvite, name: 'Invite Members', group: 'organization' },
  { key: Permissions.OrganizationMemberRemove, name: 'Remove Members', group: 'organization' },
  { key: Permissions.OrganizationRolesManage, name: 'Manage Roles', group: 'organization' },
  { key: Permissions.BusinessCreate, name: 'Create Businesses', group: 'business' },
  { key: Permissions.BusinessUpdate, name: 'Update Business', group: 'business' },
  { key: Permissions.BusinessDelete, name: 'Delete Business', group: 'business' },
  { key: Permissions.BranchManage, name: 'Manage Branches', group: 'organization' },
  { key: Permissions.DepartmentManage, name: 'Manage Departments', group: 'organization' },
  { key: Permissions.TeamManage, name: 'Manage Teams', group: 'organization' },
];

const ROLE_DEFINITIONS: { name: string; description: string; isSystem: boolean; permissions: string[] }[] = [
  {
    name: 'Owner',
    description: 'Full access to everything',
    isSystem: true,
    permissions: PERMISSION_DEFINITIONS.map((p) => p.key),
  },
  {
    name: 'Admin',
    description: 'Full access to all business operations',
    isSystem: true,
    permissions: PERMISSION_DEFINITIONS.filter(
      (p) =>
        !p.key.startsWith('organization.') &&
        !p.key.startsWith('business.delete') &&
        !p.key.startsWith('compliance.admin') &&
        !p.key.startsWith('tax.admin')
    ).map((p) => p.key),
  },
  {
    name: 'Accountant',
    description: 'Financial operations',
    isSystem: true,
    permissions: [
      Permissions.InvoiceCreate, Permissions.InvoiceRead, Permissions.InvoiceUpdate,
      Permissions.InvoiceSend, Permissions.InvoicePaymentRecord, Permissions.InvoicePaymentRefund,
      Permissions.ClientCreate, Permissions.ClientRead, Permissions.ClientUpdate,
      Permissions.ExpenseCreate, Permissions.ExpenseRead, Permissions.ExpenseUpdate, Permissions.ExpenseBulkImport,
      Permissions.AnalyticsView, Permissions.AnalyticsExport,
      Permissions.ReconciliationView, Permissions.ReconciliationMatch, Permissions.ReconciliationMarkPaid,
      Permissions.TaxView, Permissions.TaxConfigure,
      Permissions.ComplianceView,
      Permissions.SettingsRead,
      Permissions.SubscriptionRead,
    ],
  },
  {
    name: 'Sales',
    description: 'Client-facing operations',
    isSystem: true,
    permissions: [
      Permissions.InvoiceCreate, Permissions.InvoiceRead, Permissions.InvoiceUpdate, Permissions.InvoiceSend,
      Permissions.ClientCreate, Permissions.ClientRead, Permissions.ClientUpdate,
      Permissions.QuotationCreate, Permissions.QuotationRead, Permissions.QuotationUpdate, Permissions.QuotationConvert,
      Permissions.AnalyticsView,
      Permissions.SettingsRead,
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access',
    isSystem: true,
    permissions: [
      Permissions.InvoiceRead, Permissions.InvoiceViewPublic,
      Permissions.ClientRead, Permissions.QuotationRead,
      Permissions.ExpenseRead, Permissions.AnalyticsView,
      Permissions.SettingsRead, Permissions.SubscriptionRead,
      Permissions.ComplianceView, Permissions.TaxView,
      Permissions.DocumentRead, Permissions.ReconciliationView,
    ],
  },
];

export async function seedPermissionsAndRoles(): Promise<void> {
  const existingCount = await prisma.role.count();
  if (existingCount > 0) {
    logger.info('Permissions and roles already seeded, skipping');
    return;
  }

  logger.info('Seeding permissions and roles...');

  await prisma.permission.createMany({
    data: PERMISSION_DEFINITIONS,
    skipDuplicates: true,
  });
  logger.info(`Seeded ${PERMISSION_DEFINITIONS.length} permissions`);

  const allPermissions = await prisma.permission.findMany();

  for (const roleDef of ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description, isSystem: roleDef.isSystem },
      create: { name: roleDef.name, description: roleDef.description, isSystem: roleDef.isSystem },
    });

    const permIds = allPermissions
      .filter((p) => roleDef.permissions.includes(p.key))
      .map((p) => ({ roleId: role.id, permissionId: p.id }));

    if (permIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permIds,
        skipDuplicates: true,
      });
    }
  }
  logger.info(`Seeded ${ROLE_DEFINITIONS.length} roles`);
}
