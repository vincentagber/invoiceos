'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Product', href: '/' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'Contact', href: '/contact' },
        { name: 'Resources', href: '/contact' },
    ];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 docked full-width top-0 sticky z-50">
            <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                {/* Brand */}
                <div className="flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="InvoiceOS" className="h-11 w-auto object-contain" />
                    </Link>
                </div>

                {/* Center Menu Items (Desktop) */}
                <div className="hidden md:flex flex-1 justify-center gap-8">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
                        return (
                            <Link 
                                key={item.name}
                                href={item.href} 
                                className={clsx(
                                    "font-medium text-sm tracking-tight transition-colors",
                                    isActive 
                                        ? "text-black border-b-2 border-black pb-1" 
                                        : "text-slate-600 hover:text-black"
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                    <Link href="/login" className="text-sm font-medium tracking-tight text-slate-600 hover:text-black transition-colors px-4 py-2">Log In</Link>
                    <Link href="/register" className="bg-black text-white text-sm font-medium tracking-tight px-6 py-2.5 rounded-lg active:scale-95 transition-all duration-200 shadow-lg shadow-black/10">Get Started</Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-600 hover:text-black transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {menuItems.map((item) => (
                                <Link 
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-lg font-semibold text-slate-900"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                                <Link 
                                    href="/login" 
                                    className="w-full text-center py-4 text-slate-900 font-bold border border-slate-200 rounded-xl"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                                <Link 
                                    href="/register" 
                                    className="w-full text-center py-4 bg-black text-white font-bold rounded-xl shadow-lg shadow-black/10"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
