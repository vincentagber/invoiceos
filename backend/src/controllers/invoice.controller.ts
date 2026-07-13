import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, verifyBusinessOwnership } from '../middlewares/auth.middleware';

const verifyInvoiceAccess = async (userId: string, invoiceId: string): Promise<{ allowed: boolean; invoice?: any }> => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { businessId: true, id: true, invoiceNumber: true, totalAmount: true, status: true, version: true, updatedAt: true, client: { select: { name: true } } },
  });
  if (!invoice) return { allowed: false };
  const allowed = await verifyBusinessOwnership(userId, invoice.businessId);
  return { allowed, invoice };
};

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, status, startDate, endDate, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!businessId) {
      return res.json({ data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } });
    }

    const owns = await verifyBusinessOwnership(req.user!.id, businessId as string);
    if (!owns) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const where: any = { businessId: businessId as string };
    if (clientId) where.clientId = clientId as string;
    if (status) where.status = status as string;
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const skip = (Number(page) - 1) * Number(limit);
    const allowedSortFields = ['createdAt', 'updatedAt', 'issueDate', 'dueDate', 'totalAmount', 'status', 'invoiceNumber'];
    const orderField = allowedSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          items: true,
        },
        orderBy: { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      data: invoices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, items, ...data } = req.body;

    const owns = await verifyBusinessOwnership(req.user!.id, businessId);
    if (!owns) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
        businessId,
        clientId,
        status: 'DRAFT',
        currency: data.currency || 'USD',
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        taxRate: data.taxRate || 0,
        discountAmount: data.discountAmount || 0,
        totalAmount: data.totalAmount || 0,
        items: items?.length ? {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        } : undefined,
      },
      include: { items: true, client: true },
    });

    const io = req.app.get('io');
    io.to(businessId).emit('invoice-created', invoice);

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { allowed } = await verifyInvoiceAccess(req.user!.id, req.params.id as string);
    if (!allowed) return res.status(404).json({ message: 'Invoice not found' });

    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id as string },
      include: {
        client: true,
        items: true,
        payments: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const { allowed } = await verifyInvoiceAccess(req.user!.id, req.params.id as string);
    if (!allowed) return res.status(404).json({ message: 'Invoice not found' });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: { status },
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-status-updated', {
      id: invoice.id,
      status,
      invoiceNumber: invoice.invoiceNumber,
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const trackView = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        status: 'VIEWED',
      },
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-viewed', {
      id: invoice.id,
      viewCount: invoice.viewCount,
      invoiceNumber: invoice.invoiceNumber,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const addPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, method, transactionId } = req.body;
    const invoiceId = req.params.id as string;

    const { allowed, invoice: inv } = await verifyInvoiceAccess(req.user!.id, invoiceId);
    if (!allowed) return res.status(404).json({ message: 'Invoice not found' });

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId: transactionId || null,
        status: 'SUCCESS',
        paidAt: new Date(),
      },
      include: { invoice: true },
    });

    const allPayments = await prisma.payment.findMany({
      where: { invoiceId, status: 'SUCCESS' },
      select: { amount: true },
    });

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const fullInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { totalAmount: true, businessId: true } });
    const newStatus = totalPaid >= Number(fullInvoice?.totalAmount || 0) ? 'PAID' : 'PARTIAL';

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });

    const io = req.app.get('io');
    io.to(fullInvoice!.businessId).emit('payment-received', {
      id: invoiceId,
      amount,
      invoiceNumber: inv.invoiceNumber,
      totalPaid,
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, version, ...data } = req.body;
    const invoiceId = req.params.id as string;

    const { allowed, invoice: current } = await verifyInvoiceAccess(req.user!.id, invoiceId);
    if (!allowed) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (current.version !== (version || 1)) {
      const io = req.app.get('io');
      io.to(current.businessId).emit('invoice-updated', current);
      return res.status(409).json({
        message: 'Conflict detected: The document has been modified by another user.',
        currentVersion: current.version,
        lastModified: current.updatedAt,
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...data,
        version: current.version + 1,
        ...(items ? {
          items: {
            deleteMany: {},
            create: items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        } : {}),
      },
      include: { items: true, client: true },
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-updated', invoice);

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const triggerReminder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { allowed } = await verifyInvoiceAccess(req.user!.id, req.params.id as string);
    if (!allowed) return res.status(404).json({ message: 'Invoice not found' });

    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id as string },
      include: { client: true },
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('notification', {
      title: 'Reminder Sent',
      message: `Overdue reminder sent to ${invoice.client.name} for Invoice #${invoice.invoiceNumber}`,
      type: 'info',
    });

    res.json({ success: true, message: 'Reminder triggered' });
  } catch (error) {
    next(error);
  }
};

export const sendInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { allowed } = await verifyInvoiceAccess(req.user!.id, req.params.id as string);
    if (!allowed) return res.status(404).json({ message: 'Invoice not found' });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: { status: 'SENT' },
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-sent', {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    });

    res.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { allowed } = await verifyInvoiceAccess(req.user!.id, req.params.id as string);
    if (!allowed) return res.status(404).json({ message: 'Invoice not found' });

    await prisma.invoice.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
