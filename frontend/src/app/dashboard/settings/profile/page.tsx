'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
    User, 
    Mail, 
    Shield, 
    Camera, 
    Bell, 
    Lock,
    Globe,
    Zap,
    CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';
import { StatusModal } from '@/components/ui/StatusModal';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profilePicture, setProfilePicture] = useState<string | null>(user?.profilePicture || null);

    // Sync state when user loads
    React.useEffect(() => {
        if (user) {
            setProfileName(user.name || '');
            setProfilePicture(user.profilePicture || null);
        }
    }, [user]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicture(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateIdentity = async () => {
        setSaving(true);
        try {
            await api.put('/settings/profile', {
                name: profileName,
                profilePicture: profilePicture
            });
            setModalConfig({
                title: 'Identity Synchronized',
                message: 'Your personal institutional credentials have been successfully updated.',
                type: 'success'
            });
            setShowModal(true);
            // Refresh page to show new name/pic in layout
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setModalConfig({
                title: 'Identity Update Refused',
                message: error.response?.data?.error || 'Synchronization Error',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000 font-sans overflow-x-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-4">
                        Identity Management
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Personal Identity</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Manage your institutional credentials and security protocols.</p>
                </div>
                <button 
                    onClick={handleUpdateIdentity}
                    disabled={saving}
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? 'Synchronizing...' : 'Update Identity'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 sm:p-8 text-center space-y-6">
                        <div className="relative inline-block mx-auto">
                            <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden ring-4 ring-slate-50 shadow-inner">
                                {profilePicture ? (
                                    <img src={profilePicture} alt={profileName} className="h-full w-full object-cover" />
                                ) : (
                                    <User size={48} strokeWidth={1.5} />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 h-10 w-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform cursor-pointer">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{profileName}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{user.email}</p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Verified Identity</span>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-5 sm:p-8 text-white space-y-6">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-emerald-400" />
                            <h4 className="text-xs font-black uppercase tracking-widest">Security Status</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
                            Your account is protected by hardware-grade encryption and multi-factor verification protocols.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                <span>MFA Status</span>
                                <span className="text-emerald-400">Active</span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 sm:p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Full Identity Name</label>
                                <input 
                                    type="text" 
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Primary Email</label>
                                <input 
                                    type="email" 
                                    defaultValue={user.email}
                                    disabled
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-300 cursor-not-allowed outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Language Node</label>
                                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none">
                                    <option>English (US)</option>
                                    <option>French (FR)</option>
                                    <option>Yoruba (NG)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Timezone Cluster</label>
                                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all appearance-none">
                                    <option>Africa/Lagos (WAT)</option>
                                    <option>Europe/London (GMT)</option>
                                    <option>America/New_York (EST)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Communication Node</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receive institutional summaries via email.</p>
                                </div>
                                <div className="h-6 w-11 bg-slate-900 rounded-full p-1 cursor-pointer">
                                    <div className="h-4 w-4 bg-white rounded-full translate-x-5 transition-transform" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Security Alerts</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical login & configuration notifications.</p>
                                </div>
                                <div className="h-6 w-11 bg-slate-900 rounded-full p-1 cursor-pointer">
                                    <div className="h-4 w-4 bg-white rounded-full translate-x-5 transition-transform" />
                                </div>
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
