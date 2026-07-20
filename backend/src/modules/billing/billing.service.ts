import prisma from '../../lib/prisma';
import axios from 'axios';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { ForbiddenError, NotFoundError } from '../../shared/errors';

export const billingService = {
  async verifySubscription(data: { reference: string; businessId: string; plan: string; billingCycle: string; amount: number }, userId: string) {
    const owns = await verifyBusinessOwnership(userId, data.businessId);
    if (!owns) throw new ForbiddenError();

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${data.reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    if (response.data.data.status !== 'success') {
      throw new Error('Paystack verification failed');
    }

    const paystackAmount = response.data.data.amount / 100;
    if (Math.abs(paystackAmount - data.amount) > 0.01) {
      throw new Error('Amount mismatch between request and Paystack');
    }

    const startDate = new Date();
    const endDate = new Date();
    if (data.billingCycle.toLowerCase() === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const existingSub = await prisma.subscription.findUnique({ where: { businessId: data.businessId } });

    let subscription;
    if (existingSub) {
      subscription = await prisma.subscription.update({
        where: { businessId: data.businessId },
        data: {
          plan: data.plan.toUpperCase(),
          status: 'ACTIVE',
          amount: data.amount,
          billingCycle: data.billingCycle.toUpperCase(),
          startDate,
          endDate,
          paystackRef: data.reference,
        },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          businessId: data.businessId,
          plan: data.plan.toUpperCase(),
          status: 'ACTIVE',
          amount: data.amount,
          billingCycle: data.billingCycle.toUpperCase(),
          startDate,
          endDate,
          paystackRef: data.reference,
        },
      });
    }

    await prisma.subscriptionTransaction.create({
      data: {
        subscriptionId: subscription.id,
        plan: data.plan.toUpperCase(),
        amount: data.amount,
        billingCycle: data.billingCycle.toUpperCase(),
        paystackRef: data.reference,
        status: 'SUCCESS',
      },
    });

    return subscription;
  },

  async getSubscription(businessId: string, userId: string) {
    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    const subscription = await prisma.subscription.findUnique({ where: { businessId } });
    return subscription || { status: 'INACTIVE', plan: 'FREE' };
  },

  async getBillingHistory(businessId: string, userId: string) {
    const owns = await verifyBusinessOwnership(userId, businessId);
    if (!owns) throw new ForbiddenError();

    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
      select: { id: true },
    });

    if (!subscription) return [];

    return prisma.subscriptionTransaction.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
    });
  },
};
