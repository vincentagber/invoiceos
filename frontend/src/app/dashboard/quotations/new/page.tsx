'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { StatusModal } from '@/components/ui/StatusModal';
import { AddClientModal } from '@/components/ui/AddClientModal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/useToast';
import { 
    Plus, 
    Trash, 
    ArrowLeft, 
    X,
    Sparkles,
    Mic,
    ChevronDown,
    GripVertical,
    PenLine,
    Rocket
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

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

export default function NewQuotationPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showAddClient, setShowAddClient] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    // Form State
    const [clientId, setClientId] = useState('');
    const [quotationNumber, setQuotationNumber] = useState(`QT-${Math.floor(1000 + Math.random() * 9000)}`);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
    const [notes, setNotes] = useState('This quotation is valid for 30 days. Please sign and return to accept.');
    const [currency, setCurrency] = useState('NGN');
    const [taxRate, setTaxRate] = useState(0);
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        const init = async () => {
            try {
                const [bizRes, clientsRes] = await Promise.all([
                    api.get('/business/me'),
                    api.get('/clients')
                ]);
                setClients(clientsRes.data || []);
                if (bizRes.data) setSettings(bizRes.data);
            } catch (error) {
                toast.error('Failed to initialize page');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleClientCreated = (newClient: any) => {
        setClients([...clients, newClient]);
        setClientId(newClient.id.toString());
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const discountAmount = (subtotal * (Number(discount) || 0)) / 100;
    const total = subtotal + taxAmount - discountAmount;

    const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
        if (!clientId) {
            setModalConfig({ title: 'Recipient Required', message: 'Please select or add a customer to continue.', type: 'error' });
            setShowModal(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                businessId: settings.id,
                clientId: clientId,
                quotationNumber,
                issueDate: new Date(issueDate).toISOString(),
                expiryDate: expiryDate ? new Date(expiryDate).toISOString() : new Date().toISOString(),
                currency,
                taxRate: Number(taxRate),
                discountAmount: Number(discount),
                totalAmount: total,
                items: items,
                notes: notes,
                status: status
            };

            await api.post('/quotations', payload);
            setModalConfig({
                title: status === 'SENT' ? 'Quotation Finalized' : 'Draft Synchronized',
                message: status === 'SENT' 
                    ? 'The revenue engine has successfully deployed this quotation to the pipeline.' 
                    : 'Your quotation draft has been successfully stored in the archive.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error) {
            toast.error('Failed to create quotation');
            setModalConfig({
                title: 'Operation Failed',
                message: 'We encountered an error while processing the quotation. Please verify all line items.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5E6AD2] border-t-transparent"></div>
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Booting Pipeline...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-12 font-sans antialiased">
            <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.03)] overflow-hidden">
                
                {/* Header */}
                <div className="p-8 lg:p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quotation Details</h1>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all">
                                <Mic size={14} /> Autofill with AI
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all">
                                <Sparkles size={14} /> Fill with AI
                            </button>
                        </div>
                    </div>
                    <Link href="/dashboard/quotations" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                        <X size={20} />
                    </Link>
                </div>

                <div className="p-8 lg:p-10 space-y-12">
                    {/* Top Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Left: Customer & Number */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer</label>
                                    <button 
                                        onClick={() => setShowAddClient(true)}
                                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-indigo-700"
                                    >
                                        <Plus size={14} /> Add New Customer
                                    </button>
                                </div>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                    >
                                        <option value="">{clients.length > 0 ? 'Select a customer...' : 'No customers found.'}</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Quotation Number</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    value={quotationNumber}
                                    onChange={(e) => setQuotationNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Right: Dates */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Validity Expiry</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="rounded-[2.5rem] border border-slate-100 overflow-hidden bg-slate-50/30">
                        <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-white border-b border-slate-50">
                                    <th className="text-left py-6 px-4 sm:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Item Description</th>
                                    <th className="text-right py-6 px-2 sm:px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 whitespace-nowrap">Qty</th>
                                    <th className="text-right py-6 px-2 sm:px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32 whitespace-nowrap">Price</th>
                                    <th className="text-right py-6 px-4 sm:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40 whitespace-nowrap">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {items.map((item, index) => (
                                    <tr key={index} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="py-6 px-4 sm:px-8 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <GripVertical className="text-slate-200 cursor-move" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Search or enter item..."
                                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-6 px-2 sm:px-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-2 py-3 text-sm font-bold text-center text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="py-6 px-2 sm:px-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-2 py-3 text-sm font-bold text-right text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                value={item.unitPrice || ''}
                                                onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="py-6 px-4 sm:px-8 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <span className="text-sm font-black text-slate-900 tabular-nums">
                                                    {currency === 'NGN' ? '₦' : '$'}{(item.quantity * item.unitPrice).toLocaleString()}
                                                </span>
                                                <button onClick={() => removeItem(index)} className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-8 bg-white flex justify-start">
                            <button 
                                onClick={addItem}
                                className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-700"
                            >
                                <div className="h-6 w-6 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                                    <Plus size={12} strokeWidth={3} />
                                </div>
                                Add Line Item
                            </button>
                        </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                        {/* Notes */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 block">Notes / Terms</label>
                            <textarea
                                rows={6}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Totals */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                <label className="text-sm text-slate-600">Currency:</label>
                                <div className="relative">
                                    <select 
                                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none appearance-none pr-8 min-w-[120px]"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    >
                                        <option value="NGN">NGN (₦)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Subtotal:</span>
                                    <span className="text-sm font-semibold text-slate-900">{currency === 'NGN' ? '₦' : '$'}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">Discount (%):</span>
                                        <input
                                            type="number"
                                            className="w-16 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-sm text-center outline-none focus:bg-white focus:border-indigo-300"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-500">-{currency === 'NGN' ? '₦' : '$'}{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">Tax (%):</span>
                                        <input
                                            type="number"
                                            className="w-16 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-sm text-center outline-none focus:bg-white focus:border-indigo-300"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(Number(e.target.value))}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{currency === 'NGN' ? '₦' : '$'}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex items-center justify-between pt-6 mt-2 border-t border-slate-100">
                                    <span className="text-base font-bold text-slate-900">Total Amount:</span>
                                    <span className="text-xl font-semibold text-[#5E6AD2]">
                                        {currency === 'NGN' ? '₦' : '$'}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 pb-8 px-8 lg:px-10">
                    <button 
                        onClick={() => router.push('/dashboard/quotations')}
                        className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={() => handleSubmit('DRAFT')}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-50/80 text-[#5E6AD2] text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        <PenLine size={16} /> Save as Draft
                    </button>
                    <button 
                        onClick={() => handleSubmit('SENT')}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium shadow-sm shadow-[#5E6AD2]/20 hover:bg-[#4E5AC2] transition-colors disabled:opacity-50"
                    >
                        <Rocket size={16} /> Finalize & Create
                    </button>
                </div>
            </div>

            <AddClientModal 
                isOpen={showAddClient} 
                onClose={() => setShowAddClient(false)} 
                onSuccess={handleClientCreated}
            />

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
                actionLabel={modalConfig.type === 'success' ? 'Return to Pipeline' : 'Close'}
            />
        </div>
    );
}
