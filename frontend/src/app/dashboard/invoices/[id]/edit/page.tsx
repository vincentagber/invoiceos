'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash, Save, ArrowLeft, Eye, User as UserIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface Client {
    id: number;
    name: string;
    email?: string;
    address?: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
}

export default function EditInvoicePage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.id as string;

    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form Stats
    const [clientId, setClientId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [notes, setNotes] = useState('');

    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    useEffect(() => {
        if (!invoiceId) return;

        const init = async () => {
            try {
                const [clientsRes, settingsRes, invoiceRes] = await Promise.all([
                    api.get('/clients/read.php'),
                    api.get('/settings/read.php?all=true'),
                    api.get(`/invoices/read.php?id=${invoiceId}`)
                ]);
                setClients(clientsRes.data);
                if (settingsRes.data) setSettings(settingsRes.data);

                // Populate Invoice Data
                const inv = invoiceRes.data;
                if (inv) {
                    setClientId(inv.client_id.toString());
                    setInvoiceNumber(inv.invoice_number);
                    setIssueDate(inv.issue_date);
                    setDueDate(inv.due_date);
                    setNotes(inv.notes || '');

                    // Map items (ensure numbers are numbers)
                    const mappedItems = inv.items.map((i: any) => ({
                        description: i.description,
                        quantity: Number(i.quantity),
                        unit_price: Number(i.unit_price)
                    }));
                    setItems(mappedItems);
                }

            } catch (error) {
                console.error(error);
                alert("Failed to load invoice data");
                router.push('/dashboard/invoices');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [invoiceId]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
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

    const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const calculateTotal = () => calculateSubtotal();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return alert('Please select a client');

        setSubmitting(true);
        try {
            // Include ID for update
            await api.post('/invoices/update.php', {
                id: invoiceId,
                client_id: clientId,
                issue_date: issueDate,
                due_date: dueDate,
                items: items,
                notes: notes
            });
            router.push('/dashboard/invoices');
        } catch (error) {
            alert('Failed to update invoice');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const clientDetails = clients.find(c => c.id.toString() === clientId);

    const InvoicePreview = () => (
        <div className="bg-white shadow-lg rounded-none sm:rounded-lg aspect-[1/1.414] w-full max-w-[210mm] mx-auto p-[10mm] text-xs sm:text-sm leading-relaxed border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/logo.png" alt="Company Logo" className="w-48 h-auto object-contain" />
                    </div>
                    <div className="text-gray-500 space-y-0.5">
                        <p>{settings.company_address || '123 Business Rd'}</p>
                        <p>{settings.company_email || 'support@superlink.com'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                    <p className="text-gray-500"># {invoiceNumber || 'DRAFT'}</p>
                </div>
            </div>

            {/* Bill To & Dates */}
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
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-indigo-600">
                            <th className="text-left py-2 font-semibold text-indigo-600">Description</th>
                            <th className="text-right py-2 font-semibold text-indigo-600 w-16">Qty</th>
                            <th className="text-right py-2 font-semibold text-indigo-600 w-24">Price</th>
                            <th className="text-right py-2 font-semibold text-indigo-600 w-24">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-3 text-gray-900">{item.description || <span className="text-gray-300 italic">Item description...</span>}</td>
                                <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                                <td className="py-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                                <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.quantity * item.unit_price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
                <div className="w-48 space-y-2">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2 border-gray-200">
                        <span>Total</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {(notes || settings.footer_note) && (
                <div className="mt-12 pt-4 border-t border-gray-100 text-gray-500 text-sm">
                    {notes && <p className="whitespace-pre-wrap">{notes}</p>}
                </div>
            )}
        </div>
    );

    if (loading) return <div className="p-10 text-center">Loading invoice...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Edit Invoice {invoiceNumber}</h1>
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
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
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

            {/* Main Editor Area */}
            <main className="flex-1 flex overflow-hidden relative">

                {/* Left Panel: Form Editor */}
                <div className={clsx(
                    "flex-1 overflow-y-auto p-6 lg:p-10 transition-all duration-300",
                    showPreviewMobile ? "hidden lg:block w-full lg:w-1/2" : "w-full lg:w-1/2"
                )}>
                    <div className="max-w-2xl mx-auto space-y-8">

                        {/* Section: Who & When */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <UserIcon size={16} className="text-indigo-500" />
                                Client Details
                            </h2>
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                                    <select
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5 bg-gray-50"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                        <input
                                            type="date"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5"
                                            value={issueDate}
                                            onChange={(e) => setIssueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Items */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText size={16} className="text-indigo-500" />
                                    Line Items
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="group relative grid grid-cols-12 gap-3 items-start p-3 rounded-lg border border-gray-100 bg-gray-50 hover:border-gray-300 transition-colors">
                                        <div className="col-span-12 sm:col-span-6">
                                            <label className="sr-only">Description</label>
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3 sm:col-span-2">
                                            <label className="sr-only">Qty</label>
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-4 sm:col-span-3">
                                            <label className="sr-only">Price</label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                    <span className="text-gray-500 sm:text-sm">₦</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="block w-full rounded-md border-gray-300 pl-6 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1 sm:col-span-1 flex justify-end pt-2">
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
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
                                className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-dashed border-indigo-200 hover:border-indigo-300 transition-all"
                            >
                                <Plus size={16} /> Add Line Item
                            </button>
                        </div>

                        {/* Section: Notes */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Notes & Terms</label>
                            <textarea
                                rows={3}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5"
                                placeholder="Payment due within 30 days..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className={clsx(
                    "hidden lg:flex flex-1 bg-gray-800/95 overflow-y-auto p-10 justify-center items-start shadow-inner",
                    showPreviewMobile && "!flex absolute inset-0 z-20"
                )}>
                    <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-100 origin-top transition-transform duration-300 ease-out">
                        <InvoicePreview />
                    </div>
                </div>
            </main>
        </div>
    );
}
