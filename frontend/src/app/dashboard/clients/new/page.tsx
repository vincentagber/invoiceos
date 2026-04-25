'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { StatusModal } from '@/components/ui/StatusModal';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function NewClientPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [taxId, setTaxId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.businesses?.[0]?.id) {
            setModalConfig({
                title: 'Session Expired',
                message: 'Business profile not found. Please relogin to continue.',
                type: 'error'
            });
            setShowModal(true);
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/clients', {
                name,
                email,
                phone,
                address,
                taxId,
                businessId: user.businesses[0].id
            });
            setModalConfig({
                title: 'Partner Registered',
                message: 'The new revenue partner has been successfully integrated into your database.',
                type: 'success'
            });
            setShowModal(true);
        } catch (error) {
            console.error(error);
            setModalConfig({
                title: 'Registration Failed',
                message: 'We encountered an error while adding this partner. Please check all fields.',
                type: 'error'
            });
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clients" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 sm:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Client / Company Name</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID / VAT Number</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Client
                            </>
                        )}
                    </button>
                </div>
            </form>

            <StatusModal 
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (modalConfig.type === 'success') {
                        router.push('/dashboard/clients');
                    }
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                actionLabel={modalConfig.type === 'success' ? 'View Partners' : 'Close'}
            />
        </div>
    );
}
