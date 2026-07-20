import prisma from '../../lib/prisma';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { ForbiddenError } from '../../shared/errors';

export const analyticsService = {
  async getSummary(businessId: string, userId: string) {
    if (!businessId) throw new ForbiddenError('Organization ID is required');

    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    const invoices = await prisma.invoice.findMany({
      where: { businessId },
      select: { status: true, totalAmount: true, clientId: true, client: { select: { name: true } } },
    });

    const metrics = {
      totalInvoiced: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      conversionRate: 0,
      invoicesSentCount: 0,
      totalClients: 0,
    };

    const clientRevenue: Record<string, { name: string; total: number; balance: number }> = {};
    let paidCount = 0;

    invoices.forEach((inv) => {
      const amount = Number(inv.totalAmount);
      metrics.totalInvoiced += amount;

      const clientId = inv.clientId;
      const clientName = inv.client?.name || 'Unknown Client';

      if (!clientRevenue[clientId]) {
        clientRevenue[clientId] = { name: clientName, total: 0, balance: 0 };
      }
      clientRevenue[clientId].total += amount;

      if (inv.status === 'PAID') {
        metrics.paidAmount += amount;
        paidCount++;
      } else if (inv.status !== 'CANCELLED') {
        metrics.outstandingAmount += amount;
        clientRevenue[clientId].balance += amount;
      }

      if (inv.status !== 'DRAFT') {
        metrics.invoicesSentCount++;
      }
    });

    metrics.conversionRate = metrics.invoicesSentCount > 0 ? (paidCount / metrics.invoicesSentCount) * 100 : 0;
    metrics.totalClients = await prisma.client.count({ where: { businessId } });

    let totalExpenses = 0;
    try {
      const expenses = await prisma.expense.findMany({
        where: { businessId },
        select: { amount: true },
      });
      totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    } catch (error) {
      console.error('[AnalyticsService] Failed to fetch expenses for summary:', error);
    }

    const topClients = Object.entries(clientRevenue)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { metrics: { ...metrics, totalExpenses }, topClients };
  },

  async getRevenueTrends(businessId: string, userId: string) {
    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const invoices = await prisma.invoice.findMany({
      where: { businessId, status: 'PAID', issueDate: { gte: sixMonthsAgo } },
      select: { totalAmount: true, issueDate: true },
    });

    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(d.toLocaleString('default', { month: 'short' }));
    }

    const trends = last6Months.map((month) => ({ name: month, revenue: 0, expenses: 0 }));

    invoices.forEach((inv) => {
      const month = new Date(inv.issueDate).toLocaleString('default', { month: 'short' });
      const trend = trends.find((t) => t.name === month);
      if (trend) trend.revenue += Number(inv.totalAmount);
    });

    try {
      const expenses = await prisma.expense.findMany({
        where: { businessId, date: { gte: sixMonthsAgo } },
        select: { amount: true, date: true },
      });
      expenses.forEach((exp) => {
        const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
        const trend = trends.find((t) => t.name === month);
        if (trend) trend.expenses += Number(exp.amount);
      });
    } catch (error) {
      console.error('[AnalyticsService] Failed to fetch expenses for trends:', error);
    }

    return trends;
  },
};
