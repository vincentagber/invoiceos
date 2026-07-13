'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Repeat,
  Globe,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Professional Invoices',
    desc: 'Create stunning invoices with customizable templates. Add your logo, set payment terms, and send in seconds.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    desc: 'Accept payments via Stripe, PayPal, and bank transfers. All transactions are encrypted and PCI compliant.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Track your revenue, outstanding invoices, and payment trends with beautiful real-time charts and reports.',
  },
  {
    icon: Repeat,
    title: 'Automation',
    desc: 'Automate recurring invoices, payment reminders, and late fees. Save hours every month on manual tasks.',
  },
  {
    icon: Globe,
    title: 'Multi-Currency',
    desc: 'Send invoices in USD, EUR, NGN, and more. Accept payments in your clients preferred currency.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Invite your team members, assign roles, and collaborate on invoices and client management in real time.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-16 lg:py-28 bg-white relative overflow-hidden">
      {/* Quiet background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F8F9FC] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12 lg:mb-20"
        >
          <span className="inline-flex items-center gap-2.5 text-[11px] font-bold text-[#0F172A] uppercase tracking-[0.2em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
            Features
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0F172A] mb-5 leading-[1.1]">
            Everything you need to run your business
          </h2>
          <p className="text-sm sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            InvoiceOS provides all the tools you need to create, send, and manage invoices like a pro.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -3, transition: { duration: 0.3 } }}
              className="group relative bg-white border border-[#E2E8F0] rounded-xl p-7 hover:border-[#CBD5E1] hover:shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F8F9FC] border border-[#E2E8F0] flex items-center justify-center mb-5 group-hover:border-[#CBD5E1] transition-colors duration-300">
                <feature.icon
                  size={18}
                  className="text-[#64748B] group-hover:text-[#0F172A] transition-colors duration-300"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2.5">{feature.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{feature.desc}</p>
              <div className="mt-5 flex items-center gap-1 text-[13px] font-medium text-[#64748B] group-hover:text-[#0F172A] transition-colors duration-300">
                <span>Learn more</span>
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
