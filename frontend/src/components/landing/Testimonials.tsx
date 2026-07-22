'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO, Bright Studio',
    avatar: 'SC',
    content: 'InvoiceOS transformed how we bill our clients. We went from spending 8 hours a week on invoicing to fully automated. The compliance features alone are worth it.',
    rating: 5,
  },
  {
    name: 'James Okafor',
    role: 'CFO, TechLabs Africa',
    avatar: 'JO',
    content: 'Finally, a financial platform built for African businesses. The automated VAT and WHT calculations save us hours every month. Our accountant loves it.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Freelance Designer',
    avatar: 'ER',
    content: 'As a solo founder, I needed something that didnt require an accounting degree. InvoiceOS makes invoicing, expense tracking, and tax prep dead simple.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'COO, Nexus Digital',
    avatar: 'DK',
    content: 'We evaluated Mercury, Ramp, and QuickBooks. InvoiceOS won because it combines invoicing, compliance, and accounting in one beautiful platform.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-accent-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            Loved by businesses everywhere
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            See what our customers have to say about their experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface rounded-2xl border border-border p-6 lg:p-8"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-warning-400 text-warning-400" />
                ))}
              </div>
              <p className="text-sm lg:text-base text-text-primary leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{t.name}</div>
                  <div className="text-xs text-text-tertiary">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
