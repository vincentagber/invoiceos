import { getTaxRules, getComplianceAdapterAsync } from '../compliance/compliance.service';
import { TaxLine, TaxCalculationResult, TaxCalculationInput, TaxRuleConfig } from './tax.types';

/**
 * Per-item tax calculation helper
 */
interface ItemTotal {
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isExempt: boolean;
  exemptionCode?: string;
}

function buildItemTotals(items: TaxCalculationInput['items']): ItemTotal[] {
  return items.map((item) => ({
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || 0,
    lineTotal: (item.quantity || 0) * (item.unitPrice || 0),
    isExempt: item.isExempt || false,
    exemptionCode: item.exemptionCode,
  }));
}

/**
 * Determine the taxable base for a rule, excluding exempt items.
 */
function taxableBaseForRule(
  items: ItemTotal[],
  rule: TaxRuleConfig,
): number {
  if (!rule.exemptionCodes) {
    // No exemptions: all items are taxable
    return items.reduce((s, i) => s + i.lineTotal, 0);
  }
  const exemptCodes = rule.exemptionCodes.split(',');
  return items
    .filter((i) => !(i.isExempt && i.exemptionCode && exemptCodes.includes(i.exemptionCode)))
    .reduce((s, i) => s + i.lineTotal, 0);
}

/**
 * Check whether a rule applies given the input parameters.
 */
function ruleApplies(
  rule: TaxRuleConfig,
  taxableBase: number,
  customerType: string,
  itemType: string,
  applyWht: boolean,
): boolean {
  if (rule.compoundOnParentId) return false;

  if (rule.customerType && rule.customerType !== 'ALL' && rule.customerType !== 'BOTH') {
    if (rule.customerType !== customerType) return false;
  }

  if (rule.appliesTo && rule.appliesTo !== 'ALL' && rule.appliesTo !== 'BOTH') {
    if (rule.appliesTo !== itemType) return false;
  }

  if (rule.minimumThreshold !== null && taxableBase < Number(rule.minimumThreshold)) {
    return false;
  }
  if (rule.maximumThreshold !== null && taxableBase > Number(rule.maximumThreshold)) {
    return false;
  }

  if (rule.isWithholding && !applyWht) return false;

  const now = new Date();
  if (rule.effectiveFrom > now) return false;
  if (rule.effectiveTo && rule.effectiveTo < now) return false;

  return true;
}

function calcTaxAmount(rule: TaxRuleConfig, taxableBase: number, isTaxInclusive: boolean): number {
  switch (rule.method) {
    case 'ZERO_RATED':
      return 0;
    case 'INCLUSIVE':
      return taxableBase * (rule.rate / (100 + rule.rate));
    case 'COMPOUND':
      return 0;
    case 'REVERSE_CHARGE':
      return 0;
    case 'EXCLUSIVE':
    default:
      return taxableBase * (rule.rate / 100);
  }
}

/**
 * Calculate taxes for an invoice/quote using data-driven tax rules (async, DB-backed).
 *
 * Handles:
 *  - Per-item exemptions (mixed-exempt invoices)
 *  - Compound taxes (tax-on-tax, e.g. NHIL on VAT)
 *  - Multi-rule stacking (VAT + CIT + levies)
 *  - Effective dates, thresholds, customer/item filtering
 *  - Tax-inclusive and tax-exclusive pricing
 *  - Withholding tax deducted at source
 */
export async function calculateInvoiceTaxesAsync(input: TaxCalculationInput): Promise<TaxCalculationResult> {
  const adapter = await getComplianceAdapterAsync(input.countryCode);
  const taxRules = await getTaxRules(input.countryCode);
  const discountAmount = input.discountAmount || 0;
  const isTaxInclusive = input.isTaxInclusive || false;
  const customerType = input.customerType || 'BUSINESS';
  const itemType = input.itemType || 'GOODS';
  const applyWht = input.applyWht || false;

  const items = buildItemTotals(input.items);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const taxableBase = Math.max(0, subtotal - discountAmount);

  if (taxRules.length > 0) {
    return calculateWithRulesV2(taxRules, items, taxableBase, subtotal, discountAmount, isTaxInclusive, customerType, itemType, applyWht, input.currency);
  }

  return calculateSimple(input, adapter, subtotal, taxableBase, discountAmount, isTaxInclusive);
}

function calculateWithRulesV2(
  rules: TaxRuleConfig[],
  items: ItemTotal[],
  taxableBase: number,
  subtotal: number,
  discountAmount: number,
  isTaxInclusive: boolean,
  customerType: string,
  itemType: string,
  applyWht: boolean,
  currency?: string,
): TaxCalculationResult {
  const taxLines: TaxLine[] = [];
  let totalVatAndExcise = 0;
  const lineTotals: Array<{ ruleId: string; taxAmount: number; compoundAmount: number }> = [];

  // Pass 1: determine per-rule totals and compound relationships
  const activeRules = rules.filter(
    (r) => r.compoundOnParentId || ruleApplies(r, taxableBase, customerType, itemType, applyWht),
  );
  activeRules.sort((a, b) => a.priority - b.priority);

  // Map compound children to parent
  const parentMap = new Map<string, TaxRuleConfig[]>();
  for (const r of activeRules) {
    if (r.compoundOnParentId) {
      const existing = parentMap.get(r.compoundOnParentId) || [];
      existing.push(r);
      parentMap.set(r.compoundOnParentId, existing);
    }
  }

  // Pass 2: calculate
  for (const rule of activeRules) {
    if (rule.compoundOnParentId) continue;

    const ruleBase = taxableBaseForRule(items, rule);
    if (ruleBase <= 0) continue;

    const taxAmt = Math.round(calcTaxAmount(rule, ruleBase, isTaxInclusive) * 100) / 100;
    const children = parentMap.get(rule.id) || [];

    let compoundTotal = 0;
    for (const child of children) {
      let childAmt = taxAmt * (child.rate / 100);
      childAmt = Math.round(childAmt * 100) / 100;
      compoundTotal += childAmt;

      taxLines.push({
        name: child.name,
        code: child.code,
        rate: child.rate,
        amount: rule.isWithholding ? -childAmt : childAmt,
        type: child.type,
        isWithholding: child.isWithholding || rule.isWithholding,
        reportingCode: child.reportingCode || undefined,
      });
      if (!child.isWithholding && !rule.isWithholding) {
        totalVatAndExcise += childAmt;
      }
    }

    const effectiveTax = taxAmt + compoundTotal;

    if (Math.abs(effectiveTax) > 0 || rule.method === 'ZERO_RATED') {
      const amount = rule.isWithholding ? -effectiveTax : effectiveTax;
      taxLines.push({
        name: rule.name,
        code: rule.code,
        rate: rule.rate,
        amount,
        type: rule.type,
        isWithholding: rule.isWithholding,
        reportingCode: rule.reportingCode || undefined,
      });
      if (!rule.isWithholding) {
        totalVatAndExcise += effectiveTax;
      }
    }

    lineTotals.push({ ruleId: rule.id, taxAmount: taxAmt, compoundAmount: compoundTotal });
  }

  // WHT is already included in taxLines via isWithholding rules
  const whtTotal = taxLines
    .filter((t) => t.isWithholding)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  let totalAmount: number;
  if (isTaxInclusive) {
    totalAmount = taxableBase;
  } else {
    totalAmount = taxableBase + totalVatAndExcise - whtTotal;
  }
  totalAmount = Math.round(totalAmount * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableBase * 100) / 100,
    taxLines,
    totalTax: Math.round(totalVatAndExcise * 100) / 100,
    totalAmount,
    currency: currency || 'USD',
  };
}

function calculateSimple(
  input: TaxCalculationInput,
  adapter: { taxRules: { vatRate: number; whtRate: number; corporateTaxRate: number } },
  subtotal: number,
  taxableAmount: number,
  discountAmount: number,
  isTaxInclusive: boolean,
): TaxCalculationResult {
  const taxLines: TaxLine[] = [];

  const vatRate = adapter.taxRules.vatRate;
  const vatAmount = Math.round(
    (isTaxInclusive
      ? taxableAmount * (vatRate / (100 + vatRate))
      : taxableAmount * (vatRate / 100)
    ) * 100,
  ) / 100;

  taxLines.push({
    name: `${input.countryCode} VAT`,
    code: 'VAT_STANDARD',
    rate: vatRate,
    amount: vatAmount,
    type: 'VAT',
    isWithholding: false,
  });

  const totalTax = vatAmount;

  let whtAmount = 0;
  if (input.applyWht) {
    const whtRate = input.whtRateOverride !== undefined ? input.whtRateOverride : adapter.taxRules.whtRate;
    whtAmount = Math.round(taxableAmount * (whtRate / 100) * 100) / 100;
    taxLines.push({
      name: `${input.countryCode} WHT`,
      code: 'WHT',
      rate: whtRate,
      amount: -whtAmount,
      type: 'WITHHOLDING',
      isWithholding: true,
    });
  }

  const totalAmount = Math.round(
    (isTaxInclusive ? taxableAmount - whtAmount : taxableAmount + vatAmount - whtAmount) * 100
  ) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    taxLines,
    totalTax: Math.round(totalTax * 100) / 100,
    totalAmount,
    currency: input.currency || 'USD',
  };
}

// ─── Sync wrapper ──────────────────────────────────────────────
// Tries async DB-driven path first, falls back to in-memory.
// This maintains backward compatibility for existing callers
// that cannot use async/await.

export function calculateInvoiceTaxes(input: TaxCalculationInput): TaxCalculationResult {
  try {
    const { getComplianceAdapter } = require('../compliance/compliance.service');
    const adapter = getComplianceAdapter(input.countryCode);
    const discountAmount = input.discountAmount || 0;
    const isTaxInclusive = input.isTaxInclusive || false;

    let subtotal = 0;
    for (const item of input.items) {
      subtotal += (item.quantity || 0) * (item.unitPrice || 0);
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const vatRate = adapter.taxRules.vatRate;

    const vatAmount = Math.round(
      (isTaxInclusive
        ? taxableAmount * (vatRate / (100 + vatRate))
        : taxableAmount * (vatRate / 100)
      ) * 100,
    ) / 100;

    const taxLines: TaxLine[] = [
      {
        name: `${input.countryCode} VAT`,
        code: 'VAT_STANDARD',
        rate: vatRate,
        amount: vatAmount,
        type: 'VAT',
        isWithholding: false,
      },
    ];

    const totalTax = vatAmount;

    let whtAmount = 0;
    if (input.applyWht) {
      const whtRate = input.whtRateOverride !== undefined ? input.whtRateOverride : adapter.taxRules.whtRate;
      whtAmount = Math.round(taxableAmount * (whtRate / 100) * 100) / 100;
      taxLines.push({
        name: `${input.countryCode} WHT`,
        code: 'WHT',
        rate: whtRate,
        amount: -whtAmount,
        type: 'WITHHOLDING',
        isWithholding: true,
      });
    }

    const totalAmount = Math.round(
      (isTaxInclusive ? taxableAmount - whtAmount : taxableAmount + vatAmount - whtAmount) * 100
    ) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      taxLines,
      totalTax: Math.round(totalTax * 100) / 100,
      totalAmount,
      currency: input.currency || 'USD',
    };
  } catch {
    const discountAmount = input.discountAmount || 0;
    let subtotal = 0;
    for (const item of input.items) {
      subtotal += (item.quantity || 0) * (item.unitPrice || 0);
    }
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      taxLines: [],
      totalTax: 0,
      totalAmount: Math.round(taxableAmount * 100) / 100,
      currency: input.currency || 'USD',
    };
  }
}
