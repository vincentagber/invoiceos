'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    Wallet,
    AlertCircle,
    Plus,
    Calendar,
    ChevronDown,
    ReceiptText,
    LineChart,
    PieChart,
    BarChart3,
    X,
    Smartphone,
    Menu,
    Rocket,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Building2,
    SlidersHorizontal,
    TrendingUp,
    TrendingDown,
    FileCheck,
    Users,
    ArrowUpRight,
    Search,
    MoreHorizontal,
    Filter,
    Download
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart } from './components/RevenueChart';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Skeleton } from '@/components/ui/skeleton';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardStats {
    metrics: {
        totalInvoiced: number;
        paidAmount: number;
        outstandingAmount: number;
        totalExpenses: number;
        totalClients: number;
        invoicesSentCount: number;
        conversionRate: number;
        growth?: number;
    };
    topClients: Array<{
        name: string;
        total: number;
        balance: number;
        avatar?: string;
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const { user, token, loading: authLoading } = useAuth();
    const { socket } = useSocket();

    const fetchDashboardData = async () => {
        try {
            setLoadingStats(true);
            const businessId = user?.organizations?.[0]?.id;
            if (!businessId) {
                setLoadingStats(false);
                return;
            }

            const [statsRes, trendsRes, invoicesRes] = await Promise.all([
                api.get(`/analytics/summary?businessId=${businessId}`),
                api.get(`/analytics/revenue-trends?businessId=${businessId}&timeframe=${timeframe}`),
                api.get(`/invoices?businessId=${businessId}&limit=5`)
            ]);

            setStats({
                metrics: statsRes.data.metrics || {
                    totalInvoiced: 0,
                    paidAmount: 0,
                    outstandingAmount: 0,
                    totalExpenses: 0,
                    totalClients: 0,
                    invoicesSentCount: 0,
                    conversionRate: 0
                },
                topClients: (statsRes.data.topClients || []).map((c: any) => ({
                    ...c,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`
                }))
            });

            setTrends(trendsRes.data || []);
            setRecentActivity(invoicesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setLoadingStats(false);
            return;
        }
        if (user && user.organizations.length === 0) {
            setLoadingStats(false);
            return;
        }
        fetchDashboardData();
    }, [authLoading, token, user, timeframe]);

    useEffect(() => {
        if (!socket) return;
        const handleLiveUpdate = () => fetchDashboardData();
        socket.on('invoice-status-updated', handleLiveUpdate);
        socket.on('payment-received', handleLiveUpdate);
        socket.on('invoice-created', handleLiveUpdate);
        return () => {
            socket.off('invoice-status-updated', handleLiveUpdate);
            socket.off('payment-received', handleLiveUpdate);
            socket.off('invoice-created', handleLiveUpdate);
        };
    }, [socket]);

    if (authLoading || loadingStats) {
        return <DashboardSkeleton />;
    }

    if (user && user.organizations.length === 0) {
        return <OnboardingState />;
    }

    if (!stats) return <ErrorState onRetry={() => fetchDashboardData()} />;

    const kpiMetrics = [
        { label: 'Total Revenue', value: `$${(stats.metrics.paidAmount || 0).toLocaleString()}`, trend: '+12.5%', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Total Expenses', value: `$${(stats.metrics.totalExpenses || 0).toLocaleString()}`, trend: '-2.4%', icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Invoices Sent', value: (stats.metrics.invoicesSentCount || 0).toString(), trend: '+18%', icon: FileCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Unpaid Invoices', value: `$${(stats.metrics.outstandingAmount || 0).toLocaleString()}`, trend: '+4%', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Total Clients', value: (stats.metrics.totalClients || 0).toString(), trend: '+2', icon: Users, color: 'text-sky-500', bg: 'bg-sky-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user.name}</h1>
                    <p className="text-sm font-medium text-slate-500">Monitor and control what happens with your money today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpiMetrics.map((kpi, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={clsx("p-2.5 rounded-xl transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
                                <kpi.icon size={20} />
                            </div>
                            <div className={clsx("flex items-center gap-1 text-[10px] font-black uppercase tracking-tight", kpi.trend.startsWith('+') ? "text-emerald-600" : "text-rose-500")}>
                                {kpi.trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {kpi.trend}
                            </div>
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Analytics & Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Overview Chart */}
                <div className="lg:col-span-8 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Overview</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Growth Analytics</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                            {['weekly', 'monthly', 'yearly'].map((t) => (
                                <button 
                                    key={t}
                                    onClick={() => setTimeframe(t as any)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        timeframe === t ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[340px]">
                        <RevenueChart data={trends} />
                    </div>
                </div>

                {/* Performance & Goals */}
                <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Goals</h3>
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    
                    <div className="space-y-8 flex-1">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Target</span>
                                <span className="text-sm font-black text-slate-900">$25,000</span>
                            </div>
                            <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((stats.metrics.paidAmount || 0) / 25000) * 100, 100)}%` }}
                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]" 
                                />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 text-right">
                                {Math.round(((stats.metrics.paidAmount || 0) / 25000) * 100)}% Reached
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Clients</h4>
                            <div className="space-y-4">
                                {(stats.topClients || []).map((client, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <img src={client.avatar} alt="" className="h-8 w-8 rounded-xl bg-white border border-slate-200" />
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 tracking-tight">{client.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Total: ${(client.total || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-emerald-600">Active</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors mt-2">
                                View All Clients
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Latest Ledger Entries</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search activity..." 
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all w-64"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-slate-50">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Client Name</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Invoice ID</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Date</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 text-right">Amount</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 text-right">Status</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentActivity.map((inv, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={inv.id} 
                                    className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                >
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-[10px]">
                                                {inv.client?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-black text-slate-900 truncate">{inv.client?.name || 'Unknown Client'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 truncate">{inv.client?.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <span className="text-[12px] font-bold text-slate-500">#{inv.invoice_number || inv.id.slice(0, 8)}</span>
                                    </td>
                                    <td className="py-5 px-4">
                                        <span className="text-[12px] font-bold text-slate-400">
                                            {new Date(inv.issue_date || inv.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <span className="text-[13px] font-black text-slate-900">${(inv.total_amount || 0).toLocaleString()}</span>
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <span className={clsx(
                                            "inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            inv.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            inv.status === 'OVERDUE' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32 rounded-2xl" />
                    <Skeleton className="h-10 w-28 rounded-2xl" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-[24px]" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Skeleton className="lg:col-span-8 h-[450px] rounded-[32px]" />
                <Skeleton className="lg:col-span-4 h-[450px] rounded-[32px]" />
            </div>
            <Skeleton className="h-[400px] rounded-[32px]" />
        </div>
    );
}

function OnboardingState() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 p-10 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="h-24 w-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-600 mb-4">
                <Rocket size={48} />
            </div>
            <div className="space-y-3 max-w-lg">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Initialization Required</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    Welcome to InvoiceOS. Establish your professional identity to begin financial operations.
                </p>
            </div>
            <Link 
                href="/dashboard/setup/branding" 
                className="group flex items-center gap-6 px-12 py-6 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-emerald-600 transition-all duration-500 active:scale-[0.98]"
            >
                <span>Initialize Profile</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
                <AlertCircle size={40} />
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">System Desync Detected</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    We're having trouble reaching the institutional ledger. This usually happens during network shifts or organization updates.
                </p>
            </div>
            <button 
                onClick={onRetry}
                className="group flex items-center gap-4 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-rose-600 transition-all active:scale-95 mx-auto"
            >
                <span>Retry Connection</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
