import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const ALLOWED_UPDATE_FIELDS = [
  'name', 'address', 'phone', 'email', 'taxNumber', 'paymentDetails',
  'brandColor', 'customDomain', 'defaultCurrency', 'invoicePrefix',
  'defaultDuePeriod', 'defaultDiscount', 'defaultNotes',
  'invoiceReminders', 'documentStyle', 'estimatePrefix', 'bccEmails',
  'autoSendInvoice', 'paymentReminders', 'dailySummary',
];

const whitelistBody = (body: any): any => {
  const data: any = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
};

export const getCurrent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findFirst({
      where: { ownerId: req.user?.id },
      include: {
        _count: { select: { clients: true, invoices: true } },
      },
    });

    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const updateCurrent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.business.findFirst({
      where: { ownerId: req.user?.id },
    });

    if (!existing) return res.status(404).json({ message: 'Business not found' });

    const business = await prisma.business.update({
      where: { id: existing.id },
      data: whitelistBody(req.body),
    });

    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findFirst({
      where: { id: req.params.id as string, ownerId: req.user?.id },
      include: {
        _count: { select: { clients: true, invoices: true } },
      },
    });

    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.business.findFirst({
      where: { id: req.params.id as string, ownerId: req.user?.id },
    });

    if (!existing) return res.status(404).json({ message: 'Business not found' });

    const business = await prisma.business.update({
      where: { id: req.params.id as string },
      data: whitelistBody(req.body),
    });

    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.business.findFirst({
      where: { id: req.params.id as string, ownerId: req.user?.id },
    });

    if (!existing) return res.status(404).json({ message: 'Business not found' });

    const { brandColor, customDomain } = req.body;

    const business = await prisma.business.update({
      where: { id: req.params.id as string },
      data: {
        brandColor: brandColor || undefined,
        customDomain: customDomain || undefined,
      },
    });

    res.json(business);
  } catch (error) {
    next(error);
  }
};
