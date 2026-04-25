import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCurrent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findFirst({
      where: { ownerId: req.user?.id },
      include: { _count: { select: { clients: true, invoices: true } } }
    });
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.params.id as string },
      include: { _count: { select: { clients: true, invoices: true } } }
    });
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const business = await prisma.business.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.json(business);
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { logo, brandColor, customDomain } = req.body;
    const business = await prisma.business.update({
      where: { id: req.params.id as string },
      data: { logo, brandColor, customDomain }
    });
    res.json(business);
  } catch (error) {
    next(error);
  }
};
