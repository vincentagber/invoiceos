'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
    Save, 
    Upload, 
    Info,
    Clock,
    Lock,
    AlertTriangle,
    Mail,
    ChevronDown,
    Globe,
    Bell,
    Zap,
    ShieldCheck,
    CreditCard,
    Check
} from 'lucide-react';
import clsx from 'clsx';
import { StatusModal } from '@/components/ui/StatusModal';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button 
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
            "w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative flex items-center flex-shrink-0",
            checked ? "bg-[#5E6AD2]" : "bg-slate-200"
        )}
    >
        <span className={clsx(
            "absolute left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm",
            checked ? "translate-x-5" : "translate-x-0"
        )} />
    </button>
);

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    const [settings, setSettings] = useState({
        businessName: '',
        address: '',
        email: '',
        phone: '',
        taxNumber: '',
        paymentDetails: '',

        // Branding
        brandColor: '#5E6AD2',
        logo: null as string | null,
        favicon: null as string | null,
        icon: null as string | null,
        customDomain: '',
        
        // Invoice Defaults
        defaultCurrency: 'NGN',
        invoicePrefix: 'INV',
        defaultDuePeriod: 'Net 30 Days',
        defaultDiscount: '0',
        defaultNotes: '',

        // Workflow
        invoiceReminders: false,
        documentStyle: 'Professional',
        estimatePrefix: 'EST',
        bccEmails: false,

        // Notifications
        autoSendInvoice: false,
        paymentReminders: true,
        dailySummary: false,

        // SMTP
        smtpHost: '',
        smtpPort: '',
        smtpUsername: '',
        smtpPassword: '',
        fromName: '',
        fromEmail: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                if (res.data) {
                    const s = res.data;
                    const smtp = s.smtpConfig || {};
                    setSettings({
                        businessName: s.name || '',
                        address: s.address || '',
                        email: s.email || '',
                        phone: s.phone || '',
                        taxNumber: s.taxNumber || '',
                        paymentDetails: s.paymentDetails || '',
                        brandColor: s.brandColor || '#5E6AD2',
                        logo: s.logo || null,
                        favicon: s.favicon || null,
                        icon: s.icon || null,
                        customDomain: s.customDomain || '',
                        defaultCurrency: s.defaultCurrency || 'NGN',
                        invoicePrefix: s.invoicePrefix || 'INV',
                        defaultDuePeriod: s.defaultDuePeriod || 'Net 30 Days',
                        defaultDiscount: s.defaultDiscount?.toString() || '0',
                        defaultNotes: s.defaultNotes || '',
                        invoiceReminders: s.invoiceReminders || false,
                        documentStyle: s.documentStyle || 'Professional',
                        estimatePrefix: s.estimatePrefix || 'EST',
                        bccEmails: s.bccEmails || false,
                        autoSendInvoice: s.autoSendInvoice || false,
                        paymentReminders: s.paymentReminders || true,
                        dailySummary: s.dailySummary || false,
                        smtpHost: smtp.host || '',
                        smtpPort: smtp.port || '',
                        smtpUsername: smtp.user || '',
                        smtpPassword: smtp.pass || '',
                        fromName: smtp.fromName || '',
                        fromEmail: smtp.fromEmail || '',
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
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon' | 'icon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSettings(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Sequential saves for robust error reporting
            await api.put('/settings/business', {
                businessName: settings.businessName,
                address: settings.address,
                email: settings.email,
                phone: settings.phone,
                taxNumber: settings.taxNumber,
                paymentDetails: settings.paymentDetails
            });

            await api.put('/settings/branding', {
                brandColor: settings.brandColor,
                customDomain: settings.customDomain,
                logo: settings.logo,
                favicon: settings.favicon,
                icon: settings.icon
            });

            await api.put('/settings/invoice-defaults', {
                defaultCurrency: settings.defaultCurrency,
                invoicePrefix: settings.invoicePrefix,
                defaultDuePeriod: settings.defaultDuePeriod,
                defaultDiscount: settings.defaultDiscount,
                defaultNotes: settings.defaultNotes
            });

            await api.put('/settings/workflow', {
                invoiceReminders: settings.invoiceReminders,
                documentStyle: settings.documentStyle,
                estimatePrefix: settings.estimatePrefix,
                bccEmails: settings.bccEmails
            });

            await api.put('/settings/notifications', {
                autoSendInvoice: settings.autoSendInvoice,
                paymentReminders: settings.paymentReminders,
                dailySummary: settings.dailySummary
            });

            await api.put('/settings/email', {
                smtpHost: settings.smtpHost,
                smtpPort: settings.smtpPort,
                smtpUsername: settings.smtpUsername,
                smtpPassword: settings.smtpPassword,
                fromName: settings.fromName,
                fromEmail: settings.fromEmail
            });

            setModalConfig({
                title: 'Institutional Sync Complete',
                message: 'All platform configurations have been successfully committed to the ledger.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || 'Synchronization Error';
            setModalConfig({
                title: 'Operational Failure',
                message: `The ledger refused the update: ${msg}`,
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        setTestingEmail(true);
        try {
            await api.post('/settings/email/test', {
                smtpHost: settings.smtpHost,
                smtpPort: settings.smtpPort,
                smtpUsername: settings.smtpUsername,
                smtpPassword: settings.smtpPassword,
                fromName: settings.fromName,
                fromEmail: settings.fromEmail
            });
            setModalConfig({
                title: 'Verification Dispatched',
                message: 'A test email has been successfully queued for delivery.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || 'SMTP Failure';
            setModalConfig({
                title: 'Email Operational Failure',
                message: `SMTP verification failed: ${msg}`,
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setTestingEmail(false);
        }
    };

    const handleDeleteBusiness = async () => {
        if (!confirm('CRITICAL: Are you sure you want to terminate this institutional workspace? This action is permanent.')) return;
        
        try {
            await api.delete('/settings/business');
            setModalConfig({
                title: 'Workspace Terminated',
                message: 'The institutional business has been successfully decommissioned.',
                type: 'success'
            });
            setShowModal(true);
            setTimeout(() => window.location.href = '/dashboard', 2000);
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message;
            setModalConfig({
                title: 'Termination Refused',
                message: `The system blocked the deletion: ${msg}`,
                type: 'error'
            });
            setShowModal(true);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
        </div>
    );

    const inputClasses = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all";
    const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1";
    const gridLayout = "grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-start";

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 font-sans animate-in fade-in duration-700">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Console Settings</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Manage institutional identity and revenue protocols.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                    {saving ? <Clock className="animate-spin" size={16} /> : (
                        <span className="flex items-center gap-3"><Save size={14} /> Synchronize Ledger</span>
                    )}
                </button>
            </div>

            <div className="space-y-10">
                
                {/* 1. Business Profile */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">1. Business Profile</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Core institutional data for generated documents.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className={labelClasses}>Legal Entity Name</label>
                            <input type="text" name="businessName" value={settings.businessName} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Institutional Email</label>
                            <input type="email" name="email" value={settings.email} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className={labelClasses}>Physical Address</label>
                            <textarea name="address" rows={3} value={settings.address} onChange={handleChange} className={clsx(inputClasses, "resize-none")} />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Contact Terminal (Phone)</label>
                            <input type="text" name="phone" value={settings.phone} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Tax Identity (TIN/RC)</label>
                            <input type="text" name="taxNumber" value={settings.taxNumber} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className={labelClasses}>Default Financial Settlement Details</label>
                            <textarea name="paymentDetails" rows={3} value={settings.paymentDetails} onChange={handleChange} className={clsx(inputClasses, "resize-none")} />
                        </div>
                    </div>
                </div>

                {/* 2. Branding */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">2. Institutional Branding</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <label className={labelClasses}>Brand Architecture</label>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                    {settings.logo ? (
                                        <img src={settings.logo} className="h-full w-full object-contain p-4" />
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No Logo Uploaded</span>
                                    )}
                                </div>
                                <label className="shrink-0 h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                                    <Upload size={18} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className={labelClasses}>Institutional Color</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    name="brandColor"
                                    value={settings.brandColor}
                                    onChange={handleChange}
                                    className="h-14 w-14 rounded-2xl border-0 p-0 cursor-pointer overflow-hidden shadow-lg flex-shrink-0"
                                />
                                <input type="text" name="brandColor" value={settings.brandColor} onChange={handleChange} className={clsx(inputClasses, "uppercase font-mono")} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className={labelClasses}>Favicon Cluster</label>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                                    {settings.favicon ? (
                                        <img src={settings.favicon} className="h-full w-full object-cover" />
                                    ) : (
                                        <Globe size={18} className="text-slate-200" />
                                    )}
                                </div>
                                <label className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 cursor-pointer transition-colors">
                                    Upload Favicon
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className={labelClasses}>App Icon Node</label>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
                                    {settings.icon ? (
                                        <img src={settings.icon} className="h-full w-full object-cover" />
                                    ) : (
                                        <Zap size={20} className="text-white" fill="currentColor" />
                                    )}
                                </div>
                                <label className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 cursor-pointer transition-colors">
                                    Upload Icon
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'icon')} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Invoice Defaults */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">3. Ledger Defaults</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Standardized values for newly minted documents.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className={labelClasses}>Primary Currency</label>
                            <select name="defaultCurrency" value={settings.defaultCurrency} onChange={handleChange} className={inputClasses}>
                                <option value="NGN">NGN (₦)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Invoice Alpha-Prefix</label>
                            <input type="text" name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Standard Due Protocol</label>
                            <select name="defaultDuePeriod" value={settings.defaultDuePeriod} onChange={handleChange} className={inputClasses}>
                                <option value="Net 15 Days">Net 15 Days</option>
                                <option value="Net 30 Days">Net 30 Days</option>
                                <option value="Due on Receipt">Due on Receipt</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Baseline Yield Discount (%)</label>
                            <input type="number" name="defaultDiscount" value={settings.defaultDiscount} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className={labelClasses}>Institutional Terms & Notes</label>
                            <textarea name="defaultNotes" rows={3} value={settings.defaultNotes} onChange={handleChange} className={clsx(inputClasses, "resize-none")} />
                        </div>
                    </div>
                </div>

                {/* 4. Workflow Preferences */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">4. Workflow Engines</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between gap-6 border-b border-slate-50 pb-8">
                            <div className="space-y-1">
                                <label className="text-[12px] font-black uppercase text-slate-900">Institutional Reminders</label>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allow clients to anchor reminders to their local calendars.</p>
                            </div>
                            <Toggle checked={settings.invoiceReminders} onChange={(v) => setSettings({...settings, invoiceReminders: v})} />
                        </div>

                        <div className="flex items-center justify-between gap-6 border-b border-slate-50 pb-8">
                            <div className="space-y-1">
                                <label className="text-[12px] font-black uppercase text-slate-900">Document Visual Aesthetic</label>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select the institutional skin for outgoing PDFs.</p>
                            </div>
                            <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
                                {['Minimal', 'Professional', 'Bold'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setSettings({...settings, documentStyle: opt})}
                                        className={clsx(
                                            "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", 
                                            settings.documentStyle === opt ? "bg-white shadow-xl text-slate-900" : "text-slate-300 hover:text-slate-500"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-6">
                            <div className="space-y-1">
                                <label className="text-[12px] font-black uppercase text-slate-900">Routing Redundancy (BCC)</label>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronize all outgoing traffic to your archive terminal.</p>
                            </div>
                            <Toggle checked={settings.bccEmails} onChange={(v) => setSettings({...settings, bccEmails: v})} />
                        </div>
                    </div>
                </div>

                {/* 5. Notifications & Automation */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">5. Automation Protocols</h2>
                    </div>

                    <div className="space-y-8">
                        {[
                            { id: 'autoSendInvoice', label: 'Autonomous Dispatch', desc: 'Instantly transmit invoices triggered via API hooks.' },
                            { id: 'paymentReminders', label: 'Overdue Interception', desc: 'Automated follow-ups for expired ledger items.' },
                            { id: 'dailySummary', label: 'Institutional Briefing', desc: 'Daily revenue digest delivered at 08:00 UTC.' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-6 border-b border-slate-50 last:border-0 pb-8 last:pb-0">
                                <div className="space-y-1">
                                    <label className="text-[12px] font-black uppercase text-slate-900">{item.label}</label>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                                </div>
                                <Toggle checked={(settings as any)[item.id]} onChange={(v) => setSettings({...settings, [item.id]: v})} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Email Integrations (SMTP) */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">6. Communication Infrastructure</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Deploy your institutional domain for document transit.</p>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white flex gap-6 items-center">
                        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Zap size={24} className="text-emerald-400" />
                        </div>
                        <p className="text-[11px] font-bold uppercase leading-relaxed tracking-wider">
                            By deploying your own SMTP node, you gain full control over deliverability and institutional branding. Ensure your SPF and DKIM records are correctly anchored.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className={labelClasses}>SMTP Relay Host</label>
                            <input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange} className={inputClasses} placeholder="smtp.provider.com" />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Encryption Port</label>
                            <input type="text" name="smtpPort" value={settings.smtpPort} onChange={handleChange} className={inputClasses} placeholder="587" />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Credential Username</label>
                            <input type="text" name="smtpUsername" value={settings.smtpUsername} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Security Token / Key</label>
                            <input type="password" name="smtpPassword" value={settings.smtpPassword} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Dispatch Identity (From Name)</label>
                            <input type="text" name="fromName" value={settings.fromName} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-3">
                            <label className={labelClasses}>Institutional From Address</label>
                            <input type="text" name="fromEmail" value={settings.fromEmail} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSendTestEmail}
                            disabled={testingEmail}
                            className="flex items-center gap-3 px-8 py-3.5 bg-slate-50 border border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {testingEmail ? <Clock className="animate-spin" size={14} /> : <><Mail size={14} /> Send Verification Pulse</>}
                        </button>
                    </div>
                </div>

                {/* Sub Footer Actions */}
                <div className="flex justify-end pb-12">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(15,23,42,0.2)] hover:bg-slate-800 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Clock className="animate-spin" size={18} /> : "Synchronize Console Preferences"}
                    </button>
                </div>

                {/* 7. Business Management */}
                <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-rose-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-rose-600 uppercase tracking-tight flex items-center gap-3">
                                <AlertTriangle size={24} /> 7. Workspace Termination
                            </h2>
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-2">Caution: Destructive protocols below. Proceed with care.</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Active Workspace</span>
                        </div>
                    </div>
                    
                    <div className="p-10 space-y-10">
                        <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl flex gap-6 items-start">
                            <Lock size={20} className="text-rose-600 shrink-0 mt-1" />
                            <div className="space-y-4">
                                <p className="text-[11px] font-bold text-rose-800 uppercase leading-relaxed tracking-wider">
                                    Terminating this institutional workspace will result in the permanent decommissioning of all related invoices, client records, and financial intelligence. Any active subscription nodes must be manually severed prior to termination.
                                </p>
                                <button 
                                    onClick={handleDeleteBusiness}
                                    className="text-[11px] font-black text-rose-600 hover:text-rose-700 underline uppercase tracking-[0.2em] decoration-2 underline-offset-4"
                                >
                                    Initiate Termination Protocol
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <StatusModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel="Acknowledge"
            />
        </div>
    );
}
