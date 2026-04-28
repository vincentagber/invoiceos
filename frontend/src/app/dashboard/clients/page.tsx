'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash, Search, Mail, Phone, Users, Download, Filter, Handshake, UserPlus, ShieldCheck } from 'lucide-react';
import { StatusModal } from '@/components/ui/StatusModal';
import { AddClientModal } from '@/components/ui/AddClientModal';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import clsx from 'clsx';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    version: number;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAddClient, setShowAddClient] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const bizRes = await api.get('/business/me');
            if (bizRes.data && bizRes.data.id) {
                const res = await api.get(`/clients?businessId=${bizRes.data.id}`);
                setClients(Array.isArray(res.data) ? res.data : []);
            }
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClientCreated = (newClient: any) => {
        setClients([newClient, ...clients]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to terminate this partner relationship?')) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(clients.filter(c => c.id !== id));
            setModalConfig({
                title: 'Relationship Terminated',
                message: 'The partner has been successfully purged from your active database.',
                type: 'info'
            });
            setShowModal(true);
        } catch (error) {
            setModalConfig({
                title: 'Termination Failed',
                message: 'We could not remove this partner. They may be linked to active revenue streams.',
                type: 'error'
            });
            setShowModal(true);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
                        <ShieldCheck size={12} />
                        Enterprise Ledger
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Partners & Clients</h1>
                        <p className="text-slate-500 mt-2 font-medium max-w-xl">
                            Manage your revenue-generating relationships and institutional ledger entries.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-2xl py-3 px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95">
                        <Download size={14} />
                        Export CSV
                    </button>
                    <Link 
                        href="/dashboard/clients/new"
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3 px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <Plus size={14} />
                        New Partner
                    </Link>
                </div>
            </div>

            {/* Tools Row */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by name, email, or tax ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white pl-12 pr-4 py-4 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none shadow-sm"
                    />
                </div>
                <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm">
                    <Filter size={18} />
                    Filters (0)
                </button>
            </div>

            {/* Content Area */}
            {filteredClients.length === 0 ? (
                <div className="relative w-full rounded-[2.5rem] border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[550px] flex items-center justify-center p-8 group">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-slate-50 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] rounded-full bg-slate-50 blur-3xl transition-transform duration-1000 group-hover:scale-110 delay-150"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto space-y-8">
                        <div className="w-24 h-24 relative flex items-center justify-center animate-in zoom-in-50 duration-500">
                            <div className="absolute inset-0 bg-slate-50 rounded-[2rem] rotate-6 shadow-sm border border-slate-100 transition-transform duration-500 group-hover:rotate-12"></div>
                            <div className="absolute inset-0 bg-white rounded-[2rem] -rotate-6 shadow-xl border border-slate-100 flex items-center justify-center transition-transform duration-500 group-hover:-rotate-12">
                                <Handshake size={40} className="text-slate-900" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Build Your Partner Network</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Start by adding your first client, vendor, or partner to begin tracking intelligence, managing relationships, and generating institutional invoices.
                            </p>
                        </div>
                        <Link 
                            href="/dashboard/clients/new"
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 px-8 font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                        >
                            <UserPlus size={18} />
                            Add First Partner
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Intelligence Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tax Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-sm border border-slate-200 transition-transform duration-300 group-hover:scale-110">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 tracking-tight">{client.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Partner ID: {client.id.substring(0, 8).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <Mail size={14} className="text-slate-300" />
                                                    {client.email}
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                        <Phone size={14} className="text-slate-300" />
                                                        {client.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                                                {client.taxId || 'NO TAX ID'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(client.id)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddClientModal 
                isOpen={showAddClient} 
                onClose={() => setShowAddClient(false)} 
                onSuccess={handleClientCreated}
            />

            <StatusModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel="Proceed"
            />
        </div>
    );
}
