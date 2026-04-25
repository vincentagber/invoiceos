'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Plus, Eye, Download, Search, Pencil, Trash2 } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';

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
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [settings, setSettings] = useState<any>({});

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
            const res = await api.get(`/invoices?businessId=${bizRes.data.id}`);
            setInvoices(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: string) => {
        setDownloadingId(id as any);
        try {
            const res = await api.get(`/invoices/${id}`);
            const invoiceData = res.data;
            await generateInvoicePDF(invoiceData, settings);
        } catch (error) {
            console.error("Failed to download PDF", error);
            alert("Failed to generate PDF");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;

        try {
            await api.delete(`/invoices/${id}`);
            // Remove from local state
            setInvoices(invoices.filter(inv => inv.id !== id));
        } catch (error) {
            console.error("Failed to delete invoice", error);
            alert("Failed to delete invoice");
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <Link
                    href="/dashboard/invoices/new"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                >
                    <Plus size={18} />
                    New Invoice
                </Link>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-md shadow-sm max-w-md">
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search invoices..."
                    className="flex-1 border-none focus:ring-0 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Number</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No invoices found.</td></tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-indigo-600 tabular-nums">
                                            <Link href={`/dashboard/invoices/${inv.id}/edit`} className="hover:underline">
                                                {inv.invoiceNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[13px] font-medium text-slate-900">{inv.client?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-500 tabular-nums">{inv.issueDate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[13px] font-bold text-slate-900 tabular-nums">{formatCurrency(inv.totalAmount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-md 
                                                ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                    inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleDownload(inv.id)}
                                                    disabled={downloadingId === inv.id}
                                                    className="text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                                                    title="Download PDF"
                                                >
                                                    {downloadingId === inv.id ? (
                                                        <span className="animate-spin">⌛</span>
                                                    ) : (
                                                        <Download size={18} />
                                                    )}
                                                </button>

                                                <Link
                                                    href={`/dashboard/invoices/${inv.id}/edit`}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit Invoice"
                                                >
                                                    <Pencil size={18} />
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete Invoice"
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                        No invoices found.
                    </div>
                ) : (
                    filteredInvoices.map((inv) => (
                        <div key={inv.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Link href={`/dashboard/invoices/${inv.id}/edit`} className="text-sm font-bold text-indigo-600 hover:underline block">
                                        {inv.invoiceNumber}
                                    </Link>
                                    <p className="text-sm font-medium text-gray-900 mt-0.5">{inv.client?.name}</p>
                                </div>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full 
                                    ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'}`}>
                                    {inv.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{inv.issueDate}</span>
                                <span className="font-bold text-gray-900">{formatCurrency(inv.totalAmount)}</span>
                            </div>

                            <div className="pt-3 border-t border-gray-50 flex justify-end gap-4">
                                <button
                                    onClick={() => handleDownload(inv.id)}
                                    disabled={downloadingId === inv.id}
                                    className="text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors flex items-center gap-1 text-xs"
                                >
                                    {downloadingId === inv.id ? <span className="animate-spin">⌛</span> : <Download size={16} />}
                                    PDF
                                </button>
                                <Link
                                    href={`/dashboard/invoices/${inv.id}/edit`}
                                    className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs"
                                >
                                    <Pencil size={16} />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(inv.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
