'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ClipboardCheck, FileText, Wallet, Users, BarChart3,
  FileSpreadsheet, Landmark, CreditCard, Settings, CircleHelp, LogOut,
  Menu, X, Search, Bell, Sparkles, Command,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const navGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Compliance', href: '/dashboard/compliance', icon: ClipboardCheck },
      { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
      { name: 'Expenses', href: '/dashboard/expenses', icon: Wallet },
      { name: 'Clients', href: '/dashboard/clients', icon: Users },
      { name: 'Accounting', href: '/dashboard/accounting', icon: BarChart3 },
      { name: 'Quotations', href: '/dashboard/quotations', icon: FileSpreadsheet },
      { name: 'Taxes', href: '/dashboard/taxes', icon: Landmark },
    ],
  },
  {
    label: 'General',
    items: [
      { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      { name: 'Help Desk', href: '/dashboard/support', icon: CircleHelp },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || (!user && !pathname.includes('login'))) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-secondary">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const notifications = [
    { id: 1, title: 'Invoice Paid', message: 'Acme Corp just settled invoice #INV-2024-001.', time: '2m ago' },
    { id: 2, title: 'New Client', message: 'Global Tech has been added to your ledger.', time: '1h ago' },
    { id: 3, title: 'Payment Overdue', message: 'Invoice #INV-2024-012 is 3 days overdue.', time: '3h ago' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary flex font-sans">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 150 }}
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-surface border-r border-border z-50 overflow-hidden"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            {collapsed ? (
              <img src="/favicon.png" alt="InvoiceOS" className="h-7 w-7 shrink-0" />
            ) : (
              <img src="/logo.png" alt="InvoiceOS" className="h-7 w-auto" />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-6">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group',
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-text-secondary hover:text-primary-600 hover:bg-primary-50/40',
                      collapsed && 'justify-center px-0',
                    )}
                  >
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                    )}
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className={clsx('shrink-0', isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-primary-500')}
                    />
                    {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                    {isActive && !collapsed && (
                      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Upgrade Card */}
        {!collapsed && (
          <div className="px-3 pb-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-md bg-white/20 flex items-center justify-center">
                  <Sparkles size={12} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Pro</span>
              </div>
              <p className="text-sm font-semibold mb-0.5">Upgrade to Pro</p>
              <p className="text-xs text-white/70 mb-3 leading-relaxed">
                Unlock advanced insights and unlimited invoices.
              </p>
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="w-full py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors text-xs font-medium"
          >
            <Menu size={16} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4 pt-0">
          <button
            onClick={() => logout()}
            className={clsx(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-text-tertiary hover:text-danger hover:bg-danger-50',
              collapsed && 'justify-center px-0',
            )}
          >
            <LogOut size={20} strokeWidth={1.5} className="shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-text-tertiary">
              <span className="text-text-primary font-medium capitalize">
                {pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors text-xs">
              <Search size={16} />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-surface-tertiary text-text-tertiary text-[10px] font-medium">
                <Command size={10} />K
              </kbd>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full border-2 border-surface" />
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-xl z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-text-primary">Notifications</h3>
                        <button className="text-[10px] font-medium text-primary hover:text-primary-700">Mark all read</button>
                      </div>
                      <div className="max-h-72 overflow-y-auto no-scrollbar">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-4 hover:bg-surface-tertiary transition-colors cursor-pointer border-b border-border-light last:border-0">
                            <div className="flex gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <p className="text-xs font-semibold text-text-primary truncate">{n.title}</p>
                                  <span className="text-[10px] text-text-tertiary shrink-0">{n.time}</span>
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{n.message}</p>
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

            {/* User Avatar */}
            <Link href="/dashboard/settings/profile" className="flex items-center gap-2 pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-text-primary leading-none mb-0.5">Vincent Agber</p>
                <p className="text-[10px] text-text-tertiary">Administrator</p>
              </div>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vincent%20Agber" alt="" className="h-full w-full object-cover" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-surface z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="InvoiceOS" className="h-7 w-auto" />
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-6">
                {navGroups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative',
                            isActive
                              ? 'bg-primary-50 text-primary-700 shadow-sm font-semibold'
                              : 'text-text-secondary hover:text-primary-600 hover:bg-primary-50/40',
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                          )}
                          <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className={clsx('shrink-0', isActive ? 'text-primary' : 'text-text-tertiary')} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-tertiary hover:text-danger hover:bg-danger-50 transition-colors"
                  >
                    <LogOut size={20} strokeWidth={1.5} />
                    Log out
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
