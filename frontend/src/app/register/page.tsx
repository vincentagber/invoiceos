'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { clsx } from 'clsx';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Validation States
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [emailValid, setEmailValid] = useState(true);

    const router = useRouter();

    useEffect(() => {
        // Password Strength Logic
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    }, [password]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || val === '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!emailValid) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        if (passwordStrength < 2) {
            setError("Please create a stronger password.");
            setLoading(false);
            return;
        }

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
                setError("Please check your email to confirm your account.");
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
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

    const getStrengthColor = () => {
        if (password.length === 0) return 'bg-gray-200';
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength >= 3) return 'bg-green-500';
        return 'bg-gray-200';
    };

    const getStrengthText = () => {
        if (password.length === 0) return '';
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength === 2) return 'Medium';
        if (passwordStrength >= 3) return 'Strong';
        return '';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] font-sans p-4">
            <div className="w-full max-w-[520px] bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Logo & Heading */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 flex items-center justify-center bg-indigo-50 rounded-2xl p-4">
                        <img 
                            src="/logo.png" 
                            alt="InvoiceOS" 
                            className="h-full w-auto object-contain"
                        />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tighter uppercase leading-none">Join the Network</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            Create your Revenue Command Center
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className={clsx(
                            "p-3 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2",
                            error.includes("check your email") ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
                        )}>
                            <span className="font-bold">{error.includes("check your email") ? "Success:" : "Error:"}</span> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />

                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                            error={!emailValid && email.length > 0 ? "Invalid email address" : undefined}
                            rightElement={emailValid && email.length > 0 ? <Check size={16} className="text-green-500" /> : undefined}
                        />

                        <div className="space-y-2">
                            <PasswordInput
                                label="Create Password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon={null}
                                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                            />
                            
                            {/* Strength Meter */}
                            <div className="px-1 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Security Level</span>
                                    <span className={clsx(
                                        passwordStrength <= 2 ? 'text-rose-500' : 'text-emerald-500'
                                    )}>{getStrengthText()}</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={clsx("h-full transition-all duration-500 ease-out", getStrengthColor())}
                                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#4F46E5] py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-[#4338CA] transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                Create Account
                                <ArrowRight size={18} className="ml-1" />
                            </>
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="bg-white px-3 text-slate-400">OR JOIN WITH</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4"/>
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853"/>
                            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#fbbc05"/>
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335"/>
                        </svg>
                        Google Account
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-sm text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-bold">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
