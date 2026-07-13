import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import axios from 'axios';
import { AuthRequest } from '../middlewares/auth.middleware';
import { verifyBusinessOwnership } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export const verifySubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { reference, businessId, plan, billingCycle, amount } = req.body;

    if (!reference || !businessId || !plan || !billingCycle || !amount) {
        return res.status(400).json({ error: 'Missing institutional parameters' });
    }

    try {
        const owns = await verifyBusinessOwnership(req.user!.id, businessId);
        if (!owns) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        if (response.data.data.status !== 'success') {
            return res.status(400).json({ error: 'Paystack verification failed' });
        }

        const paystackAmount = response.data.data.amount / 100;
        if (Math.abs(paystackAmount - amount) > 0.01) {
            return res.status(400).json({ error: 'Amount mismatch between request and Paystack' });
        }

        const startDate = new Date();
        const endDate = new Date();
        if (billingCycle.toLowerCase() === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const existingSub = await prisma.subscription.findUnique({
            where: { businessId },
        });

        let subscription;
        if (existingSub) {
            subscription = await prisma.subscription.update({
                where: { businessId },
                data: {
                    plan: plan.toUpperCase(),
                    status: 'ACTIVE',
                    amount,
                    billingCycle: billingCycle.toUpperCase(),
                    startDate,
                    endDate,
                    paystackRef: reference,
                },
            });
        } else {
            subscription = await prisma.subscription.create({
                data: {
                    businessId,
                    plan: plan.toUpperCase(),
                    status: 'ACTIVE',
                    amount,
                    billingCycle: billingCycle.toUpperCase(),
                    startDate,
                    endDate,
                    paystackRef: reference,
                },
            });
        }

        await prisma.subscriptionTransaction.create({
            data: {
                subscriptionId: subscription.id,
                plan: plan.toUpperCase(),
                amount,
                billingCycle: billingCycle.toUpperCase(),
                paystackRef: reference,
                status: 'SUCCESS',
            },
        });

        res.json({
            message: 'Institutional Subscription Activated',
            subscription,
        });
    } catch (error: any) {
        logger.error('Subscription verification failure:', error);
        next(error);
    }
};

export const getSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const businessId = req.params.businessId as string;

    try {
        const owns = await verifyBusinessOwnership(req.user!.id, businessId);
        if (!owns) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const subscription = await prisma.subscription.findUnique({
            where: { businessId },
        });

        res.json(subscription || { status: 'INACTIVE', plan: 'FREE' });
    } catch (error) {
        logger.error('Failed to fetch subscription intelligence', error);
        next(error);
    }
};

export const getBillingHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const businessId = req.params.businessId as string;

    try {
        const owns = await verifyBusinessOwnership(req.user!.id, businessId);
        if (!owns) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const subscription = await prisma.subscription.findUnique({
            where: { businessId },
            select: { id: true },
        });

        if (!subscription) return res.json([]);

        const transactions = await prisma.subscriptionTransaction.findMany({
            where: { subscriptionId: subscription.id },
            orderBy: { createdAt: 'desc' },
        });

        res.json(transactions);
    } catch (error) {
        logger.error('Failed to retrieve billing history', error);
        next(error);
    }
};
