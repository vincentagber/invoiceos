'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Cta() {
  return (
    <section id="contact" className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto px-6 text-center relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
          Ready to streamline your invoicing?
        </h2>
        <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl mx-auto">
          Join 12,000+ businesses that trust InvoiceOS for their invoicing needs.
          Start your free trial today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-base font-bold hover:bg-white/90 transition-all active:scale-[0.98] shadow-xl"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl text-base font-semibold border border-white/20 hover:bg-white/20 transition-all active:scale-[0.98]"
          >
            Learn More
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/60 font-medium">
          No credit card required. Setup takes less than 3 minutes.
        </p>
      </motion.div>
    </section>
  );
}
