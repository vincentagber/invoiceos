'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();
    const router = useRouter();

    // Redirect if already logged in
    React.useEffect(() => {
        if (session) {
            router.push('/dashboard');
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
            
            // On success, AuthContext handles state, we just redirect
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
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] font-sans p-4">
            <div className="w-full max-w-[460px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Logo & Heading */}
                <div className="flex flex-col items-center space-y-6">
                    <div className="h-20 w-20 flex items-center justify-center bg-white rounded-3xl p-4 shadow-xl shadow-indigo-500/10 border border-slate-50">
                        <img 
                            src="/logo.png" 
                            alt="InvoiceOS" 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tighter uppercase leading-none">Welcome back</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            Revenue Engine Authentication
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <Link href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </Link>
                            </div>
                            <PasswordInput
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon={null}
                                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#4F46E5] py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-[#4338CA] transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="bg-white px-3 text-slate-400">OR</span>
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
                        Continue with Google
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-sm text-slate-500 font-medium">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-bold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
