'use client';

import React from 'react';
import { useToastStore } from '@/store/toastStore';
import { ToastContainer } from '@/components/ui/Toast';

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return <ToastContainer toasts={toasts} onDismiss={removeToast} />;
}
