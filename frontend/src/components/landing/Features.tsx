'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  Repeat, 
  Globe, 
  Users, 
  ArrowRight 
} from 'lucide-react';

const features = [
  {
    icon: Receipt,
    title: 'Professional Invoices',
    desc: 'Create stunning invoices with customizable templates. Add your logo, set payment terms, and send in seconds.',
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    desc: 'Accept payments via Stripe, PayPal, and bank transfers. All transactions are encrypted and PCI compliant.',
    gradient: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Reports',
    desc: 'Track your revenue, outstanding invoices, and payment trends with beautiful real-time charts and reports.',
    gradient: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50',
  },
  {
    icon: Repeat,
    title: 'Automation',
    desc: 'Automate recurring invoices, payment reminders, and late fees. Save hours every month on manual tasks.',
    gradient: 'from-amber-500 to-orange-600',
    light: 'bg-amber-50',
  },
  {
    icon: Globe,
    title: 'Multi-Currency',
    desc: 'Send invoices in USD, EUR, NGN, and more. Accept payments in your clients preferred currency.',
    gradient: 'from-cyan-500 to-sky-600',
    light: 'bg-cyan-50',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Invite your team members, assign roles, and collaborate on invoices and client management in real time.',
    gradient: 'from-rose-500 to-pink-600',
    light: 'bg-rose-50',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function Features() {
  return (
    <section id="features" className="py-28 bg-white relative overflow-hidden">
      {/* subtle background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-semibold tracking-widest uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5 leading-[1.1]">
            Everything you need to run your business
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            InvoiceOS provides all the tools you need to create, send, and manage invoices like a pro.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative bg-white border border-gray-100 rounded-2xl p-8 hover:border-gray-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl ${feature.light} flex items-center justify-center shrink-0`}>
                  <feature.icon size={22} className={`bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} strokeWidth={1.5} />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gray-900 transition-colors">
                {feature.title}
              </h3>
              <p className="text-[15px] text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors">
                {feature.desc}
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-gray-400 group-hover:text-primary transition-colors duration-300">
                <span>Learn more</span>
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
