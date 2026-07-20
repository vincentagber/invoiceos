import { Request, Response, NextFunction } from 'express';
import { invoiceService } from './invoice.service';
import type { InvoiceFilter } from './invoice.types';
import prisma from '../../lib/prisma';

const p = (req: Request) => req.params.id as string;

export const invoiceController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId, clientId, status, startDate, endDate, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      if (!businessId) {
        return res.json({ data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } });
      }

      const result = await invoiceService.list(
        {
          businessId: businessId as string,
          clientId: clientId as string,
          status: (status as string) as InvoiceFilter['status'],
          startDate: startDate as string,
          endDate: endDate as string,
        },
        { page: Number(page), limit: Number(limit), sortBy: sortBy as string, sortOrder: sortOrder as string },
        req.user!.id,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.create(req.body, req.user!.id);

      const io = req.app.get('io');
      io.to(req.body.businessId).emit('invoice-created', invoice);

      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.getById(p(req), req.user!.id);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.update(p(req), req.body, req.user!.id);

      const io = req.app.get('io');
      if (invoice) io.to(invoice.businessId).emit('invoice-updated', invoice);

      res.json(invoice);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.body.status as string;
      const invoice = await invoiceService.updateStatus(p(req), status, req.user!.id);

      const io = req.app.get('io');
      if (invoice) {
        io.to(invoice.businessId).emit('invoice-status-updated', {
          id: invoice.id,
          status,
          invoiceNumber: invoice.invoiceNumber,
        });
      }

      res.json(invoice);
    } catch (error) {
      next(error);
    }
  },

  async trackView(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceService.trackView(p(req), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async addPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.addPayment(p(req), req.body, req.user!.id);

      const io = req.app.get('io');
      if (result.businessId) {
        io.to(result.businessId).emit('payment-received', {
          id: p(req),
          amount: req.body.amount,
          invoiceNumber: result.invoiceNumber,
          totalPaid: result.totalPaid,
        });
      }

      res.status(201).json(result.payment);
    } catch (error) {
      next(error);
    }
  },

  async triggerReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.triggerReminder(p(req), req.user!.id);

      const fullInvoice = await prisma.invoice.findUnique({
        where: { id: p(req) },
        include: { client: true },
      });

      const io = req.app.get('io');
      if (invoice) {
        io.to(invoice.businessId).emit('notification', {
          title: 'Reminder Sent',
          message: `Overdue reminder sent to ${fullInvoice?.client?.name} for Invoice #${invoice.invoiceNumber}`,
          type: 'info',
        });
      }

      res.json({ success: true, message: 'Reminder triggered' });
    } catch (error) {
      next(error);
    }
  },

  async sendInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.sendInvoice(p(req), req.user!.id);

      const io = req.app.get('io');
      if (invoice) {
        io.to(invoice.businessId).emit('invoice-sent', {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
        });
      }

      res.json({ success: true, message: 'Invoice sent successfully' });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceService.remove(p(req), req.user!.id);
      res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.getPublic(p(req));
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  },
};
