'use client';

import React, { useState } from 'react';
import { Crown, Check, CreditCard } from 'lucide-react';
import clsx from 'clsx';

export default function SubscriptionPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans antialiased">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Subscription</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your InvoiceOS subscription plan.</p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 md:p-12 text-center max-w-2xl mx-auto mt-12">
                
                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                    <Crown size={32} className="text-[#5E6AD2]" strokeWidth={2.5} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">Unlock Full Access</h2>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Subscribe to send, share, print, and download your invoices.<br />
                    Start with a <span className="font-semibold text-slate-700">5-day free trial</span>.
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex bg-slate-50 p-1.5 rounded-full mt-8 border border-slate-100">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                            billingCycle === 'monthly' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={clsx(
                            "px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                            billingCycle === 'yearly' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Yearly 
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Save 44%
                        </span>
                    </button>
                </div>

                {/* Pricing Box */}
                <div className="bg-slate-50/80 rounded-2xl p-8 text-left mt-8 max-w-sm mx-auto border border-slate-100">
                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-3xl font-bold text-slate-900">
                            {billingCycle === 'monthly' ? '₦1,500' : '₦10,000'}
                        </span>
                        <span className="text-sm font-medium text-slate-500">
                            / {billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            'Send invoices via email',
                            'Share & copy invoice links',
                            'Print & download as PDF',
                            'Share via WhatsApp',
                            '5-day free trial included'
                        ].map(feature => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Check size={12} strokeWidth={4} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-slate-600">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <button className="mt-10 px-8 py-3.5 bg-[#5E6AD2] hover:bg-[#4E5AC2] text-white rounded-xl text-sm font-semibold shadow-sm shadow-[#5E6AD2]/20 transition-all flex items-center justify-center gap-2 mx-auto w-full max-w-sm active:scale-95">
                    <CreditCard size={18} />
                    Start Free Trial
                </button>

                <p className="text-xs text-slate-400 mt-6 max-w-sm mx-auto">
                    A refundable ₦100 charge verifies your card. You won't be billed until your trial ends.
                </p>

            </div>
        </div>
    );
}
