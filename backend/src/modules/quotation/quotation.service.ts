import prisma from '../../lib/prisma';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { CreateQuotationDTO, UpdateQuotationDTO } from './quotation.types';

export const quotationService = {
  async list(businessId: string, userId: string) {
    if (!businessId) return [];

    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    return prisma.quotation.findMany({
      where: { businessId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: CreateQuotationDTO, userId: string) {
    const owns = await verifyBusinessOwnership(userId, data.businessId);
    if (!owns) throw new ForbiddenError();

    const { items, ...quotationData } = data;

    return prisma.quotation.create({
      data: {
        quotationNumber: quotationData.quotationNumber || `QT-${Date.now()}`,
        businessId: data.businessId,
        clientId: data.clientId,
        status: 'DRAFT',
        currency: data.currency || 'USD',
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(),
        taxRate: data.taxRate || 0,
        discountAmount: data.discountAmount || 0,
        totalAmount: data.totalAmount || 0,
        items: items?.length
          ? { create: items.map((item) => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice })) }
          : undefined,
      },
      include: { items: true, client: true },
    });
  },

  async getById(id: string, userId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { client: true, items: true },
    });
    if (!quotation) throw new NotFoundError('Quotation', id);

    const owns = await verifyBusinessOwnership(userId, quotation.businessId);
    if (!owns) throw new NotFoundError('Quotation', id);

    return quotation;
  },

  async update(id: string, data: UpdateQuotationDTO, userId: string) {
    const current = await prisma.quotation.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Quotation', id);

    const owns = await verifyBusinessOwnership(userId, current.businessId);
    if (!owns) throw new NotFoundError('Quotation', id);

    const { items, ...updateData } = data;

    return prisma.quotation.update({
      where: { id },
      data: {
        ...updateData,
        status: updateData.status as any,
        items: items
          ? { deleteMany: {}, create: items.map((item) => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice })) }
          : undefined,
      },
      include: { items: true, client: true },
    });
  },

  async remove(id: string, userId: string) {
    const current = await prisma.quotation.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Quotation', id);

    const owns = await verifyBusinessOwnership(userId, current.businessId);
    if (!owns) throw new NotFoundError('Quotation', id);

    await prisma.quotation.delete({ where: { id } });
  },

  async convertToInvoice(id: string, userId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!quotation) throw new NotFoundError('Quotation', id);

    const owns = await verifyBusinessOwnership(userId, quotation.businessId);
    if (!owns) throw new NotFoundError('Quotation', id);

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
          create: quotation.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    await prisma.quotation.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    return invoice;
  },
};
