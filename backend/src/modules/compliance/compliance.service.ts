import prisma from '../../lib/prisma';
import { ComplianceAdapter, ComplianceStatus } from './compliance.types';
import { logger } from '../../utils/logger';

// ─── In-Memory Fallback Adapters ─────────────────────────────────
// These are used when the database is unavailable or
// when a country hasn't been configured in the DB yet.
// Never hardcode business logic here — just sensible defaults.
const FALLBACK_ADAPTERS: Record<string, ComplianceAdapter> = {
  NG: {
    countryCode: 'NG', countryName: 'Nigeria', currency: 'NGN', governingBody: 'FIRS',
    taxRules: { vatRate: 7.5, whtRate: 5.0, devLevyRate: 4.0, corporateTaxRate: 30.0 },
    invoicingRules: { formatPrefix: 'INV-NG', qrRequired: false, electronicSignatureRequired: false, portalName: 'FIRS TaxPro-Max' },
    deadlines: [
      { name: 'VAT Remittance', frequency: 'Monthly', dateDescription: '21st of every month', governingBody: 'FIRS' },
      { name: 'Annual Returns', frequency: 'Annually', dateDescription: 'June 30th', governingBody: 'CAC' },
    ],
  },
  GH: {
    countryCode: 'GH', countryName: 'Ghana', currency: 'GHS', governingBody: 'GRA',
    taxRules: { vatRate: 15.0, whtRate: 7.5, corporateTaxRate: 25.0 },
    invoicingRules: { formatPrefix: 'INV-GH', qrRequired: true, electronicSignatureRequired: true, portalName: 'GRA Certified Billing System' },
    deadlines: [
      { name: 'VAT/Levies Remittance', frequency: 'Monthly', dateDescription: 'Last working day of the month', governingBody: 'GRA' },
    ],
  },
  KE: {
    countryCode: 'KE', countryName: 'Kenya', currency: 'KES', governingBody: 'KRA',
    taxRules: { vatRate: 16.0, whtRate: 5.0, corporateTaxRate: 30.0 },
    invoicingRules: { formatPrefix: 'INV-KE', qrRequired: true, electronicSignatureRequired: true, portalName: 'KRA eTIMS' },
    deadlines: [
      { name: 'VAT Remittance (eTIMS)', frequency: 'Monthly', dateDescription: '20th of the following month', governingBody: 'KRA' },
    ],
  },
  ZA: {
    countryCode: 'ZA', countryName: 'South Africa', currency: 'ZAR', governingBody: 'SARS',
    taxRules: { vatRate: 15.0, whtRate: 15.0, corporateTaxRate: 27.0 },
    invoicingRules: { formatPrefix: 'INV-ZA', qrRequired: false, electronicSignatureRequired: false, portalName: 'SARS eFiling' },
    deadlines: [
      { name: 'VAT Returns', frequency: 'Bi-monthly', dateDescription: '25th of the month following tax period', governingBody: 'SARS' },
    ],
  },
};

// ─── DB-backed compliance loader ────────────────────────────────

interface LoadedConfig {
  adapter: ComplianceAdapter;
  taxRules: Array<{
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
  }>;
}

const configCache = new Map<string, { data: LoadedConfig; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadConfigFromDB(countryCode: string): Promise<LoadedConfig | null> {
  const normalizedCode = countryCode.toUpperCase();

  // Check cache first
  const cached = configCache.get(normalizedCode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const config = await prisma.complianceConfig.findFirst({
      where: {
        countryCode: normalizedCode,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
      include: {
        taxRules: {
          where: { isActive: true },
          orderBy: { priority: 'asc' },
        },
        deadlines: { where: { isActive: true } },
      },
    });

    if (!config) return null;

    const adapter: ComplianceAdapter = {
      countryCode: config.countryCode,
      countryName: config.countryName,
      currency: config.currency,
      governingBody: config.governingBody,
      taxRules: {
        vatRate: Number(config.defaultVatRate),
        whtRate: Number(config.defaultWhtRate),
        devLevyRate: config.devLevyRate ? Number(config.devLevyRate) : undefined,
        corporateTaxRate: Number(config.defaultCorporateRate),
      },
      invoicingRules: {
        formatPrefix: config.invoicePrefix,
        qrRequired: config.qrRequired,
        electronicSignatureRequired: config.electronicSignatureRequired,
        portalName: config.portalName,
      },
      deadlines: config.deadlines.map((d) => ({
        name: d.name,
        frequency: d.frequency,
        dateDescription: d.dueDescription,
        governingBody: d.governingBody,
      })),
    };

    const loaded: LoadedConfig = {
      adapter,
      taxRules: config.taxRules.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        type: r.type,
        method: r.method,
        application: r.application,
        rate: Number(r.rate),
        priority: r.priority,
        isStackable: r.isStackable,
        isWithholding: r.isWithholding,
        minimumThreshold: r.minimumThreshold ? Number(r.minimumThreshold) : null,
        maximumThreshold: r.maximumThreshold ? Number(r.maximumThreshold) : null,
        exemptionCodes: r.exemptionCodes,
        appliesTo: r.appliesTo,
        customerType: r.customerType,
        compoundOnParentId: r.compoundOnParentId,
        effectiveFrom: r.effectiveFrom,
        effectiveTo: r.effectiveTo,
      })),
    };

    configCache.set(normalizedCode, { data: loaded, timestamp: Date.now() });
    return loaded;
  } catch (error) {
    logger.error(`Failed to load compliance config from DB for ${normalizedCode}:`, error);
    return null;
  }
}

export function invalidateConfigCache(countryCode?: string) {
  if (countryCode) {
    configCache.delete(countryCode.toUpperCase());
  } else {
    configCache.clear();
  }
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Get the compliance adapter for a country.
 * Tries DB first, falls back to in-memory adapters.
 */
export async function getComplianceAdapterAsync(countryCode: string): Promise<ComplianceAdapter> {
  const loaded = await loadConfigFromDB(countryCode);
  if (loaded) return loaded.adapter;

  const fallback = FALLBACK_ADAPTERS[countryCode.toUpperCase()];
  if (fallback) return fallback;

  // Ultimate fallback: NG
  return FALLBACK_ADAPTERS.NG;
}

/**
 * Get the detailed tax rules for a country (from DB).
 * Returns empty array if DB unavailable.
 */
export async function getTaxRules(countryCode: string) {
  const loaded = await loadConfigFromDB(countryCode);
  return loaded?.taxRules || [];
}

/**
 * Get all compliance configurations for a business (simplified sync version).
 * Synchronous fallback for backward compatibility.
 */
export function getComplianceAdapter(countryCode: string): ComplianceAdapter {
  const code = countryCode.toUpperCase();
  return FALLBACK_ADAPTERS[code] || FALLBACK_ADAPTERS.NG;
}

export const countryAdapters = FALLBACK_ADAPTERS;

/**
 * Get full compliance status for a business.
 */
export async function getBusinessComplianceStatus(businessId: string): Promise<ComplianceStatus> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { clients: true, invoices: true },
  });

  if (!business) {
    throw new Error('Business not found');
  }

  const adapter = await getComplianceAdapterAsync(business.country);

  const hasTaxNumber = !!business.taxNumber;
  const hasAddress = !!business.address;
  const hasEmail = !!business.email;
  const hasClientsWithTaxId = business.clients.length > 0 && business.clients.some((c) => c.taxId);
  const totalInvoicesCount = business.invoices.length;

  let score = 0;
  if (hasTaxNumber) score += 40;
  if (hasAddress) score += 20;
  if (hasEmail) score += 20;
  if (hasClientsWithTaxId) score += 20;

  const taxRules = await getTaxRules(business.country);
  const taxReadinessScore = calculateTaxReadiness(business, taxRules);

  const missingRequirements: string[] = [];
  if (!hasTaxNumber) missingRequirements.push(`Register for a ${adapter.governingBody || 'tax'} number`);
  if (!hasAddress) missingRequirements.push('Add your business physical address');
  if (!hasEmail) missingRequirements.push('Add your business email address');
  if (!hasClientsWithTaxId && business.clients.length > 0) {
    missingRequirements.push('Add tax IDs for your clients');
  }

  const complianceStatus: 'compliant' | 'at_risk' | 'non_compliant' =
    score >= 80 ? 'compliant' : score >= 50 ? 'at_risk' : 'non_compliant';

  return {
    countryCode: adapter.countryCode,
    countryName: adapter.countryName,
    currency: adapter.currency,
    governingBody: adapter.governingBody,
    complianceScore: score,
    taxReadinessScore,
    status: complianceStatus,
    missingRequirements,
    deadlines: adapter.deadlines,
    invoicingRules: adapter.invoicingRules,
    taxRules: adapter.taxRules,
    metrics: { hasTaxNumber, hasAddress, hasEmail, totalInvoicesCount },
  };
}

function calculateTaxReadiness(
  business: { taxNumber?: string | null; address?: string | null; email?: string | null },
  taxRules: Array<{ isWithholding: boolean; type: string; rate: number }>,
): number {
  if (taxRules.length === 0) return 100;
  let score = 0;
  let factors = 0;

  if (business.taxNumber) { score += 30; factors++; }
  if (business.address) { score += 20; factors++; }
  if (business.email) { score += 20; factors++; }

  const hasWHT = taxRules.some((r) => r.isWithholding);
  if (hasWHT && business.taxNumber) { score += 15; factors++; }

  const hasVAT = taxRules.some((r) => r.type === 'VAT' && r.rate > 0);
  if (hasVAT && business.taxNumber) { score += 15; factors++; }

  return factors > 0 ? Math.round(score / factors * 100) / 100 : 50;
}

/**
 * Get all countries with compliance configurations available.
 */
export async function getAvailableCountries() {
  try {
    const configs = await prisma.complianceConfig.findMany({
      where: { isActive: true },
      select: {
        countryCode: true,
        countryName: true,
        currency: true,
        governingBody: true,
        defaultVatRate: true,
        defaultCorporateRate: true,
        qrRequired: true,
        continuousTransmission: true,
        portalName: true,
      },
      distinct: ['countryCode'],
      orderBy: { countryName: 'asc' },
    });
    return configs;
  } catch {
    console.warn('[Compliance] DB unavailable, using fallback adapters');
    return Object.values(FALLBACK_ADAPTERS).map((a) => ({
      countryCode: a.countryCode,
      countryName: a.countryName,
      currency: a.currency,
      governingBody: a.governingBody,
      defaultVatRate: a.taxRules.vatRate,
      defaultCorporateRate: a.taxRules.corporateTaxRate,
      qrRequired: a.invoicingRules.qrRequired,
      continuousTransmission: false,
      portalName: a.invoicingRules.portalName,
    }));
  }
}
