import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

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
      data: req.body,
    });

    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.params.id },
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
    const business = await prisma.business.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { brandColor, customDomain } = req.body;

    const business = await prisma.business.update({
      where: { id: req.params.id },
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
