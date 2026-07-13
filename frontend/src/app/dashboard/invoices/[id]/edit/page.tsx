'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash, Save, ArrowLeft, Eye, User as UserIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { StatusModal } from '@/components/ui/StatusModal';

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

export default function EditInvoicePage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.id as string;

    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [clientId, setClientId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [notes, setNotes] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [taxRate, setTaxRate] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [status, setStatus] = useState('DRAFT');

    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    useEffect(() => {
        if (!invoiceId) return;

        const init = async () => {
            try {
                const settingsRes = await api.get('/business/me');
                const [clientsRes, invoiceRes] = await Promise.all([
                    api.get('/clients', { params: { businessId: (settingsRes as any)?.data?.id } }).catch(() => ({ data: [] })),
                    api.get(`/invoices/${invoiceId}`)
                ]);
                setClients(clientsRes.data || []);
                if (settingsRes.data) setSettings(settingsRes.data);

                const inv = invoiceRes.data;
                if (inv) {
                    setClientId(inv.clientId);
                    setInvoiceNumber(inv.invoiceNumber);
                    setIssueDate(new Date(inv.issueDate).toISOString().split('T')[0]);
                    setDueDate(new Date(inv.dueDate).toISOString().split('T')[0]);
                    setNotes(inv.notes || '');
                    setCurrency(inv.currency || 'USD');
                    setTaxRate(Number(inv.taxRate) || 0);
                    setDiscountAmount(Number(inv.discountAmount) || 0);
                    setStatus(inv.status || 'DRAFT');

                    const mappedItems = inv.items.map((i: any) => ({
                        description: i.description,
                        quantity: Number(i.quantity),
                        unitPrice: Number(i.unitPrice)
                    }));
                    setItems(mappedItems);
                }

            } catch (error) {
                console.error(error);
                setModalConfig({
                    title: 'Load Error',
                    message: 'Failed to load invoice data',
                    type: 'error'
                });
                setShowModal(true);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [invoiceId]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculateTax = () => calculateSubtotal() * (taxRate / 100);
    const calculateTotal = () => calculateSubtotal() + calculateTax() - discountAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) {
            setModalConfig({
                title: 'Validation Error',
                message: 'Please select a client.',
                type: 'warning'
            });
            setShowModal(true);
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/invoices/${invoiceId}`, {
                clientId,
                issueDate: new Date(issueDate).toISOString(),
                dueDate: new Date(dueDate).toISOString(),
                items,
                notes,
                currency,
                taxRate,
                discountAmount,
                totalAmount: calculateTotal(),
                version: undefined,
            });
            router.push('/dashboard/invoices');
        } catch (error) {
            setModalConfig({
                title: 'Update Failed',
                message: 'Failed to update invoice',
                type: 'error'
            });
            setShowModal(true);
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const clientDetails = clients.find(c => c.id.toString() === clientId);

    const InvoicePreview = () => (
        <div className="bg-white shadow-lg rounded-none sm:rounded-lg aspect-[1/1.414] w-full max-w-[210mm] mx-auto p-[10mm] text-xs sm:text-sm leading-relaxed border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold tracking-tight text-emerald-600">InvoiceOS</span>
                    </div>
                    <div className="text-gray-500 space-y-0.5">
                        <p>{settings.company_address || '123 Business Rd'}</p>
                        <p>{settings.company_email || 'support@superlink.com'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                    <p className="text-gray-500"># {invoiceNumber || 'DRAFT'}</p>
                    <p className="text-xs text-gray-400 uppercase mt-1">{status}</p>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <div>
                    <h3 className="text-gray-500 font-medium mb-1">Bill To:</h3>
                    {clientDetails ? (
                        <div className="font-semibold text-gray-900">
                            <p>{clientDetails.name}</p>
                            <p className="font-normal text-gray-500">{clientDetails.email}</p>
                            <p className="font-normal text-gray-500 whitespace-pre-line max-w-[200px]">{clientDetails.address}</p>
                        </div>
                    ) : (
                        <p className="text-gray-300 italic">Select a client...</p>
                    )}
                </div>
                <div className="text-right space-y-1">
                    <div>
                        <span className="text-gray-500 mr-4">Issue Date:</span>
                        <span className="font-medium">{issueDate}</span>
                    </div>
                    {dueDate && (
                        <div>
                            <span className="text-gray-500 mr-4">Due Date:</span>
                            <span className="font-medium">{dueDate}</span>
                        </div>
                    )}
                    <div>
                        <span className="text-gray-500 mr-4">Currency:</span>
                        <span className="font-medium">{currency}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-emerald-600">
                            <th className="text-left py-2 font-semibold text-emerald-600">Description</th>
                            <th className="text-right py-2 font-semibold text-emerald-600 w-16">Qty</th>
                            <th className="text-right py-2 font-semibold text-emerald-600 w-24">Price</th>
                            <th className="text-right py-2 font-semibold text-emerald-600 w-24">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-3 text-gray-900">{item.description || <span className="text-gray-300 italic">Item description...</span>}</td>
                                <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                                <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                                <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end">
                <div className="w-48 space-y-2">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    {taxRate > 0 && (
                        <div className="flex justify-between text-gray-500">
                            <span>Tax ({taxRate}%)</span>
                            <span>{formatCurrency(calculateTax())}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-gray-500">
                            <span>Discount</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2 border-gray-200">
                        <span>Total ({currency})</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                </div>
            </div>

            {(notes || settings.footer_note) && (
                <div className="mt-12 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                    {notes && <p className="whitespace-pre-wrap">{notes}</p>}
                </div>
            )}
        </div>
    );

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Loading Engine...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Edit Invoice {invoiceNumber}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="lg:hidden text-gray-600"
                        onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {submitting ? 'Saving...' : (
                            <>
                                <Save size={16} />
                                <span>Update Invoice</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                <div className={clsx(
                    "flex-1 overflow-y-auto p-6 lg:p-10 transition-all duration-300",
                    showPreviewMobile ? "hidden lg:block w-full lg:w-1/2" : "w-full lg:w-1/2"
                )}>
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-widest text-[11px]">
                                <UserIcon size={16} className="text-emerald-500" />
                                Client Details
                            </h2>
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select Client</label>
                                    <select
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 bg-gray-50 font-bold"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose a client...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Issue Date</label>
                                        <input
                                            type="date"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 font-bold"
                                            value={issueDate}
                                            onChange={(e) => setIssueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 font-bold"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Currency</label>
                                        <select
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 font-bold"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="NGN">NGN</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 font-bold"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Discount Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 font-bold"
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 uppercase tracking-widest text-[11px]">
                                    <FileText size={16} className="text-emerald-500" />
                                    Line Items
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="group relative grid grid-cols-12 gap-3 items-start p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="col-span-12 sm:col-span-6">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3 sm:col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 text-center font-bold"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-4 sm:col-span-3">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 font-bold"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 sm:col-span-1 flex justify-end pt-2">
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addItem}
                                className="w-full py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-dashed border-emerald-200 transition-all"
                            >
                                <Plus size={16} /> Add Line Item
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notes & Terms</label>
                            <textarea
                                rows={3}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2.5 bg-gray-50 font-medium"
                                placeholder="Payment due within 30 days..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={clsx(
                    "hidden lg:flex flex-1 bg-slate-900 overflow-y-auto p-10 justify-center items-start shadow-inner",
                    showPreviewMobile && "!flex absolute inset-0 z-20"
                )}>
                    <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-100 origin-top transition-transform duration-300 ease-out">
                        <InvoicePreview />
                    </div>
                </div>
            </main>
            <StatusModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (modalConfig.title === 'Load Error') {
                        router.push('/dashboard/invoices');
                    }
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel="Proceed"
            />
        </div>
    );
}
