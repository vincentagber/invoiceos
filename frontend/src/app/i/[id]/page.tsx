'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { 
    CheckCircle2, 
    CreditCard, 
    Download, 
    MessageSquare, 
    ShieldCheck, 
    Clock, 
    AlertCircle,
    ArrowRight,
    Lock
} from 'lucide-react';
import clsx from 'clsx';

export default function PublicInvoicePage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Using the public endpoint we just created
                const res = await api.get(`/invoices/public/${id}`);
                setInvoice(res.data);
                
                // Track interaction (Behavior-based automation start)
                // In a real app, this would hit an analytics endpoint
                console.log("Invoice viewed by client:", id);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-12 w-12 bg-indigo-600 rounded-2xl" />
                <div className="h-2 w-24 bg-slate-200 rounded-full" />
            </div>
        </div>
    );

    if (!invoice) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Invoice Not Found</h1>
            <p className="text-slate-500 mt-2">This invoice may have been deleted or the link is invalid.</p>
        </div>
    );

    const isPaid = invoice.status === 'paid';
    const isOverdue = new Date(invoice.due_date) < new Date() && !isPaid;

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            
            {/* Payment Header (Sticky on mobile) */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 md:hidden">
                <button className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20">
                    Pay {formatCurrency(invoice.total, invoice.currency)}
                </button>
            </div>

            <main className="max-w-6xl mx-auto py-10 md:py-20 px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Side: Invoice Content */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* Brand & Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-tighter text-indigo-600 uppercase">InvoiceOS</span>
                        </div>
                        <div className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
                            isPaid ? "bg-emerald-100 text-emerald-700" : isOverdue ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"
                        )}>
                            <div className={clsx("h-2 w-2 rounded-full animate-pulse", isPaid ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-indigo-500")} />
                            {invoice.status}
                        </div>
                    </div>

                    {/* The Invoice Page */}
                    <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                        
                        {/* Summary Header */}
                        <div className="bg-slate-900 p-10 md:p-14 text-white">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Amount Due</p>
                                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter">{formatCurrency(invoice.total, invoice.currency)}</h2>
                                    <p className="text-white/60 font-medium mt-4">Due on <span className="text-white font-bold">{invoice.due_date}</span></p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Invoice Number</p>
                                    <p className="text-xl font-black tracking-tighter">{invoice.invoice_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-10 md:p-14 space-y-12">
                            
                            {/* Items */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Summary</h3>
                                <div className="divide-y divide-slate-50">
                                    {invoice.items && invoice.items.map((item: any, i: number) => (
                                        <div key={i} className="py-6 flex justify-between items-center gap-4">
                                            <div>
                                                <p className="font-bold text-slate-900">{item.description}</p>
                                                <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity} × {formatCurrency(item.unit_price, invoice.currency)}</p>
                                            </div>
                                            <p className="font-black text-slate-900 tracking-tight">{formatCurrency(item.quantity * item.unit_price, invoice.currency)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Calculation */}
                            <div className="flex justify-end pt-6 border-t border-slate-50">
                                <div className="w-full sm:w-64 space-y-3 text-right">
                                    <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-slate-900">{formatCurrency(invoice.total, invoice.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-indigo-600 font-black text-xl pt-4 border-t-2 border-slate-900">
                                        <span className="uppercase tracking-tighter">Total Due</span>
                                        <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {invoice.notes && (
                                <div className="bg-slate-50 rounded-3xl p-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Note from sender</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{invoice.notes}</p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Client Interaction: Negotiation/Chat */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <MessageSquare size={20} className="text-indigo-600" />
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Negotiation & Comments</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 font-medium bg-slate-50 p-4 rounded-xl">
                                Need to discuss the pricing or terms? Leave a comment below.
                            </p>
                            <div className="flex gap-4">
                                <textarea 
                                    className="flex-1 rounded-xl border-slate-100 bg-slate-50 p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none min-h-[100px]"
                                    placeholder="Request changes or ask a question..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">
                                    Post Message
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side: Payment & Actions */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Payment Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-indigo-500/5 sticky top-10 space-y-8">
                        
                        <div className="space-y-2">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Complete Payment</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Securely pay via card or bank transfer.</p>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full group py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3">
                                <CreditCard size={18} />
                                Pay by Card
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full py-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                <Lock size={16} className="text-slate-400" />
                                Bank Transfer
                            </button>
                        </div>

                        {/* Security Badge */}
                        <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-3">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank-Level Security</span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">
                                <Download size={14} />
                                PDF
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">
                                <CheckCircle2 size={14} />
                                Approve
                            </button>
                        </div>

                        {/* Urgency Indicator */}
                        {!isPaid && !isOverdue && (
                            <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 items-start border border-amber-100/50">
                                <Clock size={16} className="text-amber-500 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                                    Payment due in 5 days. Secure your slot by paying today.
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Behavior Insight (Subtle social proof/urgency) */}
                    <div className="flex items-center gap-3 px-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-slate-50 bg-slate-200" />
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Trusted by 2,000+ companies
                        </p>
                    </div>

                </div>

            </main>

            {/* Footer */}
            <footer className="py-20 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Powered by InvoiceOS Intelligence</p>
            </footer>

        </div>
    );
}
