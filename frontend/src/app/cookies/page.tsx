'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
    return (
        <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans selection:bg-[#6cf8bb] selection:text-[#00714d]">
            <Header />

            <main className="flex-grow pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="max-w-3xl mb-20">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black tracking-[0.25em] text-indigo-600 uppercase mb-8"
                    >
                        <span className="material-symbols-outlined text-sm font-fill">policy</span>
                        Compliance & Transparency
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-bold text-[#0b1c30] tracking-tight leading-tight mb-8"
                    >
                        Cookie Policy
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-[#45464d] leading-relaxed font-medium"
                    >
                        At InvoiceOS, we prioritize the integrity of your financial data and the transparency of our technical operations. This policy details how we utilize cookies and similar tracking technologies to ensure a secure, high-performance experience within our platform.
                    </motion.p>
                </div>

                {/* Bento Grid: Cookie Types */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {[
                        { 
                            icon: 'shield', 
                            title: 'Strictly Necessary', 
                            desc: 'Core operational cookies required for authentication, secure ledger access, and fundamental platform functionality. These cannot be disabled.',
                            status: 'Always Active',
                            active: true
                        },
                        { 
                            icon: 'monitoring', 
                            title: 'Performance & Analytics', 
                            desc: 'Aggregated telemetry data utilized to optimize load times, monitor infrastructure health, and improve the efficiency of complex reporting tools.',
                            status: 'Optional',
                            active: true
                        },
                        { 
                            icon: 'target', 
                            title: 'Marketing & Targeting', 
                            desc: 'Used selectively to deliver relevant enterprise software updates and institutional insights. We do not sell this data to third-party consumer networks.',
                            status: 'Optional',
                            active: false
                        }
                    ].map((type, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-full relative overflow-hidden group hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 group-hover:bg-black transition-colors duration-500"></div>
                            <div className="w-14 h-14 rounded-2xl bg-[#e5eeff] flex items-center justify-center text-black mb-8 group-hover:bg-black group-hover:text-white transition-all duration-500">
                                <span className="material-symbols-outlined text-2xl font-fill">{type.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0b1c30] mb-4">{type.title}</h3>
                            <p className="text-sm text-[#45464d] leading-relaxed font-medium flex-grow">
                                {type.desc}
                            </p>
                            <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type.status}</span>
                                {type.status !== 'Always Active' && (
                                    <div className={clsx(
                                        "w-10 h-5 rounded-full relative transition-colors duration-300",
                                        type.active ? "bg-black" : "bg-slate-200"
                                    )}>
                                        <div className={clsx(
                                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                                            type.active ? "left-6" : "left-1"
                                        )}></div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Detailed Table Section */}
                <div className="mb-24">
                    <h2 className="text-3xl font-bold text-[#0b1c30] mb-10 tracking-tight">Detailed Provider Index</h2>
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name / Provider</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Purpose & Mechanics</th>
                                        <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-[#0b1c30]">
                                    {[
                                        { 
                                            name: 'ios_sess_id', 
                                            provider: '1st Party', 
                                            cat: 'Essential', 
                                            purpose: 'Maintains secure authenticated state across financial ledger views and prevents CSRF vulnerabilities.',
                                            duration: 'Session'
                                        },
                                        { 
                                            name: '_ga', 
                                            provider: 'Google', 
                                            cat: 'Analytics', 
                                            purpose: 'Generates statistical data on user interaction with application modules to guide UI/UX structural improvements.',
                                            duration: '2 Years'
                                        },
                                        { 
                                            name: 'mkt_b2b_trk', 
                                            provider: 'HubSpot', 
                                            cat: 'Marketing', 
                                            purpose: 'Tracks interaction with technical whitepapers and institutional feature announcements.',
                                            duration: '13 Mos'
                                        }
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold">{row.name}</span>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg">{row.provider}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-black"></div>
                                                    <span className="font-medium">{row.cat}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-slate-500 font-medium leading-relaxed max-w-md">{row.purpose}</td>
                                            <td className="py-6 px-8 text-right text-slate-400 font-bold">{row.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Management Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="bg-[#131b2e] rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-indigo-900/10"
                >
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Manage Your Preferences</h2>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            You maintain ultimate control over non-essential data collection. Adjust your institutional preferences at any time. Changes will reflect across all organizational sessions tied to your user ID.
                        </p>
                    </div>
                    <button className="flex-shrink-0 bg-white text-black px-10 py-5 rounded-2xl hover:bg-indigo-50 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 shadow-xl shadow-black/20">
                        <span className="material-symbols-outlined text-xl">tune</span>
                        Configure Settings
                    </button>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
