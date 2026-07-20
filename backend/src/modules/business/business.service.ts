import prisma from '../../lib/prisma';
import { NotFoundError } from '../../shared/errors';

const ALLOWED_UPDATE_FIELDS = [
  'name', 'address', 'phone', 'email', 'taxNumber', 'paymentDetails',
  'brandColor', 'customDomain', 'defaultCurrency', 'invoicePrefix',
  'defaultDuePeriod', 'defaultDiscount', 'defaultNotes',
  'invoiceReminders', 'documentStyle', 'estimatePrefix', 'bccEmails',
  'autoSendInvoice', 'paymentReminders', 'dailySummary',
] as const;

const whitelistBody = (body: Record<string, unknown>): Record<string, unknown> => {
  const data: Record<string, unknown> = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
};

export const businessService = {
  async getCurrent(userId: string) {
    const business = await prisma.business.findFirst({
      where: { ownerId: userId },
      include: { _count: { select: { clients: true, invoices: true } } },
    });
    if (!business) throw new NotFoundError('Business');
    return business;
  },

  async updateCurrent(userId: string, data: Record<string, unknown>) {
    const existing = await prisma.business.findFirst({ where: { ownerId: userId } });
    if (!existing) throw new NotFoundError('Business');

    return prisma.business.update({
      where: { id: existing.id },
      data: whitelistBody(data),
    });
  },

  async getById(id: string, userId: string) {
    const business = await prisma.business.findFirst({
      where: { id, ownerId: userId },
      include: { _count: { select: { clients: true, invoices: true } } },
    });
    if (!business) throw new NotFoundError('Business', id);
    return business;
  },

  async update(id: string, userId: string, data: Record<string, unknown>) {
    const existing = await prisma.business.findFirst({ where: { id, ownerId: userId } });
    if (!existing) throw new NotFoundError('Business', id);

    return prisma.business.update({
      where: { id },
      data: whitelistBody(data),
    });
  },

  async updateBranding(id: string, userId: string, branding: { brandColor?: string; customDomain?: string }) {
    const existing = await prisma.business.findFirst({ where: { id, ownerId: userId } });
    if (!existing) throw new NotFoundError('Business', id);

    return prisma.business.update({
      where: { id },
      data: { brandColor: branding.brandColor, customDomain: branding.customDomain },
    });
  },
};
