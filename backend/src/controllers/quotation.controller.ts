import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;

    if (!businessId) return res.json([]);

    const quotations = await prisma.quotation.findMany({
      where: { businessId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, items, ...data } = req.body;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: data.quotationNumber || `QT-${Date.now()}`,
        businessId,
        clientId,
        status: 'DRAFT',
        currency: data.currency || 'USD',
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(),
        taxRate: data.taxRate || 0,
        discountAmount: data.discountAmount || 0,
        totalAmount: data.totalAmount || 0,
        items: items?.length ? {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        } : undefined,
      },
      include: { items: true, client: true },
    });

    res.status(201).json(quotation);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { client: true, items: true },
    });

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, ...data } = req.body;

    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        ...data,
        items: items ? {
          deleteMany: {},
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        } : undefined,
      },
      include: { items: true, client: true },
    });

    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.quotation.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const convertToInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        businessId: quotation.businessId,
        clientId: quotation.clientId,
        currency: quotation.currency,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        taxRate: quotation.taxRate,
        discountAmount: quotation.discountAmount,
        totalAmount: quotation.totalAmount,
        status: 'DRAFT',
        items: {
          create: quotation.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    await prisma.quotation.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};
