'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const faqs = [
  {
    q: 'How does InvoiceOS handle dual-jurisdiction compliance?',
    a: 'InvoiceOS operates a dual-ledger system. For Nigerian entities, we automate FIRS-compliant VAT (7.5%) and WHT deductions with automated credit note generation. For US entities, we manage W-9 collection, 1099 reporting, and IRS-ready transactional records. Our tax automation engine applies the correct rates based on the client jurisdiction and generates compliant invoices with the appropriate tax breakdowns.',
  },
  {
    q: 'Can I automate recurring invoices?',
    a: 'Yes. InvoiceOS features an Automation Engine that handles scheduled invoice generation and payment reminders. Configure automation rules in Settings > Workflow — set triggers (e.g., invoice.sent), actions (e.g., send_reminder or create_invoice), and delay days. The system also supports auto-send invoicing and recurring payment reminders via the Business settings panel. Advanced recurring schedules (daily, weekly, monthly, custom) are available on the Enterprise plan.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Absolutely. InvoiceOS implements bank-grade security: AES-256-GCM encryption for sensitive data at rest, bcrypt with 12 salt rounds for password hashing, and JWT-based authentication with refresh token rotation for session management. We deploy Helmet security headers (CSP, HSTS, XSS protection, noSniff), strict rate limiting (200 req/15min general, 5 req/15min on auth endpoints), and CORS restricted to approved origins. All data is transmitted over TLS. We undergo regular third-party security audits and maintain strict data residency protocols.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'InvoiceOS supports Paystack for subscription billing (credit/debit cards with 1-time and recurring payments). For invoices, we track payments across multiple methods: bank transfers, credit cards, and crypto. Our reconciliation engine automatically matches bank statement CSV uploads to outstanding invoices and supports manual payment matching, refunds, and dispute management. Stripe Connect and PayPal Business integrations are available as setup options for direct payment collection on invoices.',
  },
  {
    q: 'Can I customize invoice templates?',
    a: 'Yes. InvoiceOS provides full template customization. Each business can store multiple InvoiceTemplate variants with JSON-based configuration for layout, colors, and fields. Our built-in PDF engine (jsPDF) generates professional invoices with your logo, brand color, company details, itemized tables with auto-calculated totals, tax and discount breakdowns, and custom notes. Configure defaults in Settings: brand color, invoice prefix, default due period (e.g., Net 30), document style, and default discount rate.',
  },
  {
    q: 'Do you offer multi-currency support?',
    a: 'Yes. InvoiceOS supports invoicing in NGN (₦), USD ($), EUR (€), and GBP (£). Each invoice and quotation carries its own currency setting, independent of your business default currency. Amounts are formatted using locale-aware Intl.NumberFormat (en-NG for NGN, en-US for USD, en-IE for EUR, en-GB for GBP). Multi-currency reporting and automated FX-rate conversion are available on the Enterprise plan.',
  },
];

interface FaqProps {
  showHeader?: boolean;
}

export default function Faq({ showHeader = true }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 lg:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
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
        )}

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
                <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-sm md:text-base">
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
