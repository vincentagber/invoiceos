'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();
    const router = useRouter();

    // Redirect if already logged in and handle errors
    React.useEffect(() => {
        if (session) {
            router.push('/dashboard');
        }
        
        // Handle error parameters from URL
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
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden font-sans">
            {/* Architectural Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[480px] z-10 p-4"
            >
                <div className="bg-white/[0.8] backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-white p-8 md:p-14 relative overflow-hidden group">
                    
                    {/* Subtle Top Glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                    <div className="space-y-10 relative">
                        {/* Branding Section */}
                        <div className="flex flex-col items-center space-y-6">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="h-20 w-20 flex items-center justify-center bg-white rounded-3xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.15)] border border-slate-50 p-4 transition-all duration-500"
                            >
                                <img src="/logo.png" alt="InvoiceOS" className="h-full w-full object-contain" />
                            </motion.div>
                            <div className="text-center space-y-1.5">
                                <h1 className="text-3xl font-black text-slate-900 tracking-[-0.03em] uppercase leading-none">Welcome back</h1>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                    <ShieldCheck size={12} className="text-indigo-500" />
                                    Secure sign in
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-2xl bg-rose-50 border border-rose-100/50 text-[11px] text-rose-600 font-bold flex items-center gap-3"
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                <div className="group/field">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-14 rounded-2xl border-slate-200/60 bg-slate-50/30 px-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all duration-300"
                                    />
                                </div>

                                <div className="space-y-2 group/field">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
                                        <Link href="#" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors">Forgot?</Link>
                                    </div>
                                    <PasswordInput
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        icon={null}
                                        className="h-14 rounded-2xl border-slate-200/60 bg-slate-50/30 px-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 border-t border-indigo-400 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] transition-all duration-300 disabled:opacity-70 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        Sign In
                                        <ArrowRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.15em]"><span className="bg-[#fcfdfe] px-4 text-slate-400">Or continue with</span></div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border border-slate-200/60 bg-white py-3 text-[11px] font-black uppercase tracking-[0.1em] text-slate-600 hover:bg-slate-50 transition-all duration-300 shadow-sm"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4"/>
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853"/>
                                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#fbbc05"/>
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335"/>
                                </svg>
                                Google
                            </motion.button>
                        </form>

                        <div className="text-center pt-4 border-t border-slate-50">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                New here?{' '}
                                <Link href="/register" className="text-indigo-600 hover:text-indigo-500 transition-colors">Create an account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
