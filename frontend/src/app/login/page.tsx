'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { session } = useAuth();
    const router = useRouter();

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
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
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
        <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col items-center justify-center p-6 antialiased font-sans relative overflow-hidden selection:bg-[#6cf8bb] selection:text-[#00714d]">
            {/* Subtle Background Element for depth */}
            <div 
                className="absolute top-0 left-0 w-full h-80 bg-[#eff4ff] pointer-events-none" 
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 40%)' }}
            ></div>

            <main className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
                {/* Brand Header */}
                <div className="flex items-center gap-2 mb-10">
                    <img src="/logo.png" alt="InvoiceOS" className="h-16 w-auto object-contain" />
                </div>

                {/* Auth Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white rounded-xl border border-[#c6c6cd] shadow-[0_12px_40px_-12px_rgba(11,28,48,0.06)] p-8 md:p-10"
                >
                    <div className="mb-8">
                        <h1 className="text-[24px] leading-[1.3] font-semibold tracking-[-0.01em] text-[#0b1c30] mb-2">Sign in to your account</h1>
                        <p className="text-[#45464d] text-[14px] leading-[1.5]">Access your precision financial dashboard.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 rounded-lg border border-rose-100 bg-rose-50 text-xs font-bold text-rose-600 mb-4"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-[12px] font-semibold leading-[1.2] tracking-[0.05em] uppercase text-[#45464d] mb-2" htmlFor="email">Email Address</label>
                            <input 
                                className="w-full bg-white border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[#0b1c30] text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm placeholder:text-[#76777d] outline-none" 
                                id="email" 
                                name="email" 
                                placeholder="name@company.com" 
                                required 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[12px] font-semibold leading-[1.2] tracking-[0.05em] uppercase text-[#45464d]" htmlFor="password">Password</label>
                                <Link className="text-[13px] font-medium text-black hover:underline transition-colors" href="#">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <input 
                                    className="w-full bg-white border border-[#c6c6cd] rounded-lg px-4 py-2.5 text-[#0b1c30] text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm placeholder:text-[#76777d] outline-none pr-10" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-black transition-colors" 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                className="w-full bg-black text-white rounded-lg py-3 px-4 font-semibold text-[14px] hover:bg-black/90 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50" 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 mb-6 flex items-center justify-center">
                        <div className="flex-grow border-t border-[#c6c6cd]"></div>
                        <span className="px-3 bg-white text-[12px] font-medium text-[#45464d] uppercase tracking-[0.05em]">Or continue with</span>
                        <div className="flex-grow border-t border-[#c6c6cd]"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 bg-white border border-[#c6c6cd] rounded-lg py-2.5 px-4 hover:bg-[#eff4ff] transition-colors text-[14px] font-medium text-[#0b1c30] shadow-sm" 
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
                        <button className="flex items-center justify-center gap-2 bg-white border border-[#c6c6cd] rounded-lg py-2.5 px-4 hover:bg-[#eff4ff] transition-colors text-[14px] font-medium text-[#0b1c30] shadow-sm" type="button">
                            <svg className="w-[18px] h-[18px]" fill="#0A66C2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                            </svg>
                            LinkedIn
                        </button>
                    </div>
                </motion.div>

                <p className="mt-8 text-[14px] text-[#45464d] text-center">
                    Don't have an account? 
                    <Link className="font-semibold text-black hover:underline ml-1" href="/register">Create an account</Link>
                </p>
            </main>

            {/* Footer Copy (Small) */}
            <div className="absolute bottom-8 text-[11px] text-slate-400 font-medium">
                © 2026 InvoiceOS Precision. All rights reserved.
            </div>

            <style jsx>{`
                .font-fill {
                    font-variation-settings: 'FILL' 1;
                }
            `}</style>
        </div>
    );
}
