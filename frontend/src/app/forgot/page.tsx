'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Simulate sending reset email
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1000);
  };

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
            {sent ? (
              <>
                <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-primary" />
                </div>
                <h1 className="text-xl font-semibold text-text-primary">Check your email</h1>
                <p className="text-sm text-text-secondary mt-2">
                  We sent a password reset link to <strong className="text-text-primary">{email}</strong>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-text-primary">Forgot password?</h1>
                <p className="text-sm text-text-secondary mt-1">No worries. Enter your email and we&apos;ll send you reset instructions.</p>
              </>
            )}
          </div>

          {!sent ? (
            <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl text-sm font-medium text-danger text-center">
                    {error}
                  </div>
                )}
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail size={16} />}
                />
                <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full" leftIcon={<ArrowLeft size={16} />}>
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          <p className="text-center text-sm text-text-tertiary mt-6">
            <Link href="/login" className="font-semibold text-primary hover:text-primary-700 transition-colors">
              Back to login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
