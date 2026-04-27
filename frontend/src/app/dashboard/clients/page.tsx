'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash, Search, Mail, Phone, Users } from 'lucide-react';
import { StatusModal } from '@/components/ui/StatusModal';
import { AddClientModal } from '@/components/ui/AddClientModal';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
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
            const res = await api.get('/clients');
            if (Array.isArray(res.data)) {
                setClients(res.data);
            } else {
                setClients([]);
            }
        } catch (error) {
            console.error(error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClientCreated = (newClient: any) => {
        setClients([...clients, newClient]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return;
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

    const filteredClients = Array.isArray(clients) ? clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tighter uppercase leading-none">Clients</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Revenue Partner Database</p>
                </div>
                <button
                    onClick={() => setShowAddClient(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    New Partner
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-1">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search partners by name or email..."
                        className="block w-full rounded-2xl border-slate-200 bg-white pl-12 pr-4 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 sm:text-sm h-14 border transition-all outline-none font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Responsive Table/Card View */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Identity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Intelligence Info</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Tax ID</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                                                <Users size={32} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Partners Found in Database</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-xs shadow-sm">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-heading font-bold text-slate-900 tracking-tight">{client.name}</div>
                                                    <div className="text-[10px] font-medium text-slate-400 md:hidden">{client.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap hidden md:table-cell">
                                            <div className="text-[11px] text-slate-500 space-y-1.5 font-medium">
                                                {client.email && (
                                                    <div className="flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                                                        <Mail size={14} className="text-slate-300" /> {client.email}
                                                    </div>
                                                )}
                                                {client.phone && (
                                                    <div className="flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                                                        <Phone size={14} className="text-slate-300" /> {client.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-[11px] font-bold text-slate-500 hidden lg:table-cell uppercase tracking-wider">
                                            {client.taxId || '---'}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    className="p-2 text-slate-300 hover:text-indigo-600 transition-all rounded-xl hover:bg-indigo-50"
                                                    title="Edit Intelligence"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50"
                                                    title="Terminate Relationship"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
