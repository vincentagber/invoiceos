'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, User, Building, Store } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Toast, ToastType } from '@/components/ui/Toast';

export default function SettingsPage() {
    // State
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Data
    const [settings, setSettings] = useState({
        company_name: '',
        company_address: '',
        company_email: '',
        company_logo_url: ''
    });

    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        profile_picture: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Settings
            const settingsRes = await api.get('/settings/read.php?all=true');
            if (settingsRes.data) {
                setSettings(prev => ({ ...prev, ...settingsRes.data }));
            }

            // Fetch User Profile from Storage (or API if we had a dedicated 'me' endpoint)
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                setUserProfile({
                    name: userData.name || '',
                    email: userData.email || '',
                    profile_picture: userData.profile_picture || ''
                });
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            if (activeTab === 'company') {
                await api.post('/settings/update.php', settings);
            } else {
                const userRes = await api.post('/users/update.php', userProfile);
                if (userRes.data && userRes.data.user) {
                    localStorage.setItem('user', JSON.stringify(userRes.data.user));
                    // Dispatch a custom event so layout can update immediately without reload
                    window.dispatchEvent(new Event('user-updated'));
                }
            }
            showToast("Changes saved successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Failed to save changes", "error");
        } finally {
            setSaving(false);
        }
    };

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your account preferences and company details.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => window.location.reload()}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={saving}
                        leftIcon={<Save size={18} />}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                tabs={[
                    { id: 'profile', label: 'My Profile' },
                    { id: 'company', label: 'Company Settings' }
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                {activeTab === 'profile' && (
                    <div className="p-6 sm:p-10 space-y-10 animate-in fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left: Avatar */}
                            <div className="lg:col-span-1">
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">Profile Picture</h3>
                                <p className="text-sm text-slate-500 mb-6">This will be displayed on your profile.</p>

                                <FileUpload
                                    value={userProfile.profile_picture}
                                    onChange={(_, base64) => setUserProfile(prev => ({ ...prev, profile_picture: base64 || '' }))}
                                    className="w-full"
                                />
                            </div>

                            {/* Right: Personal Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="border-b border-gray-100 pb-6 mb-6">
                                    <h3 className="text-base font-semibold text-slate-900 mb-1">Personal Information</h3>
                                    <p className="text-sm text-slate-500">Update your photo and personal details here.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        value={userProfile.name}
                                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                        icon={<User size={18} />}
                                    />
                                    <Input
                                        label="Email Address"
                                        value={userProfile.email}
                                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                                        disabled
                                        title="Contact admin to change email"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'company' && (
                    <div className="p-6 sm:p-10 space-y-10 animate-in fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left: Logo */}
                            <div className="lg:col-span-1">
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">Company Logo</h3>
                                <p className="text-sm text-slate-500 mb-6">This logo will appear on your invoices.</p>

                                <FileUpload
                                    value={settings.company_logo_url || '/logo.png'}
                                    onChange={(_, base64) => setSettings(prev => ({ ...prev, company_logo_url: base64 || '' }))}
                                />
                            </div>

                            {/* Right: Company Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="border-b border-gray-100 pb-6 mb-6">
                                    <h3 className="text-base font-semibold text-slate-900 mb-1">Company Details</h3>
                                    <p className="text-sm text-slate-500">Update your company information and address.</p>
                                </div>

                                <Input
                                    label="Company Name"
                                    value={settings.company_name}
                                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    icon={<Building size={18} />}
                                />

                                <Input
                                    label="Contact Email"
                                    type="email"
                                    value={settings.company_email}
                                    onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                                    placeholder="billing@acme.com"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Address</label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                                            <Store size={18} />
                                        </div>
                                        <textarea
                                            className="block w-full rounded-xl border-gray-200 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50/50 transition-all border p-3 text-gray-900 placeholder:text-gray-400"
                                            rows={3}
                                            value={settings.company_address}
                                            onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                                            placeholder="123 Business St, City, Country"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
