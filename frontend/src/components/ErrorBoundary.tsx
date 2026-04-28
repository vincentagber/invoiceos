'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.1)] border border-slate-200 p-10 text-center">
            <div className="h-20 w-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mx-auto mb-8">
              <AlertCircle size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-4">System Interruption</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">
              We encountered a synchronization error. The ledger remains safe, but the current view needs to be refreshed.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#0b1c30] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/10 hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw size={14} strokeWidth={3} />
              Re-synchronize Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
