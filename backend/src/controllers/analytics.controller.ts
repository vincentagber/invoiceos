import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.query.businessId as string;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    // 1. Fetch Invoices for aggregation
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const metrics = {
      totalInvoiced: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      conversionRate: 0
    };

    let sentCount = 0;
    let paidCount = 0;

    invoices?.forEach(inv => {
      metrics.totalInvoiced += inv.total_amount;
      if (inv.status === 'PAID') {
        metrics.paidAmount += inv.total_amount;
        paidCount++;
      }
      if (inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
        metrics.outstandingAmount += inv.total_amount;
      }
      if (inv.status !== 'DRAFT') {
        sentCount++;
      }
    });

    metrics.conversionRate = sentCount > 0 ? (paidCount / sentCount) * 100 : 0;

    // 2. Fetch Expenses for aggregation (Resilient)
    let totalExpenses = 0;
    try {
      const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('organization_id', organizationId);

      if (!expError) {
        totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      }
    } catch (e) {
      console.error('Expenses table might not be migrated yet', e);
    }

    res.json({ 
      metrics: {
        ...metrics,
        totalExpenses
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.query.businessId as string;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('total_amount, issue_date')
      .eq('organization_id', organizationId)
      .eq('status', 'PAID')
      .gte('issue_date', sixMonthsAgo.toISOString());

    if (error) throw error;

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(d.toLocaleString('default', { month: 'short' }));
    }

    const trends = last6Months.map(month => ({
      name: month,
      revenue: 0,
      expenses: 0
    }));

    (invoices || []).forEach(inv => {
      const month = new Date(inv.issue_date).toLocaleString('default', { month: 'short' });
      const trend = trends.find(t => t.name === month);
      if (trend) {
        trend.revenue += inv.total_amount;
      }
    });

    // Fetch Expenses for trends (Resilient)
    try {
      const { data: expensesData, error: expError } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('organization_id', organizationId)
        .gte('date', sixMonthsAgo.toISOString());

      if (!expError && expensesData) {
        expensesData.forEach(exp => {
          const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
          const trend = trends.find(t => t.name === month);
          if (trend) {
            trend.expenses += exp.amount;
          }
        });
      }
    } catch (e) {
      console.error('Expenses trends fetch failed', e);
    }

    res.json(trends);
  } catch (error) {
    next(error);
  }
};
