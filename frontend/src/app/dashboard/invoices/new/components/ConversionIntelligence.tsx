'use client';

import React from 'react';
import { Target, TrendingUp, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface ConversionIntelligenceProps {
    total: number;
    clientName?: string;
    dueDate?: string;
}

export const ConversionIntelligence = ({ total, clientName, dueDate }: ConversionIntelligenceProps) => {
    // Mock intelligence logic
    const score = (() => {
        let s = 75;
        if (total > 5000) s -= 10;
        if (dueDate && !isNaN(new Date(dueDate).getTime())) {
            const days = (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            if (days < 7) s -= 15;
            if (days > 14) s += 5;
        }
        return Math.min(Math.max(s, 0), 100);
    })();

    const getScoreColor = () => {
        if (score > 80) return 'text-emerald-500';
        if (score > 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getScoreBg = () => {
        if (score > 80) return 'bg-emerald-500';
        if (score > 50) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target size={18} className="text-indigo-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Conversion Score</h3>
                </div>
                <span className={clsx("text-2xl font-black", getScoreColor())}>{score}%</span>
            </div>

            {/* Score Progress Bar */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                    className={clsx("h-full transition-all duration-1000 ease-out", getScoreBg())} 
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-white/90">Professional Layout</p>
                        <p className="text-[10px] text-white/50">Your template follows high-conversion design patterns.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className={clsx("mt-1 h-2 w-2 rounded-full shrink-0", total > 5000 ? "bg-amber-400" : "bg-emerald-400")} />
                    <div>
                        <p className="text-xs font-bold text-white/90">Amount Strategy</p>
                        <p className="text-[10px] text-white/50">
                            {total > 5000 ? "High value detected. Consider split payments to increase conversion." : "Optimal amount for one-time payment."}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Clock size={14} className="text-indigo-400 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-white/90">Best Time to Send</p>
                        <p className="text-[10px] text-white/50">Tomorrow at 9:00 AM (Highest open rate for {clientName || 'this client'}).</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                    <TrendingUp size={14} />
                    Optimize for Cash Flow
                </button>
            </div>
        </div>
    );
};
