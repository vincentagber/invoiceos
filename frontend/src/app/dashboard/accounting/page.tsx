'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/useToast';
import api from '@/lib/api';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart,
  Plus, Download, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusModal } from '@/components/ui/StatusModal';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function AccountingPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
  const [newExpense, setNewExpense] = useState({
    merchant: '', category: 'Office', amount: '',
    date: new Date().toISOString().split('T')[0], description: '',
  });

  const businessId = user?.organizations?.[0]?.id;

  const fetchData = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const [summaryRes, expensesRes] = await Promise.all([
        api.get(`/accounting/summary?businessId=${businessId}`),
        api.get(`/expenses?businessId=${businessId}`),
      ]);
      setSummary(summaryRes.data.data);
      setExpenses(expensesRes.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (token && businessId) fetchData(); }, [token, businessId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    try {
      await api.post('/expenses', { ...newExpense, amount: Number(newExpense.amount), businessId });
      setShowAddModal(false);
      setNewExpense({ merchant: '', category: 'Office', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      fetchData();
    } catch {
      setModalConfig({ title: 'Operation Failed', message: 'Failed to add expense.', type: 'error' });
      setShowModal(true);
    }
  };

  const exportData = () => {
    if (!expenses.length && !summary) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'FINANCIAL SUMMARY\n';
    csvContent += `Gross Revenue,$${summary?.gross_revenue || 0}\n`;
    csvContent += `Total Expenses,$${summary?.total_expenses || 0}\n`;
    csvContent += `Net Profit,$${summary?.net_profit || 0}\n`;
    csvContent += `Profit Margin,${summary?.profit_margin || 0}%\n\n`;
    csvContent += 'EXPENSE REPORT\nDate,Merchant,Category,Description,Amount\n';
    expenses.forEach(exp => {
      csvContent += `${exp.date},"${exp.merchant}","${exp.category}","${(exp.description || '').replace(/"/g, '""')}",${exp.amount}\n`;
    });
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `accounting_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Accounting</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time financial overview and expense tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={exportData}>Export CSV</Button>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAddModal(true)}>Add Expense</Button>
        </div>
      </motion.div>

      {/* Financial Cards */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₦${summary?.gross_revenue?.toLocaleString() || 0}`, subtitle: 'Income from Invoices', icon: TrendingUp, color: 'text-success', bg: 'bg-success-50' },
          { label: 'Total Expenses', value: `₦${summary?.total_expenses?.toLocaleString() || 0}`, subtitle: 'Operating Costs', icon: TrendingDown, color: 'text-danger', bg: 'bg-danger-50' },
          { label: 'Net Profit', value: `₦${summary?.net_profit?.toLocaleString() || 0}`, subtitle: `${summary?.profit_margin || 0}% Margin`, icon: DollarSign, color: summary?.net_profit >= 0 ? 'text-primary' : 'text-danger', bg: summary?.net_profit >= 0 ? 'bg-primary-50' : 'bg-danger-50' },
        ].map((card, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-tertiary">{card.label}</span>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon size={16} />
              </div>
            </div>
            <div className="text-xl font-semibold text-text-primary">{card.value}</div>
            <p className="text-xs text-text-tertiary mt-1.5">{card.subtitle}</p>
          </div>
        ))}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemAnim}>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">Recent Transactions</h3>
          </div>
          {expenses.length === 0 ? (
            <div className="py-16 text-center text-sm text-text-tertiary">No expenses recorded yet.</div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Date</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Merchant</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-left">Category</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {expenses.map((expense: any) => (
                    <tr key={expense.id} className="hover:bg-surface-secondary transition-colors">
                      <td className="px-4 py-4 text-xs text-text-tertiary whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text-primary">{expense.merchant}</div>
                        <div className="text-xs text-text-tertiary">{expense.description}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-medium rounded-lg bg-surface-tertiary text-text-secondary">{expense.category}</span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-text-primary text-right whitespace-nowrap">-${parseFloat(expense.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-surface rounded-2xl shadow-xl border border-border w-full max-w-md">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Add New Expense</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Merchant / Vendor</label>
                  <input type="text" required value={newExpense.merchant} onChange={(e) => setNewExpense({ ...newExpense, merchant: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="e.g. Adobe Creative Cloud" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Amount</label>
                    <input type="number" required min="0" step="0.01" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Date</label>
                    <input type="date" required value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                  <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all">
                    <option>Office</option><option>Software</option><option>Travel</option><option>Marketing</option><option>Contractors</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Description (Optional)</label>
                  <textarea value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all resize-none"
                    rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" size="md" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" size="md" className="flex-1">Add Expense</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <StatusModal isOpen={showModal} onClose={() => setShowModal(false)} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} actionLabel="Proceed" />
    </motion.div>
  );
}
