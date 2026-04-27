'use client';

import React, { useState } from 'react';
import { 
    Search, 
    Bell, 
    Wallet, 
    Info,
    ChevronLeft,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { RecordExpenseModal } from './components/RecordExpenseModal';

export default function ExpensesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currency, setCurrency] = useState('NGN');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock expenses state
    const expenses: any[] = []; // Currently empty to match screenshot

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans antialiased">
            
            {/* Top Navigation Bar area */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-4">
                    <button className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses</h1>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search invoices, customers, settings.."
                            className="pl-10 pr-4 py-2 w-72 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5E6AD2] hover:bg-[#4E5AC2] text-white text-sm font-semibold shadow-sm transition-colors"
                    >
                        <Wallet size={16} /> Record Expense
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                
                {/* Controls Area */}
                <div className="flex justify-end">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency:</span>
                        <div className="relative">
                            <select 
                                className="appearance-none bg-transparent text-sm font-bold text-slate-900 pr-6 outline-none cursor-pointer"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                <option value="NGN">NGN (₦)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center min-h-[160px]">
                        <p className="text-sm font-medium text-slate-500 mb-2">Total Expenses (This Month)</p>
                        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                            {currency === 'NGN' ? '₦' : '$'}0.00
                        </h2>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center relative min-h-[160px]">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-500">Uncategorized</p>
                            <Info size={16} className="text-[#5E6AD2]" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">0</h2>
                            <span className="text-sm font-medium text-slate-500">transactions</span>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 w-1/4">Date</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 w-1/4">Merchant</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 w-1/4">Category</th>
                                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 w-1/4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <p className="text-sm font-medium text-slate-500">No expenses found for {currency}.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    // Map expenses here when available
                                    null
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Footer */}
                    <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">No results found</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">Previous</button>
                            <button className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Injection */}
            <RecordExpenseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(data) => {
                    console.log('Expense saved:', data);
                    // Add state update logic here when API is ready
                }}
            />
        </div>
    );
}
