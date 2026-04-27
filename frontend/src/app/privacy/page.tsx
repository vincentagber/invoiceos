'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
    return (
        <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans selection:bg-[#6cf8bb] selection:text-[#00714d]">
            {/* Top Navigation */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 docked full-width top-0 sticky z-50">
                <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto object-contain" />
                        </Link>
                        <div className="hidden md:flex gap-8">
                            <Link href="/" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Platform</Link>
                            <Link href="#" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Solutions</Link>
                            <Link href="/#pricing" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Pricing</Link>
                            <Link href="/contact" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Resources</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium tracking-tight text-slate-600 hover:text-black transition-colors px-4 py-2">Log In</Link>
                        <Link href="/register" className="bg-black text-white text-sm font-medium tracking-tight px-6 py-2.5 rounded-lg active:scale-95 transition-all duration-200 shadow-lg shadow-black/10">Get Started</Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow pt-24 pb-20 px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="max-w-3xl mx-auto text-center mb-20 pt-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold tracking-tight text-[#0b1c30] mb-8"
                    >
                        Privacy Policy
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-[#45464d] font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Effective Date: October 24, 2024. This document outlines how InvoiceOS Precision collects, uses, and protects your institutional data with uncompromising transparency.
                    </motion.p>
                </div>

                <div className="flex justify-center w-full relative">
                    {/* Document Canvas */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-8 md:p-16"
                    >
                        <article className="space-y-16">
                            <section id="data-collection">
                                <h2 className="text-2xl font-bold tracking-tight text-[#0b1c30] mb-8 border-b border-slate-100 pb-6">1. Data Collection Practices</h2>
                                <p className="text-base leading-relaxed text-[#45464d] mb-8 font-medium">
                                    InvoiceOS Precision operates on a foundation of minimal necessary data collection. We gather information required strictly for the operation, security, and compliance of our financial infrastructure.
                                </p>
                                <div className="bg-[#f8f9ff] rounded-2xl p-8 my-10 border border-slate-100">
                                    <h4 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-6 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg text-black font-fill">database</span>
                                        Core Data Categories
                                    </h4>
                                    <ul className="space-y-4 text-sm text-[#45464d] font-medium">
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                                            <span><strong>Identity Information:</strong> Corporate entity names, authorized representative details, and structural hierarchies.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                                            <span><strong>Operational Metrics:</strong> Volume of transactions, frequency of invoicing, and API utilization rates.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                                            <span><strong>Technical Telemetry:</strong> IP addresses, browser agents, and access logs strictly for security auditing.</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            <section id="payment-health">
                                <h2 className="text-xl font-bold text-[#0b1c30] mb-6">1.1 Payment & Transactional Data</h2>
                                <p className="text-base leading-relaxed text-[#45464d] mb-6 font-medium">
                                    As a financial conduit, we process sensitive payment instruments. All payment processing data (credit cards, ACH details, wire instructions) is tokenized immediately upon entry. We do not store raw primary account numbers (PAN) on InvoiceOS servers.
                                </p>
                                <p className="text-base leading-relaxed text-[#45464d] font-medium">
                                    Location data associated with transactions is captured solely for fraud prevention and tax compliance mapping, never for marketing or tracking purposes.
                                </p>
                            </section>

                            <section id="user-rights">
                                <h2 className="text-2xl font-bold tracking-tight text-[#0b1c30] mb-8 border-b border-slate-100 pb-6">2. User Rights & Compliance (GDPR/CCPA)</h2>
                                <p className="text-base leading-relaxed text-[#45464d] mb-10 font-medium">
                                    InvoiceOS is engineered to exceed the standards set by global regulatory frameworks, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { title: 'Right to Access', desc: 'You may request a complete cryptographic export of all data associated with your organizational entity.' },
                                        { title: 'Right to Erasure', desc: 'You may invoke the right to be forgotten, subject to mandatory financial retention laws (e.g., tax auditing periods).' },
                                        { title: 'Right to Portability', desc: 'Export your ledgers and client data in machine-readable formats (JSON, CSV, XML) at any time.' },
                                        { title: 'Non-Discrimination', desc: 'Exercising your privacy rights will never result in degraded service or altered pricing structures.' }
                                    ].map((right, i) => (
                                        <div key={i} className="border border-slate-100 rounded-2xl p-6 hover:border-black/10 transition-all bg-slate-50/30">
                                            <h4 className="text-sm font-bold text-[#0b1c30] mb-3">{right.title}</h4>
                                            <p className="text-xs text-[#45464d] leading-relaxed font-medium">{right.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section id="data-retention">
                                <h2 className="text-2xl font-bold tracking-tight text-[#0b1c30] mb-8 border-b border-slate-100 pb-6">3. Data Retention Lifecycle</h2>
                                <p className="text-base leading-relaxed text-[#45464d] mb-10 font-medium">
                                    Our retention policies are strictly dictated by financial compliance requirements. Data is held only as long as legally mandated or functionally necessary.
                                </p>
                                <div className="overflow-hidden border border-slate-100 rounded-2xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f8f9ff] border-b border-slate-100">
                                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Data Type</th>
                                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Retention Period</th>
                                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Post-Retention Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-[#45464d]">
                                            {[
                                                { type: 'Invoice Records', period: '7 Years (IRS Mandate)', action: 'Cryptographic Destruction' },
                                                { type: 'Audit Logs', period: '12 Months', action: 'Aggregated & Anonymized' },
                                                { type: 'Account Metadata', period: 'Life of Account + 30 Days', action: 'Hard Delete' }
                                            ].map((row, i) => (
                                                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-5 px-6 font-bold text-[#0b1c30]">{row.type}</td>
                                                    <td className="py-5 px-6 font-medium">{row.period}</td>
                                                    <td className="py-5 px-6 font-medium text-slate-400">{row.action}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section id="third-party">
                                <h2 className="text-2xl font-bold tracking-tight text-[#0b1c30] mb-8 border-b border-slate-100 pb-6">4. Third-Party Subprocessors</h2>
                                <p className="text-base leading-relaxed text-[#45464d] mb-8 font-medium">
                                    We engage a limited number of rigorously vetted sub-processors to deliver our core services. We do not sell data to data brokers under any circumstances.
                                </p>
                                <div className="flex flex-col gap-4">
                                    {[
                                        { name: 'AWS Infrastructure', desc: 'Primary hosting and encrypted storage.', icon: 'cloud' },
                                        { name: 'Paystack / Stripe', desc: 'Fiat transaction clearing and tokenization.', icon: 'payments' }
                                    ].map((sub, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                            <div className="flex items-center gap-5">
                                                <span className="material-symbols-outlined text-slate-400 text-2xl">{sub.icon}</span>
                                                <div>
                                                    <h5 className="text-sm font-bold text-[#0b1c30]">{sub.name}</h5>
                                                    <p className="text-xs text-slate-500 font-medium">{sub.desc}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-400 shadow-sm">Essential</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="mt-20 pt-10 border-t border-slate-100" id="contact">
                                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Privacy Inquiries</h3>
                                <p className="text-sm text-[#45464d] mb-8 font-medium">For data subject access requests or compliance inquiries, please contact our Data Protection Officer.</p>
                                <a 
                                    href="mailto:privacy@invoiceos.com"
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#0b1c30] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                    privacy@invoiceos.com
                                </a>
                            </section>
                        </article>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 w-full mt-auto">
                <div className="max-w-7xl mx-auto py-16 px-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col gap-3">
                        <img src="/logo.png" alt="InvoiceOS" className="h-10 w-auto object-contain mb-2" />
                        <span className="text-slate-500 text-xs font-medium">© 2026 InvoiceOS Precision. Institutional trust and financial transparency.</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-8">
                        <Link className="text-xs font-black uppercase tracking-widest text-slate-900" href="/privacy">Privacy Policy</Link>
                        <Link className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors" href="#">Terms of Service</Link>
                        <Link className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors" href="#">Security Overview</Link>
                        <Link className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors" href="#">Cookie Policy</Link>
                        <Link className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors" href="#">Compliance Hub</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
