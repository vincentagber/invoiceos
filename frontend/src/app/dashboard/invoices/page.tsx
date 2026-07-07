'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { 
    Plus, 
    Download, 
    Search, 
    Pencil, 
    Trash2, 
    Filter, 
    TrendingUp, 
    CheckCircle, 
    FileText, 
    MoreVertical,
    Clock,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';
import { StatusModal } from '@/components/ui/StatusModal';

interface Invoice {
    id: string;
    invoiceNumber: string;
    issueDate: string;
    totalAmount: number;
    status: string;
    client: { name: string };
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [settings, setSettings] = useState<any>({});
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    useEffect(() => {
        fetchInvoices();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/business/me');
            if (res.data) setSettings(res.data);
        } catch (e) {
            console.error("Failed to fetch settings", e);
        }
    }

    const fetchInvoices = async () => {
        try {
            const bizRes = await api.get('/business/me');
            if (bizRes.data && bizRes.data.id) {
                const res = await api.get(`/invoices?businessId=${bizRes.data.id}`);
                const data = Array.isArray(res.data) ? res.data : (res.data?.invoices || []);
                setInvoices(data);
            }
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: string) => {
        setDownloadingId(id);
        try {
            const res = await api.get(`/invoices/${id}`);
            const invoiceData = res.data;
            await generateInvoicePDF(invoiceData, settings);
        } catch (error) {
            console.error("Failed to download PDF", error);
            setModalConfig({
                title: 'Export Failed',
                message: 'We could not generate the PDF for this invoice. Please check your network connection.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;

        try {
            await api.delete(`/invoices/${id}`);
            setInvoices(invoices.filter(inv => inv.id !== id));
            setModalConfig({
                title: 'Revenue Stream Terminated',
                message: 'The invoice has been successfully removed from your active ledger.',
                type: 'info'
            });
            setShowModal(true);
        } catch (error) {
            console.error("Failed to delete invoice", error);
            setModalConfig({
                title: 'Deletion Error',
                message: 'An error occurred while attempting to remove the invoice. Access denied or system error.',
                type: 'error'
            });
            setShowModal(true);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Summary Calculations
    const totalOutstanding = invoices
        .filter(inv => inv.status !== 'PAID' && inv.status !== 'DRAFT')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const paidThisMonth = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const draftsCount = invoices.filter(inv => inv.status === 'DRAFT').length;

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Invoices</h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Manage and track all billing documents and institutional revenue streams.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/dashboard/invoices/new"
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3.5 px-8 font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={16} />
                        New Invoice
                    </Link>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-slate-200">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">Total Outstanding</span>
                        <div className="p-1.5 rounded-md bg-rose-50 text-rose-500">
                            <Clock size={14} />
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <div className="text-2xl font-semibold text-slate-900">{formatCurrency(totalOutstanding)}</div>
                        <div className="flex items-center gap-1 mt-1.5">
                            <TrendingUp size={14} className="text-rose-500" />
                            <span className="text-xs font-medium text-rose-500">+12% from last month</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">Paid this Month</span>
                        <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-500">
                            <CheckCircle size={14} />
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <div className="text-2xl font-semibold text-slate-900">{formatCurrency(paidThisMonth)}</div>
                        <div className="mt-1.5 text-xs font-medium text-slate-400">
                            {invoices.filter(i => i.status === 'PAID').length} invoices cleared
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">Drafts</span>
                        <div className="p-1.5 rounded-md bg-slate-50 text-slate-400">
                            <Pencil size={14} />
                        </div>
                    </div>
                    <div className="px-5 py-4">
                        <div className="text-2xl font-semibold text-slate-900">{draftsCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-slate-400">Awaiting approval</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl px-4 py-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
                        <Filter size={16} />
                        Filters
                    </button>
                    <select className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all">
                        <option>All Statuses</option>
                        <option>Paid</option>
                        <option>Pending</option>
                        <option>Overdue</option>
                    </select>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search client or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                    />
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Partner</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Issued</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 rounded-full bg-slate-50 text-slate-300">
                                                <FileText size={32} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">No Active Revenue Flows Found</p>
                                            <Link 
                                                href="/dashboard/invoices/new"
                                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-slate-200 active:scale-95"
                                            >
                                                <Plus size={14} />
                                                Create First Invoice
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <Link href={`/dashboard/invoices/${inv.id}/edit`} className="inline-flex items-center gap-1 text-sm font-black text-slate-900 hover:text-slate-600 transition-colors">
                                                {inv.invoiceNumber}
                                                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 font-black text-[10px] border border-slate-200">
                                                    {inv.client?.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{inv.client?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{inv.issueDate}</td>
                                        <td className="px-8 py-6 text-right text-sm font-black text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                                        <td className="px-8 py-6">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                inv.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDownload(inv.id)}
                                                    disabled={downloadingId === inv.id}
                                                    className="p-2.5 text-slate-300 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100"
                                                >
                                                    {downloadingId === inv.id ? <div className="h-4 w-4 animate-spin border-2 border-slate-900 border-t-transparent rounded-full" /> : <Download size={18} />}
                                                </button>
                                                <div className="relative group/menu">
                                                    <button className="p-2.5 text-slate-300 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {/* Context Menu Mockup */}
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 hidden group-hover/menu:block z-50">
                                                        <Link href={`/dashboard/invoices/${inv.id}/edit`} className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                                                            <Pencil size={14} /> Edit Invoice
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(inv.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Showing {filteredInvoices.length} of {invoices.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-30" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            <button className="w-8 h-8 rounded-xl bg-slate-900 text-white text-[10px] font-black">1</button>
                            <button className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black hover:border-slate-900 transition-all">2</button>
                        </div>
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <StatusModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel="Proceed"
            />
        </div>
    );
}
