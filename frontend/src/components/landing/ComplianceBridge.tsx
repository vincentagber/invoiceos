'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ComplianceBridge() {
    return (
        <section className="py-16 lg:py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 lg:mb-20">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dce9ff] text-[#000000] text-[10px] font-black tracking-widest uppercase mb-6">
                        Infrastructure
                    </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-[#0b1c30] mb-4 md:mb-6">
                        One Unified Core. Dual Jurisdiction Precision.
                    </h2>
                    <p className="text-sm sm:text-lg text-[#45464d] max-w-2xl mx-auto">
                        InvoiceOS acts as the institutional bridge, translating every transaction into compliant records for both FIRS and IRS simultaneously.
                    </p>
                </div>

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
                    {/* Flow Lines Background (SVG) */}
                    <div className="absolute inset-0 z-0 hidden lg:block">
                        <svg className="w-full h-full" viewBox="0 0 1200 400" fill="none">
                            <path 
                                d="M300 200 H900" 
                                stroke="url(#gradient-line)" 
                                strokeWidth="2" 
                                strokeDasharray="8 8"
                            />
                            <defs>
                                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#006c49" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#006c49" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#006c49" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Nigeria Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="z-10 w-full lg:w-[380px] bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#006c49]"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-6 bg-emerald-700 rounded-sm shadow-sm"></div>
                            <span className="text-xs font-bold tracking-widest uppercase text-emerald-800">FIRS Compliance</span>
                        </div>
                        <h4 className="text-xl font-bold mb-4">Nigeria Regional Ledger</h4>
                        <ul className="space-y-4 text-sm font-medium text-slate-600">
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Auto-generated VAT Invoices (7.5%)
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                WHT Credit Note Reconciliation
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                CAC Entity Reporting Ready
                            </li>
                        </ul>
                    </motion.div>

                    {/* Central Core */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        className="z-20 relative"
                    >
                        {/* Glowing Rings */}
                        <div className="absolute inset-0 bg-[#006c49]/10 rounded-full blur-3xl scale-150 animate-pulse"></div>
                        
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-[#0b1c30] rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"></div>
                            <img src="/logo.png" alt="InvoiceOS Core" className="w-20 h-auto relative z-10 invert brightness-200" />
                            
                            {/* Animated Flow Particles */}
                            <motion.div 
                                animate={{ 
                                    x: [-100, 100],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute h-[1px] w-12 bg-white/40 top-1/2 -left-12 z-0"
                            />
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Institutional Hub</p>
                        </div>
                    </motion.div>

                    {/* USA Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="z-10 w-full lg:w-[380px] bg-[#0b1c30] rounded-2xl border border-white/5 p-6 md:p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-6 bg-blue-600 rounded-sm shadow-sm flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold">USA</span>
                            </div>
                            <span className="text-xs font-bold tracking-widest uppercase text-blue-400">IRS Reporting</span>
                        </div>
                        <h4 className="text-xl font-bold mb-4 text-white">United States Ledger</h4>
                        <ul className="space-y-4 text-sm font-medium text-slate-400">
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Form 1099 Automated Reporting
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                W-9 Collection & Verification
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                USD ACH & Wire Settlement
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-16 lg:mt-24 flex justify-center">
                    <div className="inline-flex items-center gap-4 sm:gap-8 px-4 sm:px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600">verified_user</span>
                            <span className="text-xs font-bold text-slate-600">SOC2 Type II</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">gavel</span>
                            <span className="text-xs font-bold text-slate-600">Cross-Border Legal Logic</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
