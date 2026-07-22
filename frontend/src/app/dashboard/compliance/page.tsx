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

interface ApiResponse<T> { success: boolean; data: T; }

interface BackendComplianceStatus {
  countryCode: string; countryName: string; currency: string; governingBody: string;
  complianceScore: number; taxReadinessScore: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  missingRequirements: string[];
  deadlines: Array<{ name: string; frequency: string; dateDescription: string; governingBody: string; }>;
  invoicingRules: { formatPrefix: string; qrRequired: boolean; electronicSignatureRequired: boolean; portalName: string; };
  taxRules: { vatRate: number; whtRate: number; devLevyRate?: number; corporateTaxRate: number; };
  metrics: { hasTaxNumber: boolean; hasAddress: boolean; hasEmail: boolean; totalInvoicesCount: number; };
}

interface BackendDeadline {
  id: string; name: string; description: string | null; frequency: string;
  dueDay: number | null; dueMonth: number | null; dueDescription: string;
  governingBody: string; formName: string | null; penaltyLate: number | null;
  penaltyRate: number | null; isActive: boolean;
}

interface BackendConnector {
  id: string; name: string; provider: string; type: string; baseUrl: string | null;
  apiVersion: string | null; authType: string | null; isAvailable: boolean;
  isMandatory: boolean; documentationUrl: string | null; statusUrl: string | null; isActive: boolean;
}

interface DeadlineDisplay {
  id: string; name: string; dateDescription: string; governingBody: string;
  frequency: string; formName: string | null;
  status: 'overdue' | 'due_soon' | 'upcoming' | 'completed';
}

interface ConnectorDisplay {
  id: string; name: string; provider: string; type: string;
  status: 'online' | 'offline' | 'degraded';
  isMandatory: boolean; baseUrl: string | null;
}

function toDeadlineDisplay(d: BackendDeadline): DeadlineDisplay {
  let status: DeadlineDisplay['status'] = 'upcoming';
  if (d.dueDay) {
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), d.dueDay);
    if (d.dueMonth !== null) {
      dueDate.setMonth(d.dueMonth - 1);
      if (dueDate < now) dueDate.setFullYear(dueDate.getFullYear() + 1);
    } else if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);
    const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= -1) status = 'overdue';
    else if (diffDays <= 7) status = 'due_soon';
    else status = 'upcoming';
  }
  return { id: d.id, name: d.name, dateDescription: d.dueDescription, governingBody: d.governingBody, frequency: d.frequency, formName: d.formName, status };
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

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
    setLoading(true); setError(null);
    try {
      const statusRes = await api.get<ApiResponse<BackendComplianceStatus>>(`/compliance/status?businessId=${businessId}`);
      const s = statusRes.data.data;
      setStatus(s);
      const [deadlinesRes, connectorsRes] = await Promise.all([
        api.get<ApiResponse<BackendDeadline[]>>(`/compliance/deadlines?businessId=${businessId}`),
        api.get<ApiResponse<BackendConnector[]>>(`/compliance/connectors?countryCode=${s.countryCode}`),
      ]);
      setDeadlines((deadlinesRes.data.data || []).map(toDeadlineDisplay));
      const rawConnectors = connectorsRes.data.data || [];
      setConnectors(rawConnectors.map(c => ({ id: c.id, name: c.name, provider: c.provider, type: c.type, status: c.isAvailable ? 'online' as const : 'offline' as const, isMandatory: c.isMandatory, baseUrl: c.baseUrl })));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load compliance data');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!token || !businessId) { setLoading(false); return; }
    fetchComplianceData();
  }, [authLoading, token, user, businessId]);

  if (authLoading || (loading && !status)) return <ComplianceSkeleton />;
  if (!token || !user) return null;

  if (!businessId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 p-10">
        <div className="h-20 w-20 rounded-[20px] bg-warning-50 flex items-center justify-center text-warning">
          <Building2 size={40} />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight">Business Required</h2>
          <p className="text-sm text-text-secondary">Set up your business profile to access compliance configuration and filing deadlines.</p>
        </div>
      </div>
    );
  }

  const fetchError = error && !status ? error : null;

  const s = status;
  const score = s?.complianceScore ?? 0;
  const rawStatus = s?.status ?? 'at_risk';
  const scoreColor = score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger';
  const scoreRing = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
  const statusLabel = rawStatus === 'compliant' ? 'Compliant' : rawStatus === 'at_risk' ? 'At Risk' : 'Non-Compliant';
  const statusColor = rawStatus === 'compliant' ? 'text-success' : rawStatus === 'at_risk' ? 'text-warning' : 'text-danger';
  const statusBg = rawStatus === 'compliant' ? 'bg-success-50' : rawStatus === 'at_risk' ? 'bg-warning-50' : 'bg-danger-50';
  const urgentDeadlines = deadlines.filter(d => d.status === 'overdue' || d.status === 'due_soon');
  const upcomingDeadlines = deadlines.filter(d => d.status === 'upcoming');
  const onlineConnectors = connectors.filter(c => c.status === 'online').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {fetchError && (
        <motion.div variants={itemAnim} className="bg-danger-50 border border-danger-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="text-xs text-danger font-medium flex-1">{fetchError}</p>
          <button onClick={fetchComplianceData} className="text-xs font-semibold text-danger underline whitespace-nowrap">Retry</button>
        </motion.div>
      )}
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Compliance Center</h1>
          <p className="text-sm text-text-secondary mt-1">Monitor regulatory compliance, filing deadlines, and government connector status.</p>
        </div>
        <button onClick={fetchComplianceData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-xs font-medium text-text-secondary hover:bg-surface-tertiary transition-all disabled:opacity-50">
          <RefreshCw size={14} className={clsx(loading && 'animate-spin')} />
          Refresh
        </button>
      </motion.div>

      {/* Score + Config + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score Card */}
        <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="8" />
              <motion.circle cx="60" cy="60" r="54" fill="none" stroke={scoreRing} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 339.292} 339.292`}
                initial={{ strokeDasharray: '0 339.292' }}
                animate={{ strokeDasharray: `${(score / 100) * 339.292} 339.292` }}
                transition={{ duration: 1, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={clsx('text-3xl font-bold', scoreColor)}>{score}</span>
                <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mt-1">Score</p>
              </div>
            </div>
          </div>
          <span className={clsx('inline-flex px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border', statusBg, statusColor, statusBg.replace('bg-', 'border-').replace('50', '200').replace('success', 'success').replace('warning', 'warning').replace('danger', 'danger'))}>
            {statusLabel}
          </span>
          {s && (
            <div className="w-full mt-5 pt-5 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Tax Readiness</span>
                <span className={clsx('text-sm font-semibold', score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger')}>{s.taxReadinessScore}%</span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <motion.div className={clsx('h-full rounded-full', s.taxReadinessScore >= 80 ? 'bg-success' : s.taxReadinessScore >= 50 ? 'bg-warning' : 'bg-danger')}
                  initial={{ width: 0 }} animate={{ width: `${s.taxReadinessScore}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
          )}
          {s && s.missingRequirements.length > 0 && (
            <div className="w-full mt-5 pt-5 border-t border-border text-left">
              <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">Missing Requirements</p>
              <div className="space-y-2">
                {s.missingRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-warning bg-warning-50 px-3 py-2 rounded-xl">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Country Config */}
        <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-text-primary">Country Configuration</h3>
            <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary"><Globe size={16} /></div>
          </div>
          {s ? (
            <div className="space-y-4">
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
          ) : <div className="py-8 text-center text-xs text-text-tertiary">No configuration loaded</div>}
        </motion.div>

        {/* Overview Stats */}
        <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-text-primary">Overview</h3>
            <div className="h-8 w-8 rounded-lg bg-accent-50 flex items-center justify-center text-accent"><FileText size={16} /></div>
          </div>
          <div className="space-y-4">
            <StatRow icon={AlertTriangle} iconClass="text-danger" label="Urgent" value={urgentDeadlines.length} valueClass="text-danger" />
            <StatRow icon={Calendar} iconClass="text-warning" label="Upcoming" value={upcomingDeadlines.length} valueClass="text-warning" />
            <StatRow icon={CheckCircle} iconClass="text-success" label="Connectors Online" value={`${onlineConnectors}/${connectors.length}`} valueClass="text-success" />
            <StatRow icon={Shield} iconClass="text-primary" label="Tax Registered" value={s?.metrics.hasTaxNumber ? 'Yes' : 'No'} valueClass={s?.metrics.hasTaxNumber ? 'text-success' : 'text-danger'} />
            <StatRow icon={Building2} iconClass="text-text-tertiary" label="Invoices" value={s?.metrics.totalInvoicesCount ?? 0} valueClass="text-text-primary" />
          </div>
        </motion.div>
      </div>

      {/* Filing Deadlines */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Filing Deadlines</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Compliance Calendar</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Clock size={14} />
            <span>{deadlines.length} deadlines</span>
          </div>
        </div>
        {deadlines.length === 0 ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-3"><Calendar size={24} className="text-text-tertiary" /></div>
            <p className="text-sm text-text-tertiary">No filing deadlines found</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {deadlines.map((dl, i) => {
              const dlColors = dl.status === 'overdue' ? 'text-danger bg-danger-50 border-danger-200' :
                dl.status === 'due_soon' ? 'text-warning bg-warning-50 border-warning-200' :
                dl.status === 'completed' ? 'text-success bg-success-50 border-success-200' : 'text-text-secondary bg-surface-tertiary border-border';
              const DlIcon = dl.status === 'overdue' ? XCircle : dl.status === 'due_soon' ? AlertCircle : Calendar;
              return (
                <motion.div key={dl.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border hover:border-border-light hover:bg-surface-secondary transition-all group">
                  <div className={clsx('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', dlColors)}><DlIcon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-text-primary truncate">{dl.name}</p>
                      <span className={clsx('inline-flex px-2 py-0.5 rounded-md text-[8px] font-semibold uppercase tracking-wider border', dlColors)}>
                        {dl.status === 'due_soon' ? 'Due Soon' : dl.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-tertiary">{dl.dateDescription} · {dl.governingBody}{dl.formName && <span> · Form {dl.formName}</span>}</p>
                  </div>
                  <span className="text-[10px] text-text-tertiary shrink-0 capitalize">{dl.frequency.toLowerCase().replace('_', ' ')}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Government Connectors */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Government Connectors</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Portal Availability</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-success"><span className="h-2 w-2 rounded-full bg-success" /> {onlineConnectors} Online</span>
            <span className="flex items-center gap-1.5 text-[10px] text-danger"><span className="h-2 w-2 rounded-full bg-danger" /> {connectors.length - onlineConnectors} Offline</span>
          </div>
        </div>
        {connectors.length === 0 ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-3"><WifiOff size={24} className="text-text-tertiary" /></div>
            <p className="text-sm text-text-tertiary">No connectors configured</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connectors.map((conn, i) => {
              const isOnline = conn.status === 'online';
              return (
                <motion.div key={conn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={clsx('flex items-start gap-3.5 p-4 rounded-xl border transition-all', isOnline ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200')}>
                  <div className={clsx('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', isOnline ? 'text-success bg-success-100' : 'text-danger bg-danger-100')}>
                    {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-text-primary">{conn.name}</p>
                      <span className={clsx('flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider', isOnline ? 'text-success' : 'text-danger')}>
                        <span className={clsx('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-success' : 'bg-danger')} />
                        {isOnline ? 'Operational' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary">{conn.provider} {conn.type.replace(/_/g, ' ').toLowerCase()}{conn.isMandatory && <span className="text-warning font-medium"> · Mandatory</span>}</p>
                    {conn.baseUrl && <p className="text-[9px] text-text-tertiary truncate mt-0.5">{conn.baseUrl}</p>}
                  </div>
                  <ChevronRight size={14} className="text-text-tertiary shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
      <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

function StatRow({ icon: Icon, iconClass, label, value, valueClass }: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  iconClass: string; label: string; value: string | number; valueClass: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconClass} />
        <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">{label}</span>
      </div>
      <span className={clsx('text-sm font-semibold', valueClass)}>{value}</span>
    </div>
  );
}

function ComplianceSkeleton() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-3"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48" /></div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[1, 2, 3].map(k => <Skeleton key={k} className="h-[380px] rounded-2xl" />)}</div>
      <Skeleton className="h-[350px] rounded-2xl" />
      <Skeleton className="h-[280px] rounded-2xl" />
    </div>
  );
}


