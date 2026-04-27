'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (error) throw error;
            
            if (data.user && data.session === null) {
                setError("Account created. Check your email for confirmation.");
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col antialiased font-sans selection:bg-[#6cf8bb] selection:text-[#00714d]">
            <main className="flex-grow flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-40">
                    <div className="w-[800px] h-[800px] bg-[#dce9ff] rounded-full blur-3xl absolute -top-[400px] -right-[200px]"></div>
                    <div className="w-[600px] h-[600px] bg-[#e5eeff] rounded-full blur-3xl absolute -bottom-[300px] -left-[100px]"></div>
                </div>

                {/* Registration Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-xl shadow-[0_12px_24px_-8px_rgba(15,23,42,0.06)] border border-[#c6c6cd]/30 p-8 z-10 relative"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <img src="/logo.png" alt="InvoiceOS" className="h-10 w-auto object-contain" />
                        </div>
                        <h2 className="text-xl font-semibold text-[#0b1c30] mb-2">Create your account</h2>
                        <p className="text-sm text-[#45464d]">Institutional Grade Finance. Secured.</p>
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
                                        error.includes("created") ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                                    )}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-[#0b1c30] uppercase tracking-wider mb-1" htmlFor="fullName">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-lg">person</span>
                                <input 
                                    className="w-full bg-white border border-[#c6c6cd] text-[#0b1c30] text-sm rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black block pl-10 p-2.5 transition-colors placeholder-[#76777d]/60 outline-none" 
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
                            <label className="block text-xs font-semibold text-[#0b1c30] uppercase tracking-wider mb-1" htmlFor="email">Business Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-lg">mail</span>
                                <input 
                                    className="w-full bg-white border border-[#c6c6cd] text-[#0b1c30] text-sm rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black block pl-10 p-2.5 transition-colors placeholder-[#76777d]/60 outline-none" 
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
                            <label className="block text-xs font-semibold text-[#0b1c30] uppercase tracking-wider mb-1" htmlFor="password">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-lg">lock</span>
                                <input 
                                    className="w-full bg-white border border-[#c6c6cd] text-[#0b1c30] text-sm rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black block pl-10 pr-10 p-2.5 transition-colors placeholder-[#76777d]/60 outline-none" 
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
                            {/* Password Strength Indicator */}
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-medium text-[#45464d] uppercase tracking-wider">Security Level</span>
                                    <span className={clsx(
                                        "text-[10px] font-semibold uppercase tracking-wider",
                                        passwordStrength >= 3 ? "text-[#006c49]" : "text-amber-600"
                                    )}>
                                        {passwordStrength >= 3 ? 'Strong' : 'Weak'}
                                    </span>
                                </div>
                                <div className="flex gap-1 h-1.5">
                                    <div className={clsx("w-1/3 rounded-l-full transition-colors", passwordStrength >= 1 ? "bg-[#006c49]" : "bg-slate-200")} />
                                    <div className={clsx("w-1/3 transition-colors", passwordStrength >= 2 ? "bg-[#006c49]" : "bg-slate-200")} />
                                    <div className={clsx("w-1/3 rounded-r-full transition-colors", passwordStrength >= 3 ? "bg-[#006c49]" : "bg-slate-200")} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start mt-4">
                            <div className="flex items-center h-5">
                                <input className="w-4 h-4 border border-[#c6c6cd] rounded bg-white focus:ring-black text-black" id="terms" required type="checkbox"/>
                            </div>
                            <label className="ml-2 text-sm font-medium text-[#45464d]" htmlFor="terms">
                                I agree to the <Link className="text-black hover:underline font-semibold" href="#">Terms of Service</Link> and <Link className="text-black hover:underline font-semibold" href="#">Privacy Policy</Link>.
                            </label>
                        </div>

                        <button 
                            className="w-full text-white bg-black hover:bg-black/90 focus:ring-4 focus:outline-none focus:ring-black/10 font-semibold rounded-lg text-sm px-5 py-3 text-center transition-colors mt-6 flex justify-center items-center gap-2 disabled:opacity-50" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                            {!loading && <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-[#45464d]">
                                Already have an account? <Link className="font-semibold text-black hover:underline transition-all" href="/login">Sign in</Link>
                            </p>
                        </div>
                    </form>

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-6 border-t border-[#c6c6cd]/30 flex justify-center items-center gap-6 opacity-60">
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#45464d] tracking-wider uppercase">
                            <span className="material-symbols-outlined text-base">verified_user</span>
                            SOC2
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#45464d] tracking-wider uppercase">
                            <span className="material-symbols-outlined text-base">lock</span>
                            256-bit
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="bg-white text-[#0b1c30] text-sm py-12 mt-auto border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 px-6 lg:px-12 max-w-[1440px] mx-auto w-full z-10 relative">
                <div className="text-center md:text-left text-[#45464d]">© 2024 InvoiceOS Precision. Institutional Grade Security.</div>
                <nav className="flex flex-wrap justify-center md:justify-end gap-6">
                    <Link className="text-[#45464d] hover:text-black transition-colors" href="#">Privacy Policy</Link>
                    <Link className="text-[#45464d] hover:text-black transition-colors" href="#">Terms of Service</Link>
                    <Link className="text-[#45464d] hover:text-black transition-colors" href="#">Security Overview</Link>
                    <Link className="text-[#45464d] hover:text-black transition-colors" href="#">Cookie Policy</Link>
                </nav>
            </footer>

            <style jsx>{`
                .font-fill {
                    font-variation-settings: 'FILL' 1;
                }
            `}</style>
        </div>
    );
}
