'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function MiniInvoice() {
  return (
    <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.06)] shadow-sm p-5 w-full max-w-[200px] mx-auto">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-center w-full">
          <span className="text-[10px] font-bold text-blue-600">QUO-042</span>
        </div>

        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-blue-400"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"/>
            <path d="m19 12-7 7-7-7"/>
          </svg>
        </motion.div>

        <div className="bg-blue-600 rounded-lg px-4 py-2 text-center w-full shadow-sm">
          <span className="text-[10px] font-bold text-white">INV-042</span>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider">Carried over</span>
        </div>
      </div>
    </div>
  );
}
