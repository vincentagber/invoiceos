'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Free Generator', href: '/tools/invoice-generator' },
];

export default function SiteNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 lg:h-20 flex items-center px-4 sm:px-6 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-border/50">
        <div className="flex-1 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="InvoiceOS" className="h-7 w-auto" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <Link href="/login" className="hidden sm:inline text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Login
          </Link>
          <Link href="/register" className="hidden sm:inline">
            <Button size="sm">
              Get Started
              <ArrowRight size={14} />
            </Button>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 left-0 right-0 z-[99] md:hidden bg-white border-b border-border shadow-lg"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 text-sm font-semibold text-text-primary border border-border rounded-xl hover:bg-surface-tertiary transition-colors">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors">
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
