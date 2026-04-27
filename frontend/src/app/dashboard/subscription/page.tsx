'use client';

import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Crown, Check, Zap, Building2, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function SubscriptionPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');
    const [billingCycle, setBillingCycle] = useState('MONTHLY');
    const [processing, setProcessing] = useState(false);

    const plans = {
        PROFESSIONAL: {
            name: 'Professional',
            monthly: 3000,
            yearly: 28800,
            features: [
                'Unlimited Invoices & Clients',
                'FIRS & IRS Automation',
                'Multi-currency (NGN/USD)',
                'White-label portal'
            ]
        },
        ENTERPRISE: {
            name: 'Enterprise',
            monthly: 7500,
            yearly: 72000,
            features: [
                'Everything in Professional',
                'Custom SMTP Server',
                'Multi-entity Switcher (5 entities)',
                'Priority 24/7 Support'
            ]
        }
    };

    const fetchSubscription = async () => {
        try {
            const bizRes = await api.get('/business/me');
            const res = await api.get(`/billing/${bizRes.data.id}`);
            setSubscription(res.data);
        } catch (error) {
            console.error('Failed to fetch subscription', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchSubscription();
    }, [user]);

    const amount = billingCycle === 'MONTHLY' 
        ? plans[selectedPlan as keyof typeof plans].monthly 
        : plans[selectedPlan as keyof typeof plans].yearly;

    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.email || '',
        amount: amount * 100, // Paystack expects amount in kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    };

    const initializePayment: any = usePaystackPayment(config);

    const handleSuccess = async (reference: any) => {
        setProcessing(true);
        try {
            const bizRes = await api.get('/business/me');
            await api.post('/billing/verify', {
                reference: reference.reference,
                businessId: bizRes.data.id,
                plan: selectedPlan,
                billingCycle: billingCycle.toLowerCase(),
                amount: amount
            });
            await fetchSubscription();
        } catch (error) {
            alert('Verification failed. Please contact support.');
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        console.log('Payment closed');
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Syncing Ledger...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-100">
                    <Crown size={12} />
                    Institutional Billing
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subscription Management</h1>
                <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                    Manage your institutional access and global financial capabilities.
                </p>
            </div>

            {/* Current Plan Status */}
            <div className={clsx(
                "p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500",
                subscription?.status === 'ACTIVE' ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-200 shadow-sm"
            )}>
                <div className="flex items-center gap-6">
                    <div className={clsx(
                        "h-16 w-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500",
                        subscription?.status === 'ACTIVE' ? "bg-emerald-600 text-white scale-110" : "bg-slate-100 text-slate-400"
                    )}>
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Status</p>
                        <h3 className="text-2xl font-black text-slate-900">
                            {subscription?.status === 'ACTIVE' ? `${subscription.plan} ACTIVE` : 'INACTIVE / FREE'}
                        </h3>
                        {subscription?.status === 'ACTIVE' && (
                            <p className="text-xs text-emerald-600 font-bold mt-1">
                                Renewing on {new Date(subscription.endDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
                {subscription?.status === 'ACTIVE' && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                        <Zap size={16} className="text-emerald-600" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Full Capabilities Enabled</span>
                    </div>
                )}
            </div>

            {/* Pricing Toggles */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Select Billing Cycle</p>
                        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                            <button 
                                onClick={() => setBillingCycle('MONTHLY')}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    billingCycle === 'MONTHLY' ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Monthly
                            </button>
                            <button 
                                onClick={() => setBillingCycle('YEARLY')}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    billingCycle === 'YEARLY' ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Yearly <span className="text-emerald-500 ml-1">-20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Institutional Tiers</p>
                        <div className="space-y-3">
                            {Object.keys(plans).map((planKey) => (
                                <button
                                    key={planKey}
                                    onClick={() => setSelectedPlan(planKey)}
                                    className={clsx(
                                        "w-full p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                                        selectedPlan === planKey ? "border-indigo-600 bg-white shadow-xl shadow-indigo-100" : "border-slate-100 bg-white hover:border-slate-300"
                                    )}
                                >
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">{plans[planKey as keyof typeof plans].name}</h4>
                                            <p className="text-2xl font-black text-slate-900 mt-2">
                                                ₦{(billingCycle === 'MONTHLY' ? plans[planKey as keyof typeof plans].monthly : plans[planKey as keyof typeof plans].yearly).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                                                Per {billingCycle.toLowerCase()}
                                            </p>
                                        </div>
                                        {selectedPlan === planKey && (
                                            <div className="h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    {selectedPlan === planKey && (
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Building2 size={80} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Plan Features & Action */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col shadow-sm">
                    <div className="flex-grow space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900">{plans[selectedPlan as keyof typeof plans].name} Overview</h4>
                                <p className="text-xs text-slate-400 font-medium">Full suite of financial intelligence tools.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plans[selectedPlan as keyof typeof plans].features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment Secured by</p>
                                <span className="font-black text-lg tracking-tighter">Paystack</span>
                            </div>
                            
                            <button
                                onClick={() => {
                                    initializePayment(handleSuccess, handleClose);
                                }}
                                disabled={processing}
                                className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] hover:bg-indigo-600 transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Activate {plans[selectedPlan as keyof typeof plans].name}
                                        <Zap size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
