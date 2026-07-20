import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';

export const analyticsController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getSummary(req.query.businessId as string, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getRevenueTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await analyticsService.getRevenueTrends(req.query.businessId as string, req.user!.id);
      res.json(trends);
    } catch (error) {
      next(error);
    }
  },
};
