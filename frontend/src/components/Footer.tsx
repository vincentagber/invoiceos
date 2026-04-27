'use client';

import React from 'react';
import NextLink from 'next/link';

export default function Footer() {
    return (
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
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">About</NextLink></li>
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Careers</NextLink></li>
                    </ul>
                </div>
                <div>
                    <h6 className="text-slate-900 font-bold text-sm mb-4">Product</h6>
                    <ul className="space-y-3">
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Intelligence</NextLink></li>
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="#">Compliance</NextLink></li>
                    </ul>
                </div>
                <div>
                    <h6 className="text-slate-900 font-bold text-sm mb-4">Legal</h6>
                    <ul className="space-y-3">
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="/privacy">Privacy</NextLink></li>
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="/privacy">Terms</NextLink></li>
                    </ul>
                </div>
                <div>
                    <h6 className="text-slate-900 font-bold text-sm mb-4">Support</h6>
                    <ul className="space-y-3">
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="/contact">API Docs</NextLink></li>
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="/security">Security</NextLink></li>
                        <li><NextLink className="text-slate-500 text-sm hover:text-black underline underline-offset-4 decoration-slate-300" href="/cookies">Cookies</NextLink></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-10 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-xs">© 2026 InvoiceOS Precision. All rights reserved. Financial services provided by partner banks.</p>
                <div className="flex gap-6">
                    <NextLink className="text-slate-400 hover:text-black transition-colors" href="#"><span className="material-symbols-outlined text-lg">brand_awareness</span></NextLink>
                    <NextLink className="text-slate-400 hover:text-black transition-colors" href="#"><span className="material-symbols-outlined text-lg">public</span></NextLink>
                </div>
            </div>
        </footer>
    );
}
