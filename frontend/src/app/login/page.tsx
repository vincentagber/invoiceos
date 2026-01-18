'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
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
        <div className="min-h-screen flex bg-white font-sans text-slate-900">
            {/* Left Side - Brand & Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-900/40 z-10 animate-in fade-in duration-1000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full">
                    <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in duration-700">
                        {/* Logo */}
                        <div className="bg-white p-3 rounded-xl shadow-lg">
                            <img src="/logo.png" alt="Superlink" className="h-10 w-auto object-contain" />
                        </div>
                    </div>

                    <div className="space-y-6 max-w-lg mb-20 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Manage your invoices with confidence.
                        </h2>
                        <p className="text-lg text-slate-300">
                            Create professional invoices in seconds, track payments, and get paid faster with the most robust billing platform.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400 animate-in fade-in duration-1000 delay-500">
                        <p>© 2025 Superlink Invoice. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50 lg:bg-white animate-in zoom-in-95 duration-500">
                <div className="w-full max-w-md space-y-8 bg-white lg:bg-transparent p-8 lg:p-0 rounded-2xl shadow-sm lg:shadow-none border lg:border-none border-gray-100">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign up for free
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <span className="font-medium">Error:</span> {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <Input
                                label="Email address"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={<Mail size={18} />}
                            />

                            <div className="space-y-1">
                                <PasswordInput
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="flex justify-end">
                                    <Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white lg:bg-transparent px-2 text-gray-500">Secured by Superlink</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
