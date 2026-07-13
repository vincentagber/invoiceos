'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, RefreshCw, Wallet, ArrowRight } from 'lucide-react';
import WorkflowCard from './WorkflowCard';
import Connector from './Connector';
import MiniQuotation from './MiniQuotation';
import MiniInvoice from './MiniInvoice';
import MiniPayment from './MiniPayment';

const steps = [
  {
    step: '01',
    icon: <ClipboardList size={24} />,
    title: 'Create a quotation',
    description:
      'Add products, quantities, taxes, discounts and pricing in seconds. Every calculation updates automatically.',
    accent: '#F97316',
    mockup: <MiniQuotation />,
  },
  {
    step: '02',
    icon: <RefreshCw size={24} />,
    title: 'Convert to invoice',
    description:
      'Turn approved quotations into invoices instantly. Client details, payment terms and references are carried over automatically.',
    accent: '#3B82F6',
    mockup: <MiniInvoice />,
  },
  {
    step: '03',
    icon: <Wallet size={24} />,
    title: 'Receive payment',
    description:
      'Match incoming transfers automatically, update invoice status instantly and keep your accounts perfectly synchronized.',
    accent: '#10B981',
    mockup: <MiniPayment />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: '#FAFAFB' }}
    >
      {/* Radial gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[rgba(249,115,22,0.03)] rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[rgba(59,130,246,0.03)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[rgba(16,185,129,0.03)] rounded-full blur-3xl" />
        {/* Subtle noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-6 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-[1180px] mx-auto"
        >
          {/* Header */}
          <motion.div variants={childVariants} className="text-center mb-12 lg:mb-20">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-[rgba(15,23,42,0.08)]" />
              <span className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.25em]">
                How It Works
              </span>
              <div className="w-12 h-px bg-[rgba(15,23,42,0.08)]" />
            </div>

            {/* Headline */}
            <h2 className="text-[34px] md:text-[48px] lg:text-[64px] font-extrabold tracking-tight leading-[1.08] text-[#0F172A] mb-5">
              Create. Send. Get Paid.
              <br />
              <span className="text-[#64748B] text-[28px] md:text-[40px] lg:text-[52px] font-bold">
                Everything happens in three effortless steps.
              </span>
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Generate quotations in seconds, convert them into professional invoices, and
              automatically reconcile incoming payments — all from one intelligent platform.
            </p>
          </motion.div>

          {/* Cards Grid with Connectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <React.Fragment key={step.step}>
                <WorkflowCard
                  step={step.step}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  accent={step.accent}
                  index={i}
                >
                  {step.mockup}
                </WorkflowCard>
                {i < steps.length - 1 && <Connector />}
              </React.Fragment>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            variants={childVariants}
            className="flex justify-center mt-12 lg:mt-16"
          >
            <motion.a
              href="/register"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 bg-[#0F172A] text-white text-[15px] font-semibold px-8 py-4 rounded-full shadow-[0_4px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.25)] transition-shadow duration-300"
            >
              <span>Start Creating Invoices for Free</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <ArrowRight size={18} />
              </motion.span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
