'use client';

import React, { useState } from 'react';
import { 
    Check, 
    ChevronLeft, 
    ArrowRight, 
    HelpCircle, 
    ShieldCheck, 
    Lock, 
    Globe, 
    CreditCard, 
    Building2,
    Info,
    Ban,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export default function FinancialSetupPage() {
    const [taxId, setTaxId] = useState('');
    const [currency, setCurrency] = useState('USD — United States Dollar');
    const [bankTransfer, setBankTransfer] = useState(true);
    const [creditCard, setCreditCard] = useState(true);
    const [stripeConnect, setStripeConnect] = useState(false);
    const [paypalBusiness, setPaypalBusiness] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const { user, refreshUser } = useAuth();
    const router = useRouter();

    const steps = [
        { id: 1, name: 'ENTITY', status: 'complete' },
        { id: 2, name: 'BANKING', status: 'complete' },
        { id: 3, name: 'FINANCIALS', status: 'current' },
        { id: 4, name: 'REVIEW', status: 'upcoming' },
    ];

    const handleSubmit = async () => {
        if (!user || user.organizations.length === 0) {
            alert("Please complete the Branding step first.");
            router.push('/dashboard/setup/branding');
            return;
        }

        setLoading(true);
        try {
            const orgId = user.organizations[0].id;

            // Save financial settings to organizations table
            const { error } = await supabase
                .from('organizations')
                .update({
                    tax_id: taxId,
                    currency: currency.split(' — ')[0],
                    payment_methods: {
                        bank_transfer: bankTransfer,
                        credit_card: creditCard,
                        stripe_connect: stripeConnect,
                        paypal: paypalBusiness
                    }
                })
                .eq('id', orgId);

            if (error) throw error;

            // Refresh user session to reflect new business data
            await refreshUser();
            
            // Success! Redirect to dashboard
            router.push('/dashboard?setup=complete');
        } catch (error: any) {
            console.error('Finalization Error:', error);
            alert(error.message || "Failed to finalize setup");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight">InvoiceOS</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <HelpCircle size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto py-12 px-4">
                <div className="max-w-[720px] mx-auto space-y-12">
                    
                    {/* Stepper */}
                    <div className="flex items-center justify-center">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-black transition-all",
                                        step.status === 'complete' ? "bg-emerald-800 text-white" :
                                        step.status === 'current' ? "bg-slate-900 text-white shadow-lg" :
                                        "bg-slate-100 text-slate-400"
                                    )}>
                                        {step.status === 'complete' ? <Check size={14} strokeWidth={3} /> : step.id}
                                    </div>
                                    <span className={clsx(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        step.status === 'upcoming' ? "text-slate-300" : 
                                        step.status === 'complete' ? "text-emerald-800" : "text-slate-900"
                                    )}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="w-16 h-px bg-slate-200 mx-4" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Financial Setup Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="p-10 sm:p-14 space-y-10">
                            
                            {/* Header */}
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Financial Setup</h2>
                                <p className="text-slate-500 text-base">Configure your tax identification and preferred payment ecosystem.</p>
                            </div>

                            <div className="h-px bg-slate-100 -mx-14" />

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                <div>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 block">Tax ID (EIN/VAT)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="XX-XXXXXXX"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value)}
                                            className="w-full h-14 bg-white border border-slate-200 rounded-lg px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-slate-400 transition-all placeholder:text-slate-300"
                                        />
                                        <Info size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 block">Default Currency</label>
                                    <div className="relative">
                                        <select 
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full h-14 bg-white border border-slate-200 rounded-lg px-4 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-slate-400 transition-all appearance-none"
                                        >
                                            <option>USD — United States Dollar</option>
                                            <option>NGN — Nigerian Naira</option>
                                            <option>EUR — Euro</option>
                                            <option>GBP — British Pound</option>
                                        </select>
                                        <ChevronLeft size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 -rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Accepted Payment Methods</label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Bank Transfer */}
                                    <div className="flex items-center justify-between p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                                                <Building2 size={18} strokeWidth={1.5} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">Bank Transfer</span>
                                        </div>
                                        <button 
                                            onClick={() => setBankTransfer(!bankTransfer)}
                                            className={clsx(
                                                "w-12 h-6 rounded-full transition-all relative flex items-center",
                                                bankTransfer ? "bg-emerald-800" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={clsx(
                                                "h-4 w-4 bg-white rounded-full transition-transform absolute",
                                                bankTransfer ? "translate-x-7" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>

                                    {/* Credit Card */}
                                    <div className="flex items-center justify-between p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                                                <CreditCard size={18} strokeWidth={1.5} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">Credit Card</span>
                                        </div>
                                        <button 
                                            onClick={() => setCreditCard(!creditCard)}
                                            className={clsx(
                                                "w-12 h-6 rounded-full transition-all relative flex items-center",
                                                creditCard ? "bg-emerald-800" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={clsx(
                                                "h-4 w-4 bg-white rounded-full transition-transform absolute",
                                                creditCard ? "translate-x-7" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>

                                    {/* Stripe Connect */}
                                    <div className="flex items-center justify-between p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                                                <svg className="w-5 h-5 grayscale opacity-50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M30 18.5H10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                                </svg>
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">Stripe Connect</span>
                                        </div>
                                        <button 
                                            onClick={() => setStripeConnect(!stripeConnect)}
                                            className={clsx(
                                                "w-12 h-6 rounded-full transition-all relative flex items-center",
                                                stripeConnect ? "bg-emerald-800" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={clsx(
                                                "h-4 w-4 bg-white rounded-full transition-transform absolute",
                                                stripeConnect ? "translate-x-7" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>

                                    {/* PayPal */}
                                    <div className="flex items-center justify-between p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                                                <span className="text-[10px] font-black italic">P</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">PayPal Business</span>
                                        </div>
                                        <button 
                                            onClick={() => setPaypalBusiness(!paypalBusiness)}
                                            className={clsx(
                                                "w-12 h-6 rounded-full transition-all relative flex items-center",
                                                paypalBusiness ? "bg-emerald-800" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={clsx(
                                                "h-4 w-4 bg-white rounded-full transition-transform absolute",
                                                paypalBusiness ? "translate-x-7" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Advisory */}
                            <div className="bg-[#EEF4FF] rounded-xl p-6 flex gap-4 border border-indigo-50">
                                <ShieldCheck className="text-slate-400 shrink-0" size={20} strokeWidth={1.5} />
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Compliance Advisory</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        InvoiceOS uses institutional-grade encryption for all financial data. Tax IDs are stored in a PCI-compliant vault and are only transmitted for official reporting purposes.
                                    </p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="pt-6 flex items-center justify-between">
                                <Link href="#" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">
                                    <ChevronLeft size={16} />
                                    Back
                                </Link>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={clsx(
                                        "bg-black text-white px-8 py-4 rounded-lg text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg active:scale-[0.98] transition-all",
                                        loading && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? 'Finalizing...' : 'Next: Finalize'}
                                    {!loading && <ArrowRight size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="flex items-center justify-center gap-8 py-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">AES-256 ENCRYPTED</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">GDPR COMPLIANT</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">SOC2 TYPE II</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="h-20 bg-[#F8F9FB] border-t border-slate-100 flex items-center justify-between px-12 shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    © 2024 INVOICEOS. INSTITUTIONAL GRADE FINANCE.
                </div>
                <div className="flex items-center gap-8">
                    <Link href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Privacy Policy</Link>
                    <Link href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Terms of Service</Link>
                    <Link href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Security</Link>
                </div>
            </footer>
        </div>
    );
}
