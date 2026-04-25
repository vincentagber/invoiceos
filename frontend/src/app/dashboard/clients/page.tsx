'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Plus, Edit, Trash, Search, Mail, Phone, Users, MoreHorizontal } from 'lucide-react';

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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(clients.filter(c => c.id !== id));
        } catch (error) {
            alert('Failed to delete client');
        }
    };

    const filteredClients = Array.isArray(clients) ? clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your customer database.</p>
                </div>
                <Link
                    href="/dashboard/clients/new"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    New Client
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 p-1">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="block w-full rounded-lg border-gray-200 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border p-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax ID</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Users size={24} className="text-gray-400" />
                                            </div>
                                            <p>No clients found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-gray-900">{client.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 space-y-1">
                                                {client.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} /> {client.email}
                                                    </div>
                                                )}
                                                {client.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={14} /> {client.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {client.taxId || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded hover:bg-indigo-50"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                                    title="Delete"
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
        </div>
    );
}
