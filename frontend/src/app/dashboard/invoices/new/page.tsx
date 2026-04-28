'use client';

import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { StatusModal } from '@/components/ui/StatusModal';
import { AddClientModal } from '@/components/ui/AddClientModal';
import { useRouter } from 'next/navigation';
import { 
    Plus, 
    Trash, 
    Save, 
    X,
    ChevronDown,
    PlusCircle,
    Eye,
    Send,
    FileText,
    History,
    Receipt
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

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

export default function NewInvoicePage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showAddClient, setShowAddClient] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    // Form State
    const [clientId, setClientId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    const [poNumber, setPoNumber] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('Net 30. Please make payments via bank transfer or credit card.');
    const [currency, setCurrency] = useState('NGN');
    const [taxRate, setTaxRate] = useState(0);

    const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

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
                console.error(error);
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

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const total = subtotal + taxAmount;

    const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
        if (!clientId) {
            setModalConfig({ title: 'Recipient Required', message: 'Please select a partner to proceed with document generation.', type: 'error' });
            setShowModal(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                businessId: settings.id,
                clientId: clientId,
                invoiceNumber,
                poNumber,
                issueDate: new Date(issueDate).toISOString(),
                dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
                currency,
                taxRate: Number(taxRate),
                totalAmount: total,
                items: items,
                notes: notes,
                terms: terms,
                status: status
            };

            await api.post('/invoices', payload);
            setModalConfig({
                title: status === 'SENT' ? 'Document Deployed' : 'Draft Synchronized',
                message: status === 'SENT' 
                    ? 'The invoice has been successfully registered in the institutional ledger.' 
                    : 'The document draft has been successfully archived.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error) {
            console.error(error);
            setModalConfig({
                title: 'Transmission Error',
                message: 'We encountered a synchronization failure while registering the document.',
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
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Loading Intelligence Ledger...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-10 mb-10">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">New Invoice</h1>
                    <p className="text-slate-500 font-medium">Generate a professional financial document for your institutional partners.</p>
                </div>
                <Link href="/dashboard/invoices" className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100 active:scale-90">
                    <X size={24} />
                </Link>
            </div>

            <div className="flex flex-col xl:flex-row gap-12 items-start">
                
                {/* Left Side: Form Controls */}
                <div className="flex-1 space-y-8 w-full">
                    
                    {/* Invoice Details Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Document Configuration</h3>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">DRAFT</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Client Selection */}
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Partner / Client</label>
                                    <button 
                                        onClick={() => setShowAddClient(true)}
                                        className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                                    >
                                        <Plus size={14} /> New Partner
                                    </button>
                                </div>
                                <div className="relative group">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none cursor-pointer"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                    >
                                        <option value="">Select an institutional partner...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-900 transition-colors" size={18} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Index</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Order (P.O)</label>
                                <input
                                    type="text"
                                    placeholder="Optional PO reference"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    value={poNumber}
                                    onChange={(e) => setPoNumber(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Settlement Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Items</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <div className="col-span-6">Line Description</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-right">Amount</div>
                            </div>

                            {/* Rows */}
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:border-slate-200 transition-all">
                                        <div className="col-span-6">
                                            <input
                                                type="text"
                                                placeholder="Service or product description..."
                                                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-sm font-bold text-slate-900 text-center outline-none"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full bg-transparent text-sm font-bold text-slate-900 text-right outline-none"
                                                value={item.unitPrice || ''}
                                                onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-3">
                                            <span className="text-sm font-black text-slate-900 tabular-nums">
                                                {(item.quantity * item.unitPrice).toLocaleString()}
                                            </span>
                                            <button 
                                                onClick={() => removeItem(index)}
                                                className="text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={addItem}
                                className="flex items-center gap-2 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-70 transition-all pt-4 ml-2"
                            >
                                <PlusCircle size={18} />
                                Add Line Item
                            </button>
                        </div>

                        {/* Totals Section */}
                        <div className="mt-10 pt-10 border-t border-slate-100 flex justify-end">
                            <div className="w-full md:w-72 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                                    <span className="font-black text-slate-900 tabular-nums">{formatCurrency(subtotal, currency)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Tax</span>
                                        <input
                                            type="number"
                                            className="w-12 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-[10px] font-black text-center outline-none"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(Number(e.target.value))}
                                        />
                                        <span className="text-[10px] font-black text-slate-400">%</span>
                                    </div>
                                    <span className="font-black text-slate-900 tabular-nums">{formatCurrency(taxAmount, currency)}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 border-dashed flex justify-between items-center">
                                    <span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Total Yield</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{formatCurrency(total, currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Terms Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 space-y-8">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-6">Notes & Governance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Memorandum</label>
                                <textarea
                                    rows={4}
                                    placeholder="Institutional notes or thank you message..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all resize-none"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Terms</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all resize-none"
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview & Global Actions */}
                <div className="w-full xl:w-[480px] space-y-8">
                    
                    {/* Sticky Container */}
                    <div className="xl:sticky xl:top-8 space-y-8">
                        
                        {/* Global Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => handleSubmit('DRAFT')}
                                disabled={submitting}
                                className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-2xl py-4 px-6 font-black text-[11px] uppercase tracking-widest flex justify-center items-center gap-3 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                            >
                                <Save size={18} />
                                Save Draft
                            </button>
                            <button 
                                onClick={() => handleSubmit('SENT')}
                                disabled={submitting}
                                className="flex-1 bg-slate-900 text-white rounded-2xl py-4 px-6 font-black text-[11px] uppercase tracking-widest flex justify-center items-center gap-3 transition-all hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                            >
                                <Send size={18} />
                                Deploy Invoice
                            </button>
                        </div>

                        {/* Document Preview */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in duration-500">
                            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Eye size={16} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Real-Time Yield Preview</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                </div>
                            </div>
                            
                            {/* Paper Preview Container */}
                            <div className="p-10 bg-white">
                                <div className="border border-slate-100 p-8 shadow-sm rounded-sm text-[10px] leading-relaxed text-slate-600 min-h-[600px] flex flex-col">
                                    {/* Invoice Header */}
                                    <div className="flex justify-between items-start mb-10 pb-10 border-b border-slate-100">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Invoice</h4>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">{invoiceNumber}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs ml-auto mb-2">
                                                {settings.name?.charAt(0) || 'I'}
                                            </div>
                                            <p className="font-black text-slate-900 uppercase text-[9px]">{settings.name || 'InvoiceOS Intelligence'}</p>
                                            <p className="text-[8px] font-medium text-slate-400">Precision Finance Systems</p>
                                        </div>
                                    </div>

                                    {/* Document Meta */}
                                    <div className="grid grid-cols-2 gap-10 mb-10">
                                        <div className="space-y-2">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bill To / Partner</p>
                                            <p className="text-sm font-black text-slate-900 tracking-tight">{selectedClient?.name || '[Partner Name]'}</p>
                                            <p className="text-[9px] font-medium text-slate-500 leading-normal max-w-[160px]">
                                                {selectedClient?.email || 'partner@institution.com'}<br />
                                                {selectedClient?.address || 'Institutional Headquarters'}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-3">
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Registration Date</p>
                                                <p className="font-bold text-slate-900">{issueDate}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Due Date / Settlement</p>
                                                <p className="font-bold text-slate-900">{dueDate || 'TBD'}</p>
                                            </div>
                                            {poNumber && (
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">P.O Reference</p>
                                                    <p className="font-bold text-slate-900">{poNumber}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Table Preview */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2 mb-4 font-black text-slate-400 uppercase tracking-widest text-[8px]">
                                            <div className="col-span-8">Description of Services / Product</div>
                                            <div className="col-span-4 text-right">Yield Amount</div>
                                        </div>
                                        <div className="space-y-3">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-2 text-[9px]">
                                                    <div className="col-span-8 flex flex-col">
                                                        <span className="font-bold text-slate-900">{item.description || 'Service Entry'}</span>
                                                        <span className="text-slate-400 text-[8px]">{item.quantity} Unit(s) at {formatCurrency(item.unitPrice, currency)}</span>
                                                    </div>
                                                    <div className="col-span-4 text-right font-black text-slate-900">
                                                        {formatCurrency(item.quantity * item.unitPrice, currency)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer / Totals */}
                                    <div className="mt-10 pt-10 border-t border-slate-100 space-y-1.5 w-1/2 ml-auto">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">Subtotal</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(subtotal, currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">Tax ({taxRate}%)</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(taxAmount, currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                                            <span className="text-slate-900 font-black uppercase text-[9px] tracking-widest">Total Due</span>
                                            <span className="text-base font-black text-slate-900 tracking-tight">{formatCurrency(total, currency)}</span>
                                        </div>
                                    </div>

                                    {/* Terms Memo */}
                                    <div className="mt-10 pt-10 border-t border-slate-50">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Memorandum & Terms</p>
                                        <p className="text-[8px] font-medium text-slate-400 italic leading-normal">
                                            {notes || 'No institutional notes provided.'}
                                        </p>
                                        <p className="text-[8px] font-medium text-slate-400 mt-2 leading-normal">
                                            {terms}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Helper Tools */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Receipt size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tax Settings</span>
                            </button>
                            <button className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <History size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Audit Log</span>
                            </button>
                        </div>
                    </div>
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
                        router.push('/dashboard/invoices');
                    }
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel={modalConfig.type === 'success' ? 'Return to Ledger' : 'Close'}
            />
        </div>
    );
}
