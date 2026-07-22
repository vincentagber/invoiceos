'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-700 shadow-sm active:bg-primary-800',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-tertiary shadow-sm active:bg-surface-secondary',
  outline: 'border border-border bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
  danger: 'bg-danger text-white hover:bg-danger-600 shadow-sm active:bg-danger-700',
  success: 'bg-success text-white hover:bg-success-600 shadow-sm active:bg-success-700',
  warning: 'bg-warning text-white hover:bg-warning-600 shadow-sm active:bg-warning-700',
};

const sizes = {
  xs: 'h-7 px-2.5 text-[11px] rounded-lg gap-1.5 font-semibold',
  sm: 'h-9 px-3.5 text-xs rounded-xl gap-2 font-semibold',
  md: 'h-10 px-5 text-sm rounded-xl gap-2 font-semibold',
  lg: 'h-12 px-6 text-sm rounded-2xl gap-2.5 font-semibold',
  xl: 'h-14 px-8 text-base rounded-2xl gap-3 font-semibold',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          'select-none',
          variants[variant],
          sizes[size],
          className,
        ))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin shrink-0" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
