'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Plus, Download, Search, Pencil, Trash2, Filter, TrendingUp,
  CheckCircle, FileText, MoreVertical, Clock, AlertCircle,
  ChevronLeft, ChevronRight, ArrowUpRight, Receipt,
} from 'lucide-react';
import { useToast } from '@/lib/useToast';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { StatusModal } from '@/components/ui/StatusModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  totalAmount: number;
  status: string;
  client: { id: string; name: string; email: string };
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
  const toast = useToast();
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; onConfirm: () => void; title: string; message: string; variant?: 'danger' | 'warning' | 'info'
  }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

  useEffect(() => { fetchInvoices(); fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { const res = await api.get('/business/me'); if (res.data) setSettings(res.data); }
    catch { toast.error('Failed to load settings'); }
  };

  const fetchInvoices = async () => {
    try {
      const bizRes = await api.get('/business/me');
      if (bizRes.data?.id) {
        const res = await api.get(`/invoices?businessId=${bizRes.data.id}`);
        setInvoices(Array.isArray(res.data) ? res.data : (res.data?.invoices || []));
      }
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const res = await api.get(`/invoices/${id}`);
      await generateInvoicePDF(res.data, settings);
    } catch {
      toast.error('Failed to download PDF');
      setModalConfig({ title: 'Export Failed', message: 'Could not generate the PDF for this invoice.', type: 'error' });
      setShowModal(true);
    } finally { setDownloadingId(null); }
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      onConfirm: async () => {
        try {
          await api.delete(`/invoices/${id}`);
          setInvoices(invoices.filter(inv => inv.id !== id));
          setModalConfig({ title: 'Invoice Deleted', message: 'The invoice has been removed successfully.', type: 'info' });
          setShowModal(true);
        } catch {
          toast.error('Failed to delete invoice');
          setModalConfig({ title: 'Deletion Error', message: 'An error occurred while deleting the invoice.', type: 'error' });
          setShowModal(true);
        }
      },
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
      variant: 'danger',
    });
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'PAID' && inv.status !== 'DRAFT')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const paidThisMonth = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const draftsCount = invoices.filter(inv => inv.status === 'DRAFT').length;

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Page Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Invoices</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and track all billing documents and revenue streams.</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button size="md" leftIcon={<Plus size={16} />}>New Invoice</Button>
        </Link>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Outstanding', value: formatCurrency(totalOutstanding), trend: '+12%', icon: Clock, color: 'text-danger', bg: 'bg-danger-50' },
          { label: 'Paid this Month', value: formatCurrency(paidThisMonth), subtitle: `${invoices.filter(i => i.status === 'PAID').length} invoices cleared`, icon: CheckCircle, color: 'text-success', bg: 'bg-success-50' },
          { label: 'Drafts', value: draftsCount.toString(), subtitle: 'Awaiting approval', icon: FileText, color: 'text-text-tertiary', bg: 'bg-surface-tertiary' },
        ].map((card, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-tertiary">{card.label}</span>
              <div className={clsx('h-8 w-8 rounded-lg flex items-center justify-center', card.bg, card.color)}>
                <card.icon size={16} />
              </div>
            </div>
            <div className="text-xl font-semibold text-text-primary">{card.value}</div>
            <div className={clsx('flex items-center gap-1 mt-1.5 text-xs font-medium', card.trend ? 'text-success' : 'text-text-tertiary')}>
              {card.trend && <><TrendingUp size={12} className="text-success" />{card.trend}</>}
              {card.subtitle && <span className="text-text-tertiary">{card.subtitle}</span>}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search client or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-surface-secondary border border-border rounded-xl text-xs text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all w-56"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select className="bg-surface-secondary border border-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all">
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
          <button className="p-2 rounded-xl border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors">
            <Filter size={14} />
          </button>
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div variants={itemAnim}>
        {filteredInvoices.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border py-20 px-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-surface-tertiary flex items-center justify-center text-text-tertiary">
                <Receipt size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary">No invoices found</p>
                <p className="text-xs text-text-tertiary">Create your first invoice to get started.</p>
              </div>
              <Link href="/dashboard/invoices/new">
                <Button size="sm" leftIcon={<Plus size={14} />}>Create Invoice</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Invoice ID</th>
                    <th className="text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Client / Partner</th>
                    <th className="text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Date Issued</th>
                    <th className="text-right px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Amount</th>
                    <th className="text-right px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Status</th>
                    <th className="text-right px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filteredInvoices.map((inv, i) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      key={inv.id}
                      className="hover:bg-surface-secondary transition-colors group"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link href={`/dashboard/invoices/${inv.id}/edit`} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary hover:text-primary transition-colors">
                          {inv.invoiceNumber}
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-surface-tertiary flex items-center justify-center text-text-primary font-semibold text-xs">
                            {inv.client?.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-text-primary">{inv.client?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-text-tertiary whitespace-nowrap">{inv.issueDate}</td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-text-primary whitespace-nowrap">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Badge
                          variant={
                            inv.status === 'PAID' ? 'success' :
                            inv.status === 'OVERDUE' ? 'danger' :
                            inv.status === 'PENDING' ? 'warning' : 'neutral'
                          }
                          size="sm"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownload(inv.id)}
                            disabled={downloadingId === inv.id}
                            className="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-tertiary"
                          >
                            {downloadingId === inv.id ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : <Download size={14} />}
                          </button>
                          <div className="relative group/menu">
                            <button className="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-tertiary">
                              <MoreVertical size={14} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-xl shadow-lg border border-border py-1.5 hidden group-hover/menu:block z-50">
                              <Link
                                href={`/dashboard/invoices/${inv.id}/edit`}
                                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
                              >
                                <Pencil size={12} /> Edit Invoice
                              </Link>
                              <button
                                onClick={() => handleDelete(inv.id)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger-50 transition-colors"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3.5 border-t border-border bg-surface-secondary flex items-center justify-between">
              <div className="text-xs text-text-tertiary">
                Showing {filteredInvoices.length} of {invoices.length} results
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-border text-text-tertiary hover:text-text-primary hover:bg-surface transition-all disabled:opacity-30" disabled>
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 rounded-lg bg-primary text-white text-[11px] font-semibold">1</button>
                  <button className="w-7 h-7 rounded-lg border border-border text-text-tertiary text-[11px] font-medium hover:border-primary hover:text-primary transition-all">2</button>
                </div>
                <button className="p-1.5 rounded-lg border border-border text-text-tertiary hover:text-text-primary hover:bg-surface transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(prev => ({ ...prev, isOpen: false })); }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant || 'danger'}
      />
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        actionLabel="Proceed"
      />
    </motion.div>
  );
}
