'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    desc: 'Perfect for freelancers getting started.',
    monthlyPrice: '₦3,000',
    yearlyPrice: '₦2,400',
    features: ['Up to 20 invoices/month', '3 invoice templates', 'Payment tracking', 'Email support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    desc: 'Best for growing businesses and agencies.',
    monthlyPrice: '₦7,500',
    yearlyPrice: '₦6,000',
    features: ['Unlimited invoices', 'All templates', 'Recurring invoices', 'Analytics & reports', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    desc: 'For large teams with advanced needs.',
    monthlyPrice: '₦15,000',
    yearlyPrice: '₦12,000',
    features: ['Everything in Professional', 'Multi-entity management', 'Custom integrations', 'White-label invoices', 'Dedicated account manager', '99.99% SLA'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4 block">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. No hidden fees.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className={clsx('text-sm font-medium transition-colors', !isYearly ? 'text-gray-900' : 'text-gray-400')}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 bg-gray-200 rounded-full relative p-1 transition-all cursor-pointer"
            >
              <div
                className={clsx(
                  'w-5 h-5 bg-primary rounded-full transition-transform duration-300 shadow-sm',
                  isYearly ? 'translate-x-7' : 'translate-x-0'
                )}
              />
            </button>
            <span className={clsx('text-sm font-medium transition-colors', isYearly ? 'text-gray-900' : 'text-gray-400')}>
              Yearly <span className="text-green-500 text-xs font-semibold">Save 20%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={clsx(
                'relative bg-white rounded-2xl p-8 flex flex-col transition-all duration-300',
                plan.popular
                  ? 'border-2 border-primary shadow-xl shadow-primary/10 scale-105 md:scale-110'
                  : 'border border-gray-100 hover:border-primary/30 hover:shadow-lg'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
                {isYearly && (
                  <p className="text-xs text-green-500 font-medium mt-1">
                    Billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={clsx(
                  'w-full py-3.5 rounded-xl text-center text-sm font-semibold transition-all active:scale-[0.98]',
                  plan.popular
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
