'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    Check, 
    ArrowRight, 
    ChevronRight, 
    Plus, 
    Play, 
    FileText, 
    CreditCard, 
    BarChart, 
    Users, 
    Shield, 
    Search,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    Minus,
    LayoutDashboard,
    Zap,
    Star
} from 'lucide-react';
import clsx from 'clsx';

export default function EmeraldLandingPage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const navLinks = [
        { name: 'Products', href: '#products' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Blog', href: '#blog' },
        { name: 'Docs', href: '#docs' },
    ];

    const featureIcons = [
        { title: "Automated Billing", desc: "Set your recurring payments once and let our engine handle the rest.", icon: Zap },
        { title: "Payment Tracking", desc: "Get real-time notifications when your clients view or pay invoices.", icon: BarChart },
        { title: "Smart Reporting", desc: "Analyze your revenue growth with deep intelligence and forecasting.", icon: LayoutDashboard },
        { title: "Global Payments", desc: "Accept payments in over 135 currencies with 1-click checkout.", icon: CreditCard },
    ];

    const pricingPlans = [
        { name: 'Basic', price: '$19', features: ['5 Invoices / mo', 'Basic Branding', 'Email Support', '1 Team Member'] },
        { name: 'Standard', price: '$49', features: ['Unlimited Invoices', 'Custom Domain', 'Priority Support', '5 Team Members'], popular: true },
        { name: 'Premium', price: '$99', features: ['White-label Everything', 'Revenue Intelligence', 'API Access', 'Unlimited Team'] },
    ];

    const testimonials = [
        { name: 'Carman Grace', role: 'CEO, Fintech Ltd', quote: 'InvoiceOS has completely transformed how we handle billing. Our collection time dropped by 40%.', avatar: 'CG' },
        { name: 'Taylor Graham', role: 'Product Manager', quote: 'The most elegant invoicing solution out there. My clients love the professional checkout experience.', avatar: 'TG' },
        { name: 'Emily Wilson', role: 'Agency Director', quote: 'The real-time tracking is a game changer. I know exactly when to follow up with my clients.', avatar: 'EW' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Header / Nav */}
            <nav className="absolute top-0 w-full z-50">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="InvoiceOS Logo" className="h-12 w-auto bg-white p-1.5 rounded-xl shadow-md" />
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map(link => (
                            <Link key={link.name} href={link.href} className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-bold text-white hover:text-white/80 transition-colors">Login</Link>
                        <Link href="/register" className="px-6 py-2.5 bg-white text-emerald-600 text-sm font-bold rounded-full hover:bg-emerald-50 transition-all active:scale-95 shadow-lg shadow-black/10">
                            Try For Free
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-32 bg-emerald-600 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[150px] -mr-40 -mt-40" />
                    </div>

                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="space-y-10 text-white">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h1 className="text-5xl md:text-7xl font-sans font-semibold leading-[1.1]">
                                    Powerful Invoicing Platform <br /> 
                                    <span className="text-emerald-200 italic">Your Business</span> & Your Clients
                                </h1>
                                <p className="text-xl text-emerald-50/80 max-w-lg leading-relaxed">
                                    The all-in-one revenue engine designed to help you collect payments faster and build stronger client relationships.
                                </p>
                            </motion.div>

                            <div className="space-y-4">
                                {['Fast Invoicing Process', 'Professional Templates', 'Secure Cloud Storage'].map(item => (
                                    <div key={item} className="flex items-center gap-3">
                                        <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-medium text-emerald-50">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex items-center gap-8">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-10 w-10 rounded-full border-2 border-emerald-600 bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                            U{i}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xl font-bold">25,707 +</p>
                                    <p className="text-xs text-emerald-100 uppercase tracking-widest font-bold">Trusted Users</p>
                                </div>
                            </div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative"
                        >
                            <img 
                                src="/emerald-hero.png" 
                                alt="InvoiceOS Mockup" 
                                className="w-full h-auto rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white/10"
                            />
                            {/* Floating Card */}
                            <div className="absolute -left-10 -bottom-10 bg-white p-6 rounded-2xl shadow-2xl hidden md:block max-w-[200px] border border-emerald-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <CreditCard size={20} />
                                    </div>
                                    <p className="text-sm font-bold">Recent Payment</p>
                                </div>
                                <p className="text-2xl font-black text-slate-900">$1,450.00</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">From Acme Corp</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="products" className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h2 className="text-emerald-600 text-sm font-black uppercase tracking-[0.3em]">The Platform</h2>
                                <h3 className="text-5xl font-sans font-semibold text-slate-900 leading-tight">All-In-One Invoice Platform</h3>
                                <p className="text-lg text-slate-500 leading-relaxed">
                                    Everything you need to manage your business finances in one place. From automated billing to deep revenue analytics.
                                </p>
                            </div>
                            <Link href="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                                Start Free Trial
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {featureIcons.map((feature, i) => (
                                <div key={i} className="p-8 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5 transition-all group">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <feature.icon size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-xl border border-slate-100 grid lg:grid-cols-2 gap-20 items-center">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-4">
                                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Growth</p>
                                    <p className="text-4xl font-black">+40%</p>
                                    <p className="text-xs text-slate-400">Average collection speed increase</p>
                                </div>
                                <div className="p-8 bg-emerald-600 rounded-3xl text-white space-y-4">
                                    <p className="text-sm font-bold text-emerald-200 uppercase tracking-widest">Active</p>
                                    <p className="text-4xl font-black">15k+</p>
                                    <p className="text-xs text-emerald-100">Daily active businesses</p>
                                </div>
                                <div className="col-span-2 p-8 bg-white border border-slate-100 rounded-3xl flex items-center gap-6 shadow-lg shadow-slate-200/50">
                                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold">JA</div>
                                    <div>
                                        <p className="font-bold text-slate-900">Julian Aroba</p>
                                        <p className="text-xs text-slate-400">CEO at Sovereign Intellect</p>
                                    </div>
                                    <div className="ml-auto flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h2 className="text-4xl font-sans font-semibold text-slate-900 leading-tight">Invoicing Solution For All Businesses</h2>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    Whether you are a solo freelancer or a growing agency, InvoiceOS provides the infrastructure you need to scale your revenue.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                                        <Check size={18} className="text-emerald-600" />
                                        Custom branding & white-labeling
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                                        <Check size={18} className="text-emerald-600" />
                                        Multi-currency support out of the box
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Preview */}
                <section className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10 order-2 lg:order-1">
                            <h2 className="text-5xl font-sans font-semibold text-slate-900 leading-tight">An Online Invoicing Software</h2>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Get a bird's eye view of your business performance. Track outstanding payments and monitor your cash flow in real-time.
                            </p>
                            <div className="space-y-8 pt-4">
                                <div className="flex gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">Easy User Interface</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">Clean, intuitive design that requires zero training to master.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">Data Safety and Privacy</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">Bank-level encryption and secure backups for all your data.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <img 
                                src="/chart-mockup.png" 
                                alt="Dashboard Chart" 
                                className="w-full h-auto rounded-[2.5rem] shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* How Does It Work */}
                <section className="py-32 bg-emerald-50/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
                            <h2 className="text-emerald-600 text-sm font-black uppercase tracking-[0.3em]">Workflow</h2>
                            <h3 className="text-5xl font-sans font-semibold text-slate-900">How Does It Work?</h3>
                            <p className="text-slate-500 font-medium">Three simple steps to streamline your revenue operations.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Register Account", desc: "Sign up in seconds and configure your business brand.", img: "/feature-1.png", color: "bg-emerald-50" },
                                { title: "Create Invoice", desc: "Draft professional invoices with our drag-and-drop builder.", img: "/feature-2.png", color: "bg-blue-50" },
                                { title: "Receive Payments", desc: "Get paid instantly via card, transfer, or crypto.", img: "/feature-3.png", color: "bg-amber-50" },
                            ].map((step, i) => (
                                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center group">
                                    <div className={clsx("h-48 w-full rounded-2xl mb-8 flex items-center justify-center overflow-hidden", step.color)}>
                                        <img src={step.img} alt={step.title} className="w-4/5 h-auto object-contain group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h4>
                                    <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-24 space-y-6">
                            <h2 className="text-emerald-600 text-sm font-black uppercase tracking-[0.3em]">Pricing Plans</h2>
                            <h3 className="text-5xl font-sans font-semibold text-slate-900">Choose Your Plan</h3>
                            <p className="text-slate-500 font-medium">Simple, transparent pricing for teams of all sizes.</p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {pricingPlans.map((plan, i) => (
                                <div key={i} className={clsx(
                                    "p-12 rounded-[3.5rem] border transition-all flex flex-col h-full",
                                    plan.popular ? "bg-emerald-600 text-white border-emerald-600 shadow-2xl shadow-emerald-600/20 scale-105 z-10" : "bg-white text-slate-900 border-slate-100 shadow-sm"
                                )}>
                                    <h4 className="text-lg font-bold mb-6">{plan.name}</h4>
                                    <p className="text-5xl font-black mb-10">{plan.price} <span className="text-sm font-medium opacity-60">/ mo</span></p>
                                    <div className="space-y-6 flex-1">
                                        {plan.features.map(f => (
                                            <div key={f} className="flex items-center gap-3">
                                                <div className={clsx("h-5 w-5 rounded-full flex items-center justify-center", plan.popular ? "bg-white/20" : "bg-emerald-50")}>
                                                    <Check size={12} className={plan.popular ? "text-white" : "text-emerald-600"} />
                                                </div>
                                                <span className="text-sm font-medium opacity-90">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Link 
                                        href="/register" 
                                        className={clsx(
                                            "mt-12 py-5 rounded-2xl text-center font-bold transition-all active:scale-95 shadow-lg",
                                            plan.popular ? "bg-white text-emerald-600 hover:bg-emerald-50" : "bg-emerald-600 text-white hover:bg-emerald-500"
                                        )}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-32 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-24 space-y-6">
                            <h2 className="text-emerald-600 text-sm font-black uppercase tracking-[0.3em]">Testimonials</h2>
                            <h3 className="text-5xl font-sans font-semibold text-slate-900">What Our Client Says</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {testimonials.map((t, i) => (
                                <div key={i} className="text-center space-y-8">
                                    <div className="h-24 w-24 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-2xl font-bold text-emerald-600 border-4 border-white shadow-xl">
                                        {t.avatar}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-bold text-slate-900">{t.name}</h4>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t.role}</p>
                                    </div>
                                    <p className="text-slate-500 italic font-medium leading-relaxed italic">"{t.quote}"</p>
                                    <div className="flex justify-center gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-20 flex justify-center">
                            <Link href="/register" className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                                Join These Businesses
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto bg-emerald-600 rounded-[4rem] p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl" />
                        <div className="space-y-8 text-white relative z-10 text-center lg:text-left">
                            <h2 className="text-4xl lg:text-6xl font-sans font-semibold leading-tight">
                                Let's Start Create Your <br /> Invoices For 30 Days Trial
                            </h2>
                            <Link href="/register" className="inline-flex px-10 py-5 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 shadow-2xl transition-all active:scale-95">
                                Try Free Trial
                            </Link>
                        </div>
                        <div className="relative z-10 w-full max-w-md">
                            <img src="/emerald-hero.png" alt="CTA Mockup" className="w-full h-auto rounded-2xl shadow-2xl rotate-3" />
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-start">
                        <div className="lg:sticky lg:top-32">
                            <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 shadow-inner">
                                <img src="/chart-mockup.png" alt="FAQ Graphic" className="w-full h-auto rounded-3xl" />
                            </div>
                        </div>
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-emerald-600 text-sm font-black uppercase tracking-[0.3em]">Help Center</h2>
                                <h3 className="text-5xl font-sans font-semibold text-slate-900 leading-tight">General Questions</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { q: "How secure is my data?", a: "We use AES-256 encryption for all data storage and SSL/TLS for data transmission." },
                                    { q: "Can I cancel my subscription?", a: "Yes, you can cancel at any time. Your data will be preserved for 30 days after cancellation." },
                                    { q: "Do you support mobile payments?", a: "Absolutely. Our checkout pages are mobile-responsive and support Apple/Google Pay." },
                                    { q: "What currencies are supported?", a: "We support over 135 currencies out of the box, with automatic exchange rate calculations." }
                                ].map((faq, i) => (
                                    <div key={i} className="group border-b border-slate-100 pb-6">
                                        <button 
                                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between py-4 text-left group-hover:text-emerald-600 transition-colors"
                                        >
                                            <span className="text-xl font-bold text-slate-900 group-hover:text-emerald-600">{faq.q}</span>
                                            {activeFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                                        </button>
                                        {activeFaq === i && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-slate-500 font-medium leading-relaxed pt-2"
                                            >
                                                {faq.a}
                                            </motion.p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white pt-32 pb-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-end border-b border-white/5 pb-20 mb-20">
                        <h2 className="text-5xl lg:text-7xl font-sans font-semibold leading-tight">
                            Ready to take control <br /> of your finances?
                        </h2>
                        <div className="flex gap-6">
                            <Link href="/register" className="px-12 py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all">
                                Get Started
                            </Link>
                            <Link href="/docs" className="px-12 py-5 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 border border-white/10 active:scale-95 transition-all">
                                View Docs
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24 mb-20">
                        <div className="col-span-2 space-y-10">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="InvoiceOS Logo" className="h-16 w-auto bg-white p-2 rounded-xl shadow-md" />
                            </div>
                            <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                                The next generation of invoicing and revenue intelligence for ambitious businesses worldwide.
                            </p>
                            <div className="flex gap-8">
                                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                                    <Link key={social} href="#" className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">
                                        {social}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-10">
                            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400">Platform</h4>
                            <ul className="space-y-6 text-slate-400 font-bold">
                                {['Invoicing', 'Payments', 'Analytics', 'Automations'].map(item => (
                                    <li key={item}><Link href="#" className="hover:text-white transition-colors">{item}</Link></li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-10">
                            <h4 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400">Company</h4>
                            <ul className="space-y-6 text-slate-400 font-bold">
                                {['About Us', 'Careers', 'Contact', 'Privacy'].map(item => (
                                    <li key={item}><Link href="#" className="hover:text-white transition-colors">{item}</Link></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                        <p>© 2026 INVOICEOS TECHNOLOGIES INC.</p>
                        <div className="flex gap-10">
                            <Link href="#" className="hover:text-white">Privacy Policy</Link>
                            <Link href="#" className="hover:text-white">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
