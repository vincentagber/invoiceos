'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localAuth } from '@/lib/localAuth';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import AuthFooter from '@/components/AuthFooter';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation States
    const [passwordStrength, setPasswordStrength] = useState(0);

    const router = useRouter();

    useEffect(() => {
        // Password Strength Logic
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSupabaseConfigured()) {
                const { data, error } = await supabase.auth.signUp({
                    email, password,
                    options: { data: { full_name: name } }
                });
                if (error) throw error;
                if (data.user && data.session === null) {
                    setError("Account created. Check your email for confirmation.");
                    return;
                }
            } else {
                const { error } = await localAuth.signUp(email, password, name);
                if (error) throw error;
            }
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-primary min-h-screen flex flex-col antialiased font-sans selection:bg-secondary/30 selection:text-secondary">
            <main className="flex-grow flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-40">
                    <div className="w-[800px] h-[800px] bg-soft-tint rounded-full blur-3xl absolute -top-[400px] -right-[200px]"></div>
                    <div className="w-[600px] h-[600px] bg-soft-tint rounded-full blur-3xl absolute -bottom-[300px] -left-[100px]"></div>
                </div>

                {/* Registration Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-[0_20px_60px_-12px_rgba(11,31,58,0.08)] border border-border/40 p-10 z-10 relative"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center items-center gap-2 mb-6">
                            <img src="/logo.png" alt="InvoiceOS" className="h-14 w-auto object-contain" />
                        </div>
                        <h2 className="text-2xl font-bold text-primary tracking-tight mb-1.5">Create your account</h2>
                        <p className="text-sm text-text-secondary">Institutional Grade Finance. Secured.</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={clsx(
                                        "p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-3",
                                        error.includes("created") ? "bg-secondary/10 border-secondary/20 text-secondary" : "bg-rose-50 border-rose-100 text-rose-600"
                                    )}
                                >
                                    <span className="material-symbols-outlined text-base shrink-0">{error.includes("created") ? 'check_circle' : 'error_outline'}</span>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider" htmlFor="fullName">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <input 
                                    className="w-full bg-white border border-border text-primary text-sm rounded-xl focus:ring-2 focus:ring-primary/8 focus:border-primary block pl-11 pr-4 py-3 transition-all placeholder:text-slate-400 outline-none" 
                                    id="fullName" 
                                    name="fullName" 
                                    placeholder="Jane Doe" 
                                    required 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider" htmlFor="email">Business Email</label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                <input 
                                    className="w-full bg-white border border-border text-primary text-sm rounded-xl focus:ring-2 focus:ring-primary/8 focus:border-primary block pl-11 pr-4 py-3 transition-all placeholder:text-slate-400 outline-none" 
                                    id="email" 
                                    name="email" 
                                    placeholder="jane@company.com" 
                                    required 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider" htmlFor="password">Password</label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <input 
                                    className="w-full bg-white border border-border text-primary text-sm rounded-xl focus:ring-2 focus:ring-primary/8 focus:border-primary block pl-11 pr-12 py-3 transition-all placeholder:text-slate-400 outline-none" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button 
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-0.5"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    )}
                                </button>
                            </div>
                            {/* Password Strength Indicator */}
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Security Level</span>
                                    <span className={clsx(
                                        "text-[10px] font-bold uppercase tracking-wider",
                                        passwordStrength >= 3 ? "text-secondary" : "text-amber-600"
                                    )}>
                                        {passwordStrength === 0 ? 'Weak' : passwordStrength === 1 ? 'Fair' : passwordStrength === 2 ? 'Good' : 'Strong'}
                                    </span>
                                </div>
                                <div className="flex gap-1 h-1.5">
                                    <div className={clsx("w-1/3 rounded-l-full transition-all duration-300", passwordStrength >= 1 ? "bg-rose-500" : "bg-slate-200")} />
                                    <div className={clsx("w-1/3 transition-all duration-300", passwordStrength >= 2 ? "bg-amber-500" : "bg-slate-200")} />
                                    <div className={clsx("w-1/3 rounded-r-full transition-all duration-300", passwordStrength >= 3 ? "bg-secondary" : "bg-slate-200")} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start pt-1">
                            <div className="flex items-center h-5">
                                <input className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:ring-2" id="terms" required type="checkbox"/>
                            </div>
                            <label className="ml-3 text-sm text-text-secondary" htmlFor="terms">
                                I agree to the <Link className="font-semibold text-primary hover:underline" href="#">Terms of Service</Link> and <Link className="font-semibold text-primary hover:underline" href="#">Privacy Policy</Link>.
                            </label>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.005 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full text-white bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/20 focus:ring-4 focus:outline-none focus:ring-secondary/10 font-semibold rounded-xl text-sm px-5 py-3.5 text-center transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    Creating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Create Account
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </span>
                            )}
                        </motion.button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-text-secondary">
                                Already have an account?{' '}
                                <Link className="font-semibold text-primary hover:text-primary/80 transition-colors" href="/login">Sign in</Link>
                            </p>
                        </div>
                    </form>

                </motion.div>
            </main>

            <AuthFooter />
        </div>
    );
}
