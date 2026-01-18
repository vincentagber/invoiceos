'use client';

import React, { useState, forwardRef } from 'react';
import { Input, InputProps } from './Input';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightElement'> { }

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    (props, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <Input
                type={showPassword ? 'text' : 'password'}
                icon={<Lock size={18} />}
                rightElement={
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                }
                ref={ref}
                {...props}
            />
        );
    }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
