'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function MiniPayment() {
  return (
    <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.06)] shadow-sm p-4 w-full max-w-[240px] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">INV-042</span>
        <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"/>
          </motion.svg>
          Paid
        </span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="text-lg font-bold text-slate-900">$4,515.00</div>
        <div className="text-[9px] text-slate-400">Received from Acme Corp</div>
      </div>

      <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-slate-400">Progress</span>
        <span className="text-[8px] font-bold text-emerald-600">100%</span>
      </div>
    </div>
  );
}
