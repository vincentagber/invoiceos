'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Mail, User, Check, X } from 'lucide-react';
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
        // Simple regex for basic format
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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/backend/api';
            const res = await fetch(`${apiUrl}/auth/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Success, redirect to login
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
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
        <div className="min-h-screen flex bg-white font-sans text-slate-900">
            {/* Left Side Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-indigo-600/20 z-10 animate-in fade-in duration-1000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full">
                    <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in duration-700">
                        <div className="bg-white p-3 rounded-xl shadow-lg">
                            <img src="/logo.png" alt="InvoiceOS" className="h-16 w-auto object-contain" />
                        </div>
                    </div>

                    <div className="space-y-6 max-w-lg mb-20 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Join thousands of growing businesses.
                        </h2>
                        <p className="text-lg text-slate-300">
                            Start sending professional invoices today. No credit card required.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400 animate-in fade-in duration-1000 delay-500">
                        <p>© 2025 InvoiceOS Engine. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50 lg:bg-white animate-in zoom-in-95 duration-500">
                <div className="w-full max-w-md space-y-8 bg-white lg:bg-transparent p-8 lg:p-0 rounded-2xl shadow-sm lg:shadow-none border lg:border-none border-gray-100">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h1>
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign in
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
                                label="Full Name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                icon={<User size={18} />}
                            />

                            <Input
                                label="Email address"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={handleEmailChange}
                                required
                                icon={<Mail size={18} />}
                                error={!emailValid && email.length > 0 ? "Invalid email address" : undefined}
                                rightElement={emailValid && email.length > 0 ? <Check size={16} className="text-green-500" /> : undefined}
                            />

                            <div>
                                <PasswordInput
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                {/* Password Strength Meter */}
                                <div className="mt-3 space-y-2 transition-all duration-300">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Strength</span>
                                        <span className={clsx("font-medium", {
                                            'text-red-500': passwordStrength <= 2,
                                            'text-yellow-500': passwordStrength === 3,
                                            'text-green-600': passwordStrength === 4
                                        })}>{getStrengthText()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={clsx("h-full transition-all duration-500 ease-out", getStrengthColor())}
                                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Use 8+ chars, numbers & symbols.
                                    </p>
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
                                    Create Account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white lg:bg-transparent px-2 text-gray-500">Secured by InvoiceOS</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
