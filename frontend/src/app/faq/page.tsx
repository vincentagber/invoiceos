'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Faq from '@/components/landing/Faq';

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6"
          >
            FAQ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 leading-relaxed"
          >
            Everything you need to know about InvoiceOS.
          </motion.p>
        </div>
        <Faq showHeader={false} />
      </main>
      <Footer />
    </div>
  );
}
