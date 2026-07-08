'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Crown, Check, Zap, Building2, ShieldCheck, CreditCard, Loader2, Lock, History, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';

export default function SubscriptionPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');
    const [billingCycle, setBillingCycle] = useState('MONTHLY');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
    const [billingHistory, setBillingHistory] = useState<any[]>([]);

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
            const [subRes, historyRes] = await Promise.all([
                api.get(`/billing/${bizRes.data.id}`),
                api.get(`/billing/${bizRes.data.id}/history`)
            ]);
            setSubscription(subRes.data);
            setBillingHistory(historyRes.data || []);
        } catch (error) {
            console.error('Failed to fetch subscription data', error);
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

    const loadPaystackSdk = async () => {
        if (typeof window === 'undefined') return;
        if ((window as any).PaystackPop) return;

        await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Unable to load Paystack SDK.'));
            document.body.appendChild(script);
        });
    };

    const initializePayment = async () => {
        if (!user?.email) {
            alert('Please sign in before continuing with payment.');
            return;
        }

        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

        if (!publicKey) {
            alert('Paystack public key is not configured.');
            return;
        }

        await loadPaystackSdk();

        const paystack = new (window as any).PaystackPop();
        paystack.newTransaction({
            key: publicKey,
            email: user.email,
            amount: amount * 100,
            reference: `${Date.now()}`,
            onSuccess: handleSuccess,
            onClose: handleClose,
        });
    };

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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
                    <ShieldCheck size={12} />
                    Institutional Access
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subscription Management</h1>
                <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                    Manage your institutional access and global financial capabilities.
                </p>
            </div>

            {/* Current Plan & Billing Toggle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Status & Cycle */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110"></div>
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Plan</p>
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                    subscription?.status === 'ACTIVE' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400"
                                )}>
                                    <User size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                    {subscription?.status === 'ACTIVE' ? subscription.plan : 'Inactive / Free'}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-4 border-t border-slate-100">
                                {subscription?.status === 'ACTIVE' 
                                    ? `Next billing cycle resumes on ${new Date(subscription.endDate).toLocaleDateString()}` 
                                    : 'Upgrade to access premium financial intelligence tools.'}
                            </p>
                        </div>
                    </div>

                    {/* Billing Cycle Toggle */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex shadow-sm relative z-10">
                        <button 
                            onClick={() => setBillingCycle('MONTHLY')}
                            className={clsx(
                                "flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                billingCycle === 'MONTHLY' ? "bg-slate-100 text-slate-900 shadow-inner" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('YEARLY')}
                            className={clsx(
                                "flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                                billingCycle === 'YEARLY' ? "bg-slate-100 text-slate-900 shadow-inner" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Yearly
                            <span className="bg-emerald-100 text-emerald-600 text-[9px] px-2 py-0.5 rounded-full font-black">-20%</span>
                        </button>
                    </div>

                    {/* Trust Signal */}
                    <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pt-4">
                        <Lock size={14} />
                        Payment Secured by Paystack
                    </div>
                </div>

                {/* Right Side: Plan Selection */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Professional Tier */}
                    <div className={clsx(
                        "bg-white rounded-[2.5rem] p-10 border-2 flex flex-col h-full relative transition-all duration-500",
                        selectedPlan === 'PROFESSIONAL' ? "border-slate-900 shadow-2xl scale-[1.02] z-20" : "border-slate-100 hover:border-slate-200 z-10"
                    )}
                    onClick={() => setSelectedPlan('PROFESSIONAL')}
                    >
                        <div className="absolute -top-4 right-10 bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            Recommended
                        </div>
                        
                        <div className="space-y-6 mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Professional</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">₦{billingCycle === 'MONTHLY' ? '3,000' : '28,800'}</span>
                                <span className="text-slate-400 text-sm font-bold">{" / "}{billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Full suite of financial intelligence tools.</p>
                        </div>

                        <div className="flex-grow space-y-5 pt-8 border-t border-slate-100 mb-10">
                            {plans.PROFESSIONAL.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 leading-tight uppercase tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                initializePayment();
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                        >
                            {processing && selectedPlan === 'PROFESSIONAL' ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : 'Activate Professional'}
                            <Zap size={14} />
                        </button>
                    </div>

                    {/* Enterprise Tier */}
                    <div className={clsx(
                        "bg-white rounded-[2.5rem] p-10 border-2 flex flex-col h-full relative transition-all duration-500",
                        selectedPlan === 'ENTERPRISE' ? "border-slate-900 shadow-2xl scale-[1.02] z-20" : "border-slate-100 hover:border-slate-200 z-10"
                    )}
                    onClick={() => setSelectedPlan('ENTERPRISE')}
                    >
                        <div className="space-y-6 mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Enterprise</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900">₦{billingCycle === 'MONTHLY' ? '7,500' : '72,000'}</span>
                                <span className="text-slate-400 text-sm font-bold">{" / "}{billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">For scaling teams needing advanced controls.</p>
                        </div>

                        <div className="flex-grow space-y-5 pt-8 border-t border-slate-100 mb-10">
                            {plans.ENTERPRISE.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="h-5 w-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 leading-tight uppercase tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="w-full border-2 border-slate-100 hover:border-slate-900 text-slate-900 font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all bg-transparent"
                        >
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>

            {/* Billing History Section */}
            <div className="space-y-8 pt-12">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional Ledger</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction history and audit trail</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {billingHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        No transaction records available in the local ledger.
                                    </td>
                                </tr>
                            ) : (
                                billingHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                {item.paystackRef || item.id.substring(0, 12).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-600">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                {item.plan}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-black text-slate-900">
                                            {formatCurrency(item.amount, 'NGN')}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                <Check size={10} strokeWidth={4} />
                                                {item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
