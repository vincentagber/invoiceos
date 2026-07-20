import prisma from '../lib/prisma';
import { PaymentStatus, InvoiceStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export interface ReconciliationRecord {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  transactionId: string | null;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  matched: boolean;
}

/**
 * Get all payments for a business with their invoice details
 */
export async function getPaymentReconciliation(businessId: string): Promise<ReconciliationRecord[]> {
  const invoices = await prisma.invoice.findMany({
    where: { businessId },
    select: {
      id: true,
      invoiceNumber: true,
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const records: ReconciliationRecord[] = [];

  for (const invoice of invoices) {
    for (const payment of invoice.payments) {
      records.push({
        paymentId: payment.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: Number(payment.amount),
        method: payment.method,
        transactionId: payment.transactionId,
        status: payment.status,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        matched: true, // All payments in our system are linked to an invoice
      });
    }
  }

  return records;
}

/**
 * Get all invoices with their payment status for reconciliation
 */
export async function getInvoiceReconciliation(businessId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { businessId },
    include: {
      client: { select: { name: true, email: true } },
      payments: {
        select: { id: true, amount: true, status: true, method: true, paidAt: true, transactionId: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return invoices.map(inv => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.client.name,
    clientEmail: inv.client.email,
    totalAmount: Number(inv.totalAmount),
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    totalPaid: inv.payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    paymentCount: inv.payments.filter(p => p.status === 'SUCCESS').length,
    balance: Number(inv.totalAmount) - inv.payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    payments: inv.payments,
  }));
}

/**
 * Get a summary of reconciliation status for the dashboard
 */
export async function getReconciliationSummary(businessId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { businessId },
    select: {
      id: true,
      totalAmount: true,
      status: true,
      payments: {
        where: { status: 'SUCCESS' },
        select: { amount: true },
      },
    },
  });

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let invoiceCount = 0;
  let paidInvoiceCount = 0;
  let partialInvoiceCount = 0;
  let unpaidInvoiceCount = 0;

  for (const inv of invoices) {
    const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const amount = Number(inv.totalAmount);
    totalInvoiced += amount;
    totalPaid += paid;
    totalOutstanding += amount - paid;
    invoiceCount++;

    if (inv.status === 'PAID') paidInvoiceCount++;
    else if (inv.status === 'PARTIAL') partialInvoiceCount++;
    else if (inv.status === 'SENT' || inv.status === 'VIEWED' || inv.status === 'OVERDUE') unpaidInvoiceCount++;
  }

  return {
    totalInvoiced,
    totalPaid,
    totalOutstanding,
    invoiceCount,
    paidInvoiceCount,
    partialInvoiceCount,
    unpaidInvoiceCount,
    collectionRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
  };
}

/**
 * Manually match a payment to an invoice (for bank transfer reconciliation)
 */
export async function matchPaymentToInvoice(paymentId: string, invoiceId: string) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { invoiceId },
  });
}

/**
 * Auto-reconcile: mark an invoice as paid manually (for bank transfers)
 */
export async function markInvoiceAsPaid(invoiceId: string, amount: number, method: string, transactionId?: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount,
        method: method as any,
        transactionId: transactionId || null,
        status: 'SUCCESS',
        paidAt: new Date(),
      },
    });

    const allPayments = await tx.payment.findMany({
      where: { invoiceId, status: 'SUCCESS' },
      select: { amount: true },
    });

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const invoice = await tx.invoice.findUnique({ where: { id: invoiceId }, select: { totalAmount: true } });
    const newStatus = invoice && totalPaid >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIAL';

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });

    return payment;
  });
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: true },
  });

  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'SUCCESS') throw new Error('Only successful payments can be refunded');

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    const allPayments = await tx.payment.findMany({
      where: { invoiceId: payment.invoiceId, status: 'SUCCESS' },
      select: { amount: true },
    });

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const newStatus = totalPaid >= Number(payment.invoice.totalAmount) ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'SENT';

    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: newStatus },
    });

    return updated;
  });
}

/**
 * Mark a payment as disputed (chargeback)
 */
export async function markPaymentDisputed(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Payment not found');

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'DISPUTED' },
    });

    const allPayments = await tx.payment.findMany({
      where: { invoiceId: payment.invoiceId, status: 'SUCCESS' },
      select: { amount: true },
    });

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId }, select: { totalAmount: true } });
    const newStatus = invoice && totalPaid >= Number(invoice.totalAmount) ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'SENT';

    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: newStatus },
    });

    return updated;
  });
}
