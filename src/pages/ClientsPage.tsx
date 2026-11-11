import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
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
  Edit2,
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
      setErrorMsg('Client full name or primary contact name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address is required for document delivery.');
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
            Accounts & Contacts
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Clients</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain client records, company tax details, and inspect billing dossiers.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white border border-slate-200/80 rounded-md shadow-subtle">
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, company, email or phone..."
            className="w-full text-xs rounded border border-slate-300 pl-8 pr-2.5 py-1 focus:outline-none focus:border-slate-500"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-slate-500" />}
          title={clients.length === 0 ? 'No clients added yet' : 'No matching clients found'}
          description={
            clients.length === 0
              ? 'Add your first client to start generating tailored quotations and commercial invoices.'
              : 'Try searching with a different contact name, company, or email.'
          }
          actionLabel="Add Client"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientQuotes = quotations.filter((q) => q.clientId === client.id);
            const clientInvoices = invoices.filter((i) => i.clientId === client.id);
            const totalClientPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
            const totalClientDue = clientInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);

            return (
              <div
                key={client.id}
                onClick={() => setActiveView('client-detail', client.id)}
                className="border border-slate-200/80 rounded-md bg-white p-4 shadow-subtle hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Contact Name & Edit controls */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{client.name}</h4>
                      {client.companyName ? (
                        <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{client.companyName}</span>
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">
                          Individual Account
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1 text-slate-400 hover:text-slate-800 transition-colors rounded"
                        title="Edit Client"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        className="p-1 text-slate-400 hover:text-rose-700 transition-colors rounded"
                        title="Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="py-3 space-y-1 text-xs text-slate-600 font-sans">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2 truncate text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 text-[11px] font-mono">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {clientQuotes.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-slate-400" />
                      {clientInvoices.length}
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    {totalClientDue > 0 ? (
                      <span className="text-xs font-bold text-slate-900">
                        Due: {formatCurrency(totalClientDue, currency, symbol)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Paid: {formatCurrency(totalClientPaid, currency, symbol)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit ${editingClient.name}` : 'Add New Client'}
        subtitle="Manage client details for quoting and invoicing"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
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
              label="Company Name (Optional)"
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
            placeholder="Special rates, procurement procedures, account contacts..."
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingClient ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
