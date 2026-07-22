'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/useToast';
import { RecordExpenseModal } from './components/RecordExpenseModal';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Search, Filter, ArrowUpRight, Receipt, History,
  Plus, Wallet, MoreHorizontal, FileUp, Download, Pencil, Trash2,
  X, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  currency: string;
  date: string;
  merchant?: string;
  notes?: string;
  receiptUrl?: string;
  status?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [currency, setCurrency] = useState('NGN');
  const [searchQuery, setSearchQuery] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const toast = useToast();
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);
  const [dropdownUp, setDropdownUp] = useState(false);
  useEffect(() => {
    if (!actionsOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) setActionsOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [actionsOpen]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; onConfirm: () => void; title: string; message: string; variant?: 'danger' | 'warning' | 'info'
  }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

  const fetchExpenses = async () => {
    try {
      const bizRes = await api.get('/business/me');
      const res = await api.get(`/expenses?businessId=${bizRes.data.id}`);
      setExpenses(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchExpenses(); }, [user]);

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setEditForm({
      merchant: expense.merchant || '',
      category: expense.category || '',
      amount: expense.amount || '',
      currency: expense.currency || 'NGN',
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: expense.description || '',
      status: expense.status || 'PENDING',
      receipt_url: expense.receipt_url || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const bizRes = await api.get('/business/me');
      await api.put(`/expenses/${editingExpense.id}`, { ...editForm, businessId: bizRes.data.id });
      setIsEditModalOpen(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch { toast.error('Failed to update expense'); }
    finally { setEditLoading(false); }
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      onConfirm: async () => {
        try { await api.delete(`/expenses/${id}`); setExpenses(expenses.filter(e => e.id !== id)); }
        catch { toast.error('Failed to delete expense'); }
      },
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      variant: 'danger',
    });
  };

  const filteredExpenses = expenses.filter(exp =>
    (exp.currency === currency || currency === 'ALL') &&
    (exp.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     exp.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     exp.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const mtdExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
  const totalMTD = mtdExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const categoryTotals = expenses.reduce((acc: any, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1])[0] || ['None', 0];

  const pendingAmount = expenses.filter(exp => exp.status === 'PENDING').reduce((sum, exp) => sum + Number(exp.amount), 0);

  const summaryCards = [
    { label: 'Total Expenses (MTD)', value: `₦${totalMTD.toLocaleString()}`, trend: '+5.2%', up: false, icon: Wallet, color: 'text-danger', bg: 'bg-danger-50' },
    { label: 'Pending Reimbursement', value: `₦${pendingAmount.toLocaleString()}`, subtitle: `Across ${expenses.filter(e => e.status === 'PENDING').length} active items`, icon: Clock, color: 'text-warning', bg: 'bg-warning-50' },
    { label: 'Top Category', value: topCategory[0] as string, subtitle: `₦${(topCategory[1] as number).toLocaleString()} this month`, icon: Receipt, color: 'text-accent', bg: 'bg-accent-50' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Expenses</h1>
          <p className="text-sm text-text-secondary mt-1">Monitor institutional outgoings, manage vendor payables, and track operational expenditure.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<FileUp size={14} />} onClick={() => setIsExcelModalOpen(true)}>Upload Excel</Button>
          <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>Export CSV</Button>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>Log New Expense</Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-tertiary">{card.label}</span>
              <div className={clsx('h-8 w-8 rounded-lg flex items-center justify-center', card.bg, card.color)}>
                <card.icon size={16} />
              </div>
            </div>
            <div className="text-xl font-semibold text-text-primary">{card.value}</div>
            <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-text-tertiary">
              {card.trend ? (
                <><ArrowUpRight size={12} className={card.up ? 'text-success' : 'text-danger'} />{card.trend}</>
              ) : card.subtitle}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text" placeholder="Search merchant or category..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-surface-secondary border border-border rounded-xl text-xs text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all w-full sm:w-56"
            />
          </div>
          <select
            value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="bg-surface-secondary border border-border rounded-xl px-3 py-2 text-xs font-medium text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all shrink-0"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="ALL">All Currencies</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-surface-secondary border border-border rounded-xl text-xs font-medium text-text-secondary hover:bg-surface-tertiary transition-colors">
          <Filter size={14} /> Filter
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemAnim}>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Expense ID</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Merchant / Entity</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Date</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Category</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Amount</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Status</th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center text-sm text-text-tertiary">Loading...</td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-surface-tertiary flex items-center justify-center text-text-tertiary">
                          <Receipt size={24} />
                        </div>
                        <p className="text-sm text-text-tertiary">No expenditure logged yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp, i) => (
                    <motion.tr
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      key={exp.id}
                      className="hover:bg-surface-secondary transition-colors group"
                    >
                      <td className="px-4 py-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                        EXP-{new Date(exp.date).getFullYear()}-{exp.id.slice(0, 4).toUpperCase()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-surface-tertiary flex items-center justify-center text-text-primary transition-transform group-hover:scale-110">
                            <History size={16} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-text-primary">{exp.merchant || 'Institutional Payee'}</span>
                            <span className="text-xs text-text-tertiary block truncate max-w-[200px]">{exp.description || 'Internal spend'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-text-tertiary whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-medium rounded-lg bg-surface-tertiary text-text-secondary">
                          {exp.category || 'Unclassified'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-text-primary whitespace-nowrap">
                        {formatCurrency(exp.amount, exp.currency)}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Badge variant={exp.status === 'PAID' || exp.status === 'APPROVED' ? 'success' : 'warning'} size="sm">
                          {exp.status || 'PENDING'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="relative inline-block text-left" data-dropdown>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const willOpen = actionsOpen !== exp.id;
                              if (willOpen) {
                                const btn = e.currentTarget;
                                const rect = btn.getBoundingClientRect();
                                setDropdownUp(rect.bottom + 200 > window.innerHeight);
                              }
                              setActionsOpen(willOpen ? exp.id : null);
                            }}
                            className="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-tertiary"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {actionsOpen === exp.id && (
                            <div className={`absolute right-0 z-50 w-44 bg-surface rounded-xl shadow-lg border border-border py-1.5 ${dropdownUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                              <button
                                onClick={() => { openEditModal(exp); setActionsOpen(null); }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
                              >
                                <Pencil size={12} /> Edit Expense
                              </button>
                              <button
                                onClick={() => { handleDelete(exp.id); setActionsOpen(null); }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger-50 transition-colors"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3.5 border-t border-border bg-surface-secondary flex items-center justify-between">
            <div className="text-xs text-text-tertiary">{filteredExpenses.length} transactions in current view</div>
          </div>
        </div>
      </motion.div>

      <RecordExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchExpenses} />
      <ExcelUploadModal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} onSuccess={fetchExpenses} />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(prev => ({ ...prev, isOpen: false })); }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant || 'danger'}
      />

      {/* Edit Expense Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-surface rounded-2xl shadow-xl border border-border">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">Edit Expense</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Merchant / Entity</label>
                  <input type="text" required value={editForm.merchant || ''} onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="e.g. AWS, Adobe, Office Supplies" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                    <select value={editForm.category || ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all">
                      <option value="">Select Category</option>
                      <option value="Software">Software</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Travel">Travel</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Amount</label>
                    <input type="number" required step="0.01" value={editForm.amount || ''} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                      placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Date</label>
                    <input type="date" value={editForm.date || ''} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Currency</label>
                    <select value={editForm.currency || 'NGN'} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all">
                      <option value="NGN">NGN</option><option value="USD">USD</option>
                      <option value="EUR">EUR</option><option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                  <textarea rows={3} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all resize-none"
                    placeholder="Optional description..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Status</label>
                  <select value={editForm.status || 'PENDING'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all">
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" size="md" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit" size="md" className="flex-1" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
