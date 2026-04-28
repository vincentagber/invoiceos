import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { supabase } from '../lib/supabase';
import axios from 'axios';
import { logger } from '../utils/logger';

export const verifySubscription = async (req: Request, res: Response) => {
    const { reference, businessId, plan, billingCycle, amount } = req.body;

    if (!reference || !businessId || !plan || !billingCycle || !amount) {
        return res.status(400).json({ error: 'Missing institutional parameters' });
    }

    try {
        // 1. Verify with Paystack
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

        // 3. Upsert subscription using Supabase fallback
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                organization_id: businessId,
                plan: plan.toUpperCase(),
                status: 'ACTIVE',
                amount: amount,
                billing_cycle: billingCycle.toUpperCase(),
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                paystack_ref: reference,
                updated_at: new Date().toISOString()
            }, { onConflict: 'organization_id' })
            .select()
            .single();

        if (subError) throw subError;

        // 4. Record transaction history
        await supabase
            .from('subscription_transactions')
            .insert({
                subscription_id: subscription.id,
                plan: plan.toUpperCase(),
                amount: amount,
                billing_cycle: billingCycle.toUpperCase(),
                paystack_ref: reference,
                status: 'SUCCESS'
            });

        res.json({
            message: 'Institutional Subscription Activated',
            subscription
        });
    } catch (error: any) {
        logger.error('Subscription verification failure:', error);
        res.status(500).json({ error: 'Internal system error during verification' });
    }
};

export const getSubscription = async (req: Request, res: Response) => {
    const businessId = req.params.businessId as string;

    try {
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('organization_id', businessId)
            .maybeSingle();

        res.json(subscription || { status: 'INACTIVE', plan: 'FREE' });
    } catch (error) {
        logger.error('Failed to fetch subscription intelligence', error);
        res.status(500).json({ error: 'Internal system error' });
    }
};

export const getBillingHistory = async (req: Request, res: Response) => {
    const businessId = req.params.businessId as string;

    try {
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('organization_id', businessId)
            .maybeSingle();

        if (!subscription) return res.json([]);

        const { data: transactions, error } = await supabase
            .from('subscription_transactions')
            .select('*')
            .eq('subscription_id', subscription.id)
            .order('created_at', { ascending: false });

        res.json(transactions || []);
    } catch (error) {
        logger.error('Failed to retrieve billing history', error);
        res.status(500).json({ error: 'Internal system error' });
    }
};
