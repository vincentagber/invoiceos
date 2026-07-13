'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, 
    Plus, 
    Trash2, 
    ChevronDown, 
    Sparkles, 
    Cpu,
    FileText, 
    PenLine,
    RefreshCw,
    GripVertical,
    UserPlus,
    Bell,
    Search,
    PlusCircle
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';
import { AddClientModal } from '@/components/ui/AddClientModal';
import { StatusModal } from '@/components/ui/StatusModal';

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [showAddClient, setShowAddClient] = useState(false);
    
    // Form State
    const [selectedClient, setSelectedClient] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [currency, setCurrency] = useState('NGN');
    const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
    const [notes, setNotes] = useState('Thank you for your business. Payment is due within 15 days.');
    const [taxRate, setTaxRate] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringFrequency, setRecurringFrequency] = useState('monthly');

    // Status Modal
    const [showStatus, setShowStatus] = useState(false);
    const [statusConfig, setStatusConfig] = useState({ title: '', message: '', type: 'success' as any });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
    const updateItem = (index: number, field: string, value: any) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal + taxAmount - discountAmount;
    const sym = currency === 'NGN' ? '₦' : '$';

    const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
        if (!selectedClient) {
            setStatusConfig({
                title: 'Validation Error',
                message: 'Please select a client.',
                type: 'warning'
            });
            setShowStatus(true);
            return;
        }
        setSubmitting(true);
        try {
            const bizRes = await api.get('/business/me');
            const payload = {
                businessId: bizRes.data.id,
                clientId: selectedClient,
                invoiceNumber,
                issueDate,
                dueDate,
                currency,
                items,
                taxRate,
                discountAmount: discount,
                totalAmount: total,
                status,
                notes,
                isRecurring,
                recurringFrequency: isRecurring ? recurringFrequency : null,
            };
            await api.post('/invoices', payload);
            setStatusConfig({
                title: 'Invoice Created',
                message: `Invoice ${invoiceNumber} has been successfully recorded in your ledger.`,
                type: 'success',
            });
            setShowStatus(true);
        } catch (error) {
            console.error(error);
            setStatusConfig({
                title: 'Creation Failed',
                message: 'There was an error generating your invoice. Please verify all fields.',
                type: 'error',
            });
            setShowStatus(true);
        } finally {
            setSubmitting(false); // ✅ fixed: was incorrectly set to true
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/10 transition-all";
    const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#F8F9FC] w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* ── Top Bar (mimics the page header in the screenshot) ── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900">Invoices</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search invoices, customers, settings..."
                                className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:bg-white transition-colors"
                            />
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={18} />
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#5E6AD2] text-white text-sm font-semibold rounded-lg shadow-sm">
                            <Plus size={16} /> New Invoice
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Invoice Details Card */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
                        
                        {/* Card Header */}
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-bold text-slate-900">Invoice Details</h2>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#5E6AD2] hover:bg-indigo-50 transition-colors">
                                <Sparkles size={13} /> Autofill with AI
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                                <Cpu size={13} /> Fill with AI
                            </button>
                        </div>

                        {/* Field Grid — 2 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            
                            {/* Customer */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className={labelClass}>Customer</label>
                                    <button
                                        onClick={() => setShowAddClient(true)}
                                        className="flex items-center gap-1 text-xs font-semibold text-[#5E6AD2] hover:underline"
                                    >
                                        <UserPlus size={12} /> Add New Customer
                                    </button>
                                </div>
                                <div className="relative">
                                    <select
                                        className={clsx(inputClass, "appearance-none pr-8", !selectedClient && "text-slate-400")}
                                        value={selectedClient}
                                        onChange={(e) => setSelectedClient(e.target.value)}
                                    >
                                        <option value="">No customers found.</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                                </div>
                            </div>

                            {/* Issue Date */}
                            <div>
                                <label className={labelClass}>Issue Date</label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                />
                            </div>

                            {/* Invoice Number */}
                            <div>
                                <label className={labelClass}>Invoice Number</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                />
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className={labelClass}>Due Date</label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ── Line Items Table ── */}
                        <div className="pt-4 border-t border-slate-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-3 pl-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Description</th>
                                        <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24 text-center">Qty</th>
                                        <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36 text-right">Price</th>
                                        <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32 text-right">Total</th>
                                        <th className="pb-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="group border-b border-slate-50 last:border-0">
                                            {/* Grip + Description */}
                                            <td className="py-3 pr-2">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical size={15} className="text-slate-300 shrink-0 cursor-grab" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search or enter item..."
                                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:bg-white focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/10 transition-all placeholder:text-slate-400"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            {/* Qty */}
                                            <td className="py-3 px-4">
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm text-center text-slate-800 outline-none focus:bg-white focus:border-[#5E6AD2] transition-all"
                                                    value={item.quantity}
                                                    min={1}
                                                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                />
                                            </td>
                                            {/* Price */}
                                            <td className="py-3 px-4">
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-right text-slate-800 outline-none focus:bg-white focus:border-[#5E6AD2] transition-all"
                                                    value={item.unitPrice || ''}
                                                    placeholder="0.00"
                                                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                />
                                            </td>
                                            {/* Total */}
                                            <td className="py-3 px-4 text-right">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {sym}{fmt(item.quantity * item.unitPrice)}
                                                </span>
                                            </td>
                                            {/* Delete */}
                                            <td className="py-3 pl-2 pr-1">
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Add Line Item */}
                            <button
                                onClick={addItem}
                                className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#5E6AD2] hover:text-[#4E5AC2] transition-colors"
                            >
                                <PlusCircle size={18} /> Add Line Item
                            </button>
                        </div>
                    </div>

                    {/* Notes & Totals Card */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Notes */}
                            <div>
                                <label className={labelClass}>Notes / Terms</label>
                                <textarea
                                    rows={5}
                                    className={clsx(inputClass, "resize-none")}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Totals */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <label className="text-sm text-slate-600">Currency:</label>
                                    <select
                                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none appearance-none pr-8 min-w-[120px] focus:border-[#5E6AD2]"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    >
                                        <option value="NGN">NGN (₦)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Subtotal:</span>
                                        <span className="font-semibold text-slate-900">{sym}{fmt(subtotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            Discount (%):
                                            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-14 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-sm text-center outline-none focus:border-[#5E6AD2]" />
                                        </div>
                                        <span className="font-semibold text-emerald-500">-{sym}{fmt(discountAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            Tax (%):
                                            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-14 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-sm text-center outline-none focus:border-[#5E6AD2]" />
                                        </div>
                                        <span className="font-semibold text-slate-900">{sym}{fmt(taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-4 border-t border-slate-100">
                                        <span className="font-bold text-slate-900">Total Amount:</span>
                                        <span className="text-lg font-bold text-[#5E6AD2]">{sym}{fmt(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recurring Toggle */}
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <RefreshCw size={15} className="text-slate-400" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Make this a Recurring Invoice</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Automatically re-generate on a schedule.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsRecurring(!isRecurring)}
                                className={clsx(
                                    "w-11 h-6 rounded-full transition-colors relative flex items-center",
                                    isRecurring ? "bg-[#5E6AD2]" : "bg-slate-200"
                                )}
                            >
                                <span className={clsx(
                                    "absolute left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                                    isRecurring ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                        {isRecurring && (
                            <div className="mt-4 pl-12">
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Repeat every</label>
                                <select
                                    value={recurringFrequency}
                                    onChange={(e) => setRecurringFrequency(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none appearance-none pr-8 focus:border-[#5E6AD2]"
                                >
                                    <option value="daily">Day</option>
                                    <option value="weekly">Week</option>
                                    <option value="monthly">Month</option>
                                    <option value="yearly">Year</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer Actions ── */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                        Discard
                    </button>
                    <button
                        onClick={() => handleSubmit('DRAFT')}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-100 text-[#5E6AD2] text-sm font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                        <PenLine size={15} /> Save as Draft
                    </button>
                    <button
                        onClick={() => handleSubmit('SENT')}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-semibold shadow-sm hover:bg-[#4E5AC2] transition-colors disabled:opacity-50"
                    >
                        <FileText size={15} /> Finalize & Create
                    </button>
                </div>
            </div>

            {/* Sub-modals */}
            <AddClientModal
                isOpen={showAddClient}
                onClose={() => setShowAddClient(false)}
                onSuccess={fetchClients}
            />
            <StatusModal
                isOpen={showStatus}
                onClose={() => {
                    setShowStatus(false);
                    if (statusConfig.type === 'success') {
                        onClose();
                        if (onSuccess) onSuccess();
                    }
                }}
                title={statusConfig.title}
                message={statusConfig.message}
                type={statusConfig.type}
                actionLabel={statusConfig.type === 'success' ? 'Done' : 'Close'}
            />
        </div>
    );
};
