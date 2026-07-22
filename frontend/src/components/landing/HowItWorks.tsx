'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, ShieldCheck, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'Increase Cash Flow',
    description: 'Get paid 2x faster with automated payment reminders, multiple payment gateways, and instant invoice sharing.',
    stat: '2x',
    statLabel: 'Faster payments',
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    icon: FileText,
    title: 'Reduce Paperwork',
    description: 'Automate invoice generation, expense categorization, and report creation. Save 10+ hours per week on admin.',
    stat: '10h',
    statLabel: 'Saved per week',
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    icon: ShieldCheck,
    title: 'Stay Compliant',
    description: 'Auto-generated tax reports for VAT, GST, WHT, and CIT. Always audit-ready with real-time compliance monitoring.',
    stat: '100%',
    statLabel: 'Compliance ready',
    gradient: 'from-success-500 to-success-600',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-success-50 border border-success-200 rounded-full text-xs font-semibold text-success-700 mb-6">
            <TrendingUp size={12} />
            Real results
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            Built for impact
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Thousands of businesses use InvoiceOS to streamline their finances and grow faster.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-surface-secondary rounded-2xl border border-border p-8 overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${benefit.gradient} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center text-white shadow-lg mb-6`}>
                  <benefit.icon size={22} />
                </div>
                <div className="text-4xl font-bold text-text-primary mb-1">{benefit.stat}</div>
                <div className="text-sm font-medium text-text-tertiary mb-4">{benefit.statLabel}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="mt-16 p-8 lg:p-12 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl border border-primary-100"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Active Businesses' },
              { value: '$50M+', label: 'Invoices Processed' },
              { value: '99.9%', label: 'Uptime' },
              { value: '4.9/5', label: 'Customer Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm font-medium text-text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
