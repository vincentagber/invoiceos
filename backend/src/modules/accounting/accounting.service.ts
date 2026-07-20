import prisma from '../../lib/prisma';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { getBusinessComplianceStatus } from '../compliance/compliance.service';
import { ForbiddenError, NotFoundError } from '../../shared/errors';

export const accountingService = {
  async getSummary(businessId: string, userId: string) {
    if (!businessId) throw new ForbiddenError('Business ID is required');

    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundError('Business', businessId);

    const complianceStatus = await getBusinessComplianceStatus(businessId);

    const paidInvoices = await prisma.invoice.findMany({
      where: { businessId, status: 'PAID' },
      select: { totalAmount: true },
    });
    const grossRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const expenses = await prisma.expense.findMany({
      where: { businessId },
      select: { amount: true },
    });
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const netProfit = grossRevenue - totalExpenses;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    const corporateTaxRate = complianceStatus.taxRules.corporateTaxRate;
    const devLevyRate = complianceStatus.taxRules.devLevyRate || 0;
    const estimatedTax = netProfit > 0 ? netProfit * (corporateTaxRate / 100) : 0;
    const devLevyAmount = netProfit > 0 && devLevyRate > 0 ? netProfit * (devLevyRate / 100) : 0;

    return {
      success: true,
      data: {
        gross_revenue: Math.round(grossRevenue * 100) / 100,
        total_expenses: Math.round(totalExpenses * 100) / 100,
        net_profit: Math.round(netProfit * 100) / 100,
        profit_margin: Math.round(profitMargin * 100) / 100,
        tax_projection: {
          estimated_tax_owed: Math.round(estimatedTax * 100) / 100,
          tax_rate: corporateTaxRate,
          dev_levy_rate: devLevyRate,
          dev_levy_amount: Math.round(devLevyAmount * 100) / 100,
          turnover: Math.round(grossRevenue * 100) / 100,
        },
      },
    };
  },

  async getComplianceStatus(businessId: string, userId: string) {
    if (!businessId) throw new ForbiddenError('Business ID is required');

    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    const status = await getBusinessComplianceStatus(businessId);
    return { success: true, data: status };
  },
};
