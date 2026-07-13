'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WorkflowCardProps {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  children?: React.ReactNode;
  index: number;
}

export default function WorkflowCard({
  step,
  icon,
  title,
  description,
  accent,
  children,
  index,
}: WorkflowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -8, scale: 1.015 }}
      className="group relative bg-white/70 backdrop-blur-xl border border-[rgba(0,0,0,0.06)] rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.10)] transition-all duration-500 flex flex-col"
    >
      {/* Step Number */}
      <div className="absolute top-4 right-6 select-none">
        <span
          className="text-[64px] font-black leading-none tracking-tighter"
          style={{ color: `color-mix(in srgb, ${accent} 8%, transparent)`, WebkitTextStroke: `1px color-mix(in srgb, ${accent} 20%, transparent)` }}
        >
          {step}
        </span>
      </div>

      {/* Icon */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, white)` }}
      >
        <div style={{ color: accent }}>{icon}</div>
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#0F172A] mb-3 relative z-10">{title}</h3>

      {/* Description */}
      <p className="text-sm text-[#64748B] leading-relaxed mb-6 relative z-10">{description}</p>

      {/* Mockup */}
      <div className="mt-auto relative z-10">{children}</div>
    </motion.div>
  );
}
