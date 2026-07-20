import { Request, Response, NextFunction } from 'express';
import { expenseService } from './expense.service';
import XLSX from 'xlsx';

const columnMapping: Record<string, string> = {
  merchant: 'merchant', vendor: 'merchant', payee: 'merchant', name: 'merchant',
  amount: 'amount', cost: 'amount', price: 'amount', value: 'amount',
  currency: 'currency', category: 'category', type: 'category',
  description: 'description', desc: 'description', notes: 'notes', note: 'notes',
  date: 'date', transactiondate: 'date', 'transaction date': 'date',
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
  if (!mapped.currency) mapped.currency = 'USD';
  if (!mapped.date) mapped.date = new Date();
  return mapped;
}

export const expenseController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const expenses = await expenseService.list(req.query.businessId as string, req.user!.id);
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.create(req.body, req.user!.id);

      const io = req.app.get('io');
      io.to(req.body.businessId).emit('expense-recorded', expense);

      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expenseService.update(req.params.id as string, req.body, req.user!.id);
      res.json(expense);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await expenseService.remove(req.params.id as string, req.user!.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async uploadExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.body.businessId as string;
      if (!businessId) {
        return res.status(400).json({ message: 'Business ID is required' });
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

      const expensesData = rows.map((row) => mapRowToExpenseData(row));
      const created = await expenseService.bulkCreate(expensesData, businessId, req.user!.id);

      const io = req.app.get('io');
      io.to(businessId).emit('expense-recorded', { count: created.length });

      res.status(201).json({ count: created.length, expenses: created });
    } catch (error) {
      next(error);
    }
  },
};
