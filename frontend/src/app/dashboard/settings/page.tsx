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
    ChevronDown
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
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    const [settings, setSettings] = useState({
        businessName: 'InvoiceOS',
        address: '123 Tech Boulevard\nSan Francisco, CA 94105',
        email: 'billing@invoiceos.com',
        phone: '+1 (555) 123-4567',
        taxNumber: '12-3456789',
        paymentDetails: 'Bank: Chase\nAccount: 123456789\nRouting: 987654321',

        // Branding
        brandColor: '#5E6AD2',
        
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
        smtpHost: 'smtp.sendgrid.net',
        smtpPort: '587',
        smtpUsername: 'apikey',
        smtpPassword: '••••••••••••••••',
        fromName: 'InvoiceOS Billing',
        fromEmail: 'billing@invoiceos.com',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/business/me');
                if (res.data) {
                    setSettings(prev => ({
                        ...prev,
                        businessName: res.data.name || prev.businessName,
                        address: res.data.address || prev.address,
                        email: res.data.supportEmail || prev.email,
                        brandColor: res.data.brandColor || prev.brandColor,
                    }));
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                name: settings.businessName,
                address: settings.address,
                supportEmail: settings.email,
                brandColor: settings.brandColor,
            };
            await api.put(`/business/me`, payload);
            setModalConfig({
                title: 'Configuration Saved',
                message: 'Your platform settings have been successfully synchronized.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error) {
            console.error(error);
            setModalConfig({
                title: 'Update Failed',
                message: 'We encountered an error saving your preferences. Please try again.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#5E6AD2] border-t-transparent rounded-full" />
        </div>
    );

    const inputClasses = "w-full bg-slate-50/80 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#5E6AD2] transition-colors";
    const labelClasses = "text-sm font-semibold text-slate-800";
    const gridLayout = "grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-start";

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans antialiased">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your InvoiceOS instance and revenue operations.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium shadow-sm hover:bg-[#4E5AC2] transition-colors active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                    {saving ? <Clock className="animate-spin" size={16} /> : (
                        <>
                            <Save size={16} />
                            Save All Settings
                        </>
                    )}
                </button>
            </div>

            <div className="space-y-6">
                
                {/* 1. Business Profile */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">1. Business Profile</h2>
                        <p className="text-sm text-slate-500 mt-1">These details appear on your generated invoices.</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className={gridLayout}>
                            <label className={labelClasses}>Business Name</label>
                            <div className="md:col-span-2">
                                <input type="text" name="businessName" value={settings.businessName} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Address</label>
                            <div className="md:col-span-2">
                                <textarea name="address" rows={3} value={settings.address} onChange={handleChange} className={clsx(inputClasses, "resize-none")} />
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Email</label>
                            <div className="md:col-span-2">
                                <input type="email" name="email" value={settings.email} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Phone</label>
                            <div className="md:col-span-2 flex items-center">
                                {/* Simulated Flag Dropdown */}
                                <div className="absolute pl-3 flex items-center pointer-events-none">
                                    <span className="text-lg mr-1">🇺🇸</span>
                                    <span className="text-sm text-slate-500 border-r border-slate-300 pr-2">+1</span>
                                </div>
                                <input type="text" name="phone" value={settings.phone.replace('+1 ', '')} onChange={handleChange} className={clsx(inputClasses, "pl-16")} />
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>IRS / TIN / RC Number</label>
                            <div className="md:col-span-2">
                                <input type="text" name="taxNumber" value={settings.taxNumber} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <div>
                                <label className={labelClasses}>Default Payment Details</label>
                                <p className="text-xs text-slate-400 mt-1">Include bank details, wire instructions, Zelle or PayPal links.</p>
                            </div>
                            <div className="md:col-span-2">
                                <textarea name="paymentDetails" rows={3} value={settings.paymentDetails} onChange={handleChange} className={clsx(inputClasses, "resize-none")} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Branding */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">2. Branding</h2>
                    </div>

                    <div className="space-y-8">
                        <div className={gridLayout}>
                            <div>
                                <label className={labelClasses}>Brand Logo</label>
                                <p className="text-xs text-slate-400 mt-1">Displayed on invoices.</p>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-4">
                                <div className="h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <span className="text-indigo-600 font-bold text-xl flex items-center gap-1"><span className="text-emerald-500 font-black tracking-tighter">OS</span>Invoice</span>
                                </div>
                                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                                    <Upload size={14} /> Upload Image
                                </button>
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <div>
                                <label className={labelClasses}>Favicon / Icon</label>
                                <p className="text-xs text-slate-400 mt-1">Small icon used in browser tabs and as a fallback if no logo is present. Recommended size: 32x32px.</p>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-4">
                                <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                                    <div className="h-6 w-6 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-md shadow-sm"></div>
                                </div>
                                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                                    <Upload size={14} /> Upload Icon
                                </button>
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <div>
                                <label className={labelClasses}>Brand Color</label>
                                <p className="text-xs text-slate-400 mt-1">Used for highlights, buttons, and accents on your invoices.</p>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-3">
                                <input 
                                    type="color" 
                                    name="brandColor"
                                    value={settings.brandColor}
                                    onChange={handleChange}
                                    className="h-10 w-10 rounded border-0 p-0 cursor-pointer overflow-hidden shadow-sm flex-shrink-0"
                                />
                                <input type="text" name="brandColor" value={settings.brandColor} onChange={handleChange} className={clsx(inputClasses, "max-w-[120px] uppercase font-mono")} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Invoice Defaults */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">3. Invoice Defaults</h2>
                        <p className="text-sm text-slate-500 mt-1">Set default values for when creating new invoices or estimates.</p>
                    </div>

                    <div className="space-y-6">
                        <div className={gridLayout}>
                            <label className={labelClasses}>Default Currency</label>
                            <div className="md:col-span-2">
                                <select name="defaultCurrency" value={settings.defaultCurrency} onChange={handleChange} className={clsx(inputClasses, "max-w-[200px]")}>
                                    <option value="NGN">NGN (₦)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Invoice Prefix</label>
                            <div className="md:col-span-2 flex items-center gap-3">
                                <input type="text" name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} className={clsx(inputClasses, "max-w-[120px]")} />
                                <span className="text-sm text-slate-400">e.g., INV-0001</span>
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Default Due Period</label>
                            <div className="md:col-span-2">
                                <select name="defaultDuePeriod" value={settings.defaultDuePeriod} onChange={handleChange} className={clsx(inputClasses, "max-w-[200px]")}>
                                    <option value="Net 15 Days">Net 15 Days</option>
                                    <option value="Net 30 Days">Net 30 Days</option>
                                    <option value="Due on Receipt">Due on Receipt</option>
                                </select>
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Default Discount (%)</label>
                            <div className="md:col-span-2">
                                <input type="number" name="defaultDiscount" value={settings.defaultDiscount} onChange={handleChange} className={clsx(inputClasses, "max-w-[120px]")} />
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Default Notes / Terms</label>
                            <div className="md:col-span-2">
                                <textarea name="defaultNotes" rows={3} value={settings.defaultNotes} onChange={handleChange} className={clsx(inputClasses, "resize-none")} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Workflow Preferences */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">4. Workflow Preferences</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure how documents are structured and handled.</p>
                    </div>

                    <div className="space-y-6">
                        <div className={gridLayout}>
                            <div>
                                <label className={labelClasses}>Invoice Reminders</label>
                                <p className="text-xs text-slate-400 mt-1">Allow clients to add reminders to their calendar directly from the invoice link. <a href="#" className="text-[#5E6AD2] hover:underline">Learn more about reminders →</a></p>
                            </div>
                            <div className="md:col-span-2 flex justify-end md:justify-start">
                                <Toggle checked={settings.invoiceReminders} onChange={(v) => setSettings({...settings, invoiceReminders: v})} />
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <div>
                                <label className={labelClasses}>Document Style</label>
                                <p className="text-xs text-slate-400 mt-1">Choose the visual aesthetic for your generated PDF invoices and estimates. <a href="#" className="text-[#5E6AD2] hover:underline">Preview Styles →</a></p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="inline-flex bg-slate-100 p-1 rounded-lg">
                                    {['Minimal', 'Professional', 'Bold'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setSettings({...settings, documentStyle: opt})}
                                            className={clsx(
                                                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors", 
                                                settings.documentStyle === opt ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <label className={labelClasses}>Estimate Prefix</label>
                            <div className="md:col-span-2 flex items-center gap-3">
                                <input type="text" name="estimatePrefix" value={settings.estimatePrefix} onChange={handleChange} className={clsx(inputClasses, "max-w-[120px]")} />
                                <span className="text-sm text-slate-400">e.g., EST-0001</span>
                            </div>
                        </div>

                        <div className={gridLayout}>
                            <div>
                                <label className={labelClasses}>BCC Email Addresses</label>
                                <p className="text-xs text-slate-400 mt-1">Automatically send a copy of all outgoing invoices, receipts, and estimates to another email. <a href="#" className="text-[#5E6AD2] hover:underline">Learn about routing →</a></p>
                            </div>
                            <div className="md:col-span-2 flex justify-end md:justify-start">
                                <Toggle checked={settings.bccEmails} onChange={(v) => setSettings({...settings, bccEmails: v})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Notifications & Automation */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">5. Notifications & Automation</h2>
                        <p className="text-sm text-slate-500 mt-1">Control your background revenue engines.</p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-6">
                            <div>
                                <label className={labelClasses}>Auto-Send Invoice Generation</label>
                                <p className="text-xs text-slate-400 mt-1">Automatically dispatch drafted invoices when API triggers them. <a href="#" className="text-[#5E6AD2] hover:underline">Read API Docs →</a></p>
                            </div>
                            <Toggle checked={settings.autoSendInvoice} onChange={(v) => setSettings({...settings, autoSendInvoice: v})} />
                        </div>

                        <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-6">
                            <div>
                                <label className={labelClasses}>Payment Reminders</label>
                                <p className="text-xs text-slate-400 mt-1">Send automated follow-ups for overdue invoices based on terms selected.</p>
                            </div>
                            <Toggle checked={settings.paymentReminders} onChange={(v) => setSettings({...settings, paymentReminders: v})} />
                        </div>

                        <div className="flex items-start justify-between gap-4 pb-2">
                            <div>
                                <label className={labelClasses}>Daily Summary</label>
                                <p className="text-xs text-slate-400 mt-1">Receive a digest email every morning with revenue statistics and tasks.</p>
                            </div>
                            <Toggle checked={settings.dailySummary} onChange={(v) => setSettings({...settings, dailySummary: v})} />
                        </div>
                    </div>
                </div>

                {/* 6. Email Integrations (SMTP) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">6. Email Integrations (SMTP)</h2>
                        <p className="text-sm text-slate-500 mt-1">Send invoices directly from your own email domain. By default, emails are sent via <span className="font-semibold text-slate-700">delivery@invoiceos.com</span>.</p>
                    </div>

                    <div className="bg-[#eff2fe] border border-indigo-100 p-4 rounded-lg flex gap-3 text-sm text-indigo-800">
                        <Info size={20} className="text-[#5E6AD2] flex-shrink-0" />
                        <p>
                            Don't have an SMTP server? You can use a service like <strong>SendGrid</strong> or <strong>Mailgun</strong> and plug their credentials here to send emails from your custom domain.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={labelClasses}>SMTP Host</label>
                            <input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>SMTP Port</label>
                            <input type="text" name="smtpPort" value={settings.smtpPort} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>Username</label>
                            <input type="text" name="smtpUsername" value={settings.smtpUsername} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>Password / API Key</label>
                            <input type="password" name="smtpPassword" value={settings.smtpPassword} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>From Name</label>
                            <input type="text" name="fromName" value={settings.fromName} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>From Email</label>
                            <input type="text" name="fromEmail" value={settings.fromEmail} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors">
                            <Mail size={16} /> Send Test Email
                        </button>
                    </div>
                </div>

                {/* Sub Footer Actions */}
                <div className="flex justify-end pb-8">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium shadow-sm hover:bg-[#4E5AC2] transition-colors active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Clock className="animate-spin" size={16} /> : "Save All Settings"}
                    </button>
                </div>

                {/* 7. Business Management */}
                <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-rose-100">
                        <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                            <AlertTriangle size={20} /> 7. Business Management
                        </h2>
                        <p className="text-sm text-rose-500 mt-1">Caution: Destructive actions below. Proceed with care.</p>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <div>
                                <label className={labelClasses}>Active Workspace</label>
                                <p className="text-xs text-slate-400 mt-1">The business you are currently viewing and managing.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900">invoiceos</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 tracking-wider">ACTIVE</span>
                            </div>
                        </div>

                        <div>
                            <button className="text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline">
                                Delete this business
                            </button>
                            <p className="text-xs text-slate-400 mt-1 mb-4">Permanently delete this business and all its data. This action cannot be undone. Any active subscriptions must be canceled first to avoid continued charges.</p>
                            
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                                <Lock size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs font-semibold text-amber-800">
                                    You cannot delete your only business. Create another business first before attempting to delete this one.
                                </p>
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
                actionLabel="Dismiss"
            />
        </div>
    );
}
