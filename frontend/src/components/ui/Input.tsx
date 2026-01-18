import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, rightElement, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={twMerge(
                            clsx(
                                "block w-full rounded-xl border-gray-200 h-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50/50 transition-all border p-2 text-gray-900 placeholder:text-gray-400",
                                icon ? "pl-10" : "pl-3",
                                rightElement ? "pr-10" : "pr-3",
                                error && "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
                                className
                            )
                        )}
                        ref={ref}
                        {...props}
                    />
                    {rightElement && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {rightElement}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-600 animate-in slide-in-from-top-1 fade-in">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
