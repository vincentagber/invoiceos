'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SecurityPage() {
    return (
        <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans selection:bg-[#6cf8bb] selection:text-[#00714d]">
            <Header />

            <main className="flex-grow pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-32">
                    {/* Hero Section */}
                    <header className="max-w-4xl mx-auto text-center space-y-8 py-20">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-bold tracking-tight text-[#0b1c30]"
                        >
                            Institutional Trust & Security
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-[#45464d] font-medium leading-relaxed max-w-3xl mx-auto"
                        >
                            At InvoiceOS, security isn't a feature—it's the foundation. We employ bank-grade encryption and rigorous compliance protocols to protect your financial data.
                        </motion.p>
                    </header>

                    {/* Bento Grid - Core Security Pillars */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: 'lock', 
                                title: 'AES-256 Encryption', 
                                desc: 'All data is encrypted at rest using AES-256 and in transit via TLS 1.3. Your financial ledgers remain completely impenetrable to unauthorized access.' 
                            },
                            { 
                                icon: 'verified_user', 
                                title: 'Multi-Factor Auth', 
                                desc: 'Mandatory MFA (SMS, Authenticator App, or Hardware Keys) ensures that only verified personnel can access critical operational dashboards.' 
                            },
                            { 
                                icon: 'monitoring', 
                                title: '24/7 Monitoring', 
                                desc: 'Continuous threat detection and automated anomaly monitoring safeguard our infrastructure, instantly alerting our dedicated security team.' 
                            }
                        ].map((pillar, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 group"
                            >
                                <div className="w-16 h-16 bg-[#e5eeff] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <span className="material-symbols-outlined text-3xl font-fill">{pillar.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-[#0b1c30]">{pillar.title}</h3>
                                <p className="text-[#45464d] text-sm leading-relaxed font-medium">
                                    {pillar.desc}
                                </p>
                            </motion.div>
                        ))}
                    </section>

                    {/* Deep Dive Feature Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-20 border-t border-slate-100">
                        <div className="space-y-10">
                            <h2 className="text-4xl font-bold tracking-tight text-[#0b1c30]">Incident Response & Readiness</h2>
                            <p className="text-lg text-[#45464d] leading-relaxed font-medium">
                                Our incident response protocols are designed for rapid containment and mitigation. Regular penetration testing by third-party experts ensures our defenses evolve faster than emerging threats.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    'Annual third-party penetration testing',
                                    'Automated daily backups across multiple regions',
                                    'Dedicated 24/7 Security Operations Center (SOC)'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                                        </div>
                                        <span className="text-base font-bold text-[#0b1c30]">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#d3e4fe]/30 border border-slate-200 rounded-[3rem] p-12 relative overflow-hidden h-[450px] flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                            <div className="z-10 text-center space-y-6">
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="h-32 w-32 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200/50"
                                >
                                    <span className="material-symbols-outlined text-6xl text-black font-fill">shield</span>
                                </motion.div>
                                <div className="space-y-2">
                                    <div className="text-xs font-black text-black tracking-[0.4em] uppercase">Zero Trust</div>
                                    <div className="text-2xl font-black text-black">Architecture</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Compliance & Certifications */}
                    <section className="py-20 border-t border-slate-100">
                        <div className="text-center mb-16 space-y-3">
                            <h2 className="text-3xl font-bold tracking-tight text-[#0b1c30]">Certifications & Compliance</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Independently audited to meet global standards.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
                            {[
                                { icon: 'fact_check', label: 'SOC 2 Type II' },
                                { icon: 'policy', label: 'GDPR Compliant' },
                                { icon: 'verified', label: 'ISO 27001' }
                            ].map((cert, i) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">
                                        <span className="material-symbols-outlined text-4xl text-black">{cert.icon}</span>
                                    </div>
                                    <span className="font-black text-xs text-[#0b1c30] uppercase tracking-widest">{cert.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
