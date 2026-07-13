'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 lg:pt-32 pb-16 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Trusted by 12,000+ businesses
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
              Create Beautiful{' '}
              <span className="text-primary">Invoices</span>
              <br />
              In Minutes.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed mb-8 sm:mb-10 max-w-xl">
              Professional invoicing software for freelancers and businesses.
              Send invoices, track payments, and get paid faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 active:scale-[0.98]"
              >
                Start Free
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                <Play size={18} />
                Live Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
