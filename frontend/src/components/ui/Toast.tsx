'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error';

export interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className={clsx(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300",
            type === 'success' ? "bg-white border-green-100 text-green-900 shadow-green-100/50" : "bg-white border-red-100 text-red-900 shadow-red-100/50"
        )}>
            {type === 'success' ? <CheckCircle2 className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
                <X size={16} />
            </button>
        </div>
    );
}
