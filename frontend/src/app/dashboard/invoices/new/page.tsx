'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
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
    Clock
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
                issueDate: issueDate,
                dueDate: dueDate,
                currency,
                taxRate: taxRate,
                discount: discount,
                items: items,
                notes: notes,
                status: status.toUpperCase()
            };

            await api.post('/invoices', payload);
            router.push('/dashboard/invoices');
        } catch (error) {
            alert('Failed to create invoice');
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
                        <span className="text-2xl font-black tracking-tighter text-indigo-600">InvoiceOS</span>
                    </div>
                    <div className="text-slate-500 space-y-0.5 text-[10px] sm:text-xs">
                        <p className="font-bold text-slate-900">{settings.company_name || "InvoiceOS User"}</p>
                        {settings.company_address && <p>{settings.company_address}</p>}
                        {settings.company_email && <p>{settings.company_email}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">INVOICE</h1>
                    <p className="text-slate-400 font-medium"># {issueDate.replace(/-/g, '')}-DRAFT</p>
                </div>
            </div>

            {/* Bill To & Dates */}
            <div className="mt-8 grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Billed To</h3>
                    {clientDetails ? (
                        <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-base">{clientDetails.name}</p>
                            <p className="text-slate-500">{clientDetails.email}</p>
                            <p className="text-slate-500 whitespace-pre-line max-w-[200px]">{clientDetails.address}</p>
                        </div>
                    ) : (
                        <p className="text-slate-300 italic">No client selected...</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Issue Date</p>
                        <p className="font-bold text-slate-900">{issueDate}</p>
                    </div>
                    {dueDate && (
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Due Date</p>
                            <p className="font-bold text-indigo-600">{dueDate}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-10">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Description</th>
                            <th className="text-right py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest w-16">Qty</th>
                            <th className="text-right py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest w-32">Price</th>
                            <th className="text-right py-3 font-bold text-slate-400 text-[10px] uppercase tracking-widest w-32">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-4 text-slate-900 font-medium">{item.description || <span className="text-slate-300 italic">Item...</span>}</td>
                                <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                                <td className="py-4 text-right text-slate-600">{formatCurrency(item.unitPrice, currency)}</td>
                                <td className="py-4 text-right font-bold text-slate-900">{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-8 flex justify-end">
                <div className="w-64 space-y-3 text-right">
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
                    <div className="flex justify-between font-black text-slate-900 text-xl border-t-2 border-slate-900 pt-4">
                        <span>Total Due</span>
                        <span>{formatCurrency(total, currency)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-100 space-y-6">
                {notes && (
                    <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 text-left">Notes & Terms</h4>
                        <p className="text-slate-500 text-xs leading-relaxed whitespace-pre-wrap text-left">{notes}</p>
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
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Booting Invoice Engine...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col h-screen overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 flex-shrink-0 z-30 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/invoices" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Invoice Engine</h1>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Drafting Phase</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={submitting}
                        className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>Save Draft</span>
                    </button>

                    <button
                        onClick={(e) => handleSubmit(e, 'sent')}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                <Send size={18} />
                                <span>Optimize & Send</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Editor Area */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Panel: Form Editor */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
                    <div className="max-w-3xl mx-auto space-y-10">

                        {/* Intelligence Sidebar (Float right on lg) */}
                        <div className="lg:hidden">
                            <ConversionIntelligence total={total} clientName={clientDetails?.name} dueDate={dueDate} />
                        </div>

                        {/* Section: Client & Global Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                    <UserIcon size={16} className="text-indigo-600" />
                                    Recipient
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <select
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 bg-slate-50/50 font-bold"
                                            value={clientId}
                                            onChange={(e) => setClientId(e.target.value)}
                                        >
                                            <option value="">Select a Client</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Issue Date</label>
                                            <input
                                                type="date"
                                                className="block w-full rounded-xl border-slate-200 sm:text-sm border p-3 bg-slate-50/50 font-bold"
                                                value={issueDate}
                                                onChange={(e) => setIssueDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                                            <input
                                                type="date"
                                                className="block w-full rounded-xl border-slate-200 sm:text-sm border p-3 bg-slate-50/50 font-bold"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                    <Settings size={16} className="text-indigo-600" />
                                    Configurations
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Currency</label>
                                            <div className="relative">
                                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <select
                                                    className="block w-full rounded-xl border-slate-200 pl-10 sm:text-sm border p-3 bg-slate-50/50 font-bold"
                                                    value={currency}
                                                    onChange={(e) => setCurrency(e.target.value)}
                                                >
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                    <option value="GBP">GBP (£)</option>
                                                    <option value="NGN">NGN (₦)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tax (%)</label>
                                            <div className="relative">
                                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="number"
                                                    className="block w-full rounded-xl border-slate-200 pl-10 sm:text-sm border p-3 bg-slate-50/50 font-bold"
                                                    value={taxRate}
                                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Discount</label>
                                            <input
                                                type="number"
                                                className="block w-full rounded-xl border-slate-200 sm:text-sm border p-3 bg-slate-50/50 font-bold"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Items */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                    <FileText size={16} className="text-indigo-600" />
                                    Revenue Streams
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="group relative flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="w-full sm:col-span-6">
                                            <input
                                                type="text"
                                                placeholder="Service or Product name"
                                                className="block w-full rounded-xl border-slate-200 text-sm border p-3 bg-white font-medium"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-4 w-full sm:contents">
                                            <div className="flex-1 sm:col-span-2">
                                                <input
                                                    type="number"
                                                    className="block w-full rounded-xl border-slate-200 text-sm border p-3 bg-white font-bold text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="flex-[1.5] sm:col-span-3">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="block w-full rounded-xl border-slate-200 pl-4 text-sm border p-3 bg-white font-bold"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="sm:col-span-1 flex justify-end">
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-slate-300 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-lg"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addItem}
                                className="w-full py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border-2 border-dashed border-indigo-200 transition-all active:scale-[0.99]"
                            >
                                <Plus size={18} /> Add Line Item
                            </button>
                        </div>

                        {/* Section: Notes */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Additional Terms & Intelligence Notes</label>
                            <textarea
                                rows={4}
                                className="block w-full rounded-2xl border-slate-200 sm:text-sm border p-4 bg-slate-50/30 font-medium"
                                placeholder="Specify payment milestones, late fees, or special instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: AI Sidebar + Preview */}
                <div className="hidden lg:flex w-[460px] bg-white border-l border-slate-200 flex-col overflow-hidden">
                    <div className="p-8 space-y-8 overflow-y-auto">
                        <ConversionIntelligence total={total} clientName={clientDetails?.name} dueDate={dueDate} />
                        
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Preview</h3>
                            <div className="scale-[0.45] origin-top border border-slate-200 rounded-lg shadow-2xl overflow-hidden pointer-events-none">
                                <InvoicePreview />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Preview Toggle */}
            <button 
                onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                className="lg:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center z-50 transition-all active:scale-90"
            >
                {showPreviewMobile ? <X size={24} /> : <Eye size={24} />}
            </button>

            {showPreviewMobile && (
                <div className="fixed inset-0 z-40 bg-slate-900/90 backdrop-blur-md p-6 overflow-y-auto flex items-start justify-center">
                    <div className="w-full mt-12 animate-in slide-in-from-bottom-10 duration-500">
                        <InvoicePreview />
                    </div>
                </div>
            )}
        </div>
    );
}
