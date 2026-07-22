'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';
import {
  Plus, Download, Search, FileText, Filter, ArrowRightCircle, File,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/useToast';
import { StatusModal } from '@/components/ui/StatusModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Quotation {
  id: string;
  quotationNumber: string;
  client: { name: string };
  issueDate: string;
  expiryDate: string;
  totalAmount: number;
  status: string;
  items: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; onConfirm: () => void; title: string; message: string; variant?: 'danger' | 'warning' | 'info'
  }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
  const [settings, setSettings] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
  const router = useRouter();

  useEffect(() => { fetchQuotations(); fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { const res = await api.get('/business/me'); if (res.data) setSettings(res.data); }
    catch { toast.error('Failed to load settings'); }
  };

  const fetchQuotations = async () => {
    try {
      const bizRes = await api.get('/business/me');
      if (bizRes.data?.id) {
        const res = await api.get(`/quotations?businessId=${bizRes.data.id}`);
        if (Array.isArray(res.data)) setQuotations(res.data);
      }
    } catch { toast.error('Failed to load quotations'); setQuotations([]); }
    finally { setLoading(false); }
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const res = await api.get(`/quotations/${id}`);
      await generateInvoicePDF(res.data, settings, 'quotation');
    } catch {
      toast.error('Failed to download PDF');
      setModalConfig({ title: 'Export Failed', message: 'Could not generate the PDF proposal.', type: 'error' });
      setShowModal(true);
    } finally { setDownloadingId(null); }
  };

  const handleConvertToInvoice = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        setConvertingId(id);
        try {
          await api.post(`/quotations/${id}/convert`);
          setModalConfig({ title: 'Pipeline Deployment', message: 'Quotation converted to an invoice draft.', type: 'success' });
          setShowModal(true);
        } catch {
          toast.error('Failed to convert quotation');
          setModalConfig({ title: 'Conversion Error', message: 'Failed to deploy quotation to invoice pipeline.', type: 'error' });
          setShowModal(true);
        } finally { setConvertingId(null); }
      },
      title: 'Convert to Invoice',
      message: 'Convert this quotation to an invoice? This will create a new invoice draft.',
      variant: 'warning',
    });
  };

  const statusVariant = (status: string): any => {
    if (status === 'ACCEPTED') return 'success';
    if (status === 'REJECTED') return 'danger';
    if (status === 'SENT') return 'primary';
    return 'secondary';
  };

  const filteredQuotations = Array.isArray(quotations) ? quotations.filter(q =>
    q.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Quotations</h1>
          <p className="text-sm text-text-secondary mt-1">Proposal & Bid Pipeline</p>
        </div>
        <Link href="/dashboard/quotations/new">
          <Button size="md" leftIcon={<Plus size={16} />}>New Proposal</Button>
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemAnim} className="relative flex-1 max-w-md">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text" placeholder="Search proposals by number or client..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
        />
      </motion.div>

      {/* Desktop Table */}
      <motion.div variants={itemAnim} className="hidden lg:block bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-border-light min-w-[650px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Proposal ID</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Client Prospect</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Issue Date</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Est. Value</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Status</th>
                <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center text-sm text-text-tertiary">No Proposals in Pipeline</td>
                </tr>
              ) : (
                filteredQuotations.map((quote, i) => (
                  <motion.tr
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    key={quote.id}
                    className="hover:bg-surface-secondary transition-colors group"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-surface-tertiary flex items-center justify-center text-text-primary">
                          <FileText size={14} />
                        </div>
                        <span className="text-sm font-medium text-text-primary">{quote.quotationNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{quote.client?.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-text-tertiary">{quote.issueDate}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">{formatCurrency(quote.totalAmount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={statusVariant(quote.status)} size="sm">{quote.status || 'DRAFT'}</Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {quote.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => handleConvertToInvoice(quote.id)}
                            disabled={convertingId === quote.id}
                            className="p-2 text-text-tertiary hover:text-success transition-all rounded-lg hover:bg-success-50"
                            title="Convert to Invoice"
                          >
                            {convertingId === quote.id
                              ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-success border-t-transparent" />
                              : <ArrowRightCircle size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(quote.id)}
                          disabled={downloadingId === quote.id}
                          className="p-2 text-text-tertiary hover:text-primary transition-all rounded-lg hover:bg-primary-50"
                          title="Export Proposal"
                        >
                          {downloadingId === quote.id
                            ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            : <Download size={14} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Mobile Card View */}
      <motion.div variants={itemAnim} className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuotations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-surface rounded-2xl border border-dashed border-border">
            <div className="h-14 w-14 rounded-2xl bg-surface-tertiary flex items-center justify-center mb-3 text-text-tertiary">
              <File size={24} />
            </div>
            <p className="text-sm text-text-tertiary">No Active Proposals Found</p>
          </div>
        ) : (
          filteredQuotations.map((quote) => (
            <div key={quote.id} className="bg-surface rounded-2xl border border-border p-5 space-y-4 hover:shadow-card-hover transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant={statusVariant(quote.status)} size="sm">{quote.status || 'DRAFT'}</Badge>
                  <p className="mt-2 text-base font-semibold text-text-primary">{quote.quotationNumber}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{quote.client?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-text-primary">{formatCurrency(quote.totalAmount)}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{quote.issueDate}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-border">
                {quote.status !== 'ACCEPTED' && (
                  <button onClick={() => handleConvertToInvoice(quote.id)}
                    className="flex-1 py-2.5 bg-success-50 text-success rounded-xl text-xs font-medium hover:bg-success-100 transition-all flex items-center justify-center gap-1.5">
                    <ArrowRightCircle size={12} /> Convert
                  </button>
                )}
                <button onClick={() => handleDownload(quote.id)}
                  className="flex-1 py-2.5 bg-surface-tertiary text-text-secondary rounded-xl text-xs font-medium hover:bg-surface-secondary transition-all flex items-center justify-center gap-1.5">
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>
          ))
        )}
      </motion.div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({ ...prev, isOpen: false })); }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant || 'danger'}
      />
      <StatusModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          if (modalConfig.title === 'Pipeline Deployment') router.push('/dashboard/invoices');
        }}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        actionLabel={modalConfig.title === 'Pipeline Deployment' ? 'View Invoices' : 'Continue'}
      />
    </motion.div>
  );
}
