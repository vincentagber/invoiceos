'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings as SettingsIcon,
    LogOut,
    Menu,
    X,
    Wallet,
    Search,
    Bell,

    HelpCircle,
    PanelLeftClose,
    ShieldCheck,
    Zap,
    ChevronDown,
    CreditCard,
    BarChart3,
    ClipboardCheck,
    Command,
    ArrowUpRight,
    CircleHelp
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import clsx from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || (!user && !pathname.includes('login'))) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-[4px] border-slate-50 border-t-emerald-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const navGroups = [
        {
            label: 'MAIN MENU',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Compliance', href: '/dashboard/compliance', icon: ClipboardCheck },
                { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
                { name: 'Expenses', href: '/dashboard/expenses', icon: Wallet },
                { name: 'Clients', href: '/dashboard/clients', icon: Users },
            ]
        },
        {
            label: 'GENERAL',
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
                { name: 'Help Desk', href: '/dashboard/support', icon: CircleHelp },
                { name: 'Log out', onClick: logout, icon: LogOut },
            ]
        }
    ];

    const notifications = [
        { id: 1, title: 'Invoice Paid', message: 'Acme Corp just settled invoice #INV-2024-001.', time: '2m ago', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 2, title: 'New Client', message: 'Global Tech has been added to your ledger.', time: '1h ago', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 3, title: 'Payment Overdue', message: 'Invoice #INV-2024-012 is 3 days overdue.', time: '3h ago', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <div className="min-h-screen bg-[#FBFBFC] flex font-sans selection:bg-emerald-500 selection:text-white">
            <LayoutGroup>
                {/* Desktop Sidebar */}
                <motion.aside 
                    animate={{ width: collapsed ? 88 : 280 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                    className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-100 z-50 overflow-hidden"
                >
                    {/* Brand Header */}
                    <div className="h-20 flex items-center px-6 justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <img src="/logo.png" alt="InvoiceOS" className="h-10 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto no-scrollbar">
                        {navGroups.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-3">
                                {!collapsed && (
                                    <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        {group.label}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href || (item.href && item.href !== '/dashboard' && pathname.startsWith(item.href));
                                        
                                        const navItemClasses = clsx(
                                            "group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 relative",
                                            isActive 
                                                ? "text-emerald-600 bg-emerald-50" 
                                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                                            collapsed && "justify-center px-0 w-12 mx-auto"
                                        );

                                        const content = (
                                            <>
                                                <item.icon 
                                                    size={20} 
                                                    strokeWidth={isActive ? 2.5 : 2} 
                                                    className={clsx("shrink-0", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-900")} 
                                                />
                                                {!collapsed && (
                                                    <span className="flex-1 text-left">{item.name}</span>
                                                )}
                                            </>
                                        );

                                        if (item.onClick) {
                                            return <button key={item.name} onClick={() => item.onClick?.()} className={navItemClasses}>{content}</button>;
                                        }

                                        return (
                                            <Link key={item.name} href={item.href as any} className={navItemClasses}>
                                                {content}
                                                {isActive && !collapsed && (
                                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Upgrade Card */}
                    {!collapsed && (
                        <div className="p-4 mt-auto">
                            <div className="rounded-xl p-[1px] relative overflow-hidden bg-gradient-to-b from-slate-700/60 to-slate-800/10">
                                <div className="rounded-xl p-4 bg-slate-900/95 h-full">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-emerald-400">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400/70">Pro</span>
                                    </div>
                                    <p className="text-white font-semibold text-sm mb-0.5">Upgrade to Pro</p>
                                    <p className="text-slate-400 text-[11px] leading-relaxed mb-3.5">
                                        Unlock advanced financial insights.
                                    </p>
                                    <button className="w-full py-2 rounded-lg text-[11px] font-medium transition-all duration-200 border border-slate-600 text-slate-300 hover:bg-white hover:text-slate-900 hover:border-white">
                                        Upgrade
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
                        <div className="flex items-center gap-4 flex-1">
                            <button 
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden lg:flex p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                            
                            {/* Search */}
                            <div className="relative group max-w-md w-full">
                                <Search className={clsx(
                                    "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                                    searchFocused ? "text-emerald-500" : "text-slate-300"
                                )} size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search invoices, clients..."
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="w-full bg-slate-50 border border-transparent rounded-2xl pl-12 pr-12 py-2.5 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-30">
                                    <Command size={12} />
                                    <span className="text-[10px] font-black">K</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 border-r border-slate-100 pr-3 mr-1">
                                <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50">
                                    <CircleHelp size={20} />
                                </button>
                                <div className="relative">
                                    <button 
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                        className={clsx(
                                            "p-3 transition-colors rounded-xl relative",
                                            notificationsOpen ? "text-slate-900 bg-slate-50" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                        )}
                                    >
                                        <Bell size={20} />
                                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {notificationsOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-20 overflow-hidden"
                                                >
                                                    <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Notifications</h3>
                                                        <button className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Mark all as read</button>
                                                    </div>
                                                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                                                        {notifications.map((n) => (
                                                            <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
                                                                <div className="flex gap-3">
                                                                    <div className={clsx("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", n.bg, n.color)}>
                                                                        <n.icon size={14} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                                                            <p className="text-[11px] font-black text-slate-900 truncate">{n.title}</p>
                                                                            <span className="text-[9px] font-bold text-slate-300 shrink-0">{n.time}</span>
                                                                        </div>
                                                                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            
                            <Link 
                                href="/dashboard/settings/profile"
                                className="flex items-center gap-3 pl-1 group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black text-slate-900 leading-none mb-1">{user.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Administrator</p>
                                </div>
                                <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg transition-transform group-hover:scale-105 overflow-hidden">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{user.name?.charAt(0)}</span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto px-8 py-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </LayoutGroup>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-slate-50">
                                <img src="/logo.png" alt="InvoiceOS" className="h-10 w-auto object-contain" />
                                <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                                {navGroups.map((group, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-300">{group.label}</h3>
                                        <div className="space-y-1">
                                            {group.items.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href || '#'}
                                                    onClick={() => { if (item.onClick) item.onClick(); setMobileOpen(false); }}
                                                    className={clsx(
                                                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                                        pathname === item.href ? "bg-emerald-50 text-emerald-600" : "text-slate-500"
                                                    )}
                                                >
                                                    <item.icon size={20} />
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
