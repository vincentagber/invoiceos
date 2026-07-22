'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const faqs = [
  {
    q: 'What is InvoiceOS?',
    a: 'InvoiceOS is an all-in-one financial operating system that combines invoicing, expense tracking, compliance monitoring, accounting, and tax reporting into one seamless platform. It is designed for freelancers, SMEs, and growing enterprises.',
  },
  {
    q: 'How is InvoiceOS different from QuickBooks or Xero?',
    a: 'Unlike traditional accounting software, InvoiceOS is built for modern businesses that need more than just bookkeeping. We offer automated compliance monitoring, AI-powered insights, quotation management, and real-time tax reports tailored to your jurisdiction — all in a beautifully designed interface.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. InvoiceOS uses bank-grade encryption (AES-256) for data at rest and TLS 1.3 for data in transit. We are SOC 2 compliant, conduct regular penetration testing, and offer SSO/SAML for enterprise customers. Your financial data is safe with us.',
  },
  {
    q: 'Can I customize invoices and quotations?',
    a: 'Yes. You can fully customize your invoice and quotation templates with your logo, brand colors, custom fields, and preferred layout. We also offer multiple professional templates to get you started.',
  },
  {
    q: 'Does InvoiceOS handle tax compliance for my country?',
    a: 'Yes. InvoiceOS supports VAT, GST, WHT, CIT, and sales tax for multiple jurisdictions including Nigeria, the United States, the United Kingdom, Kenya, South Africa, and more. We continuously update our compliance engine to match regulatory changes.',
  },
  {
    q: 'Can I invite my team or accountant?',
    a: 'Yes. InvoiceOS supports multi-user access with role-based permissions. You can invite your team members, accountant, or compliance officer with customized access levels. The Professional plan includes 3 seats, and Enterprise offers unlimited users.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. Our Free plan includes up to 5 invoices per month, basic expense tracking, and invoice templates — no credit card required. Upgrade to Professional or Enterprise when you need more power.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'We support credit/debit cards, bank transfers, and local payment methods depending on your region. In Nigeria, we support Paystack and bank transfers. In the US and Europe, we support Stripe and wire transfers.',
  },
];

export default function Faq({ showHeader = true }: { showHeader?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {showHeader && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Everything you need to know about InvoiceOS.
              </p>
            </motion.div>
          )}

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="bg-surface rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-text-primary">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={clsx(
                    'shrink-0 text-text-tertiary transition-transform duration-200',
                    openIndex === i && 'rotate-180',
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
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
