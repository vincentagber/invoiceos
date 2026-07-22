'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ className, variant = 'text', width, height, style }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-tertiary';

  const variants = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl h-40',
  };

  return (
    <div
      className={twMerge(clsx(baseClasses, variants[variant], className))}
      style={{ width, height, ...(style || {}) }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
      <div className="pt-3">
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`c-${c}`} className="h-4 flex-1" style={{ width: `${50 + Math.random() * 50}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
