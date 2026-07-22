'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Check, Zap, ShieldCheck, Loader2, Lock, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/lib/useToast';
import { StatusModal } from '@/components/ui/StatusModal';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type PaystackSuccessResponse = { reference: string };
interface BillingHistoryItem { id: string; createdAt: string; plan: string; amount: number; status: string; paystackRef?: string; }
interface Subscription { plan?: string; status?: string; endDate?: string; }
interface PaystackOptions { key: string; email: string; amount: number; reference: string; callback: (response: PaystackSuccessResponse) => void; onClose: () => void; }
interface PaystackHandler { openIframe: () => void; }
interface PaystackWindow extends Window { PaystackPop?: { setup: (options: PaystackOptions) => PaystackHandler; }; }

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [processing, setProcessing] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

  const plans = {
    PROFESSIONAL: { name: 'Professional', monthly: 3000, yearly: 28800, features: ['Unlimited Invoices & Clients', 'FIRS & IRS Automation', 'Multi-currency (NGN/USD)', 'White-label portal'] },
    ENTERPRISE: { name: 'Enterprise', monthly: 7500, yearly: 72000, features: ['Everything in Professional', 'Custom SMTP Server', 'Multi-entity Switcher (5 entities)', 'Priority 24/7 Support'] },
  };

  const fetchSubscription = async () => {
    try {
      const bizRes = await api.get('/business/me');
      const [subRes, historyRes] = await Promise.all([api.get(`/billing/${bizRes.data.id}`), api.get(`/billing/${bizRes.data.id}/history`)]);
      setSubscription(subRes.data);
      setBillingHistory(historyRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchSubscription(); }, [user]);

  const amount = billingCycle === 'MONTHLY' ? plans[selectedPlan as keyof typeof plans].monthly : plans[selectedPlan as keyof typeof plans].yearly;

  const loadPaystackSdk = async () => {
    if (typeof window === 'undefined') return;
    const win = window as PaystackWindow;
    if (win.PaystackPop) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js'; script.async = true;
      script.onload = () => resolve(); script.onerror = () => reject(new Error('Unable to load Paystack SDK.'));
      document.body.appendChild(script);
    });
  };

  const initializePayment = async () => {
    if (!user?.email) {
      setModalConfig({ title: 'Authentication Required', message: 'Please sign in before continuing.', type: 'warning' });
      setShowModal(true); return;
    }
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setModalConfig({ title: 'Configuration Error', message: 'Paystack public key is not configured.', type: 'error' });
      setShowModal(true); return;
    }
    await loadPaystackSdk();
    const win = window as PaystackWindow;
    if (!win.PaystackPop) {
      setModalConfig({ title: 'SDK Error', message: 'Paystack SDK failed to load. Please try again.', type: 'error' });
      setShowModal(true); return;
    }
    win.PaystackPop.setup({ key: publicKey, email: user.email, amount: amount * 100, reference: `${Date.now()}`, callback: handleSuccess, onClose: () => {} }).openIframe();
  };

  const handleSuccess = async (response: PaystackSuccessResponse) => {
    setProcessing(true);
    try {
      const bizRes = await api.get('/business/me');
      await api.post('/billing/verify', { reference: response.reference, businessId: bizRes.data.id, plan: selectedPlan, billingCycle: billingCycle.toLowerCase(), amount });
      await fetchSubscription();
    } catch {
      setModalConfig({ title: 'Verification Failed', message: 'Verification failed. Please contact support.', type: 'error' });
      setShowModal(true);
    } finally { setProcessing(false); }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs text-text-tertiary">Loading subscription...</p></div>
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <motion.div variants={itemAnim} className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Subscription Management</h1>
        <p className="text-sm text-text-secondary">Manage your institutional access and global financial capabilities.</p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Status + Cycle */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface rounded-2xl border border-border p-5">
            <p className="text-xs font-medium text-text-tertiary mb-3">Current Plan</p>
            <div className="flex items-center gap-3 mb-3">
              <div className={clsx('h-10 w-10 rounded-xl flex items-center justify-center', subscription?.status === 'ACTIVE' ? 'bg-success text-white' : 'bg-surface-tertiary text-text-tertiary')}>
                <User size={20} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary uppercase">{subscription?.status === 'ACTIVE' ? subscription.plan : 'Free'}</h3>
            </div>
            <p className="text-xs text-text-tertiary pt-3 border-t border-border">
              {subscription?.status === 'ACTIVE' && subscription?.endDate
                ? `Next billing cycle resumes on ${new Date(subscription.endDate!).toLocaleDateString()}`
                : 'Upgrade to access premium financial intelligence tools.'}
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-1 flex">
            {['MONTHLY', 'YEARLY'].map(cycle => (
              <button key={cycle} onClick={() => setBillingCycle(cycle)}
                className={clsx('flex-1 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all relative',
                  billingCycle === cycle ? 'bg-surface-tertiary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary')}>
                {cycle === 'YEARLY' ? 'Yearly' : 'Monthly'}
                {cycle === 'YEARLY' && <span className="ml-1.5 bg-success-50 text-success text-[9px] px-1.5 py-0.5 rounded-md font-semibold">-20%</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-medium text-text-tertiary"><Lock size={12} /> Secured by Paystack</div>
        </div>

        {/* Right: Plans */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['PROFESSIONAL', 'ENTERPRISE'] as const).map(planKey => {
            const plan = plans[planKey];
            const isSelected = selectedPlan === planKey;
            return (
              <div key={planKey} onClick={() => setSelectedPlan(planKey)}
                className={clsx('bg-surface rounded-2xl border-2 p-6 flex flex-col relative transition-all duration-200 cursor-pointer',
                  isSelected ? 'border-primary shadow-card' : 'border-border hover:border-border-light')}>
                {planKey === 'PROFESSIONAL' && (
                  <div className="absolute -top-3 right-6 bg-primary text-white text-[9px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Recommended</div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-text-primary">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-text-primary">₦{billingCycle === 'MONTHLY' ? '3,000' : '28,800'}</span>
                    <span className="text-xs text-text-tertiary">/ {billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">Full suite of financial intelligence tools.</p>
                </div>
                <div className="flex-1 space-y-3 pt-5 border-t border-border mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-4 w-4 rounded-full bg-success-50 flex items-center justify-center text-success shrink-0 mt-0.5"><Check size={10} strokeWidth={4} /></div>
                      <span className="text-xs text-text-primary">{f}</span>
                    </div>
                  ))}
                </div>
                {planKey === 'PROFESSIONAL' ? (
                  <Button size="md" className="w-full" leftIcon={processing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    onClick={(e) => { e.stopPropagation(); initializePayment(); }} disabled={processing}>
                    {processing ? 'Processing...' : 'Activate Professional'}
                  </Button>
                ) : (
                  <Button variant="secondary" size="md" className="w-full">Contact Sales</Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <motion.div variants={itemAnim} className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Billing History</h2>
          <p className="text-xs text-text-tertiary">Transaction history and audit trail</p>
        </div>
        {billingHistory.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border py-16 text-center text-sm text-text-tertiary">No transaction records available.</div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left min-w-[550px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Transaction ID</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Date</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Plan</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Amount</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {billingHistory.map(item => (
                    <tr key={item.id} className="hover:bg-surface-secondary transition-colors">
                      <td className="px-4 py-4"><span className="text-[10px] font-mono font-medium text-text-tertiary">{item.paystackRef || item.id.substring(0, 12).toUpperCase()}</span></td>
                      <td className="px-4 py-4 text-xs text-text-secondary">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">                          <Badge variant="neutral" size="sm">{item.plan}</Badge></td>
                      <td className="px-4 py-4 text-xs font-semibold text-text-primary text-right">{formatCurrency(item.amount, 'NGN')}</td>
                      <td className="px-4 py-4 text-right"><Badge variant="success" size="sm">{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <StatusModal isOpen={showModal} onClose={() => setShowModal(false)} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} actionLabel="Proceed" />
    </motion.div>
  );
}
