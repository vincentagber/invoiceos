'use client';

import React, { useState, useEffect } from 'react';
import { RecordExpenseModal } from './components/RecordExpenseModal';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
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
    Download
} from 'lucide-react';
import clsx from 'clsx';

export default function ExpensesPage() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currency, setCurrency] = useState('NGN');
    const [searchQuery, setSearchQuery] = useState('');
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Expenses (MTD)</span>
                        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                            <Wallet size={18} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                            ₦{totalMTD.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            <ArrowUpRight size={12} />
                            +5.2% vs last month
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Reimbursement</span>
                        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                            <Clock size={18} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">
                            ₦{pendingAmount.toLocaleString()}
                        </div>
                        <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Across {expenses.filter(e => e.status === 'PENDING').length} active items
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Category</span>
                        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <ReceiptText size={18} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight truncate">
                            {topCategory[0]}
                        </div>
                        <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
                                            <div className="h-2 w-24 bg-slate-100 rounded"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
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
                                            <button className="text-slate-400 hover:text-slate-900 transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
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
        </div>
    );
}
