'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';
import { Plus, Download, Search, FileText, Filter, Loader2, File, ArrowRightCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { StatusModal } from '@/components/ui/StatusModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Quotation {
    id: string;
    quotationNumber: string;
    client: { name: string };
    issueDate: string;
    expiryDate: string;
    totalAmount: number;
    status: string;
    items: any[];
}

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [convertingId, setConvertingId] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; onConfirm: () => void; title: string; message: string; variant?: 'danger' | 'warning' | 'info' }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });
    const [settings, setSettings] = useState<any>({});
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
    const router = useRouter();

    useEffect(() => {
        fetchQuotations();
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

    const fetchQuotations = async () => {
        try {
            const bizRes = await api.get('/business/me');
            if (bizRes.data && bizRes.data.id) {
                const res = await api.get(`/quotations?businessId=${bizRes.data.id}`);
                if (Array.isArray(res.data)) {
                    setQuotations(res.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch quotations", error);
            setQuotations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: string) => {
        setDownloadingId(id);
        try {
            const res = await api.get(`/quotations/${id}`);
            const data = res.data;
            await generateInvoicePDF(data, settings, 'quotation');
        } catch (error) {
            console.error("Failed to download PDF", error);
            setModalConfig({
                title: 'Export Failed',
                message: 'We could not generate the PDF proposal. Please try again.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleConvertToInvoice = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            onConfirm: async () => {
                setConvertingId(id);
                try {
                    await api.post(`/quotations/${id}/convert`);
                    setModalConfig({
                        title: 'Pipeline Deployment',
                        message: 'Quotation has been successfully converted to a revenue-generating invoice draft.',
                        type: 'success'
                    });
                    setShowModal(true);
                } catch (error) {
                    console.error("Conversion failed", error);
                    setModalConfig({
                        title: 'Conversion Error',
                        message: 'Failed to deploy quotation to invoice pipeline. Please check system logs.',
                        type: 'error'
                    });
                    setShowModal(true);
                } finally {
                    setConvertingId(null);
                }
            },
            title: 'Convert to Invoice',
            message: 'Convert this quotation to an invoice? This will create a new invoice draft.',
            variant: 'warning'
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        return (
            <span className={clsx(
                "inline-flex px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-lg shadow-sm border",
                status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                status === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                'bg-slate-50 text-slate-700 border-slate-100'
            )}>
                {status}
            </span>
        );
    };

    const filteredQuotations = Array.isArray(quotations) ? quotations.filter(q =>
        q.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tighter uppercase leading-none">Quote Matrix</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Proposal & Bid Pipeline</p>
                </div>
                <Link
                    href="/dashboard/quotations/new"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    New Proposal
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-1">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search proposals by number or client..."
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
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposal ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Prospect</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Value</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                        No Proposals in Pipeline
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="font-heading font-black text-slate-900 tracking-tighter">{quote.quotationNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[13px] font-bold text-slate-900">
                                            {quote.client?.name}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            {quote.issueDate}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[14px] font-black text-slate-900 tracking-tight">
                                            {formatCurrency(quote.totalAmount)}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <StatusBadge status={quote.status || 'DRAFT'} />
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {quote.status !== 'ACCEPTED' && (
                                                    <button
                                                        onClick={() => handleConvertToInvoice(quote.id)}
                                                        disabled={convertingId === quote.id}
                                                        className="p-2 text-slate-300 hover:text-emerald-600 transition-all rounded-xl hover:bg-emerald-50"
                                                        title="Deploy to Invoice"
                                                    >
                                                        {convertingId === quote.id ? <Loader2 size={18} className="animate-spin" /> : <ArrowRightCircle size={18} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDownload(quote.id)}
                                                    disabled={downloadingId === quote.id}
                                                    className="p-2 text-slate-300 hover:text-indigo-600 transition-all rounded-xl hover:bg-indigo-50"
                                                    title="Export Proposal"
                                                >
                                                    {downloadingId === quote.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
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
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredQuotations.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-300">
                            <File size={32} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Proposals Found</h3>
                    </div>
                ) : (
                    filteredQuotations.map((quote) => (
                        <div key={quote.id} className="bg-white rounded-[2rem] border border-slate-200/60 p-8 space-y-6 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <StatusBadge status={quote.status || 'DRAFT'} />
                                    <h3 className="mt-3 font-heading font-black text-lg text-slate-900 tracking-tighter">{quote.quotationNumber}</h3>
                                    <p className="text-sm font-bold text-slate-500 mt-1">{quote.client?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{formatCurrency(quote.totalAmount)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{quote.issueDate}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-end gap-2">
                                {quote.status !== 'ACCEPTED' && (
                                    <button
                                        onClick={() => handleConvertToInvoice(quote.id)}
                                        className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowRightCircle size={14} /> Convert
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDownload(quote.id)}
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={14} /> PDF
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({ ...prev, isOpen: false })); }}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant || 'danger'}
            />
            <StatusModal 
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (modalConfig.title === 'Pipeline Deployment') {
                        router.push('/dashboard/invoices');
                    }
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel={modalConfig.title === 'Pipeline Deployment' ? 'View Invoices' : 'Continue'}
            />
        </div>
    );
}

