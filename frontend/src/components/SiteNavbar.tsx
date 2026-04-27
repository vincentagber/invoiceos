'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SiteNavbar() {
    return (
        <nav className="h-20 flex items-center justify-between px-6 lg:px-12 bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[100] font-sans">
            {/* Logo */}
            <div className="flex-1">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto object-contain" />
                    <span className="hidden lg:block text-xl font-heading font-black tracking-tighter text-slate-900 uppercase">InvoiceOS</span>
                </Link>
            </div>

            {/* Centered Links */}
            <div className="hidden md:flex items-center justify-center gap-10 flex-[2]">
                <Link href="/#products" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-indigo-600 transition-all duration-300">Products</Link>
                <Link href="/blog" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-indigo-600 transition-all duration-300">Intelligence Blog</Link>
                <Link href="/tools/invoice-generator" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-indigo-600 transition-all duration-300">Free Generator</Link>
                <Link href="/#pricing" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-indigo-600 transition-all duration-300">Pricing</Link>
            </div>
            
            {/* Auth Actions */}
            <div className="flex items-center justify-end gap-6 flex-1">
                <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-indigo-600 transition-colors">Login</Link>
                <Link href="/register" className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">
                    Launch
                    <ArrowRight size={14} strokeWidth={3} />
                </Link>
            </div>
        </nav>
    );
}

