'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const faqs = [
  {
    q: 'How does InvoiceOS handle dual-jurisdiction compliance?',
    a: 'InvoiceOS operates a dual-ledger system. For Nigerian entities, we automate FIRS-compliant VAT (7.5%) and WHT deductions with automated credit note generation. For US entities, we manage W-9 collection, 1099 reporting, and IRS-ready transactional records.',
  },
  {
    q: 'Can I automate recurring invoices?',
    a: 'Yes. You can set up recurring invoices on daily, weekly, monthly, or custom schedules. Our system will automatically generate and send invoices to your clients on the specified dates.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Security is our highest priority. InvoiceOS uses bank-grade AES-256 encryption for all data. We undergo regular third-party security audits and maintain strict data residency protocols.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support Stripe, PayPal, bank transfers, and mobile money payments. Your clients can pay with credit/debit cards, bank accounts, or their preferred local payment method.',
  },
  {
    q: 'Can I customize invoice templates?',
    a: 'Absolutely. You can customize colors, fonts, add your logo, set custom fields, and create multiple templates for different types of invoices or clients.',
  },
  {
    q: 'Do you offer multi-currency support?',
    a: 'Yes, you can create invoices in USD, EUR, GBP, NGN, and 30+ other currencies. Our system automatically handles currency conversion and displays the amount in your preferred currency.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4 block">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to know about InvoiceOS.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group"
              >
                <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  size={20}
                  className={clsx(
                    'text-gray-400 transition-transform duration-300 shrink-0 ml-4',
                    openIndex === i && 'rotate-180'
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-gray-500 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
