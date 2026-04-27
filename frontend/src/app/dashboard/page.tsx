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
    ShieldCheck
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
    const [showInstallBanner, setShowInstallBanner] = useState(true);
    const { user, token, loading: authLoading } = useAuth();
    const { socket } = useSocket();

    const fetchDashboardData = async () => {
        try {
            const bizRes = await api.get('/business/me');
            const businessId = bizRes.data.id;

            const [statsRes, invoicesRes] = await Promise.all([
                api.get(`/analytics/summary?businessId=${businessId}`),
                api.get(`/invoices?businessId=${businessId}`)
            ]);

            setStats({
                metrics: statsRes.data.metrics || { totalInvoiced: 0, paidAmount: 0, outstandingAmount: 0, conversionRate: 0 },
                recent_invoices: invoicesRes.data.slice(0, 5) || []
            });
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
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl relative">
                    {/* Architectural Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className="relative bg-white/[0.7] backdrop-blur-2xl rounded-[3rem] border border-white p-12 sm:p-16 text-center space-y-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                        {/* Subtle Top Accent */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        
                        <div className="space-y-8 relative">
                            {/* Animated Icon Cluster */}
                            <div className="relative mx-auto w-32 h-32">
                                <div className="absolute inset-0 bg-indigo-600/10 rounded-[2.5rem] animate-pulse" />
                                <div className="relative h-full w-full bg-white rounded-[2.5rem] shadow-[0_12px_24px_-8px_rgba(79,70,229,0.15)] border border-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Rocket size={48} strokeWidth={1.5} className="animate-bounce-subtle" />
                                </div>
                                <div className="absolute -top-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white animate-in zoom-in duration-500 delay-300">
                                    <Sparkles size={18} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50">
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Onboarding Sequence 01</span>
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-[-0.04em] leading-[0.95]">
                                    Initialize Your <br />
                                    <span className="text-indigo-600">Workspace</span>
                                </h2>
                                <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                                    Welcome to the command center. To begin generating revenue and tracking financial intelligence, establish your business profile.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Link 
                                    href="/dashboard/settings" 
                                    className="group relative inline-flex items-center gap-4 px-10 py-5 bg-[#5E6AD2] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] hover:bg-[#4E5AC2] hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] lustre"
                                >
                                    <span>Setup Business Profile</span>
                                    <ArrowRight size={16} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                
                                <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheck size={12} className="text-indigo-500" />
                                    Secure Enterprise Environment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return (
        <div className="max-w-xl mx-auto py-20 text-center space-y-6">
            <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Offline</h3>
                <p className="text-xs text-slate-500 font-medium">We encountered a synchronization error with the ledger. Please check your network connection or verify your organization settings.</p>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
                Retry Synchronization
            </button>
        </div>
    );

    const kpiCards = [
        {
            title: 'Total Revenue',
            value: `₦${(stats.metrics.paidAmount / 1000).toFixed(1)}K`,
            subtext: `From ${stats.recent_invoices.length} payments`,
            icon: Wallet,
            color: 'text-slate-400'
        },
        {
            title: 'Total Expenses',
            value: `₦0.00`,
            subtext: `0 expenses logged`,
            icon: ReceiptText,
            color: 'text-slate-400'
        },
        {
            title: 'Net Profit',
            value: `₦${(stats.metrics.paidAmount / 1000).toFixed(1)}K`,
            subtext: `100% margin`,
            icon: LineChart,
            color: 'text-slate-400',
            trend: '100% margin'
        },
        {
            title: 'Outstanding',
            value: `₦${(stats.metrics.outstandingAmount / 1000).toFixed(1)}K`,
            subtext: `${stats.recent_invoices.filter(i => i.status !== 'PAID').length} unpaid`,
            icon: AlertCircle,
            color: 'text-indigo-600',
            iconColor: 'text-indigo-600'
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-32 animate-in fade-in duration-700 font-sans">
            
            <div className="space-y-10">
                
                {/* Financial Overview Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-heading font-bold text-slate-900">Financial Overview</h2>
                        
                        {/* Filters Row */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                                <Calendar size={14} className="text-slate-400 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Last 6 Months</span>
                                <ChevronDown size={14} className="text-slate-400 ml-2" />
                            </div>
                        </div>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpiCards.map((card, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 relative group">
                                <div className="absolute top-6 right-6">
                                    <card.icon size={20} className={card.iconColor || "text-slate-300"} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-heading font-bold text-slate-900 tracking-tighter">
                                            {card.value}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {card.trend && (
                                                <span className="text-[10px] font-bold text-emerald-500">{card.trend}</span>
                                            )}
                                            <p className="text-[10px] font-medium text-slate-400">{card.subtext}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cash Flow Section */}
                <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-heading font-bold text-slate-900">Cash Flow</h3>
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
                                <BarChart3 size={16} />
                            </button>
                            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                <PieChart size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="h-[350px] relative">
                        <RevenueChart />
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-lg font-heading font-bold text-slate-900">Recent Invoices</h3>
                        <Link href="/dashboard/invoices" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.recent_invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-900">{invoice.invoiceNumber}</td>
                                        <td className="px-8 py-5 text-sm text-slate-600">{invoice.client?.name || 'Unknown Client'}</td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-900">₦{(invoice.totalAmount || 0).toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                invoice.status === 'PAID' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
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

            {/* PWA Banner */}
            {showInstallBanner && (
                <div className="fixed bottom-8 right-8 w-[400px] z-[60] animate-in slide-in-from-bottom-10">
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 p-6 flex items-center gap-6 relative group">
                        <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
                            <Smartphone size={28} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase">Install InvoiceOS</h4>
                            <p className="text-[10px] text-slate-400 mt-1">Access your dashboard instantly from your home screen.</p>
                            <div className="flex items-center gap-2 mt-4">
                                <button className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl">Install</button>
                                <button onClick={() => setShowInstallBanner(false)} className="px-4 text-[10px] font-black uppercase text-slate-400">Dismiss</button>
                            </div>
                        </div>
                        <button onClick={() => setShowInstallBanner(false)} className="absolute top-4 right-4 text-slate-300 hover:text-slate-900">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
