'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/lib/useToast';
import {
  Landmark, Calendar, FileText, AlertCircle, CheckCircle,
  Download, Info, UploadCloud,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusModal } from '@/components/ui/StatusModal';
import { RemittanceTracker } from '@/app/dashboard/components/RemittanceTracker';
import { useTaxStore } from '@/store/useTaxStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function TaxesPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
  const fetchMonthlyRecords = useTaxStore(s => s.fetchMonthlyRecords);

  const businessId = user?.organizations?.[0]?.id;

  useEffect(() => {
    if (token && businessId) {
      setLoading(true);
      Promise.all([
        api.get(`/accounting/compliance-status?businessId=${businessId}`),
        api.get(`/accounting/summary?businessId=${businessId}`),
        fetchMonthlyRecords(businessId),
      ])
        .then(([complianceRes, summaryRes]) => {
          setCompliance(complianceRes.data.data);
          setSummary(summaryRes.data.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (!businessId) setLoading(false);
  }, [token, businessId]);

  const handleExport = () => {
    if (!summary || !compliance) return;
    const taxProjection = summary?.tax_projection;
    const estTaxOwed = taxProjection?.estimated_tax_owed ?? 0;
    const taxRateVal = taxProjection?.tax_rate ?? 0;
    const devLevyAmt = taxProjection?.dev_levy_amount ?? 0;
    const currentYear = new Date().getFullYear();
    const currencySymbol = '₦';
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `TAX FILING DATA (${compliance.countryName?.toUpperCase()})\n`;
    csvContent += `Assessment Year,${currentYear}\n`;
    csvContent += `Estimated CIT Liability,${currencySymbol}${estTaxOwed}\n`;
    csvContent += `Applicable CIT Rate,${taxRateVal}%\n`;
    if (compliance.countryCode === 'NG') csvContent += `Development Levy (4%),₦${devLevyAmt}\n`;
    csvContent += `Filing Deadline,${compliance.deadlines?.[0]?.dateDescription || 'June 30'}\n`;
    csvContent += `Turnover (Gross Revenue),${currencySymbol}${summary.gross_revenue}\n`;
    csvContent += `Assessable Profit (Net Profit),${currencySymbol}${summary.net_profit}\n`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${compliance.countryCode?.toLowerCase()}_tax_package_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    setUploading(true);
    try {
      await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setModalConfig({ title: 'Upload Complete', message: 'Document uploaded successfully!', type: 'success' });
      setShowModal(true);
    } catch {
      toast.error('Failed to upload document');
      setModalConfig({ title: 'Upload Failed', message: 'Failed to upload document.', type: 'error' });
      setShowModal(true);
    } finally { setUploading(false); }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!businessId) return <div className="flex h-[60vh] items-center justify-center text-sm text-danger">Please setup your business profile to view compliance settings.</div>;

  const taxProjection = summary?.tax_projection;
  const estimatedTaxOwed = taxProjection?.estimated_tax_owed ?? 0;
  const taxRate = taxProjection?.tax_rate ?? 0;
  const devLevyRate = taxProjection?.dev_levy_rate ?? 0;
  const devLevyAmount = taxProjection?.dev_levy_amount ?? 0;
  const currentYear = new Date().getFullYear();
  const filingDeadline = compliance?.deadlines?.[0]?.dateDescription || 'June 30';
  const currencySymbol = '₦';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Tax Compliance ({compliance?.governingBody || 'FIRS'})</h1>
          <p className="text-sm text-text-secondary mt-1">Estimates based on {compliance?.countryName || 'Nigeria'} Tax Act & regulations.</p>
        </div>
        <Badge variant="primary" size="sm">Currency: {compliance?.currency || 'NGN'}</Badge>
      </motion.div>

      {/* Tax Overview Card */}
      <motion.div variants={itemAnim} className="bg-gradient-to-br from-[#064E3B] to-[#0F766E] rounded-2xl p-6 text-white relative overflow-hidden border border-emerald-800/20">
        <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none">
          <Landmark size={160} />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-emerald-200 text-xs font-medium mb-2 uppercase tracking-wider">Estimated Corporate Tax Liability ({currentYear})</p>
            <h2 className="text-4xl font-bold mb-3">{currencySymbol}{estimatedTaxOwed.toLocaleString()}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-100">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-lg font-medium">{taxRate}% CIT Rate</span>
              {devLevyRate > 0 && <span>+ {devLevyRate}% Development Levy</span>}
            </div>
            <p className="text-xs text-emerald-300 mt-2 italic">Calculated based on net profit. Exemptions apply based on company size.</p>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-emerald-300" />
              </div>
              <div>
                <p className="font-medium text-emerald-50 text-sm">Next Filing Deadline</p>
                <p className="text-emerald-200 text-xs">{filingDeadline}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-emerald-300" />
              </div>
              <div>
                <p className="font-medium text-emerald-50 text-sm">Filing Platform</p>
                <p className="text-emerald-200 text-xs">{compliance?.invoicingRules?.portalName || 'TaxPro-Max (FIRS Portal)'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Remittance Tracker */}
      <motion.div variants={itemAnim}><RemittanceTracker /></motion.div>

      {/* Action Cards */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-success" />
            Filing Schedules & Deadlines
          </h3>
          <div className="space-y-2.5">
            {(compliance?.deadlines || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-border hover:border-success/30 transition-colors">
                <div className="h-5 w-5 rounded-full bg-success-50 border border-success/30 flex items-center justify-center text-success text-[10px] font-bold">✓</div>
                <span className="text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">{item.name}</span> ({item.dateDescription}) via {item.governingBody}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 space-y-5 hover:shadow-card-hover transition-all">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Audit & Export</h3>
            <p className="text-xs text-text-secondary mb-4">Export your Trial Balance, P&L, and WHT credit notes for your Auditor or local tax upload.</p>
            <Button size="md" className="w-full" leftIcon={<Download size={14} />} onClick={handleExport}>
              Download {compliance?.governingBody || 'FIRS'} Data Package
            </Button>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Upload Filing Documents</h3>
            <p className="text-xs text-text-secondary mb-3">Store filed VAT/WHT evidence, receipts, or contracts (PDF, Excel, Word).</p>
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-secondary border border-border rounded-xl hover:bg-surface-tertiary transition-all text-xs font-medium text-text-secondary cursor-pointer">
              <UploadCloud size={16} />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'tax_filing')} disabled={uploading} />
            </label>
          </div>
        </div>
      </motion.div>

      {compliance?.missingRequirements?.length > 0 && (
        <motion.div variants={itemAnim} className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-start gap-3">
          <Info size={16} className="text-warning shrink-0 mt-0.5" />
          <div className="text-sm text-text-primary">
            <p className="font-medium mb-1">Tax Readiness Alert</p>
            <ul className="list-disc pl-5 space-y-0.5 text-xs text-text-secondary">
              {compliance.missingRequirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        </motion.div>
      )}

      <StatusModal isOpen={showModal} onClose={() => setShowModal(false)} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} actionLabel="Proceed" />
    </motion.div>
  );
}
