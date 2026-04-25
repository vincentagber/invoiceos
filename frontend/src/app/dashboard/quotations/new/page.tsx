'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { StatusModal } from '@/components/ui/StatusModal';
import { Plus, Trash, Save, ArrowLeft, Eye, User as UserIcon, FileText, Send, Share2, Mail, MessageCircle, Copy, Check, X, Clock } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

// Reuse types but strictly for UI
interface Client {
    id: string;
    name: string;
    email?: string;
    address?: string;
}

interface QuoteItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <Clock className={clsx("animate-spin", className)} size={size} />
);

export default function NewQuotationPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [createdId, setCreatedId] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    // Form Stats
    const [clientId, setClientId] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([{ description: 'Service Estimate', quantity: 1, unitPrice: 100.00 }]);
    const [notes, setNotes] = useState('');

    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [clientsRes, settingsRes] = await Promise.all([
                    api.get('/clients'),
                    api.get('/business/me')
                ]);
                setClients(clientsRes.data);
                if (settingsRes.data) setSettings(settingsRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculateTotal = () => calculateSubtotal();

    const handleSubmit = async (e: React.FormEvent | null, status: string = 'DRAFT') => {
        if (e) e.preventDefault();
        if (!clientId) return alert('Please select a client');

        setSubmitting(true);
        try {
            const bizRes = await api.get('/business/me');
            const businessId = bizRes.data.id;

            const payload = {
                businessId,
                clientId: clientId,
                issueDate: new Date(issueDate).toISOString(),
                expiryDate: new Date(expiryDate || Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                items: items,
                totalAmount: calculateTotal(),
                status: status,
                quotationNumber: `QT-${Date.now()}` // Basic generator
            };

            const res = await api.post('/quotations', payload);

            const newId = res.data?.id;

            if (status === 'SENT') {
                if (newId) setCreatedId(newId.toString());
                setShowShareModal(true);
            } else {
                setModalConfig({
                    title: 'Proposal Archived',
                    message: 'Your strategic proposal has been successfully saved to the pipeline archive.',
                    type: 'success'
                });
                setShowModal(true);
            }
        } catch (error) {
            console.error(error);
            setModalConfig({
                title: 'Deployment Failed',
                message: 'We encountered an error while deploying your proposal. Please check your inputs.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        const textToCopy = `Here is your quotation from ${settings.name || 'us'}. Total Estimate: ${formatCurrency(calculateTotal())}`;
        navigator.clipboard.writeText(textToCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const clientDetails = clients.find(c => c.id === clientId);

    // Live Preview for Quote
    const QuotePreview = () => (
        <div className="bg-white shadow-2xl rounded-none sm:rounded-[2rem] aspect-[1/1.414] w-full max-w-[210mm] mx-auto p-[15mm] text-xs sm:text-sm leading-relaxed border border-slate-100 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        {settings.logo ? (
                            <img src={settings.logo} alt="Company Logo" className="w-32 h-auto object-contain" />
                        ) : (
                            <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">
                                {settings.name?.substring(0, 2).toUpperCase() || 'OS'}
                            </div>
                        )}
                    </div>
                    <div className="text-slate-500 space-y-1 font-medium">
                        <p className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-1">Origin Entity</p>
                        <p className="text-[11px]">{settings.name}</p>
                        {settings.address && <p className="text-[11px]">{settings.address}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">QUOTATION</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #EST-DRAFT</p>
                </div>
            </div>

            {/* Bill To & Dates */}
            <div className="mt-16 flex justify-between border-t border-slate-100 pt-10">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recipient Intelligence</h3>
                    {clientDetails ? (
                        <div className="space-y-1">
                            <p className="font-heading font-bold text-slate-900 text-lg tracking-tight">{clientDetails.name}</p>
                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{clientDetails.email}</p>
                        </div>
                    ) : (
                        <p className="text-slate-300 italic font-medium">Select a partner...</p>
                    )}
                </div>
                <div className="text-right space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployment Date</p>
                        <p className="font-heading font-bold text-slate-900">{issueDate}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Validity Window</p>
                        <p className="font-heading font-bold text-slate-900">{expiryDate || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-16 overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Stream</th>
                            <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Qty</th>
                            <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Unit Yield</th>
                            <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-5 px-6 font-bold text-slate-900">{item.description || <span className="text-slate-300 italic font-medium">Describe stream...</span>}</td>
                                <td className="py-5 px-6 text-right text-slate-500 font-bold tabular-nums">{item.quantity}</td>
                                <td className="py-5 px-6 text-right text-slate-500 font-bold tabular-nums">{formatCurrency(item.unitPrice)}</td>
                                <td className="py-5 px-6 text-right font-black text-slate-900 tabular-nums">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mt-10 flex justify-end">
                <div className="w-64 space-y-3 bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
                    <div className="flex justify-between items-center opacity-60">
                        <span className="text-[10px] font-black uppercase tracking-widest">Subtotal Estimate</span>
                        <span className="text-xs font-bold tabular-nums">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest">Estimated Yield</span>
                        <span className="text-2xl font-heading font-black tracking-tighter tabular-nums">{formatCurrency(calculateTotal())}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {(notes || settings.footer_note) && (
                <div className="mt-16 pt-8 border-t border-slate-100 text-slate-400 text-[11px] font-medium leading-relaxed">
                    <p className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-3">Intelligence Notes</p>
                    {notes && <p className="whitespace-pre-wrap italic opacity-80">"{notes}"</p>}
                </div>
            )}
        </div>
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-10 flex-shrink-0 z-30">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/quotations" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-heading font-black text-slate-900 tracking-tighter uppercase leading-none">New Proposal</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuring Estimated Flow</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden h-11 px-4 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest border border-slate-200"
                        onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                    >
                        {showPreviewMobile ? 'Edit' : 'Preview'}
                    </button>

                    <button
                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                        disabled={submitting}
                        className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={16} />
                        <span>Save Archive</span>
                    </button>

                    <button
                        onClick={(e) => handleSubmit(e, 'SENT')}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Syncing...' : (
                            <>
                                <Send size={16} />
                                <span>Deploy Quote</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tighter uppercase">Proposal Deployed</h3>
                            <button onClick={() => router.push('/dashboard/quotations')} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-10 space-y-10">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Check size={40} />
                                </div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Proposal is Active</p>
                                <p className="text-slate-400 text-xs mt-2 font-medium">The quotation has been successfully archived and is ready for client review.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <a
                                    href={`mailto:${clientDetails?.email}?subject=Proposal from ${settings.name}&body=Please find the attached proposal for your review.`}
                                    className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                                >
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Mail size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Email</span>
                                </a>

                                <a
                                    href={`https://wa.me/?text=Here is the proposal from ${settings.name}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 hover:border-green-500 hover:bg-green-50/30 transition-all group cursor-pointer"
                                >
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <MessageCircle size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">WhatsApp</span>
                                </a>

                                <button
                                    onClick={handleCopyLink}
                                    className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 hover:border-slate-500 hover:bg-slate-50 transition-all group cursor-pointer"
                                >
                                    <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {copySuccess ? <Check size={24} className="text-emerald-600" /> : <Copy size={24} />}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{copySuccess ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50/50 text-center">
                            <button
                                onClick={() => router.push('/dashboard/quotations')}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Return to Pipeline
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Editor Area */}
            <main className="flex-1 flex overflow-hidden relative">

                {/* Left Panel: Form Editor */}
                <div className={clsx(
                    "flex-1 overflow-y-auto p-10 lg:p-16 transition-all duration-300 bg-slate-50",
                    showPreviewMobile ? "hidden lg:block w-full lg:w-[45%]" : "w-full lg:w-[45%]"
                )}>
                    <div className="max-w-2xl mx-auto space-y-12">

                        {/* Section: Who & When */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-10">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <UserIcon size={14} className="text-indigo-600" />
                                Partner & Validity
                            </h2>
                            <div className="grid gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Client Partner</label>
                                    <select
                                        className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none border"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select a Strategic Partner...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</label>
                                        <input
                                            type="date"
                                            className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none border"
                                            value={issueDate}
                                            onChange={(e) => setIssueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validity Expiry</label>
                                        <input
                                            type="date"
                                            className="block w-full rounded-2xl border-slate-200 bg-slate-50/50 px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none border"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Items */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-10">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <FileText size={14} className="text-indigo-600" />
                                Revenue Projections
                            </h2>

                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={index} className="group relative bg-slate-50/50 p-8 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stream Description</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Enterprise Architecture Audit"
                                                className="block w-full rounded-2xl border-slate-200 bg-white px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none border"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                                <input
                                                    type="number"
                                                    placeholder="1"
                                                    className="block w-full rounded-2xl border-slate-200 bg-white px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none border"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Yield (₦)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="block w-full rounded-2xl border-slate-200 bg-white px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none border"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="absolute -top-3 -right-3 h-10 w-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addItem}
                                className="w-full py-5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-[2rem] border border-dashed border-indigo-200 hover:border-indigo-400 transition-all"
                            >
                                <Plus size={16} /> Add Revenue Stream
                            </button>
                        </div>

                        {/* Section: Notes */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Intelligence Notes</label>
                            <textarea
                                rows={4}
                                className="block w-full rounded-3xl border-slate-200 bg-slate-50/50 px-8 py-6 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none border"
                                placeholder="Add strategic notes or validity terms..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className={clsx(
                    "hidden lg:flex flex-1 bg-slate-900 overflow-y-auto p-16 justify-center items-start shadow-inner relative",
                    showPreviewMobile && "!flex absolute inset-0 z-20"
                )}>
                    {/* Ambient Background Glow */}
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] pointer-events-none" />
                    
                    <div className="scale-[0.5] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.8] xl:scale-95 2xl:scale-100 origin-top transition-transform duration-500 ease-out z-10">
                        <QuotePreview />
                    </div>
                </div>
            </main>

            <StatusModal 
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (modalConfig.type === 'success') {
                        router.push('/dashboard/quotations');
                    }
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel={modalConfig.type === 'success' ? 'View Pipeline' : 'Continue'}
            />
        </div>
    );
}
