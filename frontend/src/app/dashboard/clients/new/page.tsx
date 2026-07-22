'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/useToast';
import { 
    ChevronRight, 
    Save, 
    X, 
    Globe, 
    Mail, 
    Phone, 
    MapPin, 
    Building2, 
    CreditCard,
    ShieldCheck,
    Languages
} from 'lucide-react';
import { StatusModal } from '@/components/ui/StatusModal';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export default function NewClientPage() {
    const router = useRouter();
    const { user } = useAuth();
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        legalName: '',
        website: '',
        contactName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        taxId: '',
        currency: 'USD',
        paymentTerms: 'net30',
        taxRule: 'exempt'
    });

    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.organizations?.[0]?.id) {
            setModalConfig({
                title: 'Session Error',
                message: 'No active organization found. Please relogin to continue.',
                type: 'error'
            });
            setShowModal(true);
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/clients', {
                ...formData,
                address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`,
                businessId: user.organizations[0].id
            });
            setModalConfig({
                title: 'Partner Registered',
                message: 'The new revenue partner has been successfully integrated into your database.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error) {
            toast.error('Failed to create client');
            setModalConfig({
                title: 'Registration Failed',
                message: 'We encountered an error while adding this partner. Please check all fields.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1024px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700 overflow-x-hidden">
            {/* Custom Breadcrumbs & Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="space-y-4">
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <Link href="/dashboard/clients" className="hover:text-slate-900 transition-colors">Clients</Link>
                        <ChevronRight size={12} className="text-slate-300" />
                        <span className="text-slate-900">Add New Partner</span>
                    </nav>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Add New Partner</h1>
                        <p className="text-slate-500 mt-2 font-medium">Enter the institutional details to register a new billing entity.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Partner Identity Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-5 sm:p-10 space-y-8 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                            <Building2 size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Partner Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="name">Business Name *</label>
                            <input 
                                required
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                placeholder="Acme Corp" 
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="legalName">Legal Entity Name</label>
                            <input 
                                id="legalName"
                                value={formData.legalName}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                placeholder="Acme Corporation LLC" 
                                type="text"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="website">Website</label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={16} />
                                <input 
                                    id="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    placeholder="https://www.acmecorp.com" 
                                    type="url"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-5 sm:p-10 space-y-8 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                            <Mail size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Contact Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="contactName">Primary Contact Person *</label>
                            <input 
                                required
                                id="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                placeholder="Jane Doe" 
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="email">Email Address *</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={16} />
                                <input 
                                    required
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    placeholder="billing@acmecorp.com" 
                                    type="email"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="phone">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={16} />
                                <input 
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    placeholder="+1 (555) 000-0000" 
                                    type="tel"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid for Address & Financial */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Business Address Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-5 sm:p-10 space-y-8 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                                <MapPin size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Business Address</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="street">Street Address</label>
                                <input 
                                    id="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    placeholder="123 Financial District Blvd" 
                                    type="text"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="city">City</label>
                                    <input 
                                        id="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        placeholder="New York" 
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="state">State</label>
                                    <input 
                                        id="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        placeholder="NY" 
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="zip">ZIP Code</label>
                                    <input 
                                        id="zip"
                                        value={formData.zip}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        placeholder="10004" 
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="country">Country</label>
                                    <select 
                                        id="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    >
                                        <option value="United States">United States</option>
                                        <option value="Canada">Canada</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="European Union">European Union</option>
                                        <option value="Nigeria">Nigeria</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Configuration Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-5 sm:p-10 space-y-8 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Financial Config</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="taxId">Tax ID / VAT Number</label>
                                <input 
                                    id="taxId"
                                    value={formData.taxId}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all font-mono"
                                    placeholder="XX-XXXXXXX" 
                                    type="text"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="currency">Default Currency</label>
                                <select 
                                    id="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="NGN">NGN - Nigerian Naira</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="paymentTerms">Payment Terms</label>
                                <select 
                                    id="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                >
                                    <option value="net0">Due on Receipt</option>
                                    <option value="net15">Net 15</option>
                                    <option value="net30">Net 30</option>
                                    <option value="net60">Net 60</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block" htmlFor="taxRule">Default Tax Rule</label>
                                <select 
                                    id="taxRule"
                                    value={formData.taxRule}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                >
                                    <option value="standard">Standard Rate (7.5%)</option>
                                    <option value="exempt">Tax Exempt</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="pt-10 flex items-center justify-end gap-4">
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={submitting}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 px-10 font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Registering...' : 'Save Partner'}
                        <Save size={16} />
                    </button>
                </div>
            </form>

            <StatusModal 
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (modalConfig.type === 'success') {
                        router.push('/dashboard/clients');
                    }
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel={modalConfig.type === 'success' ? 'View Partners' : 'Close'}
            />
        </div>
    );
}
