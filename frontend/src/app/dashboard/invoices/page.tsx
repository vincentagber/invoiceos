'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Plus, Download, Search, Pencil, Trash2 } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';
import { StatusModal } from '@/components/ui/StatusModal';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';

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
    const [showCreateModal, setShowCreateModal] = useState(false);

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
                setInvoices(res.data);
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

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track all your invoices.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5E6AD2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4E5AC2] transition-all active:scale-95"
                >
                    <Plus size={16} />
                    New Invoice
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-1">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by invoice number or client..."
                        className="block w-full rounded-2xl border-slate-200 bg-white pl-12 pr-4 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 sm:text-sm h-14 border transition-all outline-none font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Partner</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Yield</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Syncing Engine Data...</td></tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Active Revenue Flows Found</td></tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <Link href={`/dashboard/invoices/${inv.id}/edit`} className="font-heading font-black text-indigo-600 tracking-tighter hover:text-indigo-700 transition-colors">
                                                {inv.invoiceNumber}
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[13px] font-bold text-slate-900">{inv.client?.name}</td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-wider">{inv.issueDate}</td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[14px] font-black text-slate-900 tracking-tight">{formatCurrency(inv.totalAmount)}</td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={clsx(
                                                "inline-flex px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-lg shadow-sm border",
                                                inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleDownload(inv.id)}
                                                    disabled={downloadingId === inv.id}
                                                    className="p-2 text-slate-300 hover:text-indigo-600 transition-all rounded-xl hover:bg-indigo-50"
                                                    title="Export PDF"
                                                >
                                                    {downloadingId === inv.id ? <div className="h-4 w-4 animate-spin border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Download size={18} />}
                                                </button>
                                                <Link
                                                    href={`/dashboard/invoices/${inv.id}/edit`}
                                                    className="p-2 text-slate-300 hover:text-blue-600 transition-all rounded-xl hover:bg-blue-50"
                                                    title="Modify Flow"
                                                >
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50"
                                                    title="Delete Flow"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile/Small Screen Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Syncing...</div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-white rounded-3xl border border-dashed border-slate-200">No Flows Found</div>
                ) : (
                    filteredInvoices.map((inv) => (
                        <div key={inv.id} className="bg-white rounded-[2rem] border border-slate-200/60 p-8 space-y-6 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={clsx(
                                        "inline-flex px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-md border mb-3",
                                        inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        inv.status === 'OVERDUE' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    )}>
                                        {inv.status}
                                    </span>
                                    <Link href={`/dashboard/invoices/${inv.id}/edit`} className="block font-heading font-black text-lg text-slate-900 tracking-tighter">
                                        {inv.invoiceNumber}
                                    </Link>
                                    <p className="text-sm font-bold text-slate-500 mt-1">{inv.client?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{formatCurrency(inv.totalAmount)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{inv.issueDate}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-end gap-2">
                                <button
                                    onClick={() => handleDownload(inv.id)}
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={14} /> PDF
                                </button>
                                <Link
                                    href={`/dashboard/invoices/${inv.id}/edit`}
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Pencil size={14} /> Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(inv.id)}
                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <StatusModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel="Proceed"
            />
            <CreateInvoiceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => { setShowCreateModal(false); fetchInvoices(); }}
            />
        </div>
    );
}
