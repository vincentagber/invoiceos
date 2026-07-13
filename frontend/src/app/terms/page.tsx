'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 leading-relaxed"
          >
            Last updated: April 2026. Please read these terms carefully before using InvoiceOS.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-16"
        >
          <article className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using InvoiceOS (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including businesses, freelancers, and individual account holders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                2. Description of Service
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                InvoiceOS provides professional invoicing, payment tracking, financial analytics, and compliance tools for businesses and freelancers. The Service includes:
              </p>
              <ul className="space-y-3 text-gray-600">
                {[
                  'Invoice creation, customization, and delivery',
                  'Payment processing and tracking',
                  'Recurring billing and automation',
                  'Financial reporting and analytics',
                  'Multi-currency and multi-jurisdiction support',
                  'API access for integrations'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                3. User Responsibilities
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                As a user of InvoiceOS, you agree to:
              </p>
              <ul className="space-y-4 text-gray-600">
                {[
                  'Provide accurate and complete information when creating your account',
                  'Maintain the security of your account credentials',
                  'Use the Service in compliance with all applicable laws and regulations',
                  'Not use the Service for fraudulent or illegal activities',
                  'Not attempt to disrupt, compromise, or reverse-engineer the Service'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                4. Payment Terms
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Subscription fees are billed in advance on a monthly or annual basis, depending on your chosen plan. All fees are non-refundable except as required by applicable law. We reserve the right to change our pricing with 30 days notice.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Payment processing fees from third-party providers (Stripe, Paystack, etc.) are passed through to the user and are not part of InvoiceOS subscription fees.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                5. Intellectual Property
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The Service, including its code, design, logos, and documentation, is the intellectual property of InvoiceOS Technologies. Users retain ownership of their data and invoice content. You may not copy, modify, distribute, or create derivative works of the Service without our express written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                InvoiceOS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability for any claim shall not exceed the amount you have paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                7. Termination
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Either party may terminate this agreement at any time. Upon termination, your access to the Service will be revoked, and your data will be exported or deleted in accordance with our data retention policy. We may terminate or suspend your account immediately for breach of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                8. Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Users will be notified of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contact</h3>
              <p className="text-sm text-gray-500 mb-6">
                For questions about these terms, please contact us.
              </p>
              <a
                href="mailto:legal@invoiceos.com"
                className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
              >
                legal@invoiceos.com
              </a>
            </section>
          </article>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
