'use client';

import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Clock, ShieldCheck, AlertTriangle, Sparkles, Loader } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

interface Insight {
    title: string;
    description: string;
    type: 'positive' | 'warning' | 'neutral';
}

interface ConversionIntelligenceProps {
    total: number;
    clientName?: string;
    dueDate?: string;
    items?: any[];
    notes?: string;
}

export const ConversionIntelligence = ({ total, clientName, dueDate, items, notes }: ConversionIntelligenceProps) => {
    const [loading, setLoading] = useState(false);
    const [aiResult, setAiResult] = useState<{ score: number, insights: Insight[], recommendation: string } | null>(null);

    const analyze = async () => {
        if (!clientName) return;
        setLoading(true);
        try {
            const res = await api.post('/ai/analyze', {
                total,
                clientName,
                dueDate,
                items,
                notes
            });
            setAiResult(res.data);
        } catch (error) {
            console.error("AI Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-analyze once client is selected and some items exist
    useEffect(() => {
        if (clientName && items && items.length > 0 && !aiResult) {
            analyze();
        }
    }, [clientName]);

    const score = aiResult?.score || 75;

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
        <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-2xl border border-white/10 relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-400" />
                    <h3 className="text-sm font-heading font-black uppercase tracking-widest">Revenue Intelligence</h3>
                </div>
                <div className="flex flex-col items-end">
                    <span className={clsx("text-2xl font-heading font-black tracking-tighter", getScoreColor())}>{score}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">Conv. Score</span>
                </div>
            </div>

            {/* Score Progress Bar */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
                <div 
                    className={clsx("h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]", getScoreBg())} 
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="space-y-5 relative z-10">
                {aiResult ? aiResult.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                        {insight.type === 'positive' && <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                        {insight.type === 'warning' && <div className="mt-1 h-2 w-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                        {insight.type === 'neutral' && <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-white/90 leading-tight">{insight.title}</p>
                            <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">{insight.description}</p>
                        </div>
                    </div>
                )) : (
                    <div className="space-y-4 py-2 opacity-50">
                        <div className="h-2 w-3/4 bg-white/10 rounded-full animate-pulse" />
                        <div className="h-2 w-1/2 bg-white/10 rounded-full animate-pulse" />
                        <div className="h-2 w-2/3 bg-white/10 rounded-full animate-pulse" />
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5 relative z-10">
                <button 
                    onClick={analyze}
                    disabled={loading || !clientName}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                >
                    {loading ? <Loader size={14} className="animate-spin" /> : <TrendingUp size={14} className="group-hover/btn:translate-y-[-2px] transition-transform" />}
                    {loading ? "Analyzing Strategy..." : "Optimize Strategy"}
                </button>
            </div>

            {aiResult?.recommendation && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mt-2 animate-in zoom-in-95 duration-500">
                    <div className="flex gap-2 items-center mb-1">
                        <Target size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Rec</span>
                    </div>
                    <p className="text-[10px] text-emerald-100/80 leading-relaxed italic">
                        "{aiResult.recommendation}"
                    </p>
                </div>
            )}
        </div>
    );
};
