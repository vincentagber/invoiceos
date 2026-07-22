'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Cta() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 sm:p-12 lg:p-16 text-center"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-grid opacity-[0.03]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-white/80 mb-8">
              <Sparkles size={12} />
              Get started in minutes
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Ready to transform your financial operations?
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
              Join thousands of businesses using InvoiceOS to streamline invoicing, compliance, and accounting.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" variant="secondary" className="w-full sm:w-auto bg-white text-primary-700 hover:bg-white/90 border-0">
                  Start Free
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="ghost" className="w-full sm:w-auto text-white/80 hover:text-white hover:bg-white/10 border border-white/20">
                  Login
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/50">No credit card required. Free forever plan included.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
