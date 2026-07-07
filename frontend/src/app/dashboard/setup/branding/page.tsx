'use client';

import React, { useState } from 'react';
import { 
    Check, 
    ChevronLeft, 
    ArrowRight, 
    HelpCircle, 
    ShieldCheck, 
    Lock, 
    Upload,
    Palette,
    Type,
    Image as ImageIcon,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export default function BrandingSetupPage() {
    const [businessName, setBusinessName] = useState('');
    const [website, setWebsite] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#5E6AD2');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const steps = [
        { id: 1, name: 'ENTITY', status: 'current' },
        { id: 2, name: 'BANKING', status: 'upcoming' },
        { id: 3, name: 'FINANCIALS', status: 'upcoming' },
        { id: 4, name: 'REVIEW', status: 'upcoming' },
    ];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            if (isSupabaseConfigured()) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user?.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('logos')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('logos')
                    .getPublicUrl(filePath);

                setLogoUrl(data.publicUrl);
            } else {
                alert('Logo upload requires Supabase Storage configuration.');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Failed to upload logo. Make sure you created the "logos" bucket in Supabase Storage.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!businessName) {
            alert("Please enter your business name.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create the Organization
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: businessName,
                    owner_id: user?.id,
                    website: website,
                    primary_color: primaryColor,
                    logo_url: logoUrl
                })
                .select()
                .single();

            if (orgError) throw orgError;

            // 2. Create the Owner Membership
            const { error: memError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: org.id,
                    user_id: user?.id,
                    role: 'OWNER'
                });

            if (memError) throw memError;

            // 3. Refresh user state
            await refreshUser();

            // 4. Move to next step
            router.push('/dashboard/setup/financials');
        } catch (error: any) {
            console.error('Branding Setup Error:', error);
            alert(error.message || "Failed to create business profile");
        } finally {
            setLoading(false);
        }
    };

    const colorOptions = [
        '#5E6AD2', '#10B981', '#F59E0B', '#EF4444', '#000000', '#6366F1'
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight">InvoiceOS</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <HelpCircle size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto py-12 px-4">
                <div className="max-w-[720px] mx-auto space-y-12">
                    
                    {/* Stepper */}
                    <div className="flex items-center justify-center">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-black transition-all",
                                        step.status === 'complete' ? "bg-emerald-800 text-white" :
                                        step.status === 'current' ? "bg-slate-900 text-white shadow-lg" :
                                        "bg-slate-100 text-slate-400"
                                    )}>
                                        {step.status === 'complete' ? <Check size={14} strokeWidth={3} /> : step.id}
                                    </div>
                                    <span className={clsx(
                                        "text-[10px] font-black uppercase tracking-widest",
                                        step.status === 'upcoming' ? "text-slate-300" : 
                                        step.status === 'complete' ? "text-emerald-800" : "text-slate-900"
                                    )}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="w-16 h-px bg-slate-200 mx-4" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Branding Setup Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="p-10 sm:p-14 space-y-10">
                            
                            {/* Header */}
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Branding & Style</h2>
                                <p className="text-slate-500 text-base">Personalize your professional identity and invoice aesthetics.</p>
                            </div>

                            <div className="h-px bg-slate-100 -mx-14" />

                            {/* Logo Upload Section */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Business Logo</label>
                                <div className="flex items-center gap-10">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-24 w-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer group overflow-hidden relative"
                                    >
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <>
                                                {uploading ? (
                                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                                                ) : (
                                                    <>
                                                        <Upload size={24} className="group-hover:scale-110 transition-transform" />
                                                        <span className="text-[8px] font-black uppercase mt-2">Upload</span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-bold text-slate-800">Company Brand Asset</p>
                                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">High-resolution PNG or SVG recommended. Transparent backgrounds work best on invoices.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                <div>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 block">Business Legal Name</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Acme Corp Ltd"
                                            className="w-full h-14 bg-white border border-slate-200 rounded-lg px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-slate-400 transition-all placeholder:text-slate-300"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 block">Primary Brand Color</label>
                                    <div className="flex items-center gap-3">
                                        {colorOptions.map(color => (
                                            <button 
                                                key={color}
                                                onClick={() => setPrimaryColor(color)}
                                                className={clsx(
                                                    "h-8 w-8 rounded-lg transition-all",
                                                    primaryColor === color ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : "hover:scale-105"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <div className="h-8 w-px bg-slate-200 mx-2" />
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-full h-10 border-b border-slate-200 text-[10px] font-black uppercase outline-none focus:border-slate-900 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                <div>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 block">Official Website</label>
                                    <div className="relative">
                                        <input 
                                            type="url" 
                                            placeholder="https://acmecorp.com"
                                            className="w-full h-14 bg-white border border-slate-200 rounded-lg px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-slate-400 transition-all placeholder:text-slate-300"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 block">Invoice Template</label>
                                    <div className="relative">
                                        <select className="w-full h-14 bg-white border border-slate-200 rounded-lg px-4 pr-10 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-slate-400 transition-all appearance-none">
                                            <option>Sovereign Clean (Default)</option>
                                            <option>Minimalist Institutional</option>
                                            <option>Modern Executive</option>
                                        </select>
                                        <ChevronLeft size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 -rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Identity Advisory */}
                            <div className="bg-[#F8F9FB] rounded-xl p-6 flex gap-4 border border-slate-100">
                                <ImageIcon className="text-slate-400 shrink-0" size={20} strokeWidth={1.5} />
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Brand Intelligence</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        Your branding assets are automatically synchronized across all customer-facing touchpoints. High-fidelity rendering ensures your legal entity maintains a premium image in all jurisdictions.
                                    </p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="pt-6 flex items-center justify-between">
                                <Link href="/dashboard" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">
                                    <ChevronLeft size={16} />
                                    Exit to Dashboard
                                </Link>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={loading || uploading}
                                    className={clsx(
                                        "bg-black text-white px-8 py-4 rounded-lg text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg active:scale-[0.98] transition-all",
                                        (loading || uploading) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? 'Saving...' : 'Save & Continue'}
                                    {!loading && <ArrowRight size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="flex items-center justify-center gap-8 py-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">AES-256 ENCRYPTED</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">GDPR COMPLIANT</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">SOC2 TYPE II</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="h-20 bg-[#F8F9FB] border-t border-slate-100 flex items-center justify-between px-12 shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    © 2024 INVOICEOS. INSTITUTIONAL GRADE FINANCE.
                </div>
                <div className="flex items-center gap-8">
                    <Link href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Privacy Policy</Link>
                    <Link href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Terms of Service</Link>
                    <Link href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Security</Link>
                </div>
            </footer>
        </div>
    );
}
