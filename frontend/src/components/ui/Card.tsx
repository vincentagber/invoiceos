'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  as?: 'div' | 'section' | 'article' | 'button';
  onClick?: () => void;
}

const cardVariants = {
  default: 'bg-surface border border-border shadow-card',
  elevated: 'bg-surface border border-border shadow-lg',
  glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-card',
  bordered: 'bg-surface border-2 border-border shadow-none',
  flat: 'bg-surface-secondary border-none shadow-none',
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'lg',
  hover = false,
  as: Component = 'div',
  onClick,
}: CardProps) {
  return (
    <Component
      className={twMerge(clsx(
        'rounded-2xl transition-all duration-200',
        cardVariants[variant],
        paddings[padding],
        hover && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className,
      ))}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className, action }: { children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={twMerge('flex items-center justify-between gap-4 mb-5', className)}>
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={twMerge('text-base font-semibold text-text-primary tracking-tight', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={twMerge('text-sm text-text-secondary mt-0.5', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge('flex items-center gap-3 mt-6 pt-5 border-t border-border', className)}>{children}</div>;
}
