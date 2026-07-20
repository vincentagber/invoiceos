import { Request, Response, NextFunction } from 'express';
import { quotationService } from './quotation.service';

const p = (req: Request) => req.params.id as string;

export const quotationController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const quotations = await quotationService.list(req.query.businessId as string, req.user!.id);
      res.json(quotations);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await quotationService.create(req.body, req.user!.id);
      res.status(201).json(quotation);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await quotationService.getById(p(req), req.user!.id);
      res.json(quotation);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await quotationService.update(p(req), req.body, req.user!.id);
      res.json(quotation);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await quotationService.remove(p(req), req.user!.id);
      res.json({ success: true, message: 'Quotation deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async convertToInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await quotationService.convertToInvoice(p(req), req.user!.id);
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  },
};
