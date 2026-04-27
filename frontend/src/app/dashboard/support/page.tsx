'use client';

import React from 'react';
import { 
    Search, 
    Rocket, 
    ReceiptText, 
    ShieldCheck, 
    Puzzle, 
    ChevronDown, 
    MessageCircle, 
    Mail, 
    Activity,
    Clock
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function DashboardSupportPage() {
    const categories = [
        { 
            icon: Rocket, 
            title: 'Getting Started', 
            desc: 'Account setup, basic navigation, and first invoice creation.',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        { 
            icon: ReceiptText, 
            title: 'Billing & Payments', 
            desc: 'Payment gateways, reconciliation, and subscription management.',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        { 
            icon: ShieldCheck, 
            title: 'Security & Compliance', 
            desc: 'Data protection, roles, and audit logs.',
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        { 
            icon: Puzzle, 
            title: 'API & Integrations', 
            desc: 'Connecting InvoiceOS to your existing tech stack.',
            color: 'text-rose-600',
            bg: 'bg-rose-50'
        }
    ];

    const faqs = [
        {
            q: 'How do I automate WHT (Withholding Tax)?',
            a: 'You can automate WHT by navigating to Settings > Tax Rules. From there, create a new rule for Withholding Tax, specify the percentage, and assign it to the relevant client profiles. The system will automatically deduct this on future invoices generated for those clients.'
        },
        {
            q: 'Can I manage multiple businesses under one account?',
            a: 'Yes, InvoiceOS Precision supports multi-entity management on the Enterprise plan. You can switch between businesses using the entity switcher in the top navigation bar.'
        },
        {
            q: 'How do I reconcile bulk payments?',
            a: 'Use the "Reconciliation" tab under the "Payments" module to upload your bank statement CSV. Our AI engine will automatically match entries to your outstanding invoices.'
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            
            {/* Hero Search Area */}
            <div className="relative rounded-[2.5rem] bg-[#131b2e] p-12 lg:p-20 overflow-hidden shadow-2xl shadow-indigo-900/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 opacity-[0.03] rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10 max-w-2xl mx-auto text-center space-y-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">How can we help you today?</h2>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input 
                            className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white placeholder:text-slate-400 focus:bg-white focus:text-black focus:ring-0 focus:border-white transition-all outline-none text-lg shadow-2xl" 
                            placeholder="Search for articles, guides, or keywords..." 
                            type="text"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Categories & FAQs */}
                <div className="lg:col-span-8 space-y-16">
                    
                    {/* Categories */}
                    <section className="space-y-8">
                        <h3 className="text-xl font-black text-[#0b1c30] uppercase tracking-widest">Browse by Category</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {categories.map((cat, i) => (
                                <motion.a 
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col items-start gap-6 group"
                                    href="#"
                                >
                                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", cat.bg, cat.color)}>
                                        <cat.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#0b1c30] mb-2">{cat.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{cat.desc}</p>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    </section>

                    {/* FAQs */}
                    <section className="space-y-8">
                        <h3 className="text-xl font-black text-[#0b1c30] uppercase tracking-widest">Frequently Asked Questions</h3>
                        <div className="bg-white border border-slate-100 rounded-3xl divide-y divide-slate-50 overflow-hidden shadow-sm">
                            {faqs.map((faq, i) => (
                                <details key={i} className="group" open={i === 0}>
                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-8 text-[#0b1c30] hover:bg-slate-50 transition-colors">
                                        <span className="text-base">{faq.q}</span>
                                        <ChevronDown className="transition-transform duration-500 group-open:rotate-180 text-slate-300" size={20} />
                                    </summary>
                                    <div className="p-8 pt-0 text-slate-500 text-sm leading-relaxed font-medium animate-in slide-in-from-top-2 duration-500">
                                        <div className="pt-6 border-t border-slate-50">
                                            {faq.a}
                                        </div>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Contact & Status */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Contact Options */}
                    <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-50 pb-6">Still need help?</h3>
                        
                        <div className="space-y-4">
                            <button className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-start gap-4 hover:bg-white hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group text-left">
                                <div className="text-emerald-600 bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0b1c30] text-sm mb-1">Live Chat</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-normal">Instant support (Mon-Fri, 9am-6pm WAT)</p>
                                </div>
                            </button>

                            <a href="mailto:support@invoiceos.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-start gap-4 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group text-left">
                                <div className="text-indigo-600 bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0b1c30] text-sm mb-1">Email Support</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-normal">Response within 2 hours</p>
                                    <p className="text-[11px] text-indigo-600 font-black mt-2">support@invoiceos.com</p>
                                </div>
                            </a>
                        </div>
                    </section>

                    {/* System Status Widget */}
                    <section className="bg-[#f8f9ff] border border-slate-200 rounded-[2.5rem] p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Status</h4>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">All Live</span>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                    <Activity size={20} />
                                </div>
                                <p className="text-sm font-bold text-[#0b1c30]">All systems operational</p>
                            </div>

                            <div className="pt-6 border-t border-slate-200 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <Clock size={12} />
                                    Business Hours
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-[#0b1c30]">Monday - Friday</p>
                                    <p className="text-xs text-slate-500 font-medium">09:00 AM - 06:00 PM (WAT)</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
