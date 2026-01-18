'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
    CreditCard,
    Users,
    FileText,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart } from './components/RevenueChart';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
    total_clients: number;
    total_invoices: number;
    total_revenue: number;
    total_outstanding: number;
    recent_invoices: Array<{
        invoice_number: string;
        total: number;
        status: string;
        client_name: string;
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const { token, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return; // wait for AuthProvider to finish loading token
        if (!token) {
            setLoadingStats(false);
            return; // not logged in – nothing to fetch
        }

        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats.php');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [authLoading, token]);

    if (authLoading || loadingStats) return <div className="p-4">Loading…</div>;
    if (!stats) return <div className="p-4 text-red-500">Failed to load dashboard data.</div>;

    const cards = [
        {
            name: 'Total Revenue',
            value: formatCurrency(stats.total_revenue),
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            name: 'Outstanding',
            value: formatCurrency(stats.total_outstanding),
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
        },
        {
            name: 'Total Invoices',
            value: stats.total_invoices,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            name: 'Total Clients',
            value: stats.total_clients,
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.name} className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
                                    <Icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.name}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <div className="lg:col-span-1">
                    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 h-full">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold leading-6 text-gray-900">Recent Invoices</h2>
                            <Link href="/dashboard/invoices" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                View all
                            </Link>
                        </div>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {stats.recent_invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No invoices found.</td>
                                        </tr>
                                    ) : (
                                        stats.recent_invoices.map((inv) => (
                                            <tr key={inv.invoice_number} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoice_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.client_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(inv.total)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : inv.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}> {inv.status} </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile List View */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {stats.recent_invoices.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No invoices found.</div>
                            ) : (
                                stats.recent_invoices.map((inv) => (
                                    <div key={inv.invoice_number} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-indigo-600 truncate">{inv.invoice_number}</p>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : inv.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{inv.status}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 truncate">{inv.client_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
