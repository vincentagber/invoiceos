import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;
    const clients = await prisma.client.findMany({
      where: { businessId },
      include: { _count: { select: { invoices: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, ...data } = req.body;
    const client = await prisma.client.create({
      data: { ...data, businessId }
    });
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id as string },
      include: { invoices: true }
    });
    res.json(client);
  } catch (error) {
    next(error);
  }
};
