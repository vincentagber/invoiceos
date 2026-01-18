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
                        {/* Logo visible on light/off-white background */}
                        <img src="/logo.png" alt="Superlink" className="w-39 h-auto object-contain" />
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
                                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200"
                                        )}
                                    >
                                        <Icon size={18} className={clsx("transition-transform group-hover:scale-105", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
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
                                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200"
                                        )}
                                    >
                                        <Icon size={18} className={clsx("transition-transform group-hover:scale-105", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
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
                                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200"
                                        )}
                                    >
                                        <Icon size={18} className={clsx("transition-transform group-hover:scale-105", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="p-4 border-t border-slate-200/60 bg-slate-50">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner bg-gradient-to-tr from-indigo-500 to-purple-600 overflow-hidden">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    user.name.charAt(0)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
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
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center h-16 bg-white border-b border-gray-200 px-4">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 text-lg font-semibold text-gray-900">Superlink Invoice</span>
                </div>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
