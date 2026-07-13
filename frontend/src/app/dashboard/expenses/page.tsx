'use client';

import React, { useState, useEffect } from 'react';
import { RecordExpenseModal } from './components/RecordExpenseModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { 
    Search, 
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Filter,
    TrendingDown,
    ArrowUpRight,
    Receipt,
    History,
    PieChart,
    Plus,
    AlertCircle,
    Wallet,
    MoreHorizontal,
    ReceiptText,
    Clock,
    FileUp,
    Download,
    Pencil,
    Trash2,
    X,
    Save,
    Calendar,
    Tag
} from 'lucide-react';
import clsx from 'clsx';

export default function ExpensesPage() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currency, setCurrency] = useState('NGN');
    const [searchQuery, setSearchQuery] = useState('');
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [editLoading, setEditLoading] = useState(false);
    const [actionsOpen, setActionsOpen] = useState<string | null>(null);
    const [confirmState, setConfirmState] = useState<{ isOpen: boolean; onConfirm: () => void; title: string; message: string; variant?: 'danger' | 'warning' | 'info' }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

    const fetchExpenses = async () => {
        try {
            const bizRes = await api.get('/business/me');
            const res = await api.get(`/expenses?businessId=${bizRes.data.id}`);
            setExpenses(res.data || []);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchExpenses();
    }, [user]);

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
            receipt_url: expense.receipt_url || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const bizRes = await api.get('/business/me');
            await api.put(`/expenses/${editingExpense.id}`, {
                ...editForm,
                businessId: bizRes.data.id
            });
            setIsEditModalOpen(false);
            setEditingExpense(null);
            fetchExpenses();
        } catch (error) {
            console.error('Failed to update expense', error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setConfirmState({
            isOpen: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/expenses/${id}`);
                    setExpenses(expenses.filter(e => e.id !== id));
                } catch (error) {
                    console.error('Failed to delete expense', error);
                }
            },
            title: 'Delete Expense',
            message: 'Are you sure you want to delete this expense?',
            variant: 'danger'
        });
    };

    const filteredExpenses = expenses.filter(exp => 
        (exp.currency === currency || currency === 'ALL') &&
        (exp.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         exp.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         exp.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // MTD Calculation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const mtdExpenses = expenses.filter(exp => new Date(exp.date) >= startOfMonth);
    const totalMTD = mtdExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    // Top Category
    const categoryTotals = expenses.reduce((acc: any, exp) => {
        const cat = exp.category || 'Other';
        acc[cat] = (acc[cat] || 0) + Number(exp.amount);
        return acc;
    }, {});
    const topCategory = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1])[0] || ['None', 0];

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const pendingAmount = expenses.filter(exp => exp.status === 'PENDING').reduce((sum, exp) => sum + Number(exp.amount), 0);

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expenses</h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Monitor institutional outgoings, manage vendor payables, and track operational expenditure.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3.5 px-8 font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={16} />
                        Log New Expense
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-slate-200">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">Total Expenses (MTD)</span>
                        <div className="p-1.5 rounded-md bg-slate-50 text-slate-400">
                            <Wallet size={14} />
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <div className="text-2xl font-semibold text-slate-900">₦{totalMTD.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-1.5">
                            <ArrowUpRight size={14} className="text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-600">+5.2% vs last month</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">Pending Reimbursement</span>
                        <div className="p-1.5 rounded-md bg-slate-50 text-slate-400">
                            <Clock size={14} />
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <div className="text-2xl font-semibold text-slate-900">₦{pendingAmount.toLocaleString()}</div>
                        <div className="mt-1.5 text-xs font-medium text-slate-400">
                            Across {expenses.filter(e => e.status === 'PENDING').length} active items
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">Top Category</span>
                        <div className="p-1.5 rounded-md bg-slate-50 text-slate-400">
                            <ReceiptText size={14} />
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <div className="text-lg font-semibold text-slate-900 truncate">{topCategory[0]}</div>
                        <div className="mt-1.5 text-xs font-medium text-slate-400">
                            ₦{(topCategory[1] as number).toLocaleString()} this month
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl px-4 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
                        <Filter size={16} />
                        Filter
                    </button>
                    <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none cursor-pointer pr-10"
                    >
                        <option value="NGN">NGN (₦)</option>
                        <option value="USD">USD ($)</option>
                        <option value="ALL">All Currencies</option>
                    </select>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search merchant or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Yield Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant / Entity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Transaction Yield</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
                                            <div className="h-2 w-24 bg-slate-100 rounded"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 rounded-full bg-slate-50 text-slate-300">
                                                <Receipt size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Expenditure Logged</p>
                                                <p className="text-xs text-slate-400 font-medium">Your operational ledger is currently clear.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6 text-sm font-black text-slate-900 tracking-tighter uppercase">
                                            EXP-{new Date(exp.date).getFullYear()}-{exp.id.slice(0, 4).toUpperCase()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200 transition-transform group-hover:scale-110">
                                                    <History size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 tracking-tight">{exp.merchant || 'Institutional Payee'}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{exp.description || 'Internal Operational Spend'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Timestamp</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                                                {exp.category || 'Unclassified'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-slate-900">{formatCurrency(exp.amount, exp.currency)}</span>
                                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Debit Confirmed</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={clsx(
                                                "inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border",
                                                exp.status === 'PAID' || exp.status === 'APPROVED'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {exp.status || 'APPROVED'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="relative inline-block text-left">
                                                <button 
                                                    onClick={() => setActionsOpen(actionsOpen === exp.id ? null : exp.id)}
                                                    className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {actionsOpen === exp.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(null)} />
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-20">
                                                            <button 
                                                                onClick={() => { openEditModal(exp); setActionsOpen(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                                                            >
                                                                <Pencil size={14} /> Edit Expense
                                                            </button>
                                                            <button 
                                                                onClick={() => { handleDelete(exp.id); setActionsOpen(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {filteredExpenses.length} transactions integrated in current view
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-30" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-30" disabled>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <RecordExpenseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchExpenses}
            />

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 sm:p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">Edit Expense</h2>
                                </div>
                                <button 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Merchant / Entity</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.merchant || ''}
                                            onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            placeholder="e.g. AWS, Adobe, Office Supplies"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Category</label>
                                            <select
                                                value={editForm.category || ''}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            >
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
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Amount</label>
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                value={editForm.amount || ''}
                                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Date</label>
                                            <input
                                                type="date"
                                                value={editForm.date || ''}
                                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Currency</label>
                                            <select
                                                value={editForm.currency || 'NGN'}
                                                onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            >
                                                <option value="NGN">NGN</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Description</label>
                                        <textarea
                                            rows={3}
                                            value={editForm.description || ''}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                                            placeholder="Optional description..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Status</label>
                                        <select
                                            value={editForm.status || 'PENDING'}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                    <Save size={16} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
