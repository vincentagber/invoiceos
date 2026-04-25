'use client';

import React from 'react';
import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="bg-slate-900 text-white pt-32 pb-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-end border-b border-white/5 pb-20 mb-20">
                    <h2 className="text-5xl lg:text-7xl font-sans font-semibold leading-tight tracking-tighter uppercase">
                        Ready to automate <br /> your revenue?
                    </h2>
                    <div className="flex gap-6">
                        <Link href="/register" className="px-12 py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
                            Get Started
                        </Link>
                        <Link href="/tools/invoice-generator" className="px-12 py-5 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-sm uppercase tracking-widest">
                            Free Tool
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24 mb-20">
                    <div className="col-span-2 space-y-10">
                        <img src="/logo.png" alt="InvoiceOS" className="h-14 w-auto bg-white p-2 rounded-xl" />
                        <p className="text-slate-400 font-medium max-w-sm leading-relaxed text-sm">
                            The all-in-one revenue engine designed for the modern entrepreneur in Nigeria & the US.
                        </p>
                    </div>
                    
                    <div className="space-y-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Resources</h4>
                        <ul className="space-y-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <li><Link href="/blog" className="hover:text-emerald-400 transition-colors">Intelligence Blog</Link></li>
                            <li><Link href="/tools/invoice-generator" className="hover:text-emerald-400 transition-colors">Free Generator</Link></li>
                            <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Client Login</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Legal</h4>
                        <ul className="space-y-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                    <p>© 2026 INVOICEOS TECHNOLOGIES INC.</p>
                    <p>BUILT FOR NIGERIA & THE US</p>
                </div>
            </div>
        </footer>
    );
}
