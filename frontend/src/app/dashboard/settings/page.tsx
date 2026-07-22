'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/lib/useToast';
import { Save, Upload, Clock, Lock, AlertTriangle, Mail, Globe, Zap, X } from 'lucide-react';
import clsx from 'clsx';
import { StatusModal } from '@/components/ui/StatusModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={clsx('w-10 h-5 rounded-full transition-colors duration-200 relative flex items-center shrink-0', checked ? 'bg-primary' : 'bg-border')}>
    <span className={clsx('absolute left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm', checked ? 'translate-x-5' : 'translate-x-0')} />
  </button>
);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; onConfirm: () => void; title: string; message: string; variant?: 'danger' | 'warning' | 'info' }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

  const [settings, setSettings] = useState({
    businessName: '', address: '', email: '', phone: '', taxNumber: '', paymentDetails: '',
    brandColor: '#2563EB', logo: null as string | null, favicon: null as string | null, icon: null as string | null, customDomain: '',
    defaultCurrency: 'NGN', invoicePrefix: 'INV', defaultDuePeriod: 'Net 30 Days', defaultDiscount: '0', defaultNotes: '',
    invoiceReminders: false, documentStyle: 'Professional', estimatePrefix: 'EST', bccEmails: false,
    autoSendInvoice: false, paymentReminders: true, dailySummary: false,
    smtpHost: '', smtpPort: '', smtpUsername: '', smtpPassword: '', fromName: '', fromEmail: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          const s = res.data;
          const smtp = s.smtpConfig || {};
          setSettings(prev => ({
            ...prev,
            businessName: s.name || '', address: s.address || '', email: s.email || '', phone: s.phone || '',
            taxNumber: s.taxNumber || '', paymentDetails: s.paymentDetails || '',
            brandColor: s.brandColor || '#2563EB', logo: s.logo || null, favicon: s.favicon || null, icon: s.icon || null, customDomain: s.customDomain || '',
            defaultCurrency: s.defaultCurrency || 'NGN', invoicePrefix: s.invoicePrefix || 'INV',
            defaultDuePeriod: s.defaultDuePeriod || 'Net 30 Days', defaultDiscount: s.defaultDiscount?.toString() || '0', defaultNotes: s.defaultNotes || '',
            invoiceReminders: s.invoiceReminders || false, documentStyle: s.documentStyle || 'Professional', estimatePrefix: s.estimatePrefix || 'EST', bccEmails: s.bccEmails || false,
            autoSendInvoice: s.autoSendInvoice || false, paymentReminders: s.paymentReminders ?? true, dailySummary: s.dailySummary || false,
            smtpHost: smtp.host || '', smtpPort: smtp.port || '', smtpUsername: smtp.user || '', smtpPassword: smtp.pass || '', fromName: smtp.fromName || '', fromEmail: smtp.fromEmail || '',
          }));
        }
      } catch { toast.error('Failed to load settings'); }
      finally { setLoading(false); }
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
    reader.onloadend = () => setSettings(prev => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/settings/business', { businessName: settings.businessName, address: settings.address, email: settings.email, phone: settings.phone, taxNumber: settings.taxNumber, paymentDetails: settings.paymentDetails }),
        api.put('/settings/branding', { brandColor: settings.brandColor, customDomain: settings.customDomain, logo: settings.logo, favicon: settings.favicon, icon: settings.icon }),
        api.put('/settings/invoice-defaults', { defaultCurrency: settings.defaultCurrency, invoicePrefix: settings.invoicePrefix, defaultDuePeriod: settings.defaultDuePeriod, defaultDiscount: settings.defaultDiscount, defaultNotes: settings.defaultNotes }),
        api.put('/settings/workflow', { invoiceReminders: settings.invoiceReminders, documentStyle: settings.documentStyle, estimatePrefix: settings.estimatePrefix, bccEmails: settings.bccEmails }),
        api.put('/settings/notifications', { autoSendInvoice: settings.autoSendInvoice, paymentReminders: settings.paymentReminders, dailySummary: settings.dailySummary }),
        api.put('/settings/email', { smtpHost: settings.smtpHost, smtpPort: settings.smtpPort, smtpUsername: settings.smtpUsername, smtpPassword: settings.smtpPassword, fromName: settings.fromName, fromEmail: settings.fromEmail }),
      ]);
      setModalConfig({ title: 'Settings Saved', message: 'All platform configurations have been updated successfully.', type: 'success' });
      setShowModal(true);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Save failed';
      setModalConfig({ title: 'Save Failed', message: `Could not save settings: ${msg}`, type: 'error' });
      setShowModal(true);
    } finally { setSaving(false); }
  };

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    try {
      await api.post('/settings/email/test', { smtpHost: settings.smtpHost, smtpPort: settings.smtpPort, smtpUsername: settings.smtpUsername, smtpPassword: settings.smtpPassword, fromName: settings.fromName, fromEmail: settings.fromEmail });
      setModalConfig({ title: 'Test Email Sent', message: 'A test email has been queued for delivery.', type: 'success' });
      setShowModal(true);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'SMTP Failure';
      setModalConfig({ title: 'Email Test Failed', message: `SMTP verification failed: ${msg}`, type: 'error' });
      setShowModal(true);
    } finally { setTestingEmail(false); }
  };

  const handleDeleteBusiness = () => {
    setConfirmState({
      isOpen: true,
      onConfirm: async () => {
        try {
          await api.delete('/settings/business');
          setModalConfig({ title: 'Workspace Terminated', message: 'The business has been decommissioned.', type: 'success' });
          setShowModal(true);
          setTimeout(() => window.location.href = '/dashboard', 2000);
        } catch (error: any) {
          const msg = error.response?.data?.error || error.message;
          setModalConfig({ title: 'Termination Refused', message: `System blocked deletion: ${msg}`, type: 'error' });
          setShowModal(true);
        }
      },
      title: 'Terminate Workspace',
      message: 'Are you sure you want to terminate this workspace? This action is permanent.',
      variant: 'danger',
    });
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  const inputClasses = 'w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all';
  const labelClasses = 'text-xs font-medium text-text-secondary mb-1.5 block';

  const sections = [
    {
      id: 'business',
      title: '1. Business Profile',
      desc: 'Core institutional data for generated documents.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClasses}>Business Name</label><input type="text" name="businessName" value={settings.businessName} onChange={handleChange} className={inputClasses} /></div>
          <div><label className={labelClasses}>Email</label><input type="email" name="email" value={settings.email} onChange={handleChange} className={inputClasses} /></div>
          <div className="md:col-span-2"><label className={labelClasses}>Address</label><textarea name="address" rows={2} value={settings.address} onChange={handleChange} className={clsx(inputClasses, 'resize-none')} /></div>
          <div><label className={labelClasses}>Phone</label><input type="text" name="phone" value={settings.phone} onChange={handleChange} className={inputClasses} /></div>
          <div><label className={labelClasses}>Tax ID</label><input type="text" name="taxNumber" value={settings.taxNumber} onChange={handleChange} className={inputClasses} /></div>
          <div className="md:col-span-2"><label className={labelClasses}>Payment Details</label><textarea name="paymentDetails" rows={2} value={settings.paymentDetails} onChange={handleChange} className={clsx(inputClasses, 'resize-none')} /></div>
        </div>
      ),
    },
    {
      id: 'branding',
      title: '2. Branding',
      desc: 'Visual identity for your documents.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className={labelClasses}>Logo</label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-full bg-surface-secondary border border-border rounded-xl flex items-center justify-center overflow-hidden">
                {settings.logo ? <img src={settings.logo} className="h-full w-full object-contain p-2" /> : <span className="text-[10px] text-text-tertiary">No logo</span>}
              </div>
              <label className="shrink-0 h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
                <Upload size={16} /><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="brandColor" value={settings.brandColor} onChange={handleChange} className="h-10 w-10 rounded-xl border-0 p-0 cursor-pointer overflow-hidden shrink-0" />
              <input type="text" name="brandColor" value={settings.brandColor} onChange={handleChange} className={clsx(inputClasses, 'uppercase font-mono')} />
            </div>
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>Favicon</label>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-surface-secondary border border-border rounded-xl flex items-center justify-center overflow-hidden">
                {settings.favicon ? <img src={settings.favicon} className="h-full w-full object-cover" /> : <Globe size={16} className="text-text-tertiary" />}
              </div>
              <label className="px-3 py-2 bg-surface-secondary border border-border rounded-xl text-[10px] font-medium text-text-secondary hover:bg-surface-tertiary cursor-pointer transition-colors">
                Upload<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <label className={labelClasses}>App Icon</label>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
                {settings.icon ? <img src={settings.icon} className="h-full w-full object-cover" /> : <Zap size={18} className="text-white" />}
              </div>
              <label className="px-3 py-2 bg-surface-secondary border border-border rounded-xl text-[10px] font-medium text-text-secondary hover:bg-surface-tertiary cursor-pointer transition-colors">
                Upload<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'icon')} />
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'defaults',
      title: '3. Invoice Defaults',
      desc: 'Standardized values for newly minted documents.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClasses}>Default Currency</label>
            <select name="defaultCurrency" value={settings.defaultCurrency} onChange={handleChange} className={inputClasses}>
              <option value="NGN">NGN (₦)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option><option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div><label className={labelClasses}>Invoice Prefix</label><input type="text" name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} className={inputClasses} /></div>
          <div><label className={labelClasses}>Due Period</label>
            <select name="defaultDuePeriod" value={settings.defaultDuePeriod} onChange={handleChange} className={inputClasses}>
              <option value="Net 15 Days">Net 15 Days</option><option value="Net 30 Days">Net 30 Days</option><option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>
          <div><label className={labelClasses}>Default Discount (%)</label><input type="number" name="defaultDiscount" value={settings.defaultDiscount} onChange={handleChange} className={inputClasses} /></div>
          <div className="md:col-span-2"><label className={labelClasses}>Default Notes</label><textarea name="defaultNotes" rows={2} value={settings.defaultNotes} onChange={handleChange} className={clsx(inputClasses, 'resize-none')} /></div>
        </div>
      ),
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Manage institutional identity and revenue protocols.</p>
        </div>
        <Button size="md" leftIcon={saving ? <Clock size={14} className="animate-spin" /> : <Save size={14} />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>

      {/* Sections 1-3 */}
      {sections.map(sec => (
        <motion.div key={sec.id} variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          <div><h2 className="text-base font-semibold text-text-primary">{sec.title}</h2><p className="text-xs text-text-secondary mt-0.5">{sec.desc}</p></div>
          {sec.content}
        </motion.div>
      ))}

      {/* 4. Workflow */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div><h2 className="text-base font-semibold text-text-primary">4. Workflow Preferences</h2></div>
        <div className="space-y-5">
          {[
            { label: 'Invoice Reminders', desc: 'Allow clients to set reminders.', key: 'invoiceReminders' },
            { label: 'BCC Emails', desc: 'Route all outgoing traffic to your archive.', key: 'bccEmails' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4 pb-5 border-b border-border last:border-b-0 last:pb-0">
              <div><p className="text-sm font-medium text-text-primary">{item.label}</p><p className="text-xs text-text-tertiary">{item.desc}</p></div>
              <Toggle checked={(settings as any)[item.key]} onChange={(v) => setSettings({ ...settings, [item.key]: v })} />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-sm font-medium text-text-primary">Document Style</p><p className="text-xs text-text-tertiary">Select the visual skin for PDFs.</p></div>
            <div className="flex bg-surface-secondary border border-border p-0.5 rounded-lg">
              {['Minimal', 'Professional', 'Bold'].map(opt => (
                <button key={opt} onClick={() => setSettings({ ...settings, documentStyle: opt })}
                  className={clsx('px-4 py-1.5 text-[10px] font-medium rounded-md transition-all', settings.documentStyle === opt ? 'bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary')}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. Automation */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div><h2 className="text-base font-semibold text-text-primary">5. Automation Protocols</h2></div>
        <div className="space-y-5">
          {[
            { label: 'Auto Send Invoice', desc: 'Instantly transmit invoices via API.', key: 'autoSendInvoice' },
            { label: 'Payment Reminders', desc: 'Automated follow-ups for overdue items.', key: 'paymentReminders' },
            { label: 'Daily Summary', desc: 'Daily revenue digest at 08:00 UTC.', key: 'dailySummary' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4 pb-5 border-b border-border last:border-b-0 last:pb-0">
              <div><p className="text-sm font-medium text-text-primary">{item.label}</p><p className="text-xs text-text-tertiary">{item.desc}</p></div>
              <Toggle checked={(settings as any)[item.key]} onChange={(v) => setSettings({ ...settings, [item.key]: v })} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6. SMTP */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div><h2 className="text-base font-semibold text-text-primary">6. Email Infrastructure</h2><p className="text-xs text-text-secondary mt-0.5">Configure SMTP for document delivery.</p></div>
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-3">
          <Zap size={16} className="text-primary shrink-0" />
          <p className="text-xs text-text-secondary">Deploy your own SMTP node for full control over deliverability and branding. Ensure SPF and DKIM records are configured.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClasses}>SMTP Host</label><input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange} className={inputClasses} placeholder="smtp.provider.com" /></div>
          <div><label className={labelClasses}>Port</label><input type="text" name="smtpPort" value={settings.smtpPort} onChange={handleChange} className={inputClasses} placeholder="587" /></div>
          <div><label className={labelClasses}>Username</label><input type="text" name="smtpUsername" value={settings.smtpUsername} onChange={handleChange} className={inputClasses} /></div>
          <div><label className={labelClasses}>Password</label><input type="password" name="smtpPassword" value={settings.smtpPassword} onChange={handleChange} className={inputClasses} /></div>
          <div><label className={labelClasses}>From Name</label><input type="text" name="fromName" value={settings.fromName} onChange={handleChange} className={inputClasses} /></div>
          <div><label className={labelClasses}>From Email</label><input type="text" name="fromEmail" value={settings.fromEmail} onChange={handleChange} className={inputClasses} /></div>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" leftIcon={testingEmail ? <Clock size={14} className="animate-spin" /> : <Mail size={14} />} onClick={handleSendTestEmail} disabled={testingEmail}>
            {testingEmail ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </motion.div>

      {/* Save Button Bottom */}
      <motion.div variants={itemAnim} className="flex justify-end">
        <Button size="lg" leftIcon={saving ? <Clock size={16} className="animate-spin" /> : <Save size={16} />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </motion.div>

      {/* 7. Termination */}
      <motion.div variants={itemAnim} className="bg-surface rounded-2xl border border-danger/20 overflow-hidden">
        <div className="p-5 border-b border-danger/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-danger flex items-center gap-2"><AlertTriangle size={18} /> 7. Workspace Termination</h2>
            <p className="text-xs text-danger/60 mt-0.5">Destructive actions below. Proceed with caution.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 border border-success-200 rounded-lg">
            <span className="h-2 w-2 bg-success rounded-full animate-pulse" />
            <span className="text-[10px] font-medium text-success">Active</span>
          </div>
        </div>
        <div className="p-5">
          <div className="bg-danger-50 border border-danger-100 p-5 rounded-xl flex gap-4 items-start">
            <Lock size={18} className="text-danger shrink-0 mt-0.5" />
            <div className="space-y-3">
              <p className="text-xs text-danger font-medium leading-relaxed">Terminating this workspace will permanently decommission all invoices, client records, and financial data.</p>
              <button onClick={handleDeleteBusiness} className="text-xs font-semibold text-danger underline decoration-2 underline-offset-2 hover:text-danger/80 transition-colors">
                Initiate Termination Protocol
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <ConfirmDialog isOpen={confirmState.isOpen}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(prev => ({ ...prev, isOpen: false })); }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title} message={confirmState.message} variant={confirmState.variant || 'danger'} />
      <StatusModal isOpen={showModal} onClose={() => setShowModal(false)} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} actionLabel="Acknowledge" />
    </motion.div>
  );
}
