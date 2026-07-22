'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Wallet, ShieldCheck, BarChart3, Users, FileSpreadsheet,
  TrendingUp, ClipboardCheck, Cloud, Users2, ScrollText, Lock
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'Invoice Management', description: 'Create, send, and track invoices with professional templates and automated payment reminders.' },
  { icon: Wallet, title: 'Expense Tracking', description: 'Capture receipts, categorize spending, and reconcile expenses against revenue automatically.' },
  { icon: ShieldCheck, title: 'Compliance Monitoring', description: 'Stay compliant with real-time regulatory checks and automated filing readiness reports.' },
  { icon: BarChart3, title: 'Tax Reports', description: 'Generate VAT, GST, CIT, and WHT reports with one click. Ready for your local tax authority.' },
  { icon: TrendingUp, title: 'Accounting', description: 'Full double-entry accounting with general ledger, trial balance, and financial statements.' },
  { icon: Users, title: 'Client Management', description: 'CRM built for billing. Track client history, payment behavior, and revenue per relationship.' },
  { icon: FileSpreadsheet, title: 'Quotations', description: 'Build beautiful quotes with drag-and-drop line items, AI suggestions, and approval workflows.' },
  { icon: ClipboardCheck, title: 'Analytics', description: 'Real-time dashboards with revenue trends, cash flow forecasts, and profitability insights.' },
  { icon: Users2, title: 'Multi-user Access', description: 'Role-based access for your team. Accountants, admins, and viewers with granular permissions.' },
  { icon: ScrollText, title: 'Audit Logs', description: 'Every action is tracked. Complete audit trail for compliance, accounting, and peace of mind.' },
  { icon: Cloud, title: 'Cloud Backup', description: 'Automatic encrypted backups across redundant servers. Your data is never at risk.' },
  { icon: Lock, title: 'Enterprise Security', description: 'SOC 2 compliant infrastructure with end-to-end encryption and SSO support.' },
];

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-xs font-semibold text-primary-700 mb-6">
            Everything you need
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            One platform for your entire financial workflow
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            No more juggling between QuickBooks, Excel, and compliance portals. Everything is unified.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              className="group relative bg-surface rounded-2xl border border-border p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
                <feature.icon size={20} />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
