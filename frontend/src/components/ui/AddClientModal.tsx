import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Building2, Globe, Mic, Sparkles, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (client: any) => void;
}

export const AddClientModal = ({ isOpen, onClose, onSuccess }: AddClientModalProps) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isAIPromptActive, setIsAIPromptActive] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    if (!isOpen) return null;

    const handleAISync = async () => {
        if (!aiPrompt) return;
        setSubmitting(true);
        try {
            // Mock AI parsing for now
            setTimeout(() => {
                setName("Acme Corp Ltd");
                setContactName("John Doe");
                setEmail("billing@acmecorp.com");
                setPhone("+234 800 000 0000");
                setAddress("123 Industry Way, Victoria Island, Lagos");
                setIsAIPromptActive(false);
                setSubmitting(false);
            }, 1500);
        } catch (err) {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const businessId = user?.organizations?.[0]?.id;
            if (!businessId) throw new Error('No active organization found');

            const res = await api.post('/clients', {
                name,
                contactName,
                email,
                phone,
                address,
                businessId
            });

            onSuccess(res.data);
            onClose();
            setName('');
            setContactName('');
            setEmail('');
            setPhone('');
            setAddress('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create customer');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 sm:p-10 space-y-8">
                    {/* Header with AI Icons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">Add New Customer</h2>
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-all active:scale-90"
                                    title="Voice Input"
                                >
                                    <Mic size={16} />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setIsAIPromptActive(!isAIPromptActive)}
                                    className={clsx(
                                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all active:scale-90",
                                        isAIPromptActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                    )}
                                    title="AI Magic Prompt"
                                >
                                    <Sparkles size={16} className={clsx(isAIPromptActive ? "animate-pulse" : "")} />
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* AI Prompt Input (Conditional) */}
                    {isAIPromptActive && (
                        <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Intelligence Link</p>
                            <textarea 
                                className="w-full bg-white border border-indigo-100 rounded-2xl p-4 text-xs font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                                placeholder="Paste business card text, LinkedIn bio, or speak to auto-fill..."
                                rows={2}
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={handleAISync}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                            >
                                Synchronize Intelligence
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                                    Company Name <span className="text-slate-300 normal-case">(Optional if contact name given)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                                    Contact Name <span className="text-slate-300 normal-case">(Optional if company name given)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Email Address <span className="text-slate-300 opacity-50">(Optional)</span></label>
                                    <input
                                        type="email"
                                        placeholder="e.g. billing@acmecorp.com"
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-2 border-r border-slate-200">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg" className="w-4 h-auto rounded-sm" alt="NG" />
                                            <ChevronDown size={10} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="e.g. +1 555-0199"
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-16 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>


                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Billing Address</label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g. 123 Industry Way, NY"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#5E6AD2] hover:bg-[#4E5AC2] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#5E6AD2]/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {submitting ? 'Synchronizing...' : 'Save Customer'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
