'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/backend/api';
            const res = await fetch(`${apiUrl}/auth/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            login(data.token, data.user);
        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] font-sans p-4">
            <div className="w-full max-w-[460px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Logo & Heading */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 flex items-center justify-center">
                        <img 
                            src="/logo.png" 
                            alt="InvoiceOS" 
                            className="h-full w-auto object-contain"
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 text-sm">
                            Sign in to your InvoiceOS account
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
                        className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        <img src="/google-logo.png" alt="Google" className="w-6 h-6" />
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

