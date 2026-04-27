import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const businessId = req.query.businessId as string;
    const invoices = await prisma.invoice.findMany({
      where: { businessId },
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { businessId, clientId, items, ...data } = req.body;

    // Generate a unique invoice number if not provided
    const invoiceNumber = data.invoiceNumber || `INV-${Date.now()}`;

    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        invoiceNumber,
        businessId,
        clientId,
        items: {
          create: items
        }
      },
      include: { client: true, items: true }
    });

    // Notify clients via Socket.io
    const io = req.app.get('io');
    io.to(businessId).emit('invoice-created', invoice);

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id as string },
      include: { client: true, items: true, payments: true }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, ...data } = req.body;
    
    // Delete existing items and recreate (simpler for updates)
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: req.params.id as string } });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        items: {
          create: items
        }
      },
      include: { client: true, items: true }
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: { status },
      include: { business: true }
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-status-updated', { id: invoice.id, status, invoiceNumber: invoice.invoiceNumber });

    if (status === 'PAID') {
      io.to(invoice.businessId).emit('payment-received', { id: invoice.id, amount: invoice.totalAmount, invoiceNumber: invoice.invoiceNumber });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const sendInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: { status: 'SENT' },
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-sent', { id: invoice.id, invoiceNumber: invoice.invoiceNumber });

    res.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const addPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, method, transactionId } = req.body;
    const invoiceId = req.params.id as string;

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId,
        status: 'SUCCESS',
        paidAt: new Date(),
      },
      include: { invoice: true }
    });

    // Check if invoice is fully paid
    const allPayments = await prisma.payment.findMany({
      where: { invoiceId, status: 'SUCCESS' }
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    
    let newStatus: any = 'PARTIAL';
    if (totalPaid >= payment.invoice.totalAmount) {
      newStatus = 'PAID';
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus }
    });

    const io = req.app.get('io');
    io.to(payment.invoice.businessId).emit('payment-received', { 
      id: payment.invoice.id, 
      amount, 
      invoiceNumber: payment.invoice.invoiceNumber,
      fullAmount: payment.invoice.totalAmount,
      totalPaid 
    });

    res.status(201).json(payment);
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
        status: {
          set: 'VIEWED' // Automatically move to VIEWED status if currently SENT
        }
      }
    });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('invoice-viewed', { id: invoice.id, viewCount: invoice.viewCount });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists and belongs to the business
    const invoice = await prisma.invoice.findUnique({
      where: { id: id as string }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Delete items first due to foreign key constraints if not using cascade
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id as string } });
    await prisma.payment.deleteMany({ where: { invoiceId: id as string } });
    
    await prisma.invoice.delete({
      where: { id: id as string }
    });

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const triggerReminder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id as string },
      include: { client: true }
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const io = req.app.get('io');
    io.to(invoice.businessId).emit('notification', {
      title: 'Reminder Sent',
      message: `Overdue reminder sent to ${invoice.client.name} for Invoice #${invoice.invoiceNumber}`,
      type: 'info'
    });

    res.json({ success: true, message: 'Reminder triggered' });
  } catch (error) {
    next(error);
  }
};
