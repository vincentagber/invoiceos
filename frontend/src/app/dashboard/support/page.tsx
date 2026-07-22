'use client';

import React from 'react';
import {
  Search, Rocket, ReceiptText, ShieldCheck, Puzzle,
  ChevronDown, MessageCircle, Mail, Activity, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function DashboardSupportPage() {
  const categories = [
    { icon: Rocket, title: 'Getting Started', desc: 'Account setup, basic navigation, and first invoice creation.', color: 'text-primary', bg: 'bg-primary-50' },
    { icon: ReceiptText, title: 'Billing & Payments', desc: 'Payment gateways, reconciliation, and subscription management.', color: 'text-success', bg: 'bg-success-50' },
    { icon: ShieldCheck, title: 'Security & Compliance', desc: 'Data protection, roles, and audit logs.', color: 'text-warning', bg: 'bg-warning-50' },
    { icon: Puzzle, title: 'API & Integrations', desc: 'Connecting InvoiceOS to your existing tech stack.', color: 'text-danger', bg: 'bg-danger-50' },
  ];

  const faqs = [
    { q: 'How do I automate WHT (Withholding Tax)?', a: 'You can automate WHT by navigating to Settings > Tax Rules. From there, create a new rule for Withholding Tax, specify the percentage, and assign it to the relevant client profiles. The system will automatically deduct this on future invoices generated for those clients.' },
    { q: 'Can I manage multiple businesses under one account?', a: 'Yes, InvoiceOS supports multi-entity management on the Enterprise plan. You can switch between businesses using the entity switcher in the top navigation bar.' },
    { q: 'How do I reconcile bulk payments?', a: 'Use the "Reconciliation" tab under the "Payments" module to upload your bank statement CSV. Our AI engine will automatically match entries to your outstanding invoices.' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      {/* Hero Search */}
      <div className="relative rounded-2xl bg-[#0F172A] p-10 lg:p-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-[0.03] rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">How can we help you today?</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-text-tertiary focus:bg-white focus:text-text-primary focus:border-white transition-all outline-none text-sm"
              placeholder="Search for articles, guides, or keywords..." type="text" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left */}
        <div className="lg:col-span-8 space-y-10">
          {/* Categories */}
          <section className="space-y-5">
            <h3 className="text-base font-semibold text-text-primary">Browse by Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <motion.a key={i} whileHover={{ y: -3 }}
                  className="bg-surface rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all flex flex-col items-start gap-4 group" href="#">
                  <div className={clsx('h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110', cat.bg, cat.color)}>
                    <cat.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1">{cat.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{cat.desc}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="space-y-5">
            <h3 className="text-base font-semibold text-text-primary">Frequently Asked Questions</h3>
            <div className="bg-surface rounded-2xl border border-border divide-y divide-border-light">
              {faqs.map((faq, i) => (
                <details key={i} className="group" open={i === 0}>
                  <summary className="flex justify-between items-center cursor-pointer list-none p-5 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown className="transition-transform duration-300 group-open:rotate-180 text-text-tertiary shrink-0" size={16} />
                  </summary>
                  <div className="px-5 pb-5 text-xs text-text-secondary leading-relaxed">
                    <div className="pt-4 border-t border-border">{faq.a}</div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-4">
          {/* Contact */}
          <section className="bg-surface rounded-2xl border border-border p-5 space-y-5">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary border-b border-border pb-4">Still need help?</h3>
            <div className="space-y-3">
              <button className="w-full bg-surface-secondary border border-border rounded-xl p-4 flex items-start gap-3 hover:bg-surface hover:border-primary/30 transition-all text-left group">
                <div className="text-success bg-success-50 p-2.5 rounded-xl group-hover:bg-success group-hover:text-white transition-all">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Live Chat</h4>
                  <p className="text-[11px] text-text-tertiary">Instant support (Mon-Fri, 9am-6pm WAT)</p>
                </div>
              </button>
              <a href="mailto:support@invoiceos.com" className="block w-full bg-surface-secondary border border-border rounded-xl p-4 flex items-start gap-3 hover:bg-surface hover:border-primary/30 transition-all text-left group">
                <div className="text-primary bg-primary-50 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Email Support</h4>
                  <p className="text-[11px] text-text-tertiary">Response within 2 hours</p>
                  <p className="text-[11px] font-medium text-primary mt-1">support@invoiceos.com</p>
                </div>
              </a>
            </div>
          </section>

          {/* System Status */}
          <section className="bg-surface-secondary rounded-2xl border border-border p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">System Status</h4>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-success" /></span>
                <span className="text-[10px] font-medium text-success uppercase tracking-wider">All Live</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-surface flex items-center justify-center text-success border border-border">
                  <Activity size={18} />
                </div>
                <p className="text-sm font-medium text-text-primary">All systems operational</p>
              </div>
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <Clock size={12} /> Business Hours
                </h4>
                <p className="text-sm font-medium text-text-primary">Monday - Friday</p>
                <p className="text-xs text-text-tertiary">09:00 AM - 06:00 PM (WAT)</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
