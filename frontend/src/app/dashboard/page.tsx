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
    Building2
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart } from './components/RevenueChart';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import clsx from 'clsx';

interface DashboardStats {
    metrics: {
        totalInvoiced: number;
        paidAmount: number;
        outstandingAmount: number;
        conversionRate: number;
        totalExpenses: number;
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
    const [trends, setTrends] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const { user, token, loading: authLoading } = useAuth();
    const { socket } = useSocket();

    const fetchDashboardData = async () => {
        try {
            const bizRes = await api.get('/business/me');
            const businessId = bizRes.data.id;

            const [statsRes, invoicesRes, trendsRes] = await Promise.all([
                api.get(`/analytics/summary?businessId=${businessId}`),
                api.get(`/invoices?businessId=${businessId}`),
                api.get(`/analytics/revenue-trends?businessId=${businessId}`)
            ]);

            const recentInvoices = Array.isArray(invoicesRes.data) 
                ? invoicesRes.data.slice(0, 5) 
                : (invoicesRes.data?.invoices?.slice(0, 5) || []);

            setStats({
                metrics: statsRes.data.metrics || { totalInvoiced: 0, paidAmount: 0, outstandingAmount: 0, conversionRate: 0, totalExpenses: 0 },
                recent_invoices: recentInvoices
            });
            setTrends(trendsRes.data || []);
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

        // If user is logged in but has no organization, we can't fetch data
        if (user && user.organizations.length === 0) {
            setLoadingStats(false);
            return;
        }

        fetchDashboardData();
    }, [authLoading, token, user]);

    useEffect(() => {
        if (!socket) return;

        const handleLiveUpdate = () => {
            console.log('Live update received, refreshing dashboard...');
            fetchDashboardData();
        };

        socket.on('invoice-status-updated', handleLiveUpdate);
        socket.on('invoice-viewed', handleLiveUpdate);
        socket.on('payment-received', handleLiveUpdate);
        socket.on('invoice-sent', handleLiveUpdate);

        return () => {
            socket.off('invoice-status-updated', handleLiveUpdate);
            socket.off('invoice-viewed', handleLiveUpdate);
            socket.off('payment-received', handleLiveUpdate);
            socket.off('invoice-sent', handleLiveUpdate);
        };
    }, [socket]);

    if (authLoading || loadingStats) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Syncing Intelligence...</p>
                </div>
            </div>
        );
    }

    if (user && user.organizations.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                    
                    {/* Minimalist State Header */}
                    <div className="space-y-6 text-center">
                        <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-slate-900 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            System Ready
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-[-0.05em] leading-[0.9]">
                                Workspace <br />
                                <span className="text-slate-300">Initialization</span>
                            </h2>
                            <p className="text-slate-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
                                Establish your professional identity. Your business profile serves as the core intelligence layer for all financial operations.
                            </p>
                        </div>
                    </div>

                    {/* Elite Setup Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {[
                            { title: 'Identity', desc: 'Legal entity name & brand assets', icon: Building2 },
                            { title: 'Compliance', desc: 'Tax identifiers & regional settings', icon: ShieldCheck },
                            { title: 'Financials', desc: 'Currency defaults & bank bridges', icon: Wallet },
                        ].map((step, i) => (
                            <div key={i} className="bg-white border border-slate-200 p-8 space-y-4 hover:bg-slate-50 transition-colors duration-300 first:rounded-l-[2rem] last:rounded-r-[2rem]">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    <step.icon size={20} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{step.title}</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-normal">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Layer */}
                    <div className="flex flex-col items-center gap-6 pt-4">
                        <Link 
                            href="/dashboard/setup/branding" 
                            className="group relative flex items-center gap-6 px-12 py-6 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] hover:bg-indigo-600 transition-all duration-500 active:scale-[0.98]"
                        >
                            <span>Initialize Profile</span>
                            <div className="w-8 h-px bg-white/20 group-hover:w-12 transition-all duration-500" />
                            <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ready for Scale</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return (
        <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center relative border border-rose-100 shadow-sm">
                    <AlertCircle size={40} strokeWidth={1.5} />
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ledger Synchronization Paused</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    We're having trouble reaching the institutional ledger. This usually happens during network shifts or organization updates.
                </p>
            </div>
            <div className="flex flex-col items-center gap-4 pt-4">
                <button 
                    onClick={() => window.location.reload()}
                    className="group relative flex items-center gap-4 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
                >
                    <span>Retry Sync</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link href="/dashboard/settings" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    Verify Organization Settings
                </Link>
            </div>
        </div>
    );

    const kpiCards = [
        {
            title: 'Total Revenue',
            value: `₦${(((stats?.metrics?.paidAmount || 0)) / 1000).toFixed(1)}K`,
            subtext: `From ${stats?.recent_invoices?.length || 0} payments`,
            trend: '+12.5%',
            icon: Wallet,
            iconColor: 'text-slate-900'
        },
        {
            title: 'Total Expenses',
            value: `₦${(stats?.metrics?.totalExpenses || 0).toLocaleString()}`,
            subtext: `${(stats?.metrics?.totalExpenses || 0) > 0 ? 'Expenditure tracked' : 'No expenses logged'}`,
            trend: '-2.4%',
            icon: ReceiptText,
            iconColor: 'text-slate-900'
        },
        {
            title: 'Net Profit',
            value: `₦${(((stats?.metrics?.paidAmount || 0) - (stats?.metrics?.totalExpenses || 0)) / 1000).toFixed(1)}K`,
            subtext: `Real-time yield`,
            trend: '+8.2%',
            icon: LineChart,
            iconColor: 'text-slate-900',
        },
        {
            title: 'Outstanding',
            value: `₦${((stats?.metrics?.outstandingAmount || 0) / 1000).toFixed(1)}K`,
            subtext: `${stats?.recent_invoices?.filter(i => i.status !== 'PAID').length || 0} unpaid`,
            trend: 'Stable',
            icon: AlertCircle,
            iconColor: 'text-indigo-600'
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-32 animate-in fade-in duration-1000 font-sans">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dce9ff] text-[#000000] text-[10px] font-black tracking-[0.2em] uppercase mb-4">
                        Financial Intelligence
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Financial Overview</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Monitoring business health and cash flow dynamics.</p>
                </div>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-slate-50 rounded-lg shadow-sm border border-slate-200/50">Last 6 Months</button>
                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">This Year</button>
                    <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">All Time</button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] relative overflow-hidden group hover:border-slate-300 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <p className="text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">{card.title}</p>
                            <div className={clsx("p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform duration-500", card.iconColor)}>
                                <card.icon size={18} strokeWidth={2} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                                {card.value}
                            </h3>
                            <div className="flex items-center gap-2">
                                {card.trend && (
                                    <span className="text-[9px] font-black text-[#006c49] bg-[#006c49]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{card.trend}</span>
                                )}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.subtext}</p>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 group-hover:bg-indigo-50 transition-colors"></div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-10 space-y-10 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Cash Flow Intelligence</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Revenue vs Expenses (Jan - Jun)</p>
                    </div>
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200/50 flex items-center gap-2">
                            <BarChart3 size={14} />
                            Line Chart
                        </button>
                        <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
                            <PieChart size={14} />
                            Bar Chart
                        </button>
                    </div>
                </div>
                <div className="h-[400px] relative">
                    <RevenueChart data={trends} />
                    {/* Institutional Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-l border-b border-slate-100/50 opacity-50"></div>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-8 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-sm bg-[#0b1c30] shadow-sm"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue Stream</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-sm bg-[#cbd5e1] shadow-sm"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expense Log</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden group">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Ledger Activity</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Latest verified transactions and invoice flows.</p>
                    </div>
                    <Link href="/dashboard/invoices" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-100 transition-all border border-slate-200/50">
                        View All
                        <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tracking ID</th>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Counterparty</th>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Net Amount</th>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fulfillment Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.recent_invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50/30 transition-colors group/row">
                                    <td className="px-10 py-6">
                                        <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="text-sm font-black text-indigo-600 tracking-tighter hover:text-indigo-700 transition-colors uppercase">
                                            {invoice.invoiceNumber}
                                        </Link>
                                    </td>
                                    <td className="px-10 py-6 text-[13px] font-bold text-slate-900">{invoice.client?.name || 'Unknown Partner'}</td>
                                    <td className="px-10 py-6 text-sm font-black text-slate-900 tracking-tight">₦{(invoice.totalAmount || 0).toLocaleString()}</td>
                                    <td className="px-10 py-6">
                                        <span className={clsx(
                                            "inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border",
                                            invoice.status === 'PAID' 
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                                : "bg-amber-50 text-amber-700 border-amber-100"
                                        )}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
