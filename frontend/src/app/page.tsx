'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function LandingPage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const faqs = [
        { 
            q: "How does InvoiceOS handle dual-jurisdiction compliance (FIRS and IRS)?", 
            a: "InvoiceOS operates a dual-ledger system. For Nigerian entities, we automate FIRS-compliant VAT (7.5%) and WHT deductions with automated credit note generation. For US entities, we manage W-9 collection, 1099 reporting, and IRS-ready transactional records, ensuring you stay compliant in both regions simultaneously." 
        },
        { 
            q: "Can I automate Withholding Tax (WHT) calculations?", 
            a: "Yes. Our system automatically calculates the appropriate WHT rate based on the vendor type and service category. We generate the necessary documentation for your accounting team to reconcile with the FIRS portal, reducing manual errors by 98%." 
        },
        { 
            q: "Is my financial data secure and SOC2 compliant?", 
            a: "Security is our highest priority. InvoiceOS is SOC2 Type II compliant and utilizes bank-grade AES-256 encryption. We undergo regular third-party security audits and maintain strict data residency protocols to protect your institutional financial records." 
        },
        { 
            q: "Does InvoiceOS support multi-business switching for agencies?", 
            a: "Absolutely. Our 'Institutional Switcher' allows you to manage multiple legal entities, subsidiaries, or client accounts from a single dashboard. Each entity maintains its own isolated ledger, tax settings, and multi-currency balances." 
        },
        { 
            q: "Can I white-label my invoices with custom domains?", 
            a: "Yes, our Enterprise plan includes full white-labeling capabilities. You can host the payment portal on your own subdomain (e.g., billing.yourcompany.com) and connect your SMTP server to ensure all financial communications come directly from your brand's email address." 
        }
    ];

    return (
        <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans selection:bg-[#6cf8bb] selection:text-[#00714d]">
            {/* Top Navigation */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 docked full-width top-0 sticky z-50">
                <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto object-contain" />
                        </Link>
                        <div className="hidden md:flex gap-8">
                            <Link href="#" className="font-medium text-sm tracking-tight text-black border-b-2 border-black pb-1">Product</Link>
                            <Link href="#" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Features</Link>
                            <Link href="#pricing" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Pricing</Link>
                            <Link href="#" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Resources</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium tracking-tight text-slate-600 hover:text-black transition-colors px-4 py-2">Log In</Link>
                        <Link href="/register" className="bg-black text-white text-sm font-medium tracking-tight px-6 py-2.5 rounded-lg active:scale-95 transition-all duration-200 shadow-lg shadow-black/10">Get Started</Link>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-24 pb-32 overflow-hidden hero-gradient">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="z-10"
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dce9ff] text-[#000000] text-xs font-bold tracking-widest uppercase mb-6">
                                Institutional Grade
                            </span>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#0b1c30] leading-[1.1] mb-8">
                                Institutional Grade Invoicing for Nigeria & the US.
                            </h1>
                            <p className="text-lg md:text-xl text-[#45464d] leading-relaxed mb-10 max-w-xl">
                                Seamlessly navigate cross-border financial operations. Fully automated FIRS compliance for Nigerian firms and IRS-ready reporting for US entities. One ledger, two jurisdictions.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/register" className="bg-black text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                                    Start Free Trial
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </Link>
                                <button className="bg-white border border-[#c6c6cd] text-[#0b1c30] px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#eff4ff] transition-all">
                                    Book a Demo
                                </button>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 relative z-10">
                                <img 
                                    alt="Dashboard Preview" 
                                    className="rounded-lg w-full h-auto" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVU4d-zYyxc9Y8q0J_V-DzY4NKYpDyvvwJ2T-TytuneMhKH74Rj8JWkNQEPYvMcFEYi-c4I9X-il7eBzF09Gdmzr0Un1RLSwQMi8ut2uVkdPVkEV0WhxvfkML-eSWrkhs6rIySeTO7SB9IFH3iSub0vBVSlUq2Fp5dfIMg5yhf2OUhnQ_56KPP81Vf_skcw_4MjoFwdb6T2Iznlq3LBf7pl3cFDll5llRP0rfUMDI0gKYAPZ3nNh-_i_eQ3QYdcJJs4qOhB9Wc6Og"
                                />
                            </div>
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#6cf8bb]/20 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#d3e4fe]/30 rounded-full blur-3xl -z-10"></div>
                        </motion.div>
                    </div>
                </section>

                {/* Trust Logos */}
                <section className="py-12 bg-white border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-center text-xs font-bold tracking-widest text-[#76777d] uppercase mb-8">Trusted by institutions using</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <span className="font-black text-2xl tracking-tighter">Paystack</span>
                            <span className="font-black text-2xl tracking-tighter">Flutterwave</span>
                            <span className="font-black text-2xl tracking-tighter">Stripe</span>
                            <span className="font-black text-2xl tracking-tighter font-serif">BREX</span>
                        </div>
                    </div>
                </section>

                {/* Dual Jurisdiction Bento Grid */}
                <section className="py-24 max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Nigeria Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-8 flex flex-col justify-between overflow-hidden relative group"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-10 h-6 bg-emerald-700 rounded-sm"></span>
                                    <span className="text-sm font-bold tracking-tight text-[#0b1c30]">Nigeria Regional Compliance</span>
                                </div>
                                <h3 className="text-3xl font-bold tracking-tight mb-4">FIRS VAT & WHT Automation</h3>
                                <p className="text-[#45464d] mb-8 max-w-md">Automatically calculate and file Withholding Tax and Value Added Tax. Support for CAC documentation and e-invoicing mandates.</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-sm font-medium">
                                        <span className="material-symbols-outlined text-[#006c49] text-lg">check_circle</span>
                                        Auto-generated VAT invoices (7.5%)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-medium">
                                        <span className="material-symbols-outlined text-[#006c49] text-lg">check_circle</span>
                                        WHT credit note reconciliation
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-4 translate-x-12 translate-y-8 group-hover:translate-x-8 group-hover:translate-y-4 transition-transform duration-500">
                                <img alt="Nigeria Compliance" className="rounded-xl w-full h-48 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfWhAiRseuxMmc_4vwZVhomXLhhttBeF0K7XX2jGk518kW2YmAJ41Fv3HWrcknKkL_1Ai13od2eFeSqmppVfcHX94-vQ9ujHS-k6zdlIedVheLGZ-lVulBq_CPX57ZYAgyCEeAU5TNavTdacVihgMg02bY4pwAcodW2GmgCKqPvSPc3Awj3jykru1rQPU2ASQ8pvHNSkIlerku5TsYEHm_uvxn-Y-C6ofr4T78jyiTiRvrZ0uvvJ2dnGrXYuFvq8xy3553kZsUxzg" />
                            </div>
                        </motion.div>
                        {/* Global Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-5 bg-[#0b1c30] text-white rounded-xl p-10 flex flex-col justify-between relative overflow-hidden group border border-white/5"
                        >
                            {/* Animated Background Pulse */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -z-0 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-sm flex items-center justify-center shadow-lg shadow-blue-900/40">
                                        <span className="text-[10px] font-bold text-white">★</span>
                                    </div>
                                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400/80">Institutional Intel</span>
                                </div>
                                
                                <h3 className="text-3xl font-bold tracking-tight mb-6 leading-tight">IRS Compliance & <br/><span className="text-blue-400">USD Settlements</span></h3>
                                <p className="text-slate-400 mb-10 leading-relaxed font-medium">Full 1099 reporting and multi-currency support. Settle in USD via Stripe or ACH with automatic FX adjustment and institutional-grade ledgering.</p>
                                
                                {/* Advanced Financial Code Block */}
                                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 font-mono text-[11px] space-y-3 shadow-2xl relative overflow-hidden group-hover:border-blue-500/30 transition-colors">
                                    <div className="flex gap-1.5 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                                        <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">// Compliance Verification</span>
                                        <span className="text-emerald-400 flex items-center gap-1 font-bold">● SECURED</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p><span className="text-blue-400">const</span> settlement = <span className="text-amber-400">"ACH_INSTANT"</span>;</p>
                                        <p><span className="text-blue-400">const</span> status = <span className="text-amber-400">"IRS_W9_VERIFIED"</span>;</p>
                                        <p><span className="text-blue-400">const</span> reporting = <span className="text-blue-300">ledger</span>.<span className="text-indigo-300">generate1099</span>();</p>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <span className="material-symbols-outlined text-7xl text-white">shield_with_house</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 flex items-center gap-4 text-xs font-bold tracking-widest text-slate-500 uppercase">
                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> SOC2 Type II</span>
                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> PCI DSS v4.0</span>
                            </div>

                            {/* Background Symbol */}
                            <div className="absolute -bottom-10 -right-10 p-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                                <span className="material-symbols-outlined text-[12rem] text-white">public</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Feature Clusters */}
                <section className="py-24 bg-[#eff4ff]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-bold tracking-tight mb-4">Built for Financial Precision</h2>
                            <p className="text-[#45464d] max-w-2xl mx-auto">Enterprise-grade tools designed to handle millions in transaction volume without missing a kobo or a cent.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: 'analytics', title: 'Intelligence', desc: 'AI-powered accounts receivable automation. Predictive cash flow insights based on payment patterns.', list: ['Smart Late-Fee Calculations', 'Revenue Projection AI'] },
                                { icon: 'brush', title: 'Customization', desc: 'Complete white-label capabilities. Connect your own SMTP for personalized invoice delivery.', list: ['Custom Domain & CSS', 'Branded SMTP Server'] },
                                { icon: 'hub', title: 'Operations', desc: 'Institutional switcher for managing multiple entities and collaboration tools for accounting teams.', list: ['Multi-Entity Switcher', 'Role-Based Access'] }
                            ].map((cluster, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-xl border border-slate-200"
                                >
                                    <div className="w-12 h-12 bg-[#e5eeff] rounded-lg flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-[#000000]">{cluster.icon}</span>
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">{cluster.title}</h4>
                                    <p className="text-sm text-[#45464d] leading-relaxed mb-6">{cluster.desc}</p>
                                    <ul className="space-y-2 text-sm font-medium">
                                        {cluster.list.map((item, j) => (
                                            <li key={j} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-black rounded-full"></span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold tracking-tight mb-4">Transparent Institutional Pricing</h2>
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <span className="text-sm font-bold">Monthly</span>
                                <div className="w-12 h-6 bg-[#e5eeff] rounded-full relative p-1 cursor-pointer">
                                    <div className="w-4 h-4 bg-black rounded-full"></div>
                                </div>
                                <span className="text-sm text-[#45464d]">Yearly (Save 20%)</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Professional */}
                            <div className="border border-slate-200 rounded-xl p-10 flex flex-col hover:border-black transition-colors">
                                <h5 className="text-lg font-bold mb-2">Professional</h5>
                                <p className="text-sm text-[#45464d] mb-6">For growing digital agencies</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-bold">₦3,000</span>
                                    <span className="text-[#45464d]">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-10 flex-grow">
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Unlimited Invoices & Clients
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        FIRS & IRS Automation
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Multi-currency (NGN/USD)
                                    </li>
                                </ul>
                                <Link 
                                    href="/register?plan=professional" 
                                    className="w-full py-3 rounded-lg border border-black text-black font-bold hover:bg-[#e5eeff] transition-all text-center"
                                >
                                    Choose Professional
                                </Link>
                            </div>
                            {/* Enterprise */}
                            <div className="border-2 border-black rounded-xl p-10 flex flex-col relative scale-105 bg-white shadow-xl">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full">Most Popular</div>
                                <h5 className="text-lg font-bold mb-2">Enterprise</h5>
                                <p className="text-sm text-[#45464d] mb-6">For multi-national operations</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-bold">₦7,500</span>
                                    <span className="text-[#45464d]">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-10 flex-grow">
                                    <li className="flex items-center gap-3 text-sm font-semibold">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Everything in Professional
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Custom SMTP & Whitelabel
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Multi-entity Switcher (5 entities)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Priority 24/7 Support
                                    </li>
                                </ul>
                                <Link 
                                    href="/register?plan=enterprise" 
                                    className="w-full py-3 rounded-lg bg-black text-white font-bold hover:opacity-90 transition-all text-center"
                                >
                                    Choose Enterprise
                                </Link>
                            </div>
                            {/* Custom */}
                            <div className="border border-slate-200 rounded-xl p-10 flex flex-col hover:border-black transition-colors">
                                <h5 className="text-lg font-bold mb-2">Custom</h5>
                                <p className="text-sm text-[#45464d] mb-6">Tailored for large institutions</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-bold">Talk to Us</span>
                                </div>
                                <ul className="space-y-4 mb-10 flex-grow">
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Unlimited Managed Entities
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Custom API Integrations
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-[#006c49] text-base">check</span>
                                        Dedicated Account Manager
                                    </li>
                                </ul>
                                <Link 
                                    href="/register?plan=custom" 
                                    className="w-full py-3 rounded-lg border border-slate-300 text-[#0b1c30] font-bold hover:bg-[#e5eeff] transition-all text-center"
                                >
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-[#eff4ff] border-t border-slate-100">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="text-xs font-bold tracking-widest text-[#000000] uppercase mb-4 block">Knowledge Base</span>
                            <h2 className="text-4xl font-bold tracking-tight text-[#0b1c30] mb-4">Frequently Asked Questions</h2>
                            <p className="text-[#45464d]">Everything you need to know about our cross-border financial engine.</p>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <button 
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        className="w-full px-8 py-6 text-left flex justify-between items-center group transition-colors hover:bg-[#f8f9ff]"
                                    >
                                        <span className="font-bold text-lg text-[#0b1c30]">{faq.q}</span>
                                        <span className={clsx(
                                            "material-symbols-outlined text-black transition-transform duration-300",
                                            activeFaq === i && "rotate-180"
                                        )}>expand_more</span>
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === i && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-8 pb-6 overflow-hidden"
                                            >
                                                <p className="text-[#45464d] leading-relaxed">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-[#d3e4fe]">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold tracking-tight mb-8">Ready to automate your global ledger?</h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/register" className="bg-black text-white px-10 py-5 rounded-lg font-bold text-lg active:scale-95 transition-all text-center">Get Started for Free</Link>
                            <button className="bg-transparent border border-[#76777d] text-[#0b1c30] px-10 py-5 rounded-lg font-bold text-lg hover:bg-white/50 transition-all">Request a Personalized Demo</button>
                        </div>
                        <p className="mt-8 text-sm text-[#45464d] font-medium">No credit card required. Setup takes less than 3 minutes.</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 px-10 py-16 max-w-7xl mx-auto">
                    <div className="col-span-2">
                        <div className="mb-6 block">
                            <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto object-contain" />
                        </div>
                        <p className="text-slate-500 text-sm leading-6 max-w-xs">The precision engine for multi-jurisdictional financial operations between Africa and the West.</p>
                    </div>
                    <div>
                        <h6 className="text-slate-900 font-bold text-sm mb-4">Company</h6>
                        <ul className="space-y-3">
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">About</Link></li>
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="text-slate-900 font-bold text-sm mb-4">Product</h6>
                        <ul className="space-y-3">
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Intelligence</Link></li>
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Compliance</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="text-slate-900 font-bold text-sm mb-4">Legal</h6>
                        <ul className="space-y-3">
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Privacy</Link></li>
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Terms</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="text-slate-900 font-bold text-sm mb-4">Support</h6>
                        <ul className="space-y-3">
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">API Docs</Link></li>
                            <li><Link className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Status</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-10 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-xs">© 2026 InvoiceOS Precision. All rights reserved. Financial services provided by partner banks.</p>
                    <div className="flex gap-6">
                        <Link className="text-slate-400 hover:text-black transition-colors" href="#"><span className="material-symbols-outlined text-lg">brand_awareness</span></Link>
                        <Link className="text-slate-400 hover:text-black transition-colors" href="#"><span className="material-symbols-outlined text-lg">public</span></Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
