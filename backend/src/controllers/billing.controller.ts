import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import axios from 'axios';
import { logger } from '../utils/logger';

export const verifySubscription = async (req: Request, res: Response) => {
    const { reference, businessId, plan, billingCycle, amount } = req.body;

    if (!reference || !businessId || !plan || !billingCycle || !amount) {
        return res.status(400).json({ error: 'Missing institutional parameters' });
    }

    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        if (response.data.data.status !== 'success') {
            return res.status(400).json({ error: 'Paystack verification failed' });
        }

        const paystackAmount = response.data.data.amount / 100;
        if (paystackAmount < amount) {
            return res.status(400).json({ error: 'Institutional amount mismatch' });
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
        res.status(500).json({ error: 'Internal system error during verification' });
    }
};

export const getSubscription = async (req: Request, res: Response) => {
    const businessId = req.params.businessId as string;

    try {
        const subscription = await prisma.subscription.findUnique({
            where: { businessId },
        });

        res.json(subscription || { status: 'INACTIVE', plan: 'FREE' });
    } catch (error) {
        logger.error('Failed to fetch subscription intelligence', error);
        res.status(500).json({ error: 'Internal system error' });
    }
};

export const getBillingHistory = async (req: Request, res: Response) => {
    const businessId = req.params.businessId as string;

    try {
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
        res.status(500).json({ error: 'Internal system error' });
    }
};
