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
                    className="w-full max-w-md bg-white rounded-xl shadow-[0_12px_24px_-8px_rgba(11,31,58,0.06)] border border-border/50 p-8 z-10 relative"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center items-center gap-2 mb-6">
                            <img src="/logo.png" alt="InvoiceOS" className="h-16 w-auto object-contain" />
                        </div>
                        <h2 className="text-xl font-semibold text-primary mb-2">Create your account</h2>
                        <p className="text-sm text-text-secondary">Institutional Grade Finance. Secured.</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={clsx(
                                        "p-3 rounded-lg border text-xs font-bold flex items-center gap-3 mb-4",
                                        error.includes("created") ? "bg-secondary/10 border-secondary/20 text-secondary" : "bg-rose-50 border-rose-100 text-rose-600"
                                    )}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1" htmlFor="fullName">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                                <input 
                                    className="w-full bg-white border border-border text-primary text-sm rounded-lg focus:ring-2 focus:ring-primary/5 focus:border-primary block pl-10 p-2.5 transition-colors placeholder:text-slate-400 outline-none" 
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

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1" htmlFor="email">Business Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                                <input 
                                    className="w-full bg-white border border-border text-primary text-sm rounded-lg focus:ring-2 focus:ring-primary/5 focus:border-primary block pl-10 p-2.5 transition-colors placeholder:text-slate-400 outline-none" 
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

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1" htmlFor="password">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                                <input 
                                    className="w-full bg-white border border-border text-primary text-sm rounded-lg focus:ring-2 focus:ring-primary/5 focus:border-primary block pl-10 pr-10 p-2.5 transition-colors placeholder:text-slate-400 outline-none" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors" 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {/* Password Strength Indicator */}
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Security Level</span>
                                    <span className={clsx(
                                        "text-[10px] font-semibold uppercase tracking-wider",
                                        passwordStrength >= 3 ? "text-secondary" : "text-amber-600"
                                    )}>
                                        {passwordStrength >= 3 ? 'Strong' : 'Weak'}
                                    </span>
                                </div>
                                <div className="flex gap-1 h-1.5">
                                    <div className={clsx("w-1/3 rounded-l-full transition-colors", passwordStrength >= 1 ? "bg-secondary" : "bg-slate-200")} />
                                    <div className={clsx("w-1/3 transition-colors", passwordStrength >= 2 ? "bg-secondary" : "bg-slate-200")} />
                                    <div className={clsx("w-1/3 rounded-r-full transition-colors", passwordStrength >= 3 ? "bg-secondary" : "bg-slate-200")} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start mt-4">
                            <div className="flex items-center h-5">
                                <input className="w-4 h-4 border border-border rounded bg-white focus:ring-primary text-primary" id="terms" required type="checkbox"/>
                            </div>
                            <label className="ml-2 text-sm font-medium text-text-secondary" htmlFor="terms">
                                I agree to the <Link className="text-primary hover:underline font-semibold" href="#">Terms of Service</Link> and <Link className="text-primary hover:underline font-semibold" href="#">Privacy Policy</Link>.
                            </label>
                        </div>

                        <button 
                            className="w-full text-white bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/20 active:scale-[0.98] focus:ring-4 focus:outline-none focus:ring-secondary/10 font-semibold rounded-lg text-sm px-5 py-3 text-center transition-all mt-6 flex justify-center items-center gap-2 disabled:opacity-50" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                            {!loading && <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-text-secondary">
                                Already have an account? <Link className="font-semibold text-primary hover:underline transition-all" href="/login">Sign in</Link>
                            </p>
                        </div>
                    </form>

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-6 border-t border-border/30 flex justify-center items-center gap-6 opacity-60">
                        <div className="flex items-center gap-1 text-xs font-semibold text-text-secondary tracking-wider uppercase">
                            <span className="material-symbols-outlined text-base">verified_user</span>
                            SOC2
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-text-secondary tracking-wider uppercase">
                            <span className="material-symbols-outlined text-base">lock</span>
                            256-bit
                        </div>
                    </div>
                </motion.div>
            </main>

            <AuthFooter />

            <style jsx>{`
                .font-fill {
                    font-variation-settings: 'FILL' 1;
                }
            `}</style>
        </div>
    );
}
