import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import type { Client } from '../types';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Building,
  Edit,
  Trash2,
  FileText,
  Receipt,
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const {
    clients,
    quotations,
    invoices,
    searchQuery: globalSearch,
    setActiveView,
    saveClient,
    deleteClient,
    showConfirmDialog,
    businessProfile,
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currency = businessProfile.defaultCurrency;
  const symbol = businessProfile.currencySymbol;

  const effectiveSearch = (globalSearch || localSearch).trim().toLowerCase();

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (!effectiveSearch) return true;
      return (
        c.name.toLowerCase().includes(effectiveSearch) ||
        (c.companyName && c.companyName.toLowerCase().includes(effectiveSearch)) ||
        c.email.toLowerCase().includes(effectiveSearch) ||
        c.phone.toLowerCase().includes(effectiveSearch) ||
        c.address.toLowerCase().includes(effectiveSearch)
      );
    });
  }, [clients, effectiveSearch]);

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setVatNumber('');
    setNotes('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompanyName(client.companyName || '');
    setEmail(client.email);
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setVatNumber(client.vatNumber || '');
    setNotes(client.notes || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Full name or primary contact name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address is required for invoicing communication.');
      return;
    }

    saveClient({
      id: editingClient?.id,
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      vatNumber: vatNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, clientName: string) => {
    showConfirmDialog({
      title: `Delete Client "${clientName}"?`,
      message: 'Are you sure you want to delete this client? Existing quotations and invoices will remain intact with their saved snapshot.',
      confirmLabel: 'Delete Client',
      isDestructive: true,
      onConfirm: () => deleteClient(id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clients</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client profiles, company contacts, and track billing histories.
          </p>
        </div>
        <Button
          variant="indigo"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Client
        </Button>
      </div>

      {/* Search Bar */}
      <Card padding="sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search clients by name, company, email or phone..."
            className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title={clients.length === 0 ? 'No clients added yet' : 'No matching clients found'}
          description={
            clients.length === 0
              ? 'Add your first client or business partner to start creating tailored quotations and invoices.'
              : 'Try searching with a different name, company, or email.'
          }
          actionLabel="Add Client"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const clientQuotes = quotations.filter((q) => q.clientId === client.id);
            const clientInvoices = invoices.filter((i) => i.clientId === client.id);
            const totalClientPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
            const totalClientDue = clientInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);

            return (
              <Card
                key={client.id}
                variant="interactive"
                padding="md"
                className="flex flex-col justify-between group"
                onClick={() => setActiveView('client-detail', client.id)}
              >
                <div>
                  {/* Top: Avatar, Name, Company */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-teal-50 text-indigo-700 font-bold text-sm border border-indigo-100 shadow-subtle shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{client.name}</h4>
                        {client.companyName ? (
                          <p className="text-xs font-medium text-slate-600 truncate flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{client.companyName}</span>
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400">Individual Client</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Client"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      {clientQuotes.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-teal-500" />
                      {clientInvoices.length}
                    </span>
                  </div>

                  <div className="text-right">
                    {totalClientDue > 0 ? (
                      <span className="font-mono text-xs font-bold text-rose-600">
                        Due: {formatCurrency(totalClientDue, currency, symbol)}
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-semibold text-emerald-600">
                        Paid: {formatCurrency(totalClientPaid, currency, symbol)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Client Modal (Add/Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit ${editingClient.name}` : 'Add New Client'}
        subtitle="Save client details for quoting and invoicing"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact / Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Helena Shipanga"
              required
            />
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Desert Bloom Hospitality"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="helena@desertbloom.na"
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+264 64 000 000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Billing / Physical Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="14 Daniel Tjongarero Ave, Swakopmund"
            />
            <Input
              label="Client VAT / Tax Number"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="VAT-449102-NA"
            />
          </div>

          <Textarea
            label="Internal Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Preferences, accounting contacts, special discount agreements..."
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="indigo" type="submit">
              {editingClient ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
