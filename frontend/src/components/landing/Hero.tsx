'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const floatingCards = [
  { icon: TrendingUp, label: 'Revenue +18%', color: 'text-success', bg: 'bg-success-50', x: '10%', y: '20%', delay: 0 },
  { icon: Shield, label: '100% Compliant', color: 'text-primary', bg: 'bg-primary-50', x: '75%', y: '15%', delay: 0.2 },
  { icon: Zap, label: 'AI Powered', color: 'text-accent', bg: 'bg-accent-50', x: '80%', y: '60%', delay: 0.4 },
];

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/2 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      {floatingCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + card.delay, duration: 0.6 }}
          className="absolute hidden lg:flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-border rounded-xl px-4 py-3 shadow-lg"
          style={{ left: card.x, top: card.y }}
        >
          <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
            <card.icon size={16} />
          </div>
          <span className="text-sm font-semibold text-text-primary">{card.label}</span>
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-xs font-semibold text-primary-700 mb-8">
              <Zap size={12} />
              Trusted by 10,000+ businesses worldwide
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-text-primary leading-[1.1] text-balance"
          >
            The smartest way to manage
            <span className="text-primary"> invoices, compliance</span>
            {' '}and finances.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto text-pretty"
          >
            From invoicing to tax compliance, InvoiceOS is the all-in-one financial OS for modern businesses. 
            Automate billing, track expenses, and stay compliant — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="xl" className="w-full sm:w-auto">
                Start Free
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Button size="xl" variant="secondary" className="w-full sm:w-auto" leftIcon={<Play size={18} />}>
              Book Demo
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 text-xs text-text-tertiary"
          >
            No credit card required. Free forever plan included.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 lg:mt-20 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-secondary via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-border shadow-2xl overflow-hidden bg-surface">
              <img
                src="/emerald-hero.png"
                alt="InvoiceOS Dashboard"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-8 bg-black/5 rounded-full blur-2xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
