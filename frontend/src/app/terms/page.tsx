'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="bg-background min-h-screen flex flex-col p-8 font-sans">
            <header className="max-w-[1440px] mx-auto w-full mb-12">
                <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Login
                </Link>
            </header>
            
            <main className="max-w-4xl mx-auto w-full bg-white rounded-3xl border border-border p-12 shadow-sm">
                <h1 className="text-4xl font-black text-primary mb-8 tracking-tighter uppercase">Terms of Service</h1>
                <p className="text-text-secondary mb-6 leading-relaxed">
                    Last updated: April 2026
                </p>
                <section className="space-y-8 text-primary">
                    <p>Welcome to InvoiceOS. By using our services, you agree to these terms.</p>
                    {/* Placeholder content */}
                    <h2 className="text-xl font-bold tracking-tight">1. Services</h2>
                    <p>InvoiceOS provides professional invoicing and financial management tools.</p>
                </section>
            </main>
        </div>
    );
}
