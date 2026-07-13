'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PrivacyPage() {
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
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 leading-relaxed"
          >
            Effective Date: October 24, 2024. This document outlines how InvoiceOS collects, uses, and protects your data.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-16"
        >
          <article className="space-y-16">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                1. Data Collection Practices
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                InvoiceOS operates on a foundation of minimal necessary data collection. We gather information required strictly for the operation, security, and compliance of our financial infrastructure.
              </p>
              <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-gray-100">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">
                  Core Data Categories
                </h4>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong>Identity Information:</strong> Corporate entity names, authorized representative details, and structural hierarchies.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong>Operational Metrics:</strong> Volume of transactions, frequency of invoicing, and API utilization rates.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong>Technical Telemetry:</strong> IP addresses, browser agents, and access logs strictly for security auditing.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6">1.1 Payment & Transactional Data</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                As a financial conduit, we process sensitive payment instruments. All payment processing data (credit cards, ACH details, wire instructions) is tokenized immediately upon entry. We do not store raw primary account numbers (PAN) on InvoiceOS servers.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Location data associated with transactions is captured solely for fraud prevention and tax compliance mapping, never for marketing or tracking purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                2. User Rights & Compliance (GDPR/CCPA)
              </h2>
              <p className="text-gray-600 leading-relaxed mb-10">
                InvoiceOS is engineered to exceed the standards set by global regulatory frameworks, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Right to Access', desc: 'You may request a complete cryptographic export of all data associated with your organizational entity.' },
                  { title: 'Right to Erasure', desc: 'You may invoke the right to be forgotten, subject to mandatory financial retention laws.' },
                  { title: 'Right to Portability', desc: 'Export your ledgers and client data in machine-readable formats (JSON, CSV, XML) at any time.' },
                  { title: 'Non-Discrimination', desc: 'Exercising your privacy rights will never result in degraded service or altered pricing structures.' }
                ].map((right, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">{right.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{right.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                3. Data Retention Lifecycle
              </h2>
              <p className="text-gray-600 leading-relaxed mb-10">
                Our retention policies are strictly dictated by financial compliance requirements. Data is held only as long as legally mandated or functionally necessary.
              </p>
              <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-4 px-6 text-xs font-semibold tracking-widest uppercase text-gray-400">Data Type</th>
                      <th className="py-4 px-6 text-xs font-semibold tracking-widest uppercase text-gray-400">Retention Period</th>
                      <th className="py-4 px-6 text-xs font-semibold tracking-widest uppercase text-gray-400">Post-Retention Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-600">
                    {[
                      { type: 'Invoice Records', period: '7 Years (IRS Mandate)', action: 'Cryptographic Destruction' },
                      { type: 'Audit Logs', period: '12 Months', action: 'Aggregated & Anonymized' },
                      { type: 'Account Metadata', period: 'Life of Account + 30 Days', action: 'Hard Delete' }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-5 px-6 font-semibold text-gray-900">{row.type}</td>
                        <td className="py-5 px-6">{row.period}</td>
                        <td className="py-5 px-6 text-gray-400">{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                4. Third-Party Subprocessors
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We engage a limited number of rigorously vetted sub-processors to deliver our core services. We do not sell data to data brokers under any circumstances.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'AWS Infrastructure', desc: 'Primary hosting and encrypted storage.' },
                  { name: 'Paystack / Stripe', desc: 'Fiat transaction clearing and tokenization.' }
                ].map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900">{sub.name}</h5>
                      <p className="text-xs text-gray-500">{sub.desc}</p>
                    </div>
                    <span className="px-3 py-1 bg-white border border-gray-100 text-xs font-semibold rounded-lg text-gray-400">Essential</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Privacy Inquiries</h3>
              <p className="text-sm text-gray-500 mb-8">For data subject access requests or compliance inquiries, please contact our Data Protection Officer.</p>
              <a
                href="mailto:privacy@invoiceos.com"
                className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
              >
                privacy@invoiceos.com
              </a>
            </section>
          </article>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
