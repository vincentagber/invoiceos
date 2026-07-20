import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';

export const aiController = {
  async analyzeInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.analyzeInvoice(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async generateDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await aiService.generateDescription(req.body.serviceType);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
