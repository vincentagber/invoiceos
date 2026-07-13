'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Connector() {
  return (
    <div className="hidden lg:flex items-center justify-center py-4 relative">
      <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-orange-400 to-transparent blur-sm"
          animate={{ left: ['-50%', '150%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -top-[3px] left-0 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-sm shadow-orange-300"
          animate={{ left: ['0%', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
