'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
    Save, 
    Upload, 
    Globe, 
    Palette, 
    ShieldCheck, 
    Mail, 
    CreditCard,
    Check,
    Layout,
    Clock
} from 'lucide-react';
import clsx from 'clsx';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>({
        company_name: '',
        company_address: '',
        company_email: '',
        brand_color: '#4F46E5',
        custom_domain: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('branding');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/business/me');
                if (res.data) {
                    setSettings({
                        id: res.data.id,
                        company_name: res.data.name,
                        company_address: res.data.address || '',
                        company_email: res.data.supportEmail || '',
                        brand_color: res.data.brandColor || '#4F46E5',
                        custom_domain: res.data.customDomain || ''
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: settings.company_name,
                brandColor: settings.brand_color,
                customDomain: settings.custom_domain
            };
            await api.put(`/business/${settings.id}`, payload);
            alert('InvoiceOS Configuration Saved');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    );

    const tabs = [
        { id: 'branding', name: 'Branding & Identity', icon: Palette },
        { id: 'profile', name: 'Company Profile', icon: Globe },
        { id: 'payments', name: 'Payment Gateways', icon: CreditCard },
        { id: 'notifications', name: 'Communication', icon: Mail }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 pb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Platform Console</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Configure your InvoiceOS Instance</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Clock className="animate-spin" size={18} /> : (
                        <>
                            <Save size={18} />
                            Save Configuration
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id 
                                    ? "bg-white shadow-lg shadow-slate-200/50 text-indigo-600 border border-slate-100" 
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    {activeTab === 'branding' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Visual Identity */}
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Layout size={18} className="text-indigo-600" />
                                    Visual Identity
                                </h3>
                                <div className="flex flex-col md:flex-row gap-10 items-center">
                                    <div className="h-40 w-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group hover:border-indigo-400 transition-colors cursor-pointer overflow-hidden relative">
                                        <Upload size={24} className="text-slate-400 group-hover:text-indigo-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Logo</p>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Accent Color</label>
                                            <div className="flex gap-4">
                                                <input 
                                                    type="color" 
                                                    name="brand_color"
                                                    value={settings.brand_color || '#4F46E5'}
                                                    onChange={handleChange}
                                                    className="h-12 w-12 rounded-xl border-0 p-0 cursor-pointer overflow-hidden shadow-sm"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={settings.brand_color || '#4F46E5'}
                                                    readOnly
                                                    className="flex-1 bg-slate-50 rounded-xl border-slate-100 text-sm font-bold p-3"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-indigo-50 rounded-2xl flex gap-3 items-start">
                                            <ShieldCheck size={16} className="text-indigo-600 mt-0.5" />
                                            <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-wider">
                                                Your logo and brand colors will be applied to all invoices and checkout pages.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* White Label */}
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                    <Globe size={18} className="text-indigo-600" />
                                    Custom Domain
                                </h3>
                                <div className="space-y-4">
                                    <input 
                                        type="text" 
                                        name="custom_domain"
                                        value={settings.custom_domain}
                                        onChange={handleChange}
                                        placeholder="billing.yourcompany.com"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-slate-100 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                    <p className="text-xs text-slate-400 font-medium">Point your CNAME record to <span className="text-indigo-600 font-bold">host.invoiceos.com</span></p>
                                </div>
                            </div>

                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <Globe size={18} className="text-indigo-600" />
                                Business Profile
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                                    <input 
                                        type="text" 
                                        name="company_name"
                                        value={settings.company_name}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-slate-100 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Email</label>
                                    <input 
                                        type="email" 
                                        name="company_email"
                                        value={settings.company_email}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-slate-100 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Address</label>
                                    <textarea 
                                        name="company_address"
                                        rows={3}
                                        value={settings.company_address}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-slate-100 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
                            <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Payment Integrations</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Connect Stripe or Paystack to enable automated payments.</p>
                            <button className="mt-8 px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Connect Provider</button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
                            <Mail size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Communication Settings</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Manage how you interact with your clients.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
