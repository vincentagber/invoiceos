import { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service';

export const billingController = {
  async verifySubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await billingService.verifySubscription(req.body, req.user!.id);
      res.json({ message: 'Institutional Subscription Activated', subscription });
    } catch (error) {
      next(error);
    }
  },

  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await billingService.getSubscription(req.params.businessId as string, req.user!.id);
      res.json(subscription);
    } catch (error) {
      next(error);
    }
  },

  async getBillingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = await billingService.getBillingHistory(req.params.businessId as string, req.user!.id);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  },
};
