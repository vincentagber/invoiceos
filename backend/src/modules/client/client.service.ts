import prisma from '../../lib/prisma';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors';

export const clientService = {
  async list(businessId: string, userId: string) {
    if (!businessId) return [];

    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    return prisma.client.findMany({
      where: { businessId },
      include: { _count: { select: { invoices: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async create(data: { businessId: string; name: string; contactName?: string; email: string; phone?: string; address?: string; taxId?: string }, userId: string) {
    const owns = await verifyBusinessOwnership(userId, data.businessId);
    if (!owns) throw new ForbiddenError();

    return prisma.client.create({ data });
  },

  async getById(id: string, userId: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { invoices: true },
    });
    if (!client) throw new NotFoundError('Client', id);

    const owns = await verifyBusinessOwnership(userId, client.businessId);
    if (!owns) throw new NotFoundError('Client', id);

    return client;
  },

  async update(id: string, data: { name?: string; contactName?: string; email?: string; phone?: string; address?: string; taxId?: string; version?: number }, userId: string) {
    const current = await prisma.client.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Client', id);

    const owns = await verifyBusinessOwnership(userId, current.businessId);
    if (!owns) throw new NotFoundError('Client', id);

    if (current.version !== (data.version || 1)) {
      throw new ConflictError('Conflict detected', { currentVersion: current.version, lastModified: current.updatedAt });
    }

    return prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        contactName: data.contactName || null,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        taxId: data.taxId || null,
        version: current.version + 1,
      },
    });
  },

  async remove(id: string, userId: string) {
    const current = await prisma.client.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Client', id);

    const owns = await verifyBusinessOwnership(userId, current.businessId);
    if (!owns) throw new NotFoundError('Client', id);

    await prisma.client.delete({ where: { id } });
  },
};
