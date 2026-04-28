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
    Plus,
    ChevronRight,
    Sparkles,
    HelpCircle,
    SlidersHorizontal,
    UserCircle,
    PanelLeftClose,
    PanelLeft,
    ShieldCheck,
    Globe,
    Zap,
    Info,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import clsx from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || (!user && !pathname.includes('login'))) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="relative">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-100 border-t-slate-900" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 bg-slate-900 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const navGroups = [
        {
            label: 'Intelligence',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            label: 'Management',
            items: [
                { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
                { name: 'Expenses', href: '/dashboard/expenses', icon: Wallet },
                { name: 'Clients', href: '/dashboard/clients', icon: Users },
            ]
        },
        {
            label: 'Institutional',
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
                { name: 'Subscription', href: '/dashboard/subscription', icon: ShieldCheck },
            ]
        }
    ];

    const notifications = [
        { id: 1, title: 'Revenue Milestone', message: 'Institutional yield exceeded $10k this morning.', time: '2m ago', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 2, title: 'Security Protocol', message: 'Terminal access verified from San Francisco.', time: '1h ago', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 3, title: 'Automation Alert', message: '3 overdue invoices intercepted by engine.', time: '3h ago', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-slate-900 selection:text-white">
            <LayoutGroup>
                {/* Desktop Sidebar */}
                <motion.aside 
                    animate={{ width: collapsed ? 88 : 280 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                    className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-100/80 z-50 overflow-hidden"
                >
                    {/* Header: Institutional Branding */}
                    <div className="h-20 flex items-center px-7 justify-between relative border-b border-slate-50/50">
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-3.5"
                                >
                                    <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                                        <Zap size={18} fill="currentColor" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-black tracking-tight text-slate-900 leading-none">InvoiceOS</span>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-1">Sovereign v4</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <button 
                            onClick={() => setCollapsed(!collapsed)}
                            className={clsx(
                                "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 z-50 border shadow-sm",
                                collapsed 
                                    ? "bg-slate-900 text-white border-slate-900 hover:scale-105 active:scale-95 mx-auto" 
                                    : "bg-white text-slate-400 border-slate-100 hover:text-slate-900 hover:border-slate-200"
                            )}
                        >
                            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                        </button>
                    </div>

                    {/* Navigation Scroll Area */}
                    <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto no-scrollbar">
                        {navGroups.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-3">
                                {!collapsed && (
                                    <h3 className="px-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">
                                        {group.label}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={clsx(
                                                    "group flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 relative",
                                                    isActive 
                                                        ? "text-slate-900" 
                                                        : "text-slate-900 hover:bg-slate-50/50",
                                                    collapsed && "justify-center px-0 w-12 mx-auto"
                                                )}
                                            >
                                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={clsx("shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-slate-900" : "text-slate-900")} />
                                                {!collapsed && <span className="tracking-tight">{item.name}</span>}
                                                
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="activeGlow"
                                                        className="absolute inset-0 bg-slate-50/80 rounded-2xl -z-10 ring-1 ring-slate-100 shadow-sm"
                                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Professional Identity Block */}
                    <div className="p-4 mt-auto">
                        <div className={clsx(
                            "p-3 rounded-2xl flex items-center gap-4 group transition-all duration-500",
                            collapsed ? "justify-center" : "bg-slate-50/50 border border-slate-100/50 hover:bg-slate-50"
                        )}>
                            <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xl overflow-hidden shrink-0 ring-2 ring-white transition-transform group-hover:scale-105">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span>{user.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-[12px] font-black text-slate-900 tracking-tight truncate leading-none uppercase">{user.name}</p>
                                        <div className="bg-emerald-500 h-1.5 w-1.5 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none mt-1.5">{user.email}</p>
                                </div>
                            )}
                        </div>
                        
                        {!collapsed && (
                            <button 
                                onClick={logout}
                                className="mt-4 flex items-center justify-center gap-3 w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300"
                            >
                                <LogOut size={14} /> Terminate Session
                            </button>
                        )}
                    </div>
                </motion.aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* World-Class Header (Screenshot Match) */}
                    <header className="h-20 bg-white border-b border-slate-100/60 flex items-center justify-between px-8 lg:px-10 sticky top-0 z-[40]">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 text-slate-900 bg-slate-50 rounded-lg"
                            >
                                <Menu size={20} />
                            </button>
                            
                            {/* Breadcrumbs */}
                            <div className="hidden lg:flex items-center gap-2 text-[13px]">
                                <span className="text-slate-400">Pages</span>
                                <span className="text-slate-300 font-light">/</span>
                                <span className="font-bold text-slate-900">
                                    {pathname.split('/').pop()?.charAt(0).toUpperCase()}{pathname.split('/').pop()?.slice(1) || 'Dashboard'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Universal Search Portal */}
                            <div className="hidden md:flex relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Search items, categories, or more..."
                                    className="w-72 bg-white border border-slate-200/60 rounded-xl pl-11 pr-4 py-2.5 text-[12px] font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/5 transition-all duration-300 shadow-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2 lg:gap-3 text-slate-400">
                                <button className="p-2.5 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
                                    <Info size={20} strokeWidth={1.5} />
                                </button>
                                <div className="relative">
                                    <button 
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                        className={clsx(
                                            "p-2.5 transition-colors rounded-lg relative",
                                            notificationsOpen ? "text-slate-900 bg-slate-50" : "hover:text-slate-900 hover:bg-slate-50"
                                        )}
                                    >
                                        <Bell size={20} strokeWidth={1.5} />
                                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-rose-500 rounded-full" />
                                    </button>

                                    <AnimatePresence>
                                        {notificationsOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-3 w-[380px] bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.1)] z-20 overflow-hidden"
                                                >
                                                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Institutional Briefing</h3>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors">Clear All</span>
                                                    </div>
                                                    <div className="max-h-[400px] overflow-y-auto no-scrollbar p-3 space-y-1">
                                                        {notifications.map((n) => (
                                                            <div key={n.id} className="p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                                                                <div className="flex gap-4">
                                                                    <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", n.bg, n.color)}>
                                                                        <n.icon size={18} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{n.title}</p>
                                                                            <span className="text-[9px] font-bold text-slate-300 uppercase">{n.time}</span>
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2">{n.message}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Link href="/dashboard/notifications" onClick={() => setNotificationsOpen(false)} className="block p-4 bg-slate-50 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors border-t border-slate-100">
                                                        View All Dispatches
                                                    </Link>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <Link 
                                    href="/dashboard/settings"
                                    className="p-2.5 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
                                >
                                    <SettingsIcon size={20} strokeWidth={1.5} />
                                </Link>
                                
                                <div className="h-8 w-px bg-slate-100 mx-1 hidden lg:block" />
                                
                                <Link 
                                    href="/dashboard/settings/profile"
                                    className="flex items-center gap-3 pl-1 group cursor-pointer"
                                >
                                    <div className="h-9 w-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-black text-sm shadow-sm overflow-hidden ring-1 ring-slate-100">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span>{user.name?.charAt(0) || 'U'}</span>
                                        )}
                                    </div>
                                    <ChevronDown size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Central Canvas */}
                    <main className="flex-1 overflow-y-auto p-6 lg:p-12 xl:p-16 scroll-smooth">
                        <div className="max-w-[1500px] mx-auto animate-in fade-in duration-1000">
                            {children}
                        </div>
                    </main>
                </div>
            </LayoutGroup>

            {/* Mobile Sidebar Overlay */}
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
                            className="fixed inset-y-0 left-0 w-[320px] bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <span className="text-xl font-black text-slate-900 tracking-tight uppercase">InvoiceOS</span>
                                </div>
                                <button onClick={() => setMobileOpen(false)} className="p-2.5 text-slate-400 bg-slate-50 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <nav className="flex-1 px-6 space-y-10 overflow-y-auto pt-6">
                                {navGroups.map((group, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <h3 className="px-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">{group.label}</h3>
                                        <div className="space-y-1.5">
                                            {group.items.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={clsx(
                                                        "flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest",
                                                        pathname === item.href ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400"
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
                            
                            <div className="p-8 border-t border-slate-50">
                                <button 
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-3 p-5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all"
                                >
                                    <LogOut size={18} /> Terminate Session
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
