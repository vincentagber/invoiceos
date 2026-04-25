import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { InvoiceStatus } from '@prisma/client';

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;
    
    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required for analytics' });
    }

    const [totalInvoiced, paidAmount, outstandingAmount] = await Promise.all([
      prisma.invoice.aggregate({
        where: { businessId },
        _sum: { totalAmount: true }
      }),
      prisma.invoice.aggregate({
        where: { businessId, status: InvoiceStatus.PAID },
        _sum: { totalAmount: true }
      }),
      prisma.invoice.aggregate({
        where: { businessId, status: { notIn: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED] } },
        _sum: { totalAmount: true }
      })
    ]);

    const sentInvoices = await prisma.invoice.count({ where: { businessId, status: { not: 'DRAFT' } } });
    const paidInvoices = await prisma.invoice.count({ where: { businessId, status: 'PAID' } });

    res.json({
      metrics: {
        totalInvoiced: totalInvoiced._sum.totalAmount || 0,
        paidAmount: paidAmount._sum.totalAmount || 0,
        outstandingAmount: outstandingAmount._sum.totalAmount || 0,
        conversionRate: sentInvoices > 0 ? (paidInvoices / sentInvoices) * 100 : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;
    
    // Simple grouping by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const invoices = await prisma.invoice.findMany({
      where: {
        businessId,
        issueDate: { gte: sixMonthsAgo },
        status: InvoiceStatus.PAID
      },
      select: {
        totalAmount: true,
        issueDate: true
      }
    });

    // Grouping logic
    const trends = invoices.reduce((acc: any, inv) => {
      const month = inv.issueDate.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + inv.totalAmount;
      return acc;
    }, {});

    res.json(trends);
  } catch (error) {
    next(error);
  }
};
