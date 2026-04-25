'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function SiteNavbar() {
    return (
        <nav className="h-24 flex items-center justify-between px-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="InvoiceOS" className="h-10 w-auto object-contain" />
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    <Link href="/#products" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors">Products</Link>
                    <Link href="/blog" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors">Intelligence Blog</Link>
                    <Link href="/tools/invoice-generator" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors">Free Generator</Link>
                    <Link href="/#pricing" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors">Pricing</Link>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-emerald-600 transition-colors">Login</Link>
                <Link href="/register" className="hidden sm:flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95">
                    Start Engine <ArrowRight size={14} />
                </Link>
            </div>
        </nav>
    );
}
