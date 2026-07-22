'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/lib/useToast';
import {
  Plus, Edit, Trash, Search, Mail, Phone, Download, Filter,
  Handshake, UserPlus, X,
} from 'lucide-react';
import { StatusModal } from '@/components/ui/StatusModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AddClientModal } from '@/components/ui/AddClientModal';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface Client {
  id: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  version: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', contactName: '', email: '', phone: '', address: '', taxId: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' as any });
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean; onConfirm: () => void; title: string; message: string; variant?: 'danger' | 'warning' | 'info'
  }>({ isOpen: false, onConfirm: () => {}, title: '', message: '' });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const bizRes = await api.get('/business/me');
      if (bizRes.data?.id) {
        const res = await api.get(`/clients?businessId=${bizRes.data.id}`);
        setClients(Array.isArray(res.data) ? res.data : []);
      }
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  };

  const handleClientCreated = (newClient: any) => setClients([newClient, ...clients]);

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      onConfirm: async () => {
        try {
          await api.delete(`/clients/${id}`);
          setClients(clients.filter(c => c.id !== id));
          setModalConfig({ title: 'Relationship Terminated', message: 'The partner has been removed from your database.', type: 'info' });
          setShowModal(true);
        } catch {
          setModalConfig({ title: 'Termination Failed', message: 'Could not remove this partner. They may be linked to active records.', type: 'error' });
          setShowModal(true);
        }
      },
      title: 'Terminate Relationship',
      message: 'Are you sure you want to terminate this partner relationship?',
      variant: 'danger',
    });
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name, contactName: client.contactName || '',
      email: client.email, phone: client.phone || '',
      address: client.address || '', taxId: client.taxId || '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setEditLoading(true);
    setEditError('');
    try {
      const { data } = await api.put(`/clients/${editingClient.id}`, { ...editForm, version: editingClient.version });
      setClients(clients.map(c => c.id === editingClient.id ? data : c));
      setShowEditModal(false);
      setEditingClient(null);
      setModalConfig({ title: 'Partner Updated', message: 'The client record has been updated successfully.', type: 'success' });
      setShowModal(true);
    } catch (error: any) {
      setEditError(error.response?.data?.message || 'Failed to update client. Please try again.');
    } finally { setEditLoading(false); }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Page Header */}
      <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Partners & Clients</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your revenue-generating relationships and institutional ledger entries.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>Export CSV</Button>
          <Link href="/dashboard/clients/new">
            <Button size="sm" leftIcon={<Plus size={14} />}>New Partner</Button>
          </Link>
        </div>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name, email, or tax ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-text-secondary hover:bg-surface-tertiary transition-colors whitespace-nowrap">
          <Filter size={14} />
          Filters (0)
        </button>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemAnim}>
        {filteredClients.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border py-20 px-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-surface-tertiary flex items-center justify-center text-text-tertiary">
                <Handshake size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary">Build Your Partner Network</p>
                <p className="text-xs text-text-tertiary max-w-sm">Start by adding your first client, vendor, or partner to begin tracking relationships and generating invoices.</p>
              </div>
              <Button size="sm" leftIcon={<UserPlus size={14} />}>Add First Partner</Button>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Partner Identity</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Contact Info</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Tax Identity</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filteredClients.map((client, i) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      key={client.id}
                      className="hover:bg-surface-secondary transition-colors group"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-surface-tertiary flex items-center justify-center text-text-primary font-semibold text-sm">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-primary">{client.name}</div>
                            <div className="text-[10px] text-text-tertiary mt-0.5">ID: {client.id.substring(0, 8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Mail size={12} className="text-text-tertiary" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2 text-xs text-text-tertiary">
                              <Phone size={12} className="text-text-tertiary" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-tertiary text-[10px] font-medium text-text-secondary">
                          {client.taxId || 'NO TAX ID'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-tertiary"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="p-2 text-text-tertiary hover:text-danger transition-colors rounded-lg hover:bg-danger-50"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <AddClientModal isOpen={showAddClient} onClose={() => setShowAddClient(false)} onSuccess={handleClientCreated} />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(prev => ({ ...prev, isOpen: false })); }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant || 'danger'}
      />
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        actionLabel="Proceed"
      />

      {/* Edit Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-surface rounded-2xl shadow-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Edit Partner</h2>
                  <p className="text-sm text-text-secondary mt-0.5">Update the institutional record for this client.</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors">
                  <X size={16} />
                </button>
              </div>

              {editError && (
                <div className="bg-danger-50 border border-danger-200 rounded-xl px-4 py-3 text-sm text-danger">{editError}</div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Partner Name <span className="text-danger">*</span></label>
                  <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="Enter partner name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Contact Name</label>
                  <input type="text" value={editForm.contactName} onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="Primary contact person" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address <span className="text-danger">*</span></label>
                  <input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="partner@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Phone</label>
                  <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Address</label>
                  <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="Full business address" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Tax ID</label>
                  <input type="text" value={editForm.taxId} onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary transition-all"
                    placeholder="Tax identification number" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" size="md" className="flex-1" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button type="submit" size="md" className="flex-1" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
