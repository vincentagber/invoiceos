import prisma from '../../lib/prisma';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { CreateExpenseDTO, UpdateExpenseDTO } from './expense.types';

export const expenseService = {
  async list(businessId: string, userId: string) {
    if (!businessId) throw new ForbiddenError('Business ID is required');

    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    return prisma.expense.findMany({
      where: { businessId },
      orderBy: { date: 'desc' },
    });
  },

  async create(data: CreateExpenseDTO, userId: string) {
    const owns = await verifyBusinessOwnership(userId, data.businessId);
    if (!owns) throw new ForbiddenError();

    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
      select: { defaultCurrency: true },
    });
    const defaultCurrency = business?.defaultCurrency || 'USD';

    const expense = await prisma.expense.create({
      data: {
        businessId: data.businessId,
        description: data.description,
        amount: data.amount,
        category: data.category,
        merchant: data.merchant || 'Unknown Merchant',
        currency: data.currency || defaultCurrency,
        date: data.date ? new Date(data.date) : new Date(),
        userId,
      },
    });

    return expense;
  },

  async update(id: string, data: UpdateExpenseDTO, userId: string) {
    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Expense', id);

    const owns = await verifyBusinessOwnership(userId, current.businessId);
    if (!owns) throw new NotFoundError('Expense', id);

    const { businessId, ...updateData } = data;

    return prisma.expense.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });
  },

  async remove(id: string, userId: string) {
    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Expense', id);

    const owns = await verifyBusinessOwnership(userId, current.businessId);
    if (!owns) throw new NotFoundError('Expense', id);

    await prisma.expense.delete({ where: { id } });
  },

  async bulkCreate(expenses: Array<Partial<CreateExpenseDTO>>, businessId: string, userId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { defaultCurrency: true },
    });
    const defaultCurrency = business?.defaultCurrency || 'USD';

    await prisma.expense.createMany({
      data: expenses.map((data) => ({
        businessId,
        userId,
        merchant: data.merchant || 'Unknown Merchant',
        amount: data.amount ?? 0,
        currency: data.currency || defaultCurrency,
        category: data.category,
        description: data.description,
        date: data.date || new Date(),
      })),
    });

    return prisma.expense.findMany({
      where: { businessId },
      orderBy: { date: 'desc' },
      take: expenses.length,
    });
  },
};
