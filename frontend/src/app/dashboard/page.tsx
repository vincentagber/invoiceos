'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/lib/useToast';
import {
  Wallet, TrendingUp, TrendingDown, Users, FileCheck,
  Calendar, Download, Search, Filter, MoreHorizontal, Rocket,
  ArrowRight, DollarSign, Activity, Clock, Star,
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart } from './components/RevenueChart';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';
import { motion } from 'framer-motion';

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
  topClients: Array<{ name: string; total: number; balance: number; avatar?: string }>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const kpiConfig = [
  { label: 'Revenue', icon: DollarSign, color: 'text-primary', bg: 'bg-primary-50', gradient: 'from-primary-500/10 to-transparent', trendColor: 'text-success' },
  { label: 'Expenses', icon: Wallet, color: 'text-danger', bg: 'bg-danger-50', gradient: 'from-danger-500/10 to-transparent', trendColor: 'text-danger' },
  { label: 'Profit', icon: Activity, color: 'text-success', bg: 'bg-success-50', gradient: 'from-success-500/10 to-transparent', trendColor: 'text-success' },
  { label: 'Invoices', icon: FileCheck, color: 'text-accent', bg: 'bg-accent-50', gradient: 'from-accent-500/10 to-transparent', trendColor: 'text-success' },
  { label: 'Clients', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-transparent', trendColor: 'text-success' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { user, token, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const toast = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      const businessId = user?.organizations?.[0]?.id;
      if (!businessId) { setLoadingStats(false); return; }

      const defaultMetrics = { totalInvoiced: 0, paidAmount: 0, outstandingAmount: 0, totalExpenses: 0, totalClients: 0, invoicesSentCount: 0, conversionRate: 0 };

      let metrics = defaultMetrics;
      let topClients: DashboardStats['topClients'] = [];
      let trends: any[] = [];
      let activity: any[] = [];

      try {
        const statsRes = await api.get(`/analytics/summary?businessId=${businessId}`);
        metrics = statsRes.data.metrics || defaultMetrics;
        topClients = (statsRes.data.topClients || []).map((c: any) => ({ ...c, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}` }));
      } catch {}

      try {
        const trendsRes = await api.get(`/analytics/revenue-trends?businessId=${businessId}&timeframe=${timeframe}`);
        trends = trendsRes.data || [];
      } catch {}

      try {
        const invoicesRes = await api.get(`/invoices?businessId=${businessId}&limit=5`);
        activity = invoicesRes.data.data || [];
      } catch {}

      setStats({ metrics, topClients });
      setTrends(trends);
      setRecentActivity(activity);
    } finally { setLoadingStats(false); }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setLoadingStats(false); setStats({ metrics: { totalInvoiced: 0, paidAmount: 0, outstandingAmount: 0, totalExpenses: 0, totalClients: 0, invoicesSentCount: 0, conversionRate: 0 }, topClients: [] }); return; }
    if (user && user.organizations.length === 0) { setLoadingStats(false); return; }
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

  if (authLoading || loadingStats) return <DashboardSkeleton />;
  if (user && user.organizations.length === 0) return <OnboardingState />;
  if (!stats) return null;

  const m = stats.metrics;
  const profit = (m.paidAmount || 0) - (m.totalExpenses || 0);
  const profitMargin = m.paidAmount > 0 ? ((profit / m.paidAmount) * 100).toFixed(1) : '0';

  const kpiValues = [
    { value: `₦${(m.paidAmount || 0).toLocaleString()}`, trend: '+12.5%', up: true },
    { value: `₦${(m.totalExpenses || 0).toLocaleString()}`, trend: '+2.4%', up: false },
    { value: `₦${profit.toLocaleString()}`, trend: `${profitMargin}%`, up: profit >= 0 },
    { value: (m.invoicesSentCount || 0).toString(), trend: '+18%', up: true },
    { value: (m.totalClients || 0).toString(), trend: '+2', up: true },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Welcome back, Vincent</h1>
          <p className="text-sm text-text-secondary mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-text-secondary shadow-sm">
            <Calendar size={14} className="text-text-tertiary" />
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>Export</Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiConfig.map((kpi, i) => {
          const v = kpiValues[i];
          return (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
              <div className={clsx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', kpi.gradient)} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{kpi.label}</span>
                <div className={clsx('h-8 w-8 rounded-lg flex items-center justify-center', kpi.bg, kpi.color)}>
                  <kpi.icon size={16} strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-text-primary">{v.value}</div>
              <div className={clsx('flex items-center gap-1 mt-1.5 text-xs font-semibold', v.up ? 'text-success' : 'text-danger')}>
                {v.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {v.trend} vs last month
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              className="flex-col sm:flex-row items-start sm:items-center"
              action={
                <div className="flex items-center gap-1 p-0.5 bg-surface-secondary rounded-lg border border-border w-full sm:w-auto">
                  {['weekly', 'monthly', 'yearly'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t as any)}
                      className={clsx(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 sm:flex-none',
                        timeframe === t ? 'bg-surface text-text-primary shadow-sm border border-border' : 'text-text-tertiary hover:text-text-secondary',
                      )}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              }
            >
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Growth analytics for your business</CardDescription>
            </CardHeader>
            <div className="h-[320px]">
              <RevenueChart data={trends} />
            </div>
          </Card>
        </div>

        {/* Revenue Goals + Top Clients */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Revenue Goals</CardTitle>
              <CardDescription>Monthly progress</CardDescription>
            </CardHeader>
            <div className="space-y-6 flex-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-tertiary">Monthly Target</span>
                  <span className="text-sm font-semibold text-text-primary">$25,000</span>
                </div>
                <div className="h-2.5 bg-surface-tertiary rounded-full overflow-hidden border border-border/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((m.paidAmount || 0) / 25000) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-text-tertiary text-right">{Math.round(((m.paidAmount || 0) / 25000) * 100)}% Reached</p>
              </div>

              <div className="p-4 bg-surface-secondary rounded-xl border border-border space-y-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <Star size={12} className="text-warning" fill="currentColor" />
                  Top Clients
                </h4>
                <div className="space-y-3">
                  {(stats.topClients || []).slice(0, 3).map((client, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'h-8 w-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs',
                          i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : 'bg-indigo-400',
                        )}>
                          {client.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{client.name}</p>
                          <p className="text-xs text-text-tertiary">${(client.total || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">Active</Badge>
                    </div>
                  ))}
                  {stats.topClients.length === 0 && (
                    <p className="text-sm text-text-tertiary text-center py-4">No client data yet</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <Card>
          <CardHeader
            className="flex-col sm:flex-row items-start sm:items-center"
            action={
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text" placeholder="Search..."
                    className="pl-9 pr-3 py-2 bg-surface-secondary border border-border rounded-xl text-xs text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all w-full sm:w-48"
                  />
                </div>
                <button className="p-2 rounded-xl border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors shrink-0">
                  <Filter size={14} />
                </button>
              </div>
            }
          >
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest ledger entries</CardDescription>
          </CardHeader>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Client</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Invoice</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Date</th>
                  <th className="text-right px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Amount</th>
                  <th className="text-right px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Status</th>
                  <th className="text-right px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-sm text-text-tertiary">No recent activity</td>
                  </tr>
                ) : (
                  recentActivity.map((inv, i) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      key={inv.id}
                      className="hover:bg-surface-secondary transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            'h-8 w-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs',
                            inv.status === 'PAID' ? 'bg-success' : inv.status === 'OVERDUE' ? 'bg-danger' : 'bg-warning',
                          )}>
                            {inv.client?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{inv.client?.name || 'Unknown'}</p>
                            <p className="text-xs text-text-tertiary truncate">{inv.client?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-text-secondary">#{inv.invoice_number || inv.id?.slice(0, 8)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-text-tertiary">
                        {new Date(inv.issue_date || inv.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-text-primary">
                        ${(inv.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'warning'} size="sm">
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-tertiary opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-3"><Skeleton className="h-8 w-64 rounded-lg" /><Skeleton className="h-4 w-48 rounded-lg" /></div>
        <div className="flex gap-3"><Skeleton className="h-9 w-32 rounded-xl" /><Skeleton className="h-9 w-24 rounded-xl" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      <Skeleton className="h-16 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[400px] rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-[400px] rounded-2xl" />
      </div>
      <Skeleton className="h-[300px] rounded-2xl" />
    </div>
  );
}

function OnboardingState() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-20 w-20 rounded-[20px] bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center text-primary border border-primary-100 shadow-sm">
        <Rocket size={40} />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-semibold text-text-primary">Initialization Required</h2>
        <p className="text-sm text-text-secondary">Welcome to InvoiceOS. Establish your business profile to begin financial operations.</p>
      </div>
      <Link href="/dashboard/setup/branding">
        <Button size="lg" rightIcon={<ArrowRight size={16} />}>Initialize Profile</Button>
      </Link>
    </div>
  );
}


