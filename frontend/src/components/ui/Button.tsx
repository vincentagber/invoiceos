import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

        const variants = {
            primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm focus-visible:outline-indigo-600",
            secondary: "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 shadow-sm",
            outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
            ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm focus-visible:outline-red-600"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
            md: "h-10 px-4 py-2 text-sm rounded-xl gap-2",
            lg: "h-12 px-6 text-base rounded-xl gap-2.5"
        };

        return (
            <button
                ref={ref}
                className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />}
                {!isLoading && leftIcon && leftIcon}
                {children}
                {!isLoading && rightIcon && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
