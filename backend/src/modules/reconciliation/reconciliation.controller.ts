import { Request, Response, NextFunction } from 'express';
import {
  getPaymentReconciliation,
  getInvoiceReconciliation,
  getReconciliationSummary,
  matchPaymentToInvoice,
  markInvoiceAsPaid,
  refundPayment,
  markPaymentDisputed,
} from './reconciliation.service';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { ForbiddenError } from '../../shared/errors';

export const reconciliationController = {
  async getReconciliationData(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.query.businessId as string;
      if (!businessId) return res.status(400).json({ message: 'Business ID is required' });

      const owns = await verifyBusinessOwnership(req.user!.id, businessId);
      if (!owns) throw new ForbiddenError();

      const payments = await getPaymentReconciliation(businessId);
      const invoices = await getInvoiceReconciliation(businessId);
      const summary = await getReconciliationSummary(businessId);

      res.json({ payments, invoices, summary });
    } catch (error) {
      next(error);
    }
  },

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.query.businessId as string;
      if (!businessId) return res.status(400).json({ message: 'Business ID is required' });

      const owns = await verifyBusinessOwnership(req.user!.id, businessId);
      if (!owns) throw new ForbiddenError();

      const summary = await getReconciliationSummary(businessId);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },

  async manualMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, invoiceId } = req.body;
      if (!paymentId || !invoiceId) {
        return res.status(400).json({ message: 'Payment ID and Invoice ID are required' });
      }
      const result = await matchPaymentToInvoice(paymentId, invoiceId);
      res.json({ success: true, payment: result });
    } catch (error) {
      next(error);
    }
  },

  async manualMarkPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId, amount, method, transactionId } = req.body;
      if (!invoiceId || !amount || !method) {
        return res.status(400).json({ message: 'Invoice ID, amount, and method are required' });
      }
      const payment = await markInvoiceAsPaid(invoiceId, amount, method, transactionId);
      res.status(201).json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  },

  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.body;
      if (!paymentId) return res.status(400).json({ message: 'Payment ID is required' });
      const payment = await refundPayment(paymentId);
      res.json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  },

  async dispute(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.body;
      if (!paymentId) return res.status(400).json({ message: 'Payment ID is required' });
      const payment = await markPaymentDisputed(paymentId);
      res.json({ success: true, payment });
    } catch (error) {
      next(error);
    }
  },
};
