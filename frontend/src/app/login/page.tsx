'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localAuth } from '@/lib/localAuth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import AuthFooter from '@/components/AuthFooter';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { session } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedPlan = searchParams?.get('plan');
    const selectedCycle = searchParams?.get('cycle');

    useEffect(() => {
        if (session) {
            router.push('/dashboard');
        }
        
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        if (errorParam === 'session_expired') {
            setError('Your session has expired. Please sign in again.');
        } else if (errorParam) {
            setError(errorParam.replace(/_/g, ' '));
        }
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSupabaseConfigured()) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await localAuth.signInWithPassword(email, password);
                if (error) throw error;
            }
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!isSupabaseConfigured()) {
            setError('Google login requires Supabase configuration');
            return;
        }
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
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

                {/* Login Card */}
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
                        <h2 className="text-2xl font-bold text-primary tracking-tight mb-1.5">Sign in to your account</h2>
                        <p className="text-sm text-text-secondary">Access your precision financial dashboard.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3.5 rounded-xl border border-rose-100 bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                <input 
                                    className="w-full bg-white border border-border text-primary text-sm rounded-xl focus:ring-2 focus:ring-primary/8 focus:border-primary block pl-11 pr-4 py-3 transition-all placeholder:text-slate-400 outline-none" 
                                    id="email" 
                                    name="email" 
                                    placeholder="name@company.com" 
                                    required 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold text-primary uppercase tracking-wider" htmlFor="password">Password</label>
                                <Link className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors" href="#">Forgot password?</Link>
                            </div>
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
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </span>
                            )}
                        </motion.button>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Or continue with</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-2.5 bg-white border border-border rounded-xl py-3 hover:bg-soft-tint transition-colors text-sm font-medium text-primary shadow-sm" 
                                type="button"
                            >
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2.5 bg-white border border-border rounded-xl py-3 hover:bg-soft-tint transition-colors text-sm font-medium text-primary shadow-sm" type="button">
                                <svg className="w-[18px] h-[18px]" fill="#0A66C2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                                </svg>
                                LinkedIn
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <p className="text-sm text-text-secondary">
                                Don't have an account?{' '}
                                <Link className="font-semibold text-primary hover:text-primary/80 transition-colors" href={selectedPlan ? `/register?plan=${selectedPlan}&cycle=${selectedCycle}` : '/register'}>Create an account</Link>
                            </p>
                        </div>
                    </form>

                </motion.div>
            </main>

            <AuthFooter />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
