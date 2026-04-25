'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
    Wallet,
    AlertCircle,
    Plus,
    Activity,
    ArrowUpRight,
    Search,
    Zap,
    Download,
    Calendar,
    ChevronDown,
    Filter,
    ShieldAlert,
    DollarSign,
    Bell,
    Menu,
    ReceiptText,
    LineChart,
    PieChart,
    BarChart3,
    Clock,
    X,
    Smartphone
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
    const [timeRange, setTimeRange] = useState('6m');
    const [currency, setCurrency] = useState('NGN');
    const [showInstallBanner, setShowInstallBanner] = useState(true);
    const { token, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setLoadingStats(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
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
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7C3AED] border-t-transparent"></div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Syncing Intelligence...</p>
                </div>
            </div>
        );
    }

    if (!stats) return <div className="p-10 text-rose-500 font-black uppercase text-xs">System Offline. Check Connection.</div>;

    // Derived values for the 4 specific cards in the image
    const kpiCards = [
        {
            title: 'Total Revenue',
            value: `₦${(stats.metrics.paidAmount / 1000000).toFixed(2)}M`,
            subtext: `From ${stats.recent_invoices.length} payments`,
            icon: Wallet,
            color: 'text-slate-400'
        },
        {
            title: 'Total Expenses',
            value: `₦345.78K`, // Mock for now as we don't have expense aggregation yet
            subtext: `2 expenses logged`,
            icon: ReceiptText,
            color: 'text-slate-400'
        },
        {
            title: 'Net Profit',
            value: `₦${((stats.metrics.paidAmount * 0.85) / 1000000).toFixed(2)}M`,
            subtext: `85.7% margin • 1 paid invoice`,
            icon: LineChart,
            color: 'text-slate-400',
            trend: '85.7% margin'
        },
        {
            title: 'Outstanding',
            value: `₦${(stats.metrics.outstandingAmount / 1000000).toFixed(2)}M`,
            subtext: `2 unpaid • 1 partial`,
            icon: AlertCircle,
            color: 'text-[#7C3AED]',
            iconColor: 'text-[#7C3AED]'
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-32 animate-in fade-in duration-700 font-sans px-4 sm:px-6">
            
            {/* Minimal Top Bar */}
            <div className="flex items-center justify-between h-16 border-b border-slate-100 mb-8">
                <div className="flex items-center gap-4">
                    <Menu className="text-slate-400 sm:hidden" size={20} />
                    <h1 className="text-xl font-heading font-bold text-slate-900 tracking-tight">Dashboard</h1>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <button className="relative text-slate-400 hover:text-slate-900 transition-colors">
                        <Bell size={22} strokeWidth={1.5} />
                        <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>
                    <Link href="/dashboard/invoices/new" className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-[#6D28D9] transition-all active:scale-95">
                        <Plus size={16} strokeWidth={3} />
                        New Invoice
                    </Link>
                </div>
            </div>

            <div className="space-y-10">
                
                {/* Financial Overview Section */}
                <div className="space-y-6">
                    <h2 className="text-lg font-heading font-bold text-slate-900">Financial Overview</h2>
                    
                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Compare</span>
                        </div>
                        
                        <div className="relative flex items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                            <Calendar size={14} className="text-slate-400 mr-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Last 6 Months</span>
                            <ChevronDown size={14} className="text-slate-400 ml-2" />
                        </div>

                        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cur:</span>
                            <div className="flex items-center gap-1 cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">NGN (₦)</span>
                                <ChevronDown size={14} className="text-slate-400" />
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
                            <button className="p-2 rounded-lg bg-[#7C3AED] text-white shadow-sm">
                                <BarChart3 size={16} />
                            </button>
                            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                <PieChart size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="h-[350px] relative">
                        <RevenueChart />
                        
                        {/* Decorative Overlay for premium feel */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Floating Install Banner (PWA Style) */}
            {showInstallBanner && (
                <div className="fixed bottom-8 left-4 right-4 sm:left-auto sm:right-8 sm:w-[450px] z-[60] animate-in slide-in-from-bottom-10 duration-700">
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 p-6 sm:p-8 flex items-center gap-6 relative overflow-hidden group">
                        {/* Ambient glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all" />
                        
                        <div className="h-16 w-16 bg-gradient-to-br from-[#7C3AED] to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
                            <Smartphone size={32} strokeWidth={1.5} />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Install InvoiceOS</h4>
                                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Add to your home screen for instant revenue tracking.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                    Install
                                </button>
                                <button onClick={() => setShowInstallBanner(false)} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                                    Not now
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowInstallBanner(false)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

