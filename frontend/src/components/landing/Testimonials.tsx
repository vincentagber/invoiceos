'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Freelance Designer',
    content: 'InvoiceOS has completely transformed how I manage my billing. I save 10+ hours every month on invoicing. The templates are beautiful and professional.',
    rating: 5,
    avatar: 'SJ',
    color: 'bg-primary',
  },
  {
    name: 'Michael Chen',
    role: 'Agency Owner',
    content: 'We manage 50+ clients and InvoiceOS makes it effortless. The recurring invoices and payment tracking are absolute game-changers for our agency.',
    rating: 5,
    avatar: 'MC',
    color: 'bg-green-500',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Small Business Owner',
    content: 'The multi-currency feature alone is worth it. I can invoice clients in USD, EUR, and NGN from one dashboard. The analytics help me understand my cash flow.',
    rating: 5,
    avatar: 'ER',
    color: 'bg-accent',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-4 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Loved by thousands
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            See what our customers say about InvoiceOS.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
