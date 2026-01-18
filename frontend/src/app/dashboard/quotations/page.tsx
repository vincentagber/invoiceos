'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';
import { Plus, Download, Search, FileText, Filter, Loader2, File, ArrowRightCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Quotation {
    id: number;
    quotation_number: string;
    client_name: string;
    issue_date: string;
    expiry_date: string;
    total: number;
    status: string;
    items: any[];
}

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [convertingId, setConvertingId] = useState<number | null>(null);
    const [settings, setSettings] = useState<any>({});
    const router = useRouter();

    useEffect(() => {
        fetchQuotations();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings/read.php?all=true');
            if (res.data) setSettings(res.data);
        } catch (e) {
            console.error("Failed to fetch settings", e);
        }
    }

    const fetchQuotations = async () => {
        try {
            const res = await api.get('/quotations/read.php');
            // Ensure data is array, otherwise default to empty array
            if (Array.isArray(res.data)) {
                setQuotations(res.data);
            } else {
                console.error("API returned non-array:", res.data);
                setQuotations([]);
            }
        } catch (error) {
            console.error(error);
            setQuotations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: number) => {
        setDownloadingId(id);
        try {
            const res = await api.get(`/quotations/read.php?id=${id}`);
            const data = res.data;
            await generateInvoicePDF(data, settings, 'quotation');
        } catch (error) {
            console.error("Failed to download PDF", error);
            alert("Failed to generate PDF");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleConvertToInvoice = async (id: number) => {
        if (!confirm("Convert this quotation to an invoice? This will create a new invoice draft.")) return;
        setConvertingId(id);
        try {
            const res = await api.post('/quotations/convert_to_invoice.php', { quotation_id: id });
            alert("Quotation converted successfully!");
            router.push('/dashboard/invoices');
        } catch (error) {
            console.error("Conversion failed", error);
            alert("Failed to convert quotation.");
        } finally {
            setConvertingId(null);
        }
    }

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            accepted: 'bg-green-50 text-green-700 ring-green-600/20',
            draft: 'bg-gray-50 text-gray-600 ring-gray-500/10',
            sent: 'bg-blue-50 text-blue-700 ring-blue-600/20',
            rejected: 'bg-red-50 text-red-700 ring-red-600/20',
        };
        const defaultStyle = styles.draft;

        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status.toLowerCase()] || defaultStyle}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredQuotations = Array.isArray(quotations) ? quotations.filter(q =>
        q.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quotations</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your price quotes.</p>
                </div>
                <Link
                    href="/dashboard/quotations/new"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    New Quote
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-1">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search quotations..."
                        className="block w-full rounded-lg border-gray-200 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border p-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredQuotations.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quote #</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredQuotations.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{quote.quotation_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {quote.client_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {quote.issue_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(quote.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={quote.status || 'draft'} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {quote.status !== 'accepted' && (
                                                    <button
                                                        onClick={() => handleConvertToInvoice(quote.id)}
                                                        disabled={convertingId === quote.id}
                                                        className="text-green-600 hover:text-green-800 p-1"
                                                        title="Convert to Invoice"
                                                    >
                                                        {convertingId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightCircle size={18} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDownload(quote.id)}
                                                    disabled={downloadingId === quote.id}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 p-1"
                                                    title="Download PDF"
                                                >
                                                    {downloadingId === quote.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Download size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <File size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No quotes found</h3>
                        <p className="text-gray-500 mt-1 max-w-sm">
                            Create a quote to send to your potential clients.
                        </p>
                        <Link
                            href="/dashboard/quotations/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                        >
                            <Plus size={16} />
                            Create Quote
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
