import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, verifyBusinessOwnership } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    const owns = await verifyBusinessOwnership(req.user!.id, businessId as string);
    if (!owns) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const expenses = await prisma.expense.findMany({
      where: { businessId: businessId as string },
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, ...data } = req.body;

    const owns = await verifyBusinessOwnership(req.user!.id, businessId);
    if (!owns) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const expense = await prisma.expense.create({
      data: {
        ...data,
        businessId,
        userId: req.user?.id,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    const io = req.app.get('io');
    io.to(businessId).emit('expense-recorded', expense);

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const current = await prisma.expense.findUnique({ where: { id: req.params.id as string } });
    if (!current) return res.status(404).json({ message: 'Expense not found' });

    const owns = await verifyBusinessOwnership(req.user!.id, current.businessId);
    if (!owns) return res.status(404).json({ message: 'Expense not found' });

    const { businessId, ...data } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    res.json(expense);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const current = await prisma.expense.findUnique({ where: { id: req.params.id as string } });
    if (!current) return res.status(404).json({ message: 'Expense not found' });

    const owns = await verifyBusinessOwnership(req.user!.id, current.businessId);
    if (!owns) return res.status(404).json({ message: 'Expense not found' });

    await prisma.expense.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
