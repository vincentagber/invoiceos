'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    CreditCard,
    Landmark
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Force update when user profile changes
    const [, setTick] = useState(0);
    React.useEffect(() => {
        const handleUserUpdate = () => {
            // In a perfect world AuthContext would handle this, 
            // but strictly for this task scope, a force re-read/render works to show new localStorage data if AuthContext isn't reactive enough to direct localStorage mutations (which it isn't usually).
            // However, AuthContext state 'user' might be stale if we don't update it. 
            // Ideally we call a method on AuthContext. 
            // For now, let's assume valid page reload or just accept that full reactivity might need AuthContext refactor.
            // Actually, the Settings page DOES dispatch 'user-updated' but doesn't update AuthContext state. 
            // Let's just create a quick reload for now to be safe, OR we can try to rely on next navigation.
            // But to make it "elegant" without reload, we need to update the User object.

            // Simplest elegant fix: Verify if page reload from Settings is enough.
            // The Settings page sets localStorage. 
            window.location.reload();
        };
        window.addEventListener('user-updated', handleUserUpdate);
        return () => window.removeEventListener('user-updated', handleUserUpdate);
    }, []);

    const router = useRouter();

    React.useLayoutEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center p-4">Loading...</div>;
    }

    if (!user) {
        return <div className="flex h-screen items-center justify-center p-4">Authenticating...</div>;
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
        { name: 'Quotations', href: '/dashboard/quotations', icon: FileText },
        { name: 'Accounting', href: '/dashboard/accounting', icon: CreditCard }, // New
        { name: 'Taxes', href: '/dashboard/taxes', icon: Landmark }, // New
        { name: 'Clients', href: '/dashboard/clients', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-800/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-72 bg-slate-50 text-slate-600 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-200",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-20 items-center px-6 border-b border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <img src="/logo.png" alt="InvoiceOS" className="h-16 w-auto object-contain" />
                        </Link>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex flex-col h-[calc(100vh-5rem)] justify-between">
                    <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">

                        {/* Main Group */}
                        <div className="space-y-2">
                            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Overview
                            </div>
                            {navigation.filter(item => ['Dashboard'].includes(item.name)).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200"
                                        )}
                                    >
                                        <Icon size={18} className={clsx("transition-transform group-hover:scale-105", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Modules Group */}
                        <div className="space-y-2">
                            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Management
                            </div>
                            {navigation.filter(item => ['Invoices', 'Quotations', 'Clients'].includes(item.name)).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href; // Simple strict match for now
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                            isActive
                                                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200"
                                        )}
                                    >
                                        <Icon size={18} className={clsx("transition-transform group-hover:scale-105", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* System Group */}
                        <div className="space-y-2">
                            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                System
                            </div>
                            {navigation.filter(item => ['Settings'].includes(item.name)).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                            isActive
                                                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200"
                                        )}
                                    >
                                        <Icon size={18} className={clsx("transition-transform group-hover:scale-105", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Resources Group */}
                        <div className="space-y-2">
                            <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Resources
                            </div>
                            <Link
                                href="/blog"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white hover:text-emerald-600 hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all"
                            >
                                <LayoutDashboard size={18} className="text-slate-400" />
                                Blog
                            </Link>
                            <Link
                                href="/tools/invoice-generator"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white hover:text-emerald-600 hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all"
                            >
                                <FileText size={18} className="text-slate-400" />
                                Free Tools
                            </Link>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-slate-200/60 bg-slate-50">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner bg-emerald-600 overflow-hidden">
                                {user?.name ? user.name.charAt(0) : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email || 'No email'}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="mt-3 flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all border border-transparent hover:border-red-100"
                        >
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-500 lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                            <span className="sr-only">View notifications</span>
                            <div className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></div>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31c.51-.183.683-.483.683-.73 0-.371-.365-.703-.956-.963a15.354 15.354 0 01-3.098-1.884l-.53-.414a16.55 16.55 0 01-1.637-1.523l-.138-.15c-.482-.544-.73-1.258-.73-1.954V10.5c0-2.139-1.318-3.928-3.136-4.422A3.001 3.001 0 0011 3.5a3.001 3.001 0 00-2.864 2.578C6.318 6.572 5 8.361 5 10.5v1.446c0 .696-.248 1.41-.73 1.954l-.138.15a16.55 16.55 0 01-1.637 1.523l-.53.414a15.354 15.354 0 01-3.098 1.884c-.591.26-.956.592-.956.963 0 .247.173.547.683.73a24.016 24.016 0 005.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        </button>

                        <Link
                            href="/dashboard/invoices/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all active:scale-95"
                        >
                            <span className="hidden sm:inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-xs">+</span>
                            New Invoice
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
