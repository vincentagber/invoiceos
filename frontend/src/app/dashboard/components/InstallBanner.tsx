'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import clsx from 'clsx';

export function InstallBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show after a small delay for better UX
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-4 flex items-center gap-4 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-colors" />
                
                <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <div className="relative">
                        <Smartphone size={24} />
                        <div className="absolute -right-1 -top-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full" />
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900">Install Superlink</h3>
                    <p className="text-xs text-slate-500 truncate">Add to your home screen for quick access</p>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-md shadow-indigo-100 transition-all active:scale-95"
                    >
                        Install
                    </button>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
