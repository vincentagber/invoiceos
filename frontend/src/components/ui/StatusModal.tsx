'use client';

import React from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: ModalType;
    actionLabel?: string;
}

export function StatusModal({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'success',
    actionLabel = 'Acknowledge'
}: StatusModalProps) {
    if (!isOpen) return null;

    const icons = {
        success: <Check size={32} className="text-emerald-600" />,
        error: <X size={32} className="text-rose-600" />,
        warning: <AlertCircle size={32} className="text-amber-600" />,
        info: <Info size={32} className="text-indigo-600" />
    };

    const bgColors = {
        success: 'bg-emerald-50',
        error: 'bg-rose-50',
        warning: 'bg-amber-50',
        info: 'bg-indigo-50'
    };

    const buttonColors = {
        success: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200',
        error: 'bg-rose-600 hover:bg-rose-500 shadow-rose-200',
        warning: 'bg-amber-600 hover:bg-amber-500 shadow-amber-200',
        info: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 p-6 sm:p-10 text-center">
                <div className={clsx("w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm", bgColors[type])}>
                    {icons[type]}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                    {title}
                </h3>
                
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
                    {message}
                </p>

                <button 
                    onClick={onClose}
                    className={clsx(
                        "w-full py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl",
                        buttonColors[type]
                    )}
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
