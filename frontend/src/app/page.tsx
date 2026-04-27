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
    Minus,
    Wand2,
    Building2,
    Calculator,
    Palette,
    Mail,
    FileCheck,
    Clock,
    BarChart3,
    Smartphone
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

                {/* Institutional Compliance Section */}
                <section className="py-32 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
                            <div className="space-y-6 max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
                                    <Shield size={14} className="text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Cross-Border Compliance</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-heading font-black text-slate-900 tracking-tighter leading-[1.1]">
                                    Global Standards. <br />
                                    <span className="text-slate-400">Local Precision.</span>
                                </h2>
                                <p className="text-xl text-slate-500 leading-relaxed font-medium">
                                    InvoiceOS handles the complexity of local tax laws so you don't have to. Built for IRS (US) and FIRS (Nigeria) standards.
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                                <div className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">IRS Validated</span>
                                </div>
                                <div className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">FIRS Validated</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            {/* USA Block */}
                            <div className="group p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Shield size={200} />
                                </div>
                                <div className="relative space-y-10">
                                    <div className="space-y-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-indigo-600">
                                            <img src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" className="w-8 h-auto" alt="USA" />
                                        </div>
                                        <h4 className="text-3xl font-heading font-black text-slate-900 tracking-tight">United States</h4>
                                    </div>
                                    <ul className="space-y-6">
                                        {[
                                            'IRS-ready reporting and W-9 collection',
                                            'Sales tax automation for all 50 states',
                                            'Professional 1099-NEC tracking'
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-4 text-slate-500 font-bold text-sm leading-tight group/item">
                                                <div className="mt-1 h-5 w-5 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Nigeria Block */}
                            <div className="group p-12 rounded-[3.5rem] bg-slate-900 text-white border border-slate-800 hover:border-indigo-500/50 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.2)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Shield size={200} />
                                </div>
                                <div className="relative space-y-10">
                                    <div className="space-y-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white/10 shadow-xl flex items-center justify-center text-indigo-400">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg" className="w-8 h-auto" alt="Nigeria" />
                                        </div>
                                        <h4 className="text-3xl font-heading font-black text-white tracking-tight">Nigeria</h4>
                                    </div>
                                    <ul className="space-y-6">
                                        {[
                                            'VAT-compliant invoices matching FIRS regulations',
                                            'WHT (Withholding Tax) calculations automated',
                                            'CAC registered business information support'
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-4 text-slate-400 font-bold text-sm leading-tight group/item">
                                                <div className="mt-1 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Advanced Features Grid */}
                <section id="features" className="py-32 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center space-y-4 mb-24">
                            <h2 className="text-5xl font-heading font-black text-slate-900 tracking-tighter">Everything you need to bill like a pro</h2>
                            <p className="text-lg text-slate-500 max-w-3xl mx-auto font-medium">
                                Say goodbye to generic invoices that advertise someone else's platform. Elevate your brand with complete customization.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {advancedFeatures.map((feature, i) => (
                                <div 
                                    key={i} 
                                    className={clsx(
                                        "group p-10 rounded-[2.5rem] border transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col items-start text-left",
                                        feature.featured 
                                            ? "bg-slate-50/50 border-indigo-100 shadow-[0_20px_40px_rgba(79,70,229,0.05)]" 
                                            : "bg-white border-slate-100 hover:border-indigo-100"
                                    )}
                                >
                                    <div className={clsx(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110",
                                        feature.iconBg || "bg-slate-50 text-slate-400"
                                    )}>
                                        <feature.icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-xl font-heading font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section (Legacy Small Icons) */}
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

const advancedFeatures = [
    { 
        icon: Wand2, 
        title: "AI-Powered Invoicing", 
        desc: "Speak or type naturally and let AI build your invoice. Dictate by voice or paste a text description to auto-fill customers, line items, and prices in seconds.",
        iconBg: "bg-indigo-50 text-indigo-600"
    },
    { 
        icon: Building2, 
        title: "Business Switcher", 
        desc: "Manage multiple businesses under one account. Switch between isolated workspaces instantly — each with its own branding, clients, and invoices.",
        iconBg: "bg-emerald-50 text-emerald-600"
    },
    { 
        icon: Calculator, 
        title: "Automatic Taxes", 
        desc: "Define tax rates once and let the system apply them automatically to every line item. VAT, GST, or set your own custom rates.",
        iconBg: "bg-amber-50 text-amber-600"
    },
    { 
        icon: Palette, 
        title: "Fully White-Label", 
        desc: "Remove our branding entirely. Add your logo, brand colors, custom domains, and custom css for a seamless client experience.",
        iconBg: "bg-rose-50 text-rose-600"
    },
    { 
        icon: Mail, 
        title: "Custom SMTP", 
        desc: "Send automated reminders and invoices directly from your own email address to maintain perfect deliverability and trust.",
        iconBg: "bg-sky-50 text-sky-600"
    },
    { 
        icon: FileCheck, 
        title: "Branded PDFs", 
        desc: "Generate pixel-perfect, beautifully designed PDF invoices that leave a lasting professional impression on your clients.",
        iconBg: "bg-indigo-50 text-indigo-600",
        featured: true
    },
    { 
        icon: Users, 
        title: "Unified Team Collaboration", 
        desc: "Securely invite team members to your workspace with strict Admin and User roles. Collaborate securely on the same financial ledger without sharing passwords.",
        iconBg: "bg-violet-50 text-violet-600"
    },
    { 
        icon: Clock, 
        title: "Intelligent Auto-Pilot", 
        desc: "Never chase down a late payment manually. The system silently evaluates due dates and fires professional reminders automatically from your custom SMTP domain.",
        iconBg: "bg-emerald-50 text-emerald-600"
    },
    { 
        icon: BarChart3, 
        title: "Dynamic Ledger Tracking", 
        desc: "Log fractional payments over time natively. Our ledger continuously calculates exact balances in real-time until the invoice perfectly reconciles to Paid.",
        iconBg: "bg-blue-50 text-blue-600"
    }
];

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
