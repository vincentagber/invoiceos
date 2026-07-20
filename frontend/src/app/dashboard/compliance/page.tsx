'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/useToast';
import api from '@/lib/api';
import {
  AlertCircle, Calendar, CheckCircle, XCircle, Globe, Wifi, WifiOff,
  RefreshCw, Building2, ArrowRight, Clock, AlertTriangle, Shield,
  ChevronRight, ExternalLink, FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// ─── Types matching actual backend API responses ──────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface BackendComplianceStatus {
  countryCode: string;
  countryName: string;
  currency: string;
  governingBody: string;
  complianceScore: number;
  taxReadinessScore: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  missingRequirements: string[];
  deadlines: Array<{
    name: string;
    frequency: string;
    dateDescription: string;
    governingBody: string;
  }>;
  invoicingRules: {
    formatPrefix: string;
    qrRequired: boolean;
    electronicSignatureRequired: boolean;
    portalName: string;
  };
  taxRules: {
    vatRate: number;
    whtRate: number;
    devLevyRate?: number;
    corporateTaxRate: number;
  };
  metrics: {
    hasTaxNumber: boolean;
    hasAddress: boolean;
    hasEmail: boolean;
    totalInvoicesCount: number;
  };
}

interface BackendDeadline {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  dueDay: number | null;
  dueMonth: number | null;
  dueDescription: string;
  governingBody: string;
  formName: string | null;
  penaltyLate: number | null;
  penaltyRate: number | null;
  isActive: boolean;
}

interface BackendConnector {
  id: string;
  name: string;
  provider: string;
  type: string;
  baseUrl: string | null;
  apiVersion: string | null;
  authType: string | null;
  isAvailable: boolean;
  isMandatory: boolean;
  documentationUrl: string | null;
  statusUrl: string | null;
  isActive: boolean;
}

// ─── Derived frontend types ───────────────────────────────────

interface DeadlineDisplay {
  id: string;
  name: string;
  dateDescription: string;
  governingBody: string;
  frequency: string;
  formName: string | null;
  status: 'overdue' | 'due_soon' | 'upcoming' | 'completed';
}

interface ConnectorDisplay {
  id: string;
  name: string;
  provider: string;
  type: string;
  status: 'online' | 'offline' | 'degraded';
  isMandatory: boolean;
  baseUrl: string | null;
}

function toDeadlineDisplay(d: BackendDeadline): DeadlineDisplay {
  let status: DeadlineDisplay['status'] = 'upcoming';
  if (d.dueDay) {
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), d.dueDay);
    if (d.dueMonth !== null) dueDate.setMonth(d.dueMonth - 1);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays < 0) status = 'overdue';
    else if (diffDays <= 7) status = 'due_soon';
    else status = 'upcoming';
  }
  return {
    id: d.id,
    name: d.name,
    dateDescription: d.dueDescription,
    governingBody: d.governingBody,
    frequency: d.frequency,
    formName: d.formName,
    status,
  };
}

const STATUS_ETA = 10000; // ms before we switch from loading to stale

export default function CompliancePage() {
  const toast = useToast();
  const { user, token, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<BackendComplianceStatus | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlineDisplay[]>([]);
  const [connectors, setConnectors] = useState<ConnectorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const businessId = user?.organizations?.[0]?.id;

  async function fetchComplianceData() {
    if (!businessId) return;
    setLoading(true);
    setError(null);

    try {
      const statusRes = await api.get<ApiResponse<BackendComplianceStatus>>(
        `/compliance/status?businessId=${businessId}`
      );
      const s = statusRes.data.data;
      setStatus(s);

      const [deadlinesRes, connectorsRes] = await Promise.all([
        api.get<ApiResponse<BackendDeadline[]>>(`/compliance/deadlines?businessId=${businessId}`),
        api.get<ApiResponse<BackendConnector[]>>(`/compliance/connectors?countryCode=${s.countryCode}`),
      ]);

      setDeadlines(
        (deadlinesRes.data.data || []).map(toDeadlineDisplay)
      );

      const rawConnectors = connectorsRes.data.data || [];
      setConnectors(
        rawConnectors.map((c) => ({
          id: c.id,
          name: c.name,
          provider: c.provider,
          type: c.type,
          status: c.isAvailable ? ('online' as const) : ('offline' as const),
          isMandatory: c.isMandatory,
          baseUrl: c.baseUrl,
        }))
      );
    } catch (err: any) {
      toast.error('Failed to load compliance data');
      setError(err?.response?.data?.message || err.message || 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    if (!businessId) { setLoading(false); return; }
    fetchComplianceData();
  }, [authLoading, token, user, businessId]);

  // ── Loading ──────────────────────────────────────────────────
  if (authLoading || (loading && !status)) return <ComplianceSkeleton />;
  if (!token || !user) return null;

  // ── No business ──────────────────────────────────────────────
  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 p-10">
        <div className="h-20 w-20 bg-amber-50 rounded-[28px] flex items-center justify-center text-amber-600">
          <Building2 size={40} />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business Required</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Set up your business profile to access compliance configuration and filing deadlines.
          </p>
        </div>
      </div>
    );
  }

  // ── Error (no cached data) ───────────────────────────────────
  if (error && !status) {
    return <ErrorState message={error} onRetry={fetchComplianceData} />;
  }

  // ── Derived values ───────────────────────────────────────────
  const s = status;
  const score = s?.complianceScore ?? 0;
  const rawStatus = s?.status ?? 'at_risk';

  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';
  const scoreRing = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  const statusLabel = rawStatus === 'compliant' ? 'Compliant' : rawStatus === 'at_risk' ? 'At Risk' : 'Non-Compliant';
  const statusColor = rawStatus === 'compliant' ? 'text-emerald-600' : rawStatus === 'at_risk' ? 'text-amber-600' : 'text-rose-600';
  const statusBg = rawStatus === 'compliant' ? 'bg-emerald-50' : rawStatus === 'at_risk' ? 'bg-amber-50' : 'bg-rose-50';

  const urgentDeadlines = deadlines.filter(d => d.status === 'overdue' || d.status === 'due_soon');
  const upcomingDeadlines = deadlines.filter(d => d.status === 'upcoming');
  const onlineConnectors = connectors.filter(c => c.status === 'online').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans pb-20">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Compliance Center</h1>
          <p className="text-sm font-medium text-slate-500">
            Monitor regulatory compliance, filing deadlines, and government connector status.
          </p>
        </div>
        <button
          onClick={fetchComplianceData}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* ── Score + Config + Overview ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center"
        >
          <div className="relative mb-6">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none"
                stroke={scoreRing}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 339.292} 339.292`}
                initial={{ strokeDasharray: '0 339.292' }}
                animate={{ strokeDasharray: `${(score / 100) * 339.292} 339.292` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={clsx("text-4xl font-black", scoreColor)}>{score}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</p>
              </div>
            </div>
          </div>
          <span className={clsx(
            "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
            statusBg, statusColor, statusBg.replace('bg-', 'border-').replace('50', '200')
          )}>
            {statusLabel}
          </span>

          {/* Tax Readiness */}
          {s && (
            <div className="w-full mt-6 pt-6 border-t border-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tax Readiness</span>
                <span className={clsx(
                  "text-sm font-black",
                  s.taxReadinessScore >= 80 ? 'text-emerald-600' : s.taxReadinessScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                )}>
                  {s.taxReadinessScore}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={clsx(
                    "h-full rounded-full",
                    s.taxReadinessScore >= 80 ? 'bg-emerald-500' : s.taxReadinessScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.taxReadinessScore}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Missing Requirements */}
          {s && s.missingRequirements.length > 0 && (
            <div className="w-full mt-6 pt-6 border-t border-slate-50 text-left">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Missing Requirements
              </p>
              <div className="space-y-2">
                {s.missingRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-xl">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Country Config */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Country Configuration</h3>
            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Globe size={16} />
            </div>
          </div>
          {s ? (
            <div className="space-y-5">
              <Row label="Country" value={s.countryName} />
              <Row label="Currency" value={s.currency} />
              <Row label="Governing Body" value={s.governingBody} />
              <Row label="Filing Portal" value={s.invoicingRules.portalName} />
              <Row label="Invoice Prefix" value={s.invoicingRules.formatPrefix} />
              <Row label="QR Required" value={s.invoicingRules.qrRequired ? 'Yes' : 'No'} />
              <Row label="CIT Rate" value={`${s.taxRules.corporateTaxRate}%`} />
              <Row label="VAT Rate" value={`${s.taxRules.vatRate}%`} />
              {s.taxRules.devLevyRate && <Row label="Dev. Levy" value={`${s.taxRules.devLevyRate}%`} />}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs font-medium text-slate-400">No configuration loaded</p>
            </div>
          )}
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Overview</h3>
            <div className="h-8 w-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
              <FileText size={16} />
            </div>
          </div>
          <div className="space-y-5">
            <StatRow icon={AlertTriangle} iconClass="text-rose-500" label="Urgent" value={urgentDeadlines.length} valueClass="text-rose-600" />
            <StatRow icon={Calendar} iconClass="text-amber-500" label="Upcoming" value={upcomingDeadlines.length} valueClass="text-amber-600" />
            <StatRow icon={CheckCircle} iconClass="text-emerald-500" label="Connectors Online" value={`${onlineConnectors}/${connectors.length}`} valueClass="text-emerald-600" />
            <StatRow icon={Shield} iconClass="text-indigo-500" label="Tax Registered" value={s?.metrics.hasTaxNumber ? 'Yes' : 'No'} valueClass={s?.metrics.hasTaxNumber ? 'text-emerald-600' : 'text-rose-600'} />
            <StatRow icon={Building2} iconClass="text-slate-500" label="Invoices" value={s?.metrics.totalInvoicesCount ?? 0} valueClass="text-slate-900" />
          </div>
        </motion.div>
      </div>

      {/* ── Filing Deadlines ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Filing Deadlines</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Compliance Calendar</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
            <Clock size={14} />
            <span>{deadlines.length} deadlines</span>
          </div>
        </div>

        {deadlines.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">No filing deadlines found</p>
            <p className="text-xs font-medium text-slate-300 mt-1">Configured deadlines will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.map((dl, i) => {
              const dlColors =
                dl.status === 'overdue' ? 'text-rose-600 bg-rose-50 border-rose-200' :
                dl.status === 'due_soon' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                dl.status === 'completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                'text-slate-600 bg-slate-50 border-slate-200';

              const DlIcon = dl.status === 'overdue' ? XCircle : dl.status === 'due_soon' ? AlertCircle : Calendar;

              return (
                <motion.div
                  key={dl.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
                >
                  <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", dlColors)}>
                    <DlIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-slate-900 truncate">{dl.name}</p>
                      <span className={clsx("inline-flex px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border", dlColors)}>
                        {dl.status === 'due_soon' ? 'Due Soon' : dl.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">
                      {dl.dateDescription} &middot; {dl.governingBody}
                      {dl.formName && <span> &middot; Form {dl.formName}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 capitalize">{dl.frequency.toLowerCase().replace('_', ' ')}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Government Connectors ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Government Connectors</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Portal Availability</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {onlineConnectors} Online
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> {connectors.length - onlineConnectors} Offline
            </span>
          </div>
        </div>

        {connectors.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <WifiOff size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">No connectors configured</p>
            <p className="text-xs font-medium text-slate-300 mt-1">
              Government connector statuses will appear once configured for your country.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectors.map((conn, i) => {
              const isOnline = conn.status === 'online';
              return (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={clsx(
                    "flex items-start gap-4 p-5 rounded-2xl border transition-all",
                    isOnline ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                  )}
                >
                  <div className={clsx(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    isOnline ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100'
                  )}>
                    {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-black text-slate-900">{conn.name}</p>
                      <span className={clsx(
                        "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest",
                        isOnline ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        <span className={clsx("h-1.5 w-1.5 rounded-full", isOnline ? 'bg-emerald-500' : 'bg-rose-500')} />
                        {isOnline ? 'Operational' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed mb-1.5">
                      {conn.provider} {conn.type.replace(/_/g, ' ').toLowerCase()}
                      {conn.isMandatory && <span className="text-amber-600 font-bold"> &middot; Mandatory</span>}
                    </p>
                    {conn.baseUrl && (
                      <p className="text-[9px] font-bold text-slate-400 truncate">
                        {conn.baseUrl}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}

function StatRow({
  icon: Icon, iconClass, label, value, valueClass,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  iconClass: string;
  label: string;
  value: string | number;
  valueClass: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconClass} />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className={clsx("text-sm font-black", valueClass)}>{value}</span>
    </div>
  );
}

function ComplianceSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((k) => (
          <Skeleton key={k} className="h-[400px] rounded-[32px]" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-[32px]" />
      <Skeleton className="h-[300px] rounded-[32px]" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
        <AlertCircle size={40} />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Compliance Data Unavailable</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="group flex items-center gap-4 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all active:scale-95 mx-auto"
      >
        <span>Retry Connection</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
