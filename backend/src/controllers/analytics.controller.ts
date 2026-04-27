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

    res.json({ metrics });
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

    const trends = (invoices || []).reduce((acc: any, inv) => {
      const month = new Date(inv.issue_date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + inv.total_amount;
      return acc;
    }, {});

    res.json(trends);
  } catch (error) {
    next(error);
  }
};
