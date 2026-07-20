import { Request, Response, NextFunction } from 'express';
import { clientService } from './client.service';

export const clientController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await clientService.list(req.query.businessId as string, req.user!.id);
      res.json(clients);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.create(req.body, req.user!.id);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.getById(req.params.id as string, req.user!.id);
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.update(req.params.id as string, req.body, req.user!.id);
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await clientService.remove(req.params.id as string, req.user!.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
