'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthFooter() {
    return (
        <footer className="bg-white text-primary text-sm py-12 mt-auto border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 px-6 lg:px-12 max-w-[1440px] mx-auto w-full z-10 relative">
            <div className="text-center md:text-left text-text-secondary">© 2026 InvoiceOS Precision. All rights reserved.</div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-6">
                <Link className="text-text-secondary hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
                <Link className="text-text-secondary hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
                <Link className="text-text-secondary hover:text-primary transition-colors" href="/security">Security Overview</Link>
            </nav>
        </footer>
    );
}
