import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;
    const quotations = await prisma.quotation.findMany({
      where: { businessId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotations);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, items, ...data } = req.body;

    // Generate a unique quotation number if not provided
    const quotationNumber = data.quotationNumber || `QT-${Date.now()}`;

    const quotation = await prisma.quotation.create({
      data: {
        ...data,
        quotationNumber,
        businessId,
        clientId,
        items: {
          create: items
        }
      },
      include: { client: true, items: true }
    });

    res.status(201).json(quotation);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id as string },
      include: { client: true, items: true }
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
    
    // Delete existing items and recreate
    await prisma.quotationItem.deleteMany({ where: { quotationId: req.params.id as string } });

    const quotation = await prisma.quotation.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        items: {
          create: items
        }
      },
      include: { client: true, items: true }
    });

    res.json(quotation);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const quotation = await prisma.quotation.findUnique({
      where: { id: id as string }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    await prisma.quotationItem.deleteMany({ where: { quotationId: id as string } });
    
    await prisma.quotation.delete({
      where: { id: id as string }
    });

    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const convertToInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const quotation = await prisma.quotation.findUnique({
      where: { id: id as string },
      include: { items: true }
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Create a new invoice from quotation data
    const invoiceNumber = `INV-${Date.now()}`; // Simple generation for now
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        businessId: quotation.businessId,
        clientId: quotation.clientId,
        currency: quotation.currency,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
        taxRate: quotation.taxRate,
        discountAmount: quotation.discountAmount,
        totalAmount: quotation.totalAmount,
        status: 'DRAFT',
        items: {
          create: quotation.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: { client: true, items: true }
    });

    // Update quotation status
    await prisma.quotation.update({
      where: { id: id as string },
      data: { status: 'ACCEPTED' }
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};
