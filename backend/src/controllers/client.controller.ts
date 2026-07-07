import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;

    if (!businessId) {
      return res.json([]);
    }

    const clients = await prisma.client.findMany({
      where: { businessId },
      include: { _count: { select: { invoices: true } } },
      orderBy: { name: 'asc' },
    });

    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, name, contactName, email, phone, address, taxId } = req.body;
    const client = await prisma.client.create({
      data: {
        businessId,
        name,
        contactName: contactName || null,
        email,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { invoices: true },
    });

    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { version, name, contactName, email, phone, address, taxId } = req.body;
    const clientId = req.params.id;

    const current = await prisma.client.findUnique({ where: { id: clientId } });
    if (!current) {
      return res.status(404).json({ message: 'Client not found' });
    }
    if (current.version !== (version || 1)) {
      return res.status(409).json({
        message: 'Conflict detected',
        currentVersion: current.version,
        lastModified: current.updatedAt,
      });
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: {
        name,
        contactName: contactName || null,
        email,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
        version: current.version + 1,
      },
    });

    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
