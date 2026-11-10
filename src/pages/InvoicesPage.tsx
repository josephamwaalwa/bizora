import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { InvoiceStatus } from '../types';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  Receipt,
  DollarSign,
  AlertCircle,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    searchQuery: globalSearch,
    setActiveView,
    openDocumentPreview,
    duplicateInvoice,
    deleteInvoice,
    openPaymentModal,
    showConfirmDialog,
    businessProfile,
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'balance-desc' | 'number'>('date-desc');

  const currency = businessProfile.defaultCurrency;
  const symbol = businessProfile.currencySymbol;

  const effectiveSearch = (globalSearch || localSearch).trim().toLowerCase();

  // Filter & Sort
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (statusFilter !== 'all' && inv.status !== statusFilter) return false;

        if (!effectiveSearch) return true;
        const numberMatch = inv.invoiceNumber.toLowerCase().includes(effectiveSearch);
        const clientMatch =
          inv.clientSnapshot.name.toLowerCase().includes(effectiveSearch) ||
          (inv.clientSnapshot.companyName && inv.clientSnapshot.companyName.toLowerCase().includes(effectiveSearch));
        const itemMatch = inv.items.some((item) => item.description.toLowerCase().includes(effectiveSearch));
        return numberMatch || clientMatch || itemMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.grandTotal - a.grandTotal;
        }
        if (sortBy === 'balance-desc') {
          return b.outstandingBalance - a.outstandingBalance;
        }
        if (sortBy === 'number') {
          return b.invoiceNumber.localeCompare(a.invoiceNumber);
        }
        return 0;
      });
  }, [invoices, statusFilter, effectiveSearch, sortBy]);

  // Aggregate metrics
  const totalBilled = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  const handleDelete = (id: string, invoiceNumber: string) => {
    showConfirmDialog({
      title: `Delete Invoice ${invoiceNumber}?`,
      message: 'Are you sure you want to delete this invoice? Recorded payments and balance histories will also be permanently deleted.',
      confirmLabel: 'Delete Invoice',
      isDestructive: true,
      onConfirm: () => deleteInvoice(id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bill clients, record installment payments, and track overdue accounts in {currency}.
          </p>
        </div>
        <Button
          variant="indigo"
          size="md"
          onClick={() => setActiveView('invoice-new')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Invoice
        </Button>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Invoiced</p>
            <p className="text-lg font-bold text-slate-900 font-mono">
              {formatCurrency(totalBilled, currency, symbol)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Collected Revenue</p>
            <p className="text-lg font-bold text-slate-900 font-mono">
              {formatCurrency(totalCollected, currency, symbol)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Outstanding Balance</p>
            <p className="text-lg font-bold text-rose-600 font-mono">
              {formatCurrency(totalOutstanding, currency, symbol)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Overdue Invoices</p>
            <p className="text-lg font-bold text-slate-900">
              {overdueCount} <span className="text-xs font-normal text-slate-500">accounts</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Controls */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'draft', label: 'Draft' },
              { id: 'sent', label: 'Sent' },
              { id: 'partially_paid', label: 'Partially Paid' },
              { id: 'paid', label: 'Paid' },
              { id: 'overdue', label: 'Overdue' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-navy-900 text-white shadow-subtle'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search invoices or items..."
                className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Total</option>
              <option value="balance-desc">Highest Balance Due</option>
              <option value="number">Doc Number</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title={invoices.length === 0 ? 'No invoices issued yet' : 'No matching invoices found'}
          description={
            invoices.length === 0
              ? 'Issue professional commercial invoices with itemized VAT, bank details, and track multi-tranche payments.'
              : 'Try clearing your search terms or choosing a different status filter.'
          }
          actionLabel="Create Invoice"
          onAction={() => setActiveView('invoice-new')}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => openDocumentPreview('invoice', inv)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{inv.clientSnapshot.name}</div>
                      {inv.clientSnapshot.companyName && (
                        <div className="text-[11px] text-slate-500">{inv.clientSnapshot.companyName}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{formatDate(inv.issueDate)}</td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className={inv.status === 'overdue' ? 'text-rose-600 font-semibold' : ''}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal, inv.currency, inv.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono">
                      {inv.status === 'paid' ? (
                        <span className="text-emerald-600 font-semibold">Settled</span>
                      ) : (
                        <span className="font-bold text-rose-600">
                          {formatCurrency(inv.outstandingBalance, inv.currency, inv.currencySymbol)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge status={inv.status} type="invoice" size="sm" />
                    </td>

                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openDocumentPreview('invoice', inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View / Print Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setActiveView('invoice-edit', inv.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicateInvoice(inv.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
