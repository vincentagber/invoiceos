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
    Landmark,
    Crown,
    Wallet
} from 'lucide-react';
import clsx from 'clsx';
import { NotificationCenter } from '@/components/NotificationCenter';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Force update when user profile changes
    const [, setTick] = useState(0);
    React.useEffect(() => {
        const handleUserUpdate = () => {
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
        { name: 'Expenses', href: '/dashboard/expenses', icon: Wallet },
        { name: 'Taxes', href: '/dashboard/taxes', icon: Landmark },
        { name: 'Clients', href: '/dashboard/clients', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        { name: 'Subscription', href: '/dashboard/subscription', icon: Crown },
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
                                                ? "bg-white text-[#5E6AD2] shadow-sm ring-1 ring-slate-200"
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
                            {navigation.filter(item => ['Invoices', 'Quotations', 'Expenses', 'Clients'].includes(item.name)).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                            isActive
                                                ? "bg-white text-[#5E6AD2] shadow-sm ring-1 ring-slate-200"
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
                            {navigation.filter(item => ['Settings', 'Subscription'].includes(item.name)).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                            isActive
                                                ? "bg-white text-[#5E6AD2] shadow-sm ring-1 ring-slate-200"
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
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white hover:text-[#5E6AD2] hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all"
                            >
                                <LayoutDashboard size={18} className="text-slate-400" />
                                Blog
                            </Link>
                            <Link
                                href="/tools/invoice-generator"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white hover:text-[#5E6AD2] hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all"
                            >
                                <FileText size={18} className="text-slate-400" />
                                Free Tools
                            </Link>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-slate-200/60 bg-slate-50">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner bg-[#5E6AD2] overflow-hidden">
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
                        <NotificationCenter />

                        <Link
                            href="/dashboard/invoices/new"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#5E6AD2] border-t border-white/20 px-4 py-2.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_-5px_rgba(94,106,210,0.3)] hover:bg-[#4E5AC2] transition-all active:scale-95 lustre"
                        >
                            <span className="hidden sm:inline-flex h-4 w-4 items-center justify-center rounded-lg bg-white/20 text-[10px]">+</span>
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
