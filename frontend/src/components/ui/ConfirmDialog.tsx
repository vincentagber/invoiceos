'use client';

import React from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface ConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const iconMap = {
        danger: <X size={32} className="text-rose-600" />,
        warning: <AlertTriangle size={32} className="text-amber-600" />,
        info: <Info size={32} className="text-indigo-600" />
    };

    const bgMap = {
        danger: 'bg-rose-50',
        warning: 'bg-amber-50',
        info: 'bg-indigo-50'
    };

    const buttonMap = {
        danger: 'bg-rose-600 hover:bg-rose-500 shadow-rose-200',
        warning: 'bg-amber-600 hover:bg-amber-500 shadow-amber-200',
        info: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-10 text-center">
                <div className={clsx("w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm", bgMap[variant])}>
                    {iconMap[variant]}
                </div>

                <h3 className="text-xl font-heading font-black text-slate-900 tracking-tighter uppercase mb-2">
                    {title}
                </h3>

                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={clsx(
                            "flex-1 py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                            buttonMap[variant]
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
