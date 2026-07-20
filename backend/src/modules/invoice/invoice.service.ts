import { Prisma } from '@prisma/client';
import { invoiceRepository } from './invoice.repository';
import { CreateInvoiceDTO, UpdateInvoiceDTO, InvoiceFilter, InvoicePublicResponse } from './invoice.types';
import { calculateInvoiceTaxesAsync, calculateInvoiceTaxes } from '../tax/tax.service';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { prisma } from '../../shared/lib/prisma';

type InvoiceAccessInfo = NonNullable<Awaited<ReturnType<typeof invoiceRepository.findWithBusiness>>>;

const ALLOWED_UPDATE_FIELDS = [
  'invoiceNumber', 'currency', 'issueDate', 'dueDate',
  'isRecurring', 'recurringFrequency',
] as const;

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'issueDate', 'dueDate', 'totalAmount', 'status', 'invoiceNumber'];

const whitelistFields = (body: Record<string, unknown>): Record<string, unknown> => {
  const safe: Record<string, unknown> = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) {
      safe[field] = field === 'issueDate' || field === 'dueDate'
        ? new Date(body[field] as string)
        : body[field];
    }
  }
  return safe;
};

export const invoiceService = {
  async list(filter: InvoiceFilter, pagination: { page: number; limit: number; sortBy: string; sortOrder: string }, userId: string) {
    const owns = await verifyBusinessOwnership(userId, filter.businessId);
    if (!owns) throw new ForbiddenError('Unauthorized');

    const where: Prisma.InvoiceWhereInput = { businessId: filter.businessId, deletedAt: null };
    if (filter.clientId) where.clientId = filter.clientId;
    if (filter.status) where.status = filter.status as any;
    if (filter.startDate) where.createdAt = { ...((where.createdAt as Prisma.DateTimeFilter) || {}), gte: new Date(filter.startDate) };
    if (filter.endDate) where.createdAt = { ...((where.createdAt as Prisma.DateTimeFilter) || {}), lte: new Date(filter.endDate) };

    const skip = (pagination.page - 1) * pagination.limit;
    const orderField = ALLOWED_SORT_FIELDS.includes(pagination.sortBy) ? pagination.sortBy : 'createdAt';

    const [invoices, total] = await Promise.all([
      invoiceRepository.findMany({
        where,
        orderBy: { [orderField]: pagination.sortOrder === 'asc' ? 'asc' : 'desc' } as Prisma.InvoiceOrderByWithRelationInput,
        skip,
        take: pagination.limit,
      }),
      invoiceRepository.count(where),
    ]);

    return {
      data: invoices,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  },

  async create(input: CreateInvoiceDTO, userId: string) {
    const owns = await verifyBusinessOwnership(userId, input.businessId);
    if (!owns) throw new ForbiddenError('Unauthorized');

    const business = await prisma.business.findUnique({
      where: { id: input.businessId },
      select: { country: true },
    });
    if (!business) throw new NotFoundError('Business', input.businessId);

    const calcResult = await calculateInvoiceTaxesAsync({
      countryCode: business.country,
      currency: input.currency,
      items: input.items || [],
      discountAmount: input.discountAmount || 0,
      applyWht: input.applyWht || false,
      whtRateOverride: input.whtRateOverride,
      isTaxInclusive: input.isTaxInclusive || false,
    });

    const mainVatRate = calcResult.taxLines.find((t) => !t.isWithholding)?.rate || 0;

    const invoice = await invoiceRepository.create({
      invoiceNumber: input.invoiceNumber || `INV-${Date.now()}`,
      business: { connect: { id: input.businessId } },
      client: { connect: { id: input.clientId } },
      status: 'DRAFT',
      currency: input.currency || 'USD',
      issueDate: input.issueDate ? new Date(input.issueDate) : new Date(),
      dueDate: input.dueDate ? new Date(input.dueDate) : new Date(),
      taxRate: mainVatRate,
      discountAmount: calcResult.discountAmount,
      totalAmount: calcResult.totalAmount,
      applyWht: input.applyWht || false,
      whtRateOverride: input.whtRateOverride || null,
      isTaxInclusive: input.isTaxInclusive || false,
      isRecurring: input.isRecurring || false,
      recurringFrequency: input.recurringFrequency || null,
      items: input.items?.length
        ? {
            create: input.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          }
        : undefined,
      taxLines: {
        create: calcResult.taxLines.map((t) => ({
          name: t.name,
          rate: t.rate,
          amount: t.amount,
        })),
      },
    });

    return invoice;
  },

  async getById(invoiceId: string, userId: string) {
    const { allowed } = await this.verifyAccess(userId, invoiceId);
    if (!allowed) throw new NotFoundError('Invoice', invoiceId);

    const invoice = await invoiceRepository.findById(invoiceId);
    return invoice;
  },

  async update(invoiceId: string, input: UpdateInvoiceDTO & { version?: number }, userId: string) {
    const { allowed, invoice } = await this.verifyAccess(userId, invoiceId);
    if (!allowed || !invoice) throw new NotFoundError('Invoice', invoiceId);
    const current = invoice;

    if (current.version !== (input.version || 1)) {
      throw new ConflictError('Conflict detected: The document has been modified by another user.', {
        currentVersion: current.version,
        lastModified: current.updatedAt,
      });
    }

    const safeData = whitelistFields(input as unknown as Record<string, unknown>);

    const fullInvoice = await invoiceRepository.findForTaxCalculation(invoiceId);
    if (!fullInvoice?.business) throw new NotFoundError('Business');

    const invoiceItems = input.items ?? fullInvoice.items ?? [];
    const discountAmount = input.discountAmount !== undefined ? input.discountAmount : Number(fullInvoice.discountAmount || 0);
    const applyWht = input.applyWht !== undefined ? input.applyWht : fullInvoice.applyWht || false;
    const whtRateOverride = input.whtRateOverride !== undefined ? input.whtRateOverride : (fullInvoice.whtRateOverride ? Number(fullInvoice.whtRateOverride) : undefined);
    const isTaxInclusive = input.isTaxInclusive !== undefined ? input.isTaxInclusive : fullInvoice.isTaxInclusive || false;

    const calcResult = await calculateInvoiceTaxesAsync({
      countryCode: fullInvoice.business.country,
      items: invoiceItems as Array<{ quantity: number; unitPrice: number }>,
      discountAmount,
      applyWht,
      whtRateOverride,
      isTaxInclusive,
    });

    const mainVatRate = calcResult.taxLines.find((t) => !t.isWithholding)?.rate || 0;

    await invoiceRepository.deleteTaxLines(invoiceId);

    const updatedInvoice = await invoiceRepository.update(invoiceId, {
      ...safeData,
      taxRate: mainVatRate,
      discountAmount: calcResult.discountAmount,
      totalAmount: calcResult.totalAmount,
      applyWht,
      whtRateOverride: whtRateOverride ?? null,
      isTaxInclusive,
      version: current.version + 1,
      ...(input.items
        ? {
            items: {
              deleteMany: {},
              create: input.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          }
        : {}),
      taxLines: {
        create: calcResult.taxLines.map((t) => ({
          name: t.name,
          rate: t.rate,
          amount: t.amount,
        })),
      },
    });

    return updatedInvoice;
  },

  async updateStatus(invoiceId: string, status: string, userId: string) {
    const { allowed, invoice: current } = await this.verifyAccess(userId, invoiceId);
    if (!allowed) throw new NotFoundError('Invoice', invoiceId);

    const invoice = await invoiceRepository.updateStatus(invoiceId, status);
    return invoice;
  },

  async trackView(invoiceId: string, userId: string) {
    const invoice = await invoiceRepository.incrementView(invoiceId);
    return invoice;
  },

  async addPayment(invoiceId: string, input: { amount: number; method: string; transactionId?: string }, userId: string) {
    const { allowed, invoice: inv } = await this.verifyAccess(userId, invoiceId);
    if (!allowed || !inv) throw new NotFoundError('Invoice', invoiceId);

    const payment = await invoiceRepository.createPayment({
      invoice: { connect: { id: invoiceId } },
      amount: input.amount,
      method: input.method as Prisma.PaymentCreateInput['method'],
      transactionId: input.transactionId || null,
      status: 'SUCCESS',
      paidAt: new Date(),
    });

    const allPayments = await invoiceRepository.getSuccessPaymentsForInvoice(invoiceId);
    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const fullInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { totalAmount: true, businessId: true },
    });
    const newStatus = totalPaid >= Number(fullInvoice?.totalAmount || 0) ? 'PAID' : 'PARTIAL';
    await invoiceRepository.updateStatus(invoiceId, newStatus);

    return { payment, businessId: fullInvoice?.businessId, invoiceNumber: inv.invoiceNumber, totalPaid };
  },

  async triggerReminder(invoiceId: string, userId: string) {
    const { allowed, invoice } = await this.verifyAccess(userId, invoiceId);
    if (!allowed || !invoice) throw new NotFoundError('Invoice', invoiceId);
    return invoice;
  },

  async sendInvoice(invoiceId: string, userId: string) {
    const { allowed } = await this.verifyAccess(userId, invoiceId);
    if (!allowed) throw new NotFoundError('Invoice', invoiceId);

    const invoice = await invoiceRepository.updateStatus(invoiceId, 'SENT');
    return invoice;
  },

  async remove(invoiceId: string, userId: string) {
    const { allowed } = await this.verifyAccess(userId, invoiceId);
    if (!allowed) throw new NotFoundError('Invoice', invoiceId);

    await invoiceRepository.softDelete(invoiceId);
  },

  async getPublic(invoiceId: string): Promise<InvoicePublicResponse> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        business: {
          select: { name: true, email: true, phone: true, address: true, defaultNotes: true },
        },
      },
    });

    if (!invoice) throw new NotFoundError('Invoice', invoiceId);

    return {
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      total: Number(invoice.totalAmount),
      currency: invoice.currency,
      due_date: invoice.dueDate.toISOString().split('T')[0],
      issue_date: invoice.issueDate.toISOString().split('T')[0],
      status: invoice.status.toLowerCase(),
      notes: invoice.business.defaultNotes || '',
      items: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: Number(item.unitPrice),
      })),
      business: {
        name: invoice.business.name,
        email: invoice.business.email,
        phone: invoice.business.phone,
        address: invoice.business.address,
      },
    };
  },

  async verifyAccess(userId: string, invoiceId: string): Promise<{ allowed: boolean; invoice?: InvoiceAccessInfo }> {
    const invoice = await invoiceRepository.findWithBusiness(invoiceId);
    if (!invoice) return { allowed: false };
    const allowed = await verifyBusinessOwnership(userId, invoice.businessId);
    return { allowed, invoice };
  },
};
