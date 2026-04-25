'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
    Wallet,
    AlertCircle,
    Plus,
    Target,
    Activity,
    ArrowUpRight,
    Search,
    Zap,
    Download,
    Calendar,
    ChevronDown,
    Filter,
    ShieldAlert,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart } from './components/RevenueChart';
import { useAuth } from '@/context/AuthContext';
import { PresenceAvatars } from '@/components/PresenceAvatars';
import clsx from 'clsx';

interface DashboardStats {
    metrics: {
        totalInvoiced: number;
        paidAmount: number;
        outstandingAmount: number;
        conversionRate: number;
    };
    recent_invoices: Array<{
        id: string;
        invoiceNumber: string;
        totalAmount: number;
        status: string;
        client: { name: string };
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const { token, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setLoadingStats(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Get business info first to get the businessId
                const bizRes = await api.get('/business/me');
                const businessId = bizRes.data.id;

                const [statsRes, invoicesRes] = await Promise.all([
                    api.get(`/analytics/summary?businessId=${businessId}`),
                    api.get(`/invoices?businessId=${businessId}`)
                ]);

                setStats({
                    metrics: statsRes.data.metrics,
                    recent_invoices: invoicesRes.data.slice(0, 5)
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchDashboardData();
    }, [authLoading, token]);

    if (authLoading || loadingStats) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-400">Loading Intelligence...</p>
                </div>
            </div>
        );
    }

    if (!stats) return <div className="p-4 text-red-500">System Offline. Check Connection.</div>;

    const mainMetrics = [
        {
            name: 'Net Revenue',
            value: formatCurrency(stats.metrics.paidAmount, 'NGN'),
            change: '+14.2%',
            icon: DollarSign,
            description: 'Total earnings after discounts'
        },
        {
            name: 'Avg. Collection',
            value: '4.2 Days',
            change: '-1.5d',
            icon: Activity,
            description: 'Time from send to settlement'
        },
        {
            name: 'Conversion Rate',
            value: `${stats.metrics.conversionRate.toFixed(1)}%`,
            change: '+2.1%',
            icon: Target,
            description: 'View-to-payment efficiency'
        },
        {
            name: 'Overdue Risk',
            value: formatCurrency(stats.metrics.outstandingAmount, 'NGN'),
            change: '-4.2%',
            icon: ShieldAlert,
            description: 'Outstanding exposure'
        },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 animate-in fade-in duration-700 font-sans">
            
            {/* Header & Date Range Selection */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-10">
                <div className="flex items-center gap-6">
                    <img src="/logo.png" alt="InvoiceOS" className="h-24 w-auto object-contain" />
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Revenue Engine</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-2">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System live • Analytics synced 2m ago</p>
                            </div>
                            <PresenceAvatars />
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                        {['24h', '7d', '30d', '12m'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={clsx(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    timeRange === range 
                                        ? "bg-white text-indigo-600 shadow-lg shadow-slate-200/50 border border-slate-100" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <Link href="/dashboard/invoices/new" className="hidden md:flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">
                        <Plus size={18} />
                        New Engine
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainMetrics.map((metric, i) => (
                    <div key={i} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <metric.icon size={20} />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 tracking-widest">
                                    {metric.change}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{metric.name}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                                    {metric.value}
                                </h3>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">{metric.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Main Trajectory Analysis */}
                <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Revenue Trajectory</h3>
                            <p className="text-xs font-medium text-slate-400 mt-1">Real-time period-over-period comparison</p>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-4 rounded-full bg-indigo-600" />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Current</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-4 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Previous</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <RevenueChart />
                    </div>
                </div>

                {/* AI Pulse Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">AI Pulse</h2>
                    <div className="space-y-4">
                        
                        {/* Insight Card 1 */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={80} />
                            </div>
                            <div className="flex items-center gap-3">
                                <Zap size={20} className="text-amber-400" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Recovery Opportunity</h3>
                            </div>
                            <p className="text-sm font-medium text-slate-300">
                                3 high-value invoices are overdue. Sending smart reminders now could recover <span className="text-amber-400 font-bold">₦{formatCurrency(12450, 'NGN').replace('₦', '')}</span> this week.
                            </p>
                            <button className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-amber-400/20">
                                Recover Revenue
                            </button>
                        </div>

                        {/* Insight Card 2 */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 space-y-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Activity size={20} className="text-indigo-600" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Behavior</h3>
                            </div>
                            <div className="space-y-4">
                                {(stats.recent_invoices || []).slice(0, 2).map((inv, i) => (
                                     <div key={i} className="flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                             <div>
                                                 <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{inv.client?.name} viewed</p>
                                                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{inv.invoiceNumber}</p>
                                             </div>
                                         </div>
                                         <span className="text-[10px] font-bold text-slate-400 uppercase">Just now</span>
                                     </div>
                                 ))}
                            </div>
                        </div>

                        {/* Insight Card 3 */}
                        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white space-y-4 shadow-xl">
                            <div className="flex items-center gap-3">
                                <ArrowUpRight size={20} className="text-indigo-200" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Optimization</h3>
                            </div>
                            <p className="text-xs font-medium text-indigo-100 leading-relaxed">
                                Client "Acme Corp" has a 100% pay rate on Tuesdays. Scheduling future invoices for Tuesday morning could speed up cash flow.
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom: Recent Activity */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Recent Revenue Flows</h2>
                    <Link href="/dashboard/invoices" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-500 transition-colors">
                        View All Activity
                    </Link>
                </div>
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                        {(stats.recent_invoices || []).slice(0, 4).map((inv) => (
                            <div key={inv.invoiceNumber} className="p-10 hover:bg-slate-50 transition-all group relative">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <span className={clsx(
                                            "inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        )}>
                                            {inv.status}
                                        </span>
                                        <p className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(inv.totalAmount, 'NGN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{inv.client?.name}</p>
                                        <p className="text-base font-black text-slate-900 tracking-tighter mt-1">{inv.invoiceNumber}</p>
                                    </div>
                                    <Link href={`/dashboard/invoices/${inv.id}`} className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                        Analyze Flow
                                        <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
