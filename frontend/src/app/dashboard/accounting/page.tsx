'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Plus,
    Download,
    Calendar,
    Briefcase
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountingPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newExpense, setNewExpense] = useState({
        merchant: '',
        category: 'Office',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, expensesRes] = await Promise.all([
                api.get('/accounting/summary.php'),
                api.get('/accounting/expenses.php')
            ]);
            setSummary(summaryRes.data.data);
            setExpenses(expensesRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/accounting/expenses.php', newExpense);
            setShowAddModal(false);
            setNewExpense({
                merchant: '',
                category: 'Office',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
            fetchData(); // Reload
        } catch (error) {
            alert('Failed to add expense');
        }
    };

    const exportData = () => {
        if (!expenses.length && !summary) return;

        // 1. Prepare CSV Content
        let csvContent = "data:text/csv;charset=utf-8,";

        // Summary Section
        csvContent += "FINANCIAL SUMMARY\n";
        csvContent += `Gross Revenue,₦${summary?.gross_revenue || 0}\n`;
        csvContent += `Total Expenses,₦${summary?.total_expenses || 0}\n`;
        csvContent += `Net Profit,₦${summary?.net_profit || 0}\n`;
        csvContent += `Profit Margin,${summary?.profit_margin || 0}%\n\n`;

        // Expenses Section
        csvContent += "EXPENSE REPORT\n";
        csvContent += "Date,Merchant,Category,Description,Amount\n";

        expenses.forEach(exp => {
            const row = [
                exp.date,
                `"${exp.merchant.replace(/"/g, '""')}"`, // Escape quotes
                exp.category,
                `"${(exp.description || '').replace(/"/g, '""')}"`,
                exp.amount
            ].join(",");
            csvContent += row + "\n";
        });

        // 2. Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `accounting_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8">Loading Financial Data...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>
                    <p className="text-gray-500">Real-time financial overview and expense tracking.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={48} className="text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                        ₦{summary?.gross_revenue?.toLocaleString()}
                    </h3>
                    <div className="mt-4 flex items-center text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                        <TrendingUp size={14} className="mr-1" />
                        <span>Income from Invoices</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={48} className="text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                        ₦{summary?.total_expenses?.toLocaleString()}
                    </h3>
                    <div className="mt-4 flex items-center text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full">
                        <TrendingDown size={14} className="mr-1" />
                        <span>Operating Costs</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={48} className="text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Net Profit</p>
                    <h3 className={`text-3xl font-bold ${summary?.net_profit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        ₦{summary?.net_profit?.toLocaleString()}
                    </h3>
                    <div className={`mt-4 flex items-center text-sm w-fit px-2 py-1 rounded-full ${summary?.net_profit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                        <PieChart size={14} className="mr-1" />
                        <span>{summary?.profit_margin}% Margin</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant / Invoice</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {expenses.length > 0 ? expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{expense.merchant}</div>
                                        <div className="text-xs text-gray-500">{expense.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                        -₦{parseFloat(expense.amount).toLocaleString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No expenses recorded yet. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Add New Expense</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Merchant / Vendor</label>
                                <input
                                    type="text"
                                    required
                                    value={newExpense.merchant}
                                    onChange={(e) => setNewExpense({ ...newExpense, merchant: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    placeholder="e.g. Adobe Creative Cloud"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₦</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={newExpense.amount}
                                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            className="w-full pl-7 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                >
                                    <option>Office</option>
                                    <option>Software</option>
                                    <option>Travel</option>
                                    <option>Marketing</option>
                                    <option>Contractors</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    rows={2}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
                                >
                                    Add Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
