import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { logger } from '../../utils/logger';

export const settingsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getAll(req.user!.id);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  },

  async updateBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateBusiness(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateBranding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateBranding(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateInvoiceDefaults(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateInvoiceDefaults(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateWorkflow(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateWorkflow(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateNotifications(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateEmail(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async sendTestEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.sendTestEmail(req.user!.id, req.body);
      res.json(result);
    } catch (error: any) {
      logger.error('SMTP Test Failure:', error);
      res.status(500).json({ error: `SMTP Verification Failed: ${error.message}` });
    }
  },

  async deleteBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.deleteBusiness(req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateProfile(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
