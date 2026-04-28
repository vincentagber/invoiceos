'use client';

import React, { useState } from 'react';
import { X, Mic, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

interface RecordExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (expenseData: any) => void;
}

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        merchant: '',
        amount: '',
        currency: 'NGN',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const bizRes = await api.get('/business/me');
            await api.post('/expenses', {
                ...formData,
                businessId: bizRes.data.id,
                amount: parseFloat(formData.amount)
            });
            if (onSuccess) onSuccess(formData);
            onClose();
            setFormData({
                merchant: '',
                amount: '',
                currency: 'NGN',
                date: new Date().toISOString().split('T')[0],
                category: '',
                description: ''
            });
        } catch (error) {
            console.error('Failed to save expense', error);
            alert('Failed to save expense. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputBaseClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/5 transition-all";
    const labelBaseClass = "block text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Record Expense</h2>
                        <div className="flex items-center gap-1.5 ml-2">
                            <button className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 transition-colors" title="Voice Input">
                                <Mic size={14} />
                            </button>
                            <button className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 transition-colors" title="Autofill with AI">
                                <Sparkles size={14} />
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-6">
                        
                        <div>
                            <label className={labelBaseClass}>Merchant / Vendor</label>
                            <input 
                                type="text" 
                                name="merchant"
                                value={formData.merchant}
                                onChange={handleChange}
                                placeholder="e.g. Amazon Web Services"
                                className={inputBaseClass}
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelBaseClass}>Amount</label>
                                <input 
                                    type="number" 
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className={inputBaseClass}
                                />
                            </div>
                            <div>
                                <label className={labelBaseClass}>Currency</label>
                                <select 
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className={inputBaseClass}
                                >
                                    <option value="NGN">NGN (₦)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelBaseClass}>Date</label>
                            <input 
                                type="date" 
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className={inputBaseClass}
                            />
                        </div>

                        <div>
                            <label className={labelBaseClass}>Category</label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={clsx(inputBaseClass, !formData.category && "text-slate-400")}
                            >
                                <option value="" disabled>Select a category...</option>
                                <option value="Software & Subscriptions">Software & Subscriptions</option>
                                <option value="Marketing & Advertising">Marketing & Advertising</option>
                                <option value="Office Supplies">Office Supplies</option>
                                <option value="Travel & Transport">Travel & Transport</option>
                                <option value="Meals & Entertainment">Meals & Entertainment</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelBaseClass}>
                                Description / Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
                            </label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g. Referral commission for introducing a client"
                                rows={3}
                                className={clsx(inputBaseClass, "resize-none")}
                            />
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving || !formData.amount || !formData.merchant}
                        className="px-6 py-2.5 rounded-xl bg-[#5E6AD2] text-white text-sm font-bold shadow-sm shadow-[#5E6AD2]/20 hover:bg-[#4E5AC2] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Saving...
                            </>
                        ) : (
                            'Save Expense'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
