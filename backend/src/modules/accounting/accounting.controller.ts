import { Request, Response, NextFunction } from 'express';
import { accountingService } from './accounting.service';

export const accountingController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await accountingService.getSummary(req.query.businessId as string, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getComplianceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await accountingService.getComplianceStatus(req.query.businessId as string, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
