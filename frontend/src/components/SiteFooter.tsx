'use client';

import React from 'react';
import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative font-sans">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-20">
                    <div className="col-span-1 lg:col-span-1 space-y-8">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="InvoiceOS" className="h-10 w-auto bg-white p-1.5 rounded-lg" />
                            <span className="text-xl font-black tracking-tight text-white">InvoiceOS</span>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed text-sm">
                            The all-in-one revenue engine designed for the modern entrepreneur in Nigeria & the US.
                        </p>
                    </div>
                    
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Resources</h4>
                        <ul className="space-y-5 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                            <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Intelligence Blog</Link></li>
                            <li><Link href="/tools/invoice-generator" className="hover:text-indigo-400 transition-colors">Free Generator</Link></li>
                            <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Client Login</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Legal</h4>
                        <ul className="space-y-5 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                            <li><Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Global</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">IRS Compliant (USA)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">FIRS Compliant (Nigeria)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                    <p>© 2026 INVOICEOS TECHNOLOGIES INC. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-8">
                        <p>BUILT FOR NIGERIA & THE US</p>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        <p className="text-slate-400">SECURE CLOUD STORAGE</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

