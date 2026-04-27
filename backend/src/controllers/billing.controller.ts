import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export const verifySubscription = async (req: Request, res: Response) => {
    const { reference, businessId, plan, billingCycle, amount } = req.body;

    if (!reference || !businessId || !plan || !billingCycle || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // 1. Verify with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        if (response.data.data.status !== 'success') {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        // Verify amount (Paystack amount is in kobo)
        const paystackAmount = response.data.data.amount / 100;
        if (paystackAmount < amount) {
            return res.status(400).json({ error: 'Payment amount mismatch' });
        }

        // 2. Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        if (billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // 3. Create or update subscription
        const subscription = await prisma.subscription.upsert({
            where: { businessId },
            create: {
                businessId,
                plan: plan.toUpperCase(),
                status: 'ACTIVE',
                amount: amount,
                billingCycle: billingCycle.toUpperCase(),
                startDate,
                endDate,
                paystackRef: reference
            },
            update: {
                plan: plan.toUpperCase(),
                status: 'ACTIVE',
                amount: amount,
                billingCycle: billingCycle.toUpperCase(),
                startDate,
                endDate,
                paystackRef: reference,
                updatedAt: new Date()
            }
        });

        res.json({
            message: 'Subscription activated successfully',
            subscription
        });
    } catch (error: any) {
        console.error('Subscription verification error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Internal server error during verification' });
    }
};

export const getSubscription = async (req: Request, res: Response) => {
    const { businessId } = req.params;

    try {
        const subscription = await prisma.subscription.findUnique({
            where: { businessId }
        });

        res.json(subscription || { status: 'INACTIVE', plan: 'FREE' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
