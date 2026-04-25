'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Check, 
    ArrowRight, 
    ChevronRight, 
    Plus, 
    Play, 
    FileText, 
    CreditCard, 
    BarChart, 
    Users, 
    Shield, 
    Zap,
    Star,
    LayoutDashboard,
    Minus
} from 'lucide-react';
import clsx from 'clsx';

import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';

export default function LandingPage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <SiteNavbar />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-32 bg-slate-900 overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -ml-20 -mb-20" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-10">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                        <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">The Future of Billing</span>
                                    </div>
                                    
                                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                                        Professional Invoicing <br /> 
                                        <span className="text-indigo-400 italic">for Global Teams</span>
                                    </h1>
                                    
                                    <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                                        The most elegant invoicing solution for Nigerian and US businesses. 
                                        Compliant with IRS and FIRS regulations out of the box.
                                    </p>

                                    <div className="flex flex-wrap items-center gap-6 pt-4">
                                        <Link href="/register" className="px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3 group">
                                            Start Free Trial
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                        <Link href="#how-it-works" className="px-10 py-5 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 border border-white/10 active:scale-95 transition-all flex items-center gap-3">
                                            <Play className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                                            Watch Demo
                                        </Link>
                                    </div>

                                    <div className="pt-10 flex items-center gap-6">
                                        <div className="flex -space-x-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-14 w-14 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-xl relative z-[10] hover:z-20 hover:scale-110 transition-all duration-300">
                                                    <img src={`/av-${i}.png`} alt={`User ${i}`} className="h-full w-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                            </div>
                                            <p className="text-sm font-bold text-white uppercase tracking-wider">
                                                25,707 + <span className="text-slate-500 font-medium">Trusted Users</span>
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="relative"
                            >
                                <div className="relative z-10 bg-slate-800/50 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-4 shadow-2xl overflow-hidden">
                                    <img 
                                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                                        alt="Dashboard Preview" 
                                        className="w-full h-auto rounded-[1.5rem] shadow-2xl"
                                    />
                                    {/* Floating Card */}
                                    <div className="absolute -left-10 bottom-10 bg-white p-6 rounded-3xl shadow-2xl hidden md:block border border-slate-100 max-w-[240px] animate-bounce-subtle">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                                <div className="h-6 w-6 rounded-lg bg-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Payment</p>
                                                <p className="text-lg font-black text-slate-900">₦1,450,000</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-indigo-600 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Global Compliance Section */}
                <section className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center space-y-4 mb-20">
                            <h2 className="text-indigo-600 text-sm font-black uppercase tracking-[0.3em]">Institutional Grade Compliance</h2>
                            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">Global Standards. Local Precision.</h3>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                InvoiceOS handles the complexity of local tax laws so you don't have to. Built for IRS (US) and FIRS (Nigeria) standards.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="group p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="h-16 w-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                        <Shield size={32} />
                                    </div>
                                    <span className="px-5 py-2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest">IRS Ready (USA)</span>
                                </div>
                                <h4 className="text-2xl font-bold text-slate-900 mb-6">United States</h4>
                                <ul className="space-y-4 text-slate-500 font-medium">
                                    <li className="flex items-center gap-3">
                                        <Check className="text-indigo-600" size={18} /> IRS-ready reporting and W-9 collection
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Check className="text-indigo-600" size={18} /> Sales tax automation for all 50 states
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Check className="text-indigo-600" size={18} /> Professional 1099-NEC tracking
                                    </li>
                                </ul>
                            </div>

                            <div className="group p-10 rounded-[3rem] bg-slate-900 text-white border border-slate-800 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="h-16 w-16 rounded-3xl bg-white/10 shadow-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Shield size={32} />
                                    </div>
                                    <span className="px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">FIRS Validated (Nigeria)</span>
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-6">Nigeria</h4>
                                <ul className="space-y-4 text-slate-400 font-medium">
                                    <li className="flex items-center gap-3">
                                        <Check className="text-indigo-400" size={18} /> VAT-compliant invoices matching FIRS regulations
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Check className="text-indigo-400" size={18} /> WHT (Withholding Tax) calculations automated
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Check className="text-indigo-400" size={18} /> CAC registered business information support
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="products" className="py-32 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-4 gap-12">
                            {featureIcons.map((feature, i) => (
                                <div key={i} className="space-y-6 group">
                                    <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                        <feature.icon size={24} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">{feature.title}</h4>
                                    <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-32 bg-white">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-indigo-600 text-sm font-black uppercase tracking-[0.3em]">Support</h2>
                            <h3 className="text-4xl font-bold text-slate-900">Frequently Asked Questions</h3>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="border border-slate-100 rounded-3xl overflow-hidden transition-all hover:border-indigo-100">
                                    <button 
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-8 text-left hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="text-xl font-bold text-slate-900">{faq.q}</span>
                                        {activeFaq === i ? <Minus size={20} className="text-indigo-600" /> : <Plus size={20} className="text-slate-400" />}
                                    </button>
                                    {activeFaq === i && (
                                        <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}

const featureIcons = [
    { icon: FileText, title: "Smart Invoicing", desc: "Create professional invoices in seconds with our automated builder." },
    { icon: Zap, title: "Instant Payments", desc: "Get paid faster with integrated payment gateways for US & Nigeria." },
    { icon: BarChart, title: "Financial Insights", desc: "Deep analytics to help you understand your business growth." },
    { icon: Shield, title: "Secure Storage", desc: "Enterprise-grade security for all your financial documents." }
];

const faqs = [
    { q: "How secure is my data?", a: "We use AES-256 encryption for all data storage and SSL/TLS for data transmission." },
    { q: "Can I cancel my subscription?", a: "Yes, you can cancel at any time. Your data will be preserved for 30 days after cancellation." },
    { q: "Do you support mobile payments?", a: "Absolutely. Our checkout pages are mobile-responsive and support Apple/Google Pay." },
    { q: "What currencies are supported?", a: "We support over 135 currencies out of the box, with automatic exchange rate calculations." }
];
