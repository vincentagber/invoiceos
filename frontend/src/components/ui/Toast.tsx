'use client';

import React from 'react';
import { CheckCircle2, XCircle, X, Info } from 'lucide-react';
import { clsx } from 'clsx';
import type { Toast as ToastType, ToastType as ToastVariant } from '@/store/toastStore';

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="text-emerald-500" size={20} />,
  error: <XCircle className="text-rose-500" size={20} />,
  info: <Info className="text-indigo-500" size={20} />,
};

const borderMap: Record<ToastVariant, string> = {
  success: 'border-emerald-100 text-emerald-900 shadow-emerald-100/50',
  error: 'border-rose-100 text-rose-900 shadow-rose-100/50',
  info: 'border-indigo-100 text-indigo-900 shadow-indigo-100/50',
};

export function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white animate-in slide-in-from-right-5 fade-in duration-300',
        borderMap[toast.type]
      )}
    >
      {iconMap[toast.type]}
      <span className="text-sm font-semibold flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastType[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
