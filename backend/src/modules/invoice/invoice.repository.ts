import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/lib/prisma';

type WhereInput = Prisma.InvoiceWhereInput;
type OrderByInput = Prisma.InvoiceOrderByWithRelationInput;

const INVOICE_INCLUDE = {
  client: { select: { id: true, name: true, email: true } },
  items: true,
  payments: true,
  taxLines: true,
  business: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      defaultNotes: true,
    },
  },
} as const;

export const invoiceRepository = {
  async findById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: INVOICE_INCLUDE,
    });
  },

  async findWithBusiness(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      select: { businessId: true, id: true, invoiceNumber: true, totalAmount: true, status: true, version: true, updatedAt: true, client: { select: { name: true } } },
    });
  },

  async findMany(options: {
    where: WhereInput;
    orderBy: OrderByInput;
    skip: number;
    take: number;
  }) {
    return prisma.invoice.findMany({
      where: options.where,
      include: { client: { select: { id: true, name: true, email: true } }, items: true },
      orderBy: options.orderBy,
      skip: options.skip,
      take: options.take,
    });
  },

  async count(where: WhereInput) {
    return prisma.invoice.count({ where });
  },

  async create(data: Prisma.InvoiceCreateInput) {
    return prisma.invoice.create({ data, include: INVOICE_INCLUDE });
  },

  async update(id: string, data: Prisma.InvoiceUpdateInput) {
    return prisma.invoice.update({ where: { id }, data, include: INVOICE_INCLUDE });
  },

  async updateStatus(id: string, status: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: status as any },
    });
  },

  async incrementView(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { viewCount: { increment: 1 }, lastViewedAt: new Date(), status: 'VIEWED' },
    });
  },

  async findForTaxCalculation(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      select: {
        discountAmount: true,
        applyWht: true,
        whtRateOverride: true,
        isTaxInclusive: true,
        items: { select: { quantity: true, unitPrice: true } },
        business: { select: { country: true } },
      },
    });
  },

  async softDelete(id: string) {
    return prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async deleteTaxLines(invoiceId: string) {
    return prisma.invoiceTaxLine.deleteMany({ where: { invoiceId } });
  },

  async createPayment(data: Prisma.PaymentCreateInput) {
    return prisma.payment.create({ data, include: { invoice: true } });
  },

  async getSuccessPaymentsForInvoice(invoiceId: string) {
    return prisma.payment.findMany({
      where: { invoiceId, status: 'SUCCESS' },
      select: { amount: true },
    });
  },
};
