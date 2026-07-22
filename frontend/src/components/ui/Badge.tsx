'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const badgeVariants = {
  default: 'bg-surface-tertiary text-text-secondary border-border',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-accent-50 text-accent-700 border-accent-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-[11px] gap-1.5',
};

const dotColors = {
  default: 'bg-text-tertiary',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-accent-500',
  neutral: 'bg-slate-400',
};

export function Badge({ children, className, variant = 'default', size = 'md', dot, removable, onRemove }: BadgeProps) {
  return (
    <span
      className={twMerge(clsx(
        'inline-flex items-center font-semibold uppercase tracking-wider rounded-lg border',
        badgeVariants[variant],
        sizes[size],
        className,
      ))}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-60 transition-opacity"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
