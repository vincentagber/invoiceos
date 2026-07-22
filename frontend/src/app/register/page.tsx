'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localAuth } from '@/lib/localAuth';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { session, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');

      const plan = searchParams?.get('plan');
      const cycle = searchParams?.get('cycle');

      if (isSupabaseConfigured()) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, plan, billing_cycle: cycle } },
        });
        if (signUpError) throw signUpError;

        setSuccess(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
          await refreshUser();
          router.push('/dashboard');
        }
      } else {
        const result = await localAuth.signUp(email, password, name);
        if (result.error) throw result.error;

        const loginResult = await localAuth.signInWithPassword(email, password);
        if (!loginResult.error) {
          await refreshUser();
          router.push('/dashboard');
        } else {
          setSuccess(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-surface-secondary">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/3 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface rounded-2xl border border-border shadow-card p-8 max-w-sm w-full text-center relative z-10">
          <div className="h-14 w-14 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Check your email</h2>
          <p className="text-sm text-text-secondary mt-2">We sent a confirmation link to <strong className="text-text-primary">{email}</strong></p>
          <Link href="/login"><Button size="lg" className="w-full mt-6">Back to Login</Button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-surface-secondary">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto" />
            </Link>
            <h1 className="text-xl font-semibold text-text-primary">Create your account</h1>
            <p className="text-sm text-text-secondary mt-1">Start your free forever plan</p>
          </div>

          <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl text-sm font-medium text-danger text-center">
                  {error}
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                icon={<User size={16} />}
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail size={16} />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                hint="Must be at least 6 characters"
                icon={<Lock size={16} />}
              />

              <Button type="submit" size="lg" className="w-full" isLoading={loading} rightIcon={<ArrowRight size={16} />}>
                Create Account
              </Button>

              <p className="text-xs text-text-tertiary text-center">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:text-primary-700">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:text-primary-700">Privacy Policy</Link>
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-text-tertiary mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
