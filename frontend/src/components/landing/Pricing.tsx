'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for freelancers and sole proprietors getting started.',
    price: { monthly: '$0', yearly: '$0' },
    period: 'forever',
    features: [
      'Up to 5 invoices/month',
      'Basic expense tracking',
      'Invoice templates',
      'Email support',
    ],
    cta: 'Start Free',
    href: '/register',
    featured: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses that need advanced financial tools.',
    price: { monthly: '$29', yearly: '$23' },
    period: '/month',
    features: [
      'Unlimited invoices',
      'Expense categorization',
      'Tax reports (VAT/GST/WHT)',
      'Client management',
      'Quotations & estimates',
      'Multi-user access (3 seats)',
      'API access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/register',
    featured: true,
  },
  {
    name: 'Enterprise',
    description: 'For scaling teams needing custom workflows and dedicated support.',
    price: { monthly: '$99', yearly: '$79' },
    period: '/month',
    features: [
      'Everything in Professional',
      'Unlimited users',
      'Custom compliance rules',
      'Dedicated account manager',
      'SSO & SAML',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    href: '/register',
    featured: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-xs font-semibold text-primary-700 mb-6">
            Simple pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            No hidden fees. No surprises.
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Start free and upgrade when you need more power.
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={clsx('text-sm font-medium', !annual ? 'text-text-primary' : 'text-text-tertiary')}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors duration-200',
              annual ? 'bg-primary' : 'bg-border-dark',
            )}
          >
            <div className={clsx(
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
              annual ? 'translate-x-6' : 'translate-x-0.5',
            )} />
          </button>
          <span className={clsx('text-sm font-medium', annual ? 'text-text-primary' : 'text-text-tertiary')}>
            Annual
            <span className="ml-1.5 text-xs text-success font-semibold">Save 20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              className={clsx(
                'relative flex flex-col rounded-2xl border p-6 lg:p-8 transition-all duration-200',
                plan.featured
                  ? 'bg-primary text-white border-primary shadow-xl scale-[1.02] lg:scale-105'
                  : 'bg-surface border-border hover:shadow-card-hover',
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-white text-[10px] font-semibold uppercase tracking-wider px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Zap size={10} />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={clsx('text-lg font-semibold', plan.featured ? 'text-white' : 'text-text-primary')}>
                  {plan.name}
                </h3>
                <p className={clsx('text-sm mt-1', plan.featured ? 'text-white/70' : 'text-text-secondary')}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className={clsx('text-4xl font-bold', plan.featured ? 'text-white' : 'text-text-primary')}>
                    {annual ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.period && (
                    <span className={clsx('text-sm font-medium', plan.featured ? 'text-white/60' : 'text-text-tertiary')}>
                      {plan.period}
                    </span>
                  )}
                </div>
                {plan.name === 'Free' && (
                  <span className={clsx('text-sm font-medium', plan.featured ? 'text-white/60' : 'text-text-tertiary')}>
                    No credit card
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check size={16} className={clsx('shrink-0 mt-0.5', plan.featured ? 'text-success-300' : 'text-success')} />
                    <span className={clsx('text-sm', plan.featured ? 'text-white/80' : 'text-text-secondary')}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  variant={plan.featured ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full"
                  rightIcon={<ArrowRight size={16} />}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
