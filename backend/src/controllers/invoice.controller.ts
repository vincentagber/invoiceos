import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;
    const invoices = await prisma.invoice.findMany({
      where: { businessId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, items, ...data } = req.body;

    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        businessId,
        clientId,
        items: {
          create: items
        }
      },
      include: { client: true, items: true }
    });

    // Notify clients via Socket.io
    const io = req.app.get('io');
    io.to(businessId).emit('invoice-created', invoice);

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id as string },
      include: { client: true, items: true, payments: true }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, ...data } = req.body;
    
    // Delete existing items and recreate (simpler for updates)
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: req.params.id as string } });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        items: {
          create: items
        }
      },
      include: { client: true, items: true }
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: { status },
      include: { business: true }
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-status-updated', { id: invoice.id, status });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const trackView = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        status: {
          set: 'VIEWED' // Automatically move to VIEWED status if currently SENT
        }
      }
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-viewed', { id: invoice.id, viewCount: invoice.viewCount });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
