'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        workEmail: '',
        subject: 'Platform Integration',
        message: ''
    });
    const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS'>('IDLE');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SUBMITTING');
        // Simulate API call
        setTimeout(() => {
            setStatus('SUCCESS');
            setFormData({ fullName: '', workEmail: '', subject: 'Platform Integration', message: '' });
        }, 1500);
    };

    return (
        <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans selection:bg-[#6cf8bb] selection:text-[#00714d]">
            {/* Top Navigation */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 docked full-width top-0 sticky z-50">
                <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="InvoiceOS" className="h-8 w-auto object-contain" />
                        </Link>
                        <div className="hidden md:flex gap-8">
                            <Link href="/" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Platform</Link>
                            <Link href="#" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Solutions</Link>
                            <Link href="/#pricing" className="font-medium text-sm tracking-tight text-slate-600 hover:text-black transition-colors">Pricing</Link>
                            <Link href="/contact" className="font-medium text-sm tracking-tight text-black border-b-2 border-black pb-1">Resources</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium tracking-tight text-slate-600 hover:text-black transition-colors px-4 py-2">Log In</Link>
                        <Link href="/register" className="bg-black text-white text-sm font-medium tracking-tight px-6 py-2.5 rounded-lg active:scale-95 transition-all duration-200 shadow-lg shadow-black/10">Get Started</Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-8 py-20">
                {/* Hero Section */}
                <header className="max-w-3xl mx-auto text-center mb-24">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold tracking-tight text-[#0b1c30] mb-8"
                    >
                        Contact our Team
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-[#45464d] font-medium leading-relaxed"
                    >
                        Precision support for modern financial operations. We provide institutional-grade assistance to businesses across global markets, with dedicated teams in New York and Lagos.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-6xl mx-auto">
                    {/* Contact Form Area */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-7 bg-white rounded-3xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] border border-slate-200 p-10 relative overflow-hidden"
                    >
                        <div className="mb-10 border-b border-slate-100 pb-8">
                            <h2 className="text-2xl font-bold text-[#0b1c30] mb-3">Send an Inquiry</h2>
                            <p className="text-sm text-[#45464d] font-medium">Our specialists aim to respond to all institutional inquiries within 2 hours.</p>
                        </div>

                        {status === 'SUCCESS' ? (
                            <div className="py-12 text-center space-y-6">
                                <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-[#0b1c30]">Inquiry Transmitted</h3>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto">Your request has been routed to the appropriate department. An officer will contact you shortly.</p>
                                </div>
                                <button 
                                    onClick={() => setStatus('IDLE')}
                                    className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline"
                                >
                                    Send another inquiry
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-8" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 block" htmlFor="fullName">Full Name</label>
                                        <input 
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all placeholder:text-slate-300" 
                                            id="fullName" 
                                            placeholder="Jane Doe" 
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 block" htmlFor="workEmail">Work Email</label>
                                        <input 
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all placeholder:text-slate-300" 
                                            id="workEmail" 
                                            placeholder="jane@company.com" 
                                            type="email"
                                            value={formData.workEmail}
                                            onChange={(e) => setFormData({...formData, workEmail: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 block" htmlFor="subject">Subject</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none appearance-none transition-all cursor-pointer" 
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    >
                                        <option>Platform Integration</option>
                                        <option>Enterprise Sales</option>
                                        <option>Technical Support</option>
                                        <option>Partnerships</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 block" htmlFor="message">Message</label>
                                    <textarea 
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none placeholder:text-slate-300" 
                                        id="message" 
                                        placeholder="Detail your inquiry here..." 
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    />
                                </div>
                                <div className="pt-4">
                                    <button 
                                        disabled={status === 'SUBMITTING'}
                                        className="bg-black text-white font-bold text-sm py-4 px-10 rounded-xl hover:opacity-90 transition-all w-full md:w-auto shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3" 
                                        type="submit"
                                    >
                                        {status === 'SUBMITTING' ? 'Transmitting...' : 'Submit Inquiry'}
                                        <span className="material-symbols-outlined text-lg">send</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>

                    {/* Sidebar Info Area */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-5 space-y-10"
                    >
                        {/* Support Channels */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-8 border-b border-slate-100 pb-4">Direct Channels</h3>
                            <div className="space-y-6">
                                {[
                                    { icon: 'support_agent', title: 'Technical Support', desc: '24/7 dedicated engineering support' },
                                    { icon: 'handshake', title: 'Sales & Enterprise', desc: 'Custom volume pricing and terms' },
                                    { icon: 'campaign', title: 'Media Relations', desc: 'Press inquiries and brand assets' }
                                ].map((channel, i) => (
                                    <a key={i} className="flex items-start gap-5 p-4 hover:bg-slate-50 rounded-2xl transition-all group" href="#">
                                        <div className="h-10 w-10 rounded-xl bg-[#e5eeff] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-xl font-fill">{channel.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#0b1c30]">{channel.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">{channel.desc}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Global Hubs */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-8 border-b border-slate-100 pb-4">Global Hubs</h3>
                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-[#006c49] text-xl">location_city</span>
                                        <h4 className="text-sm font-bold text-[#0b1c30]">New York, USA</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium pl-8">
                                        1 World Trade Center<br/>
                                        Suite 4500<br/>
                                        New York, NY 10007
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="material-symbols-outlined text-[#006c49] text-xl">corporate_fare</span>
                                        <h4 className="text-sm font-bold text-[#0b1c30]">Lagos, Nigeria</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium pl-8">
                                        Landmark Towers<br/>
                                        5B Water Corporation Road<br/>
                                        Victoria Island, Lagos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 w-full">
                <div className="w-full px-10 py-16 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div>
                        <img src="/logo.png" alt="InvoiceOS" className="h-10 w-auto object-contain mb-4" />
                        <p className="text-slate-500 text-sm">© 2026 InvoiceOS Precision. All rights reserved. Built for institutional reliability.</p>
                    </div>
                    <div className="flex flex-wrap gap-8 md:justify-end">
                        <Link className="text-sm font-bold text-slate-500 hover:text-black transition-colors" href="#">Privacy Policy</Link>
                        <Link className="text-sm font-bold text-slate-500 hover:text-black transition-colors" href="#">Terms of Service</Link>
                        <Link className="text-sm font-bold text-slate-500 hover:text-black transition-colors" href="#">Compliance</Link>
                        <Link className="text-sm font-bold text-slate-500 hover:text-black transition-colors" href="#">Security</Link>
                        <Link className="text-sm font-bold text-slate-500 hover:text-black transition-colors" href="#">API Documentation</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
