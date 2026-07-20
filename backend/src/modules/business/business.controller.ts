import { Request, Response, NextFunction } from 'express';
import { businessService } from './business.service';

export const businessController = {
  async getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await businessService.getCurrent(req.user!.id);
      res.json(business);
    } catch (error) {
      next(error);
    }
  },

  async updateCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await businessService.updateCurrent(req.user!.id, req.body);
      res.json(business);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await businessService.getById(req.params.id as string, req.user!.id);
      res.json(business);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await businessService.update(req.params.id as string, req.user!.id, req.body);
      res.json(business);
    } catch (error) {
      next(error);
    }
  },

  async updateBranding(req: Request, res: Response, next: NextFunction) {
    try {
      const business = await businessService.updateBranding(req.params.id as string, req.user!.id, req.body);
      res.json(business);
    } catch (error) {
      next(error);
    }
  },
};
