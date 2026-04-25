'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { StatusModal } from '@/components/ui/StatusModal';
import { useRouter } from 'next/navigation';
import { 
    Plus, 
    Trash, 
    Save, 
    ArrowLeft, 
    Eye, 
    User as UserIcon, 
    FileText, 
    Send, 
    Check, 
    X,
    Settings,
    Coins,
    Percent,
    ShieldCheck,
    Clock,
    Sparkles,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { ConversionIntelligence } from './components/ConversionIntelligence';

interface Client {
    id: string;
    name: string;
    email?: string;
    address?: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <Clock className={clsx("animate-spin", className)} size={size} />
);

export default function NewInvoicePage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    // Form State
    const [clientId, setClientId] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([{ description: 'Professional Services', quantity: 1, unitPrice: 150.00 }]);
    const [notes, setNotes] = useState('');
    const [currency, setCurrency] = useState('NGN');
    const [taxRate, setTaxRate] = useState(0);
    const [discount, setDiscount] = useState(0);

    // UI state
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [bizRes, clientsRes] = await Promise.all([
                    api.get('/business/me'),
                    api.get('/clients') // Backend will handle business filtering via auth context
                ]);
                setClients(clientsRes.data || []);
                if (bizRes.data) setSettings(bizRes.data);
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

    const generateAIDescription = async (index: number) => {
        const item = items[index];
        if (!item.description) return;
        try {
            const res = await api.post('/ai/generate-description', { serviceType: item.description });
            updateItem(index, 'description', res.data.description);
        } catch (error) {
            console.error("AI Generation failed", error);
        }
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const discountAmount = Number(discount) || 0;
    const total = subtotal + taxAmount - discountAmount;

    const handleSubmit = async (e: React.FormEvent | null, status: 'draft' | 'sent' = 'draft') => {
        if (e) e.preventDefault();
        if (!clientId) return alert('Please select a client');

        setSubmitting(true);
        try {
            const bizRes = await api.get('/business/me');
            const payload = {
                businessId: bizRes.data.id,
                clientId: clientId,
                issueDate: new Date(issueDate).toISOString(),
                dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
                currency,
                taxRate: Number(taxRate),
                discountAmount: Number(discount),
                totalAmount: total,
                items: items,
                notes: notes,
                status: status.toUpperCase()
            };

            await api.post('/invoices', payload);
            setModalConfig({
                title: 'Invoice Deployed',
                message: 'Your invoice has been successfully synchronized with the ledger and is ready for dispatch.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error) {
            console.error(error);
            setModalConfig({
                title: 'Creation Failed',
                message: 'We encountered an error while deploying your invoice. Please check the line items and client selection.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    const clientDetails = clients.find(c => c.id.toString() === clientId);

    const InvoicePreview = () => (
        <div className="bg-white shadow-2xl rounded-lg w-full max-w-[210mm] mx-auto p-[12mm] text-xs sm:text-sm leading-relaxed border border-slate-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-2xl font-bold tracking-tight text-emerald-600">InvoiceOS</span>
                    </div>
                    <div className="text-slate-500 space-y-0.5 text-[11px] leading-relaxed">
                        <p className="font-semibold text-slate-900 text-base">{settings.company_name || "InvoiceOS User"}</p>
                        {settings.company_address && <p>{settings.company_address}</p>}
                        {settings.company_email && <p>{settings.company_email}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
                    <p className="text-slate-500 font-medium text-[11px]"># {issueDate.replace(/-/g, '')}-DRAFT</p>
                </div>
            </div>

            {/* Bill To & Dates */}
            <div className="mt-8 grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-[13px] font-semibold text-slate-400 mb-2 leading-tight">Billed To</h3>
                    {clientDetails ? (
                        <div className="space-y-1 text-[11px] leading-relaxed">
                            <p className="font-semibold text-slate-900 text-[14px]">{clientDetails.name}</p>
                            <p className="text-slate-500">{clientDetails.email}</p>
                            <p className="text-slate-500 whitespace-pre-line max-w-[200px]">{clientDetails.address}</p>
                        </div>
                    ) : (
                        <p className="text-slate-300 italic">No client selected...</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-3 text-[11px]">
                    <div className="text-right">
                        <p className="text-[13px] font-semibold text-slate-400 mb-0.5 leading-tight">Issue Date</p>
                        <p className="font-semibold text-slate-900">{issueDate}</p>
                    </div>
                    {dueDate && (
                        <div className="text-right">
                            <p className="text-[13px] font-semibold text-slate-400 mb-0.5 leading-tight">Due Date</p>
                            <p className="font-semibold text-emerald-600">{dueDate}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-10">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-3 font-semibold text-slate-400 text-[13px] leading-tight">Description</th>
                            <th className="text-right py-3 font-semibold text-slate-400 text-[13px] leading-tight w-16">Qty</th>
                            <th className="text-right py-3 font-semibold text-slate-400 text-[13px] leading-tight w-32">Price</th>
                            <th className="text-right py-3 font-semibold text-slate-400 text-[13px] leading-tight w-32">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-4 text-slate-900 text-[11px] leading-snug">{item.description || <span className="text-slate-300 italic">Item...</span>}</td>
                                <td className="py-4 text-right text-slate-600 text-[11px] leading-snug tabular-nums">{item.quantity}</td>
                                <td className="py-4 text-right text-slate-600 text-[11px] leading-snug tabular-nums">{formatCurrency(item.unitPrice, currency)}</td>
                                <td className="py-4 text-right font-semibold text-slate-900 text-[11px] leading-snug tabular-nums">{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-8 flex justify-end">
                <div className="w-64 space-y-3 text-right text-[11px] leading-relaxed tabular-nums">
                    <div className="flex justify-between text-slate-500 font-medium">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    {taxRate > 0 && (
                        <div className="flex justify-between text-slate-500 font-medium">
                            <span>Tax ({taxRate}%)</span>
                            <span>{formatCurrency(taxAmount, currency)}</span>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Discount</span>
                            <span>-{formatCurrency(discountAmount, currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 text-[14px] border-t-2 border-slate-900 pt-4 mt-2">
                        <span>Total Due</span>
                        <span>{formatCurrency(total, currency)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-100 space-y-6">
                {notes && (
                    <div>
                        <h4 className="text-[13px] font-semibold text-slate-400 mb-2 leading-tight text-left">Notes & Terms</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed whitespace-pre-wrap text-left">{notes}</p>
                    </div>
                )}
                <div className="flex items-center justify-center gap-6 py-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Secured by InvoiceOS</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Booting Invoice Engine...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col h-screen overflow-hidden font-sans antialiased">
            {/* Optimized Top Bar */}
            <header className="bg-white border-b border-slate-200/60 h-20 flex items-center justify-between px-6 sm:px-10 flex-shrink-0 z-30">
                <div className="flex items-center gap-5">
                    <Link href="/dashboard/invoices" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-heading font-black text-slate-900 tracking-tighter uppercase leading-none">Draft Invoice</h1>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Optimization Phase</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={submitting}
                        className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={16} />
                        Save Draft
                    </button>

                    <button
                        onClick={(e) => handleSubmit(e, 'sent')}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : (
                            <>
                                <Send size={16} />
                                <span>Send Invoice</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left Panel: Form Editor */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 scrollbar-hide bg-slate-50/30">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Responsive Section: Client & Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Client Section */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <UserIcon size={16} />
                                    </div>
                                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Recipient Details</h2>
                                </div>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Select Client</label>
                                        <select
                                            className="block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none border"
                                            value={clientId}
                                            onChange={(e) => setClientId(e.target.value)}
                                        >
                                            <option value="">Choose a Client...</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Issue Date</label>
                                            <input
                                                type="date"
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3.5 text-xs font-bold border outline-none focus:bg-white"
                                                value={issueDate}
                                                onChange={(e) => setIssueDate(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Due Date</label>
                                            <input
                                                type="date"
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3.5 text-xs font-bold border outline-none focus:bg-white"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Configuration Section */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Settings size={16} />
                                    </div>
                                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Invoice Config</h2>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Currency</label>
                                            <select
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3.5 text-xs font-bold border outline-none focus:bg-white"
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="NGN">NGN (₦)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tax (%)</label>
                                            <input
                                                type="number"
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3.5 text-xs font-bold border outline-none focus:bg-white"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Discount Amount</label>
                                        <input
                                            type="number"
                                            className="block w-full rounded-xl border-slate-200 bg-slate-50/50 p-3.5 text-xs font-bold border outline-none focus:bg-white"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Streams (Line Items) */}
                        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <FileText size={16} />
                                    </div>
                                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Revenue Streams</h2>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                                    {items.length} Line Items
                                </div>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {items.map((item, index) => (
                                    <div key={index} className="p-6 sm:p-8 bg-white hover:bg-slate-50/30 transition-colors group">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="What service are you providing?"
                                                        className="block w-full rounded-xl border-slate-200 p-3.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/10 border outline-none transition-all"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    />
                                                    <button 
                                                        onClick={() => generateAIDescription(index)}
                                                        className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                        title="AI Optimizer"
                                                    >
                                                        <Sparkles size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-4 items-end">
                                                <div className="w-24">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Quantity</label>
                                                    <input
                                                        type="number"
                                                        className="block w-full rounded-xl border-slate-200 p-3.5 text-sm font-bold text-center border outline-none bg-slate-50/30"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Rate ({currency})</label>
                                                    <input
                                                        type="number"
                                                        className="block w-full rounded-xl border-slate-200 p-3.5 text-sm font-bold border outline-none bg-slate-50/30"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="flex-shrink-0 mb-1.5">
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-50/50">
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 bg-white hover:border-indigo-200 rounded-2xl border-2 border-dashed border-slate-200 transition-all"
                                >
                                    <Plus size={16} /> New Revenue Stream
                                </button>
                            </div>
                        </div>

                        {/* Intelligence Notes */}
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Zap size={16} />
                                </div>
                                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Additional Terms & Intelligence</h2>
                            </div>
                            <textarea
                                rows={3}
                                className="block w-full rounded-2xl border-slate-200 p-4 text-sm font-medium border outline-none bg-slate-50/30 focus:bg-white transition-all"
                                placeholder="Add payment instructions, milestones, or late fee terms..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Intelligence + Preview */}
                <div className="hidden lg:flex w-[480px] bg-white border-l border-slate-200 flex-col overflow-hidden">
                    <div className="p-10 space-y-10 overflow-y-auto scrollbar-hide">
                        <ConversionIntelligence total={total} clientName={clientDetails?.name} dueDate={dueDate} items={items} notes={notes} />
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dynamic Preview</h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Live Syncing</span>
                                </div>
                            </div>
                            <div className="scale-[0.5] origin-top border border-slate-200 rounded-2xl shadow-2xl overflow-hidden pointer-events-none -mb-64">
                                <InvoicePreview />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Floaties */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
                <button 
                    onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                    className="h-14 px-6 rounded-full bg-slate-900 text-white shadow-2xl flex items-center gap-3 transition-all active:scale-90"
                >
                    {showPreviewMobile ? <X size={20} /> : <Eye size={20} />}
                    <span className="text-xs font-black uppercase tracking-widest">{showPreviewMobile ? 'Close' : 'Preview'}</span>
                </button>
            </div>

            {showPreviewMobile && (
                <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md p-4 sm:p-10 overflow-y-auto flex items-start justify-center">
                    <div className="w-full max-w-2xl mt-12 mb-20 animate-in slide-in-from-bottom-10 duration-500">
                        <InvoicePreview />
                    </div>
                </div>
            )}

            <StatusModal 
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (modalConfig.type === 'success') {
                        router.push('/dashboard/invoices');
                    }
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel={modalConfig.type === 'success' ? 'View All Invoices' : 'Close'}
            />
        </div>
    );
}
