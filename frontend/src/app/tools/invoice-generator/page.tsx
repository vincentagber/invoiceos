'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, 
    Trash, 
    Download, 
    Eye, 
    ArrowLeft, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    FileText,
    ArrowRight
} from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';

import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';

export default function FreeInvoiceGenerator() {
    // Form State
    const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [items, setItems] = useState([
        { description: 'Graphic Design Services', quantity: 1, unitPrice: 120000 }
    ]);
    const [notes, setNotes] = useState('');
    const [currency, setCurrency] = useState('NGN');

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const total = subtotal; // Simplified for the free tool

    const handleDownload = () => {
        const invoiceData = {
            invoiceNumber,
            issueDate,
            dueDate,
            totalAmount: total,
            subtotal: subtotal,
            notes,
            client: {
                name: clientName || 'Valued Client',
                email: clientEmail,
                address: clientAddress
            },
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }))
        };
        // @ts-ignore
        generateInvoicePDF(invoiceData, 'invoice');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <SiteNavbar />

            <main className="max-w-7xl mx-auto py-24 px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-16">
                    
                    {/* Left: Editor */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                                <Zap size={14} className="fill-emerald-600" />
                                Instant Generator
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-sans font-semibold text-slate-900 tracking-tighter uppercase leading-[0.9]">Free Invoice Generator</h1>
                            <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Create and download professional, tax-compliant PDF invoices in seconds. No registration required.
                            </p>
                        </div>

                        <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 p-10 lg:p-16 space-y-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                <img src="/logo.png" alt="" className="h-40 w-auto" />
                            </div>

                            {/* Logo Display */}
                            <div className="flex justify-between items-start border-b border-slate-50 pb-10">
                                <img src="/logo.png" alt="InvoiceOS" className="h-12 w-auto grayscale opacity-50" />
                                <div className="text-right space-y-1">
                                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">INVOICE</h2>
                                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">#{invoiceNumber}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Your Professional Identity</label>
                                    <input 
                                        type="text" 
                                        placeholder="Business Name" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                    <textarea 
                                        placeholder="Business Address" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                        rows={3}
                                        value={companyAddress}
                                        onChange={(e) => setCompanyAddress(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Recipient Details</label>
                                    <input 
                                        type="text" 
                                        placeholder="Client Name" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                    <input 
                                        type="email" 
                                        placeholder="Client Email" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Meta Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Issue Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Currency</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    >
                                        <option value="NGN">NGN (₦)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">Line Items</label>
                                <div className="space-y-4">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-4 items-center group">
                                            <input 
                                                type="text" 
                                                placeholder="Description" 
                                                className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                                                value={item.description}
                                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                            />
                                            <div className="flex gap-4 w-full md:w-auto">
                                                <input 
                                                    type="number" 
                                                    placeholder="Qty" 
                                                    className="w-24 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-center outline-none focus:bg-white"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Price" 
                                                    className="w-36 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:bg-white"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                                                />
                                                <button 
                                                    onClick={() => removeItem(idx)}
                                                    className="p-4 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={addItem}
                                    className="w-full py-5 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all active:scale-[0.99]"
                                >
                                    + Add Line Item
                                </button>
                            </div>

                            <div className="pt-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Grand Total</p>
                                    <h2 className="text-4xl font-sans font-semibold text-slate-900 tracking-tighter uppercase">
                                        {formatCurrency(total, currency)}
                                    </h2>
                                </div>
                                <button 
                                    onClick={handleDownload}
                                    className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95"
                                >
                                    <Download size={18} />
                                    Download Professional PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar & Premium CTA */}
                    <div className="lg:col-span-5 space-y-12">
                        
                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white space-y-10 shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={160} />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                    <Zap size={14} className="fill-emerald-400" />
                                    The Revenue Engine
                                </div>
                                <h3 className="text-4xl font-sans font-semibold tracking-tight uppercase leading-tight">
                                    Stop manual <br /> typing today
                                </h3>
                                <p className="text-lg font-medium text-slate-400 leading-relaxed">
                                    Unlock automated VAT calculations, recurring billing, and real-time payment tracking.
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        'Save unlimited clients & items',
                                        'Automatic FIRS & IRS compliance',
                                        'Real-time view notifications',
                                        '1-click payment via Flutterwave'
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-xs font-bold text-slate-300">
                                            <ShieldCheck size={20} className="text-emerald-500" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className="block w-full py-6 bg-emerald-600 text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-emerald-900/40">
                                    Start Engine Free
                                </Link>
                            </div>
                        </div>

                        {/* Social Proof */}
                        <div className="bg-white rounded-[3rem] border border-slate-200/60 p-10 space-y-8 shadow-sm">
                            <div className="space-y-4 text-center">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Engine Performance</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[2rem] bg-slate-50 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Users</p>
                                        <p className="text-2xl font-sans font-semibold text-slate-900 tracking-tighter">25.7k+</p>
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-slate-50 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Satisfaction</p>
                                        <p className="text-2xl font-sans font-semibold text-slate-900 tracking-tighter">99.8%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
