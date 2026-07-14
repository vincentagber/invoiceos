import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, verifyBusinessOwnership } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import XLSX from 'xlsx';

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
        merchant: data.merchant || 'Unknown Merchant',
        currency: data.currency || 'NGN',
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

const columnMapping: Record<string, string> = {
  merchant: 'merchant',
  vendor: 'merchant',
  payee: 'merchant',
  name: 'merchant',
  amount: 'amount',
  cost: 'amount',
  price: 'amount',
  value: 'amount',
  currency: 'currency',
  category: 'category',
  type: 'category',
  description: 'description',
  desc: 'description',
  notes: 'notes',
  note: 'notes',
  date: 'date',
  transactiondate: 'date',
  'transaction date': 'date',
};

function normalizeColumnName(col: string): string {
  return col.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function mapRowToExpenseData(row: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const normalized = normalizeColumnName(key);
    const target = columnMapping[normalized] || columnMapping[key.toLowerCase()];
    if (target && value !== null && value !== undefined && value !== '') {
      if (target === 'amount') {
        const num = Number(value);
        if (!isNaN(num)) mapped.amount = num;
      } else if (target === 'date') {
        if (typeof value === 'number') {
          const excelEpoch = new Date(1899, 11, 30);
          mapped.date = new Date(excelEpoch.getTime() + value * 86400000);
        } else {
          const d = new Date(value as string);
          if (!isNaN(d.getTime())) mapped.date = d;
        }
      } else {
        mapped[target] = String(value).trim();
      }
    }
  }

  if (!mapped.currency) mapped.currency = 'NGN';
  if (!mapped.date) mapped.date = new Date();

  return mapped;
}

export const uploadExcel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.body.businessId;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    const owns = await verifyBusinessOwnership(req.user!.id, businessId);
    if (!owns) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Excel file is required' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ message: 'Excel file has no sheets' });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const expensesData = rows.map(row => mapRowToExpenseData(row));

    const created = [];
    for (const data of expensesData) {
      const expense = await prisma.expense.create({
        data: {
          businessId,
          userId: req.user?.id,
          merchant: (data.merchant as string) || 'Unknown Merchant',
          amount: data.amount as number,
          currency: (data.currency as string) || 'NGN',
          category: data.category as string | undefined,
          description: data.description as string | undefined,
          date: data.date instanceof Date ? data.date : new Date(),
          notes: data.notes as string | undefined,
        },
      });
      created.push(expense);
    }

    const io = req.app.get('io');
    io.to(businessId).emit('expense-recorded', { count: created.length });

    res.status(201).json({ count: created.length, expenses: created });
  } catch (error) {
    next(error);
  }
};
