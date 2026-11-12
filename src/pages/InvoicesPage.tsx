import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { InvoiceStatus } from '../types';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Receipt,
  CreditCard,
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
    <div className="space-y-12">
      <PageHeader
        kicker="Receivables"
        title="Invoices"
        description={`Issue invoices, record payments, and watch overdue accounts in ${currency}.`}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveView('invoice-new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 border-y border-line sm:grid-cols-2 xl:grid-cols-4">
        <div className="py-6 xl:pr-8">
          <p className="text-[14px] text-ink-secondary">Invoiced</p>
          <p className="figure-sm mt-3">{formatCurrency(totalBilled, currency, symbol)}</p>
          <p className="meta mt-2">{invoices.length} invoices</p>
        </div>
        <div className="border-t border-line py-6 sm:border-t-0 xl:border-l xl:border-line xl:px-8">
          <p className="text-[14px] text-ink-secondary">Collected</p>
          <p className="figure-sm mt-3">{formatCurrency(totalCollected, currency, symbol)}</p>
          <p className="meta mt-2">Settled to date</p>
        </div>
        <div className="border-t border-line py-6 sm:border-l sm:border-line sm:pl-8 xl:px-8">
          <p className="text-[14px] text-ink-secondary">Outstanding</p>
          <p className="figure-sm mt-3">{formatCurrency(totalOutstanding, currency, symbol)}</p>
          <p className="meta mt-2">Still to collect</p>
        </div>
        <div className="border-t border-line py-6 xl:border-l xl:border-line xl:pl-8">
          <p className="text-[14px] text-ink-secondary">Overdue</p>
          <p className={`figure-sm mt-3 ${overdueCount > 0 ? 'text-[#8E3B32]' : ''}`}>{overdueCount}</p>
          <p className="meta mt-2">Past the due date</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'draft', label: 'Draft' },
            { id: 'sent', label: 'Sent' },
            { id: 'partially_paid', label: 'Partial' },
            { id: 'paid', label: 'Paid' },
            { id: 'overdue', label: 'Overdue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`whitespace-nowrap border-b-2 pb-1 text-[15px] ${
                statusFilter === tab.id
                  ? 'border-ink font-medium text-ink'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search invoices"
              className="field pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="field w-auto"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">Highest total</option>
            <option value="balance-desc">Highest balance</option>
            <option value="number">Document number</option>
          </select>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
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
        <div className="border border-slate-200/80 rounded-md bg-white shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[15px] border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 font-normal">Invoice #</th>
                  <th className="py-2.5 px-4 font-normal">Client</th>
                  <th className="py-2.5 px-3 font-normal">Issue Date</th>
                  <th className="py-2.5 px-3 font-normal">Due Date</th>
                  <th className="py-2.5 px-4 font-normal text-right">Total</th>
                  <th className="py-2.5 px-4 font-normal text-right">Balance Due</th>
                  <th className="py-2.5 px-3 font-normal text-center">Status</th>
                  <th className="py-2.5 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => openDocumentPreview('invoice', inv)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{inv.clientSnapshot.name}</div>
                      {inv.clientSnapshot.companyName && (
                        <div className="text-[13px] text-slate-500">{inv.clientSnapshot.companyName}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-mono text-[13px]">
                      {formatDate(inv.issueDate)}
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-mono text-[13px]">
                      <span className={inv.status === 'overdue' ? 'text-rose-800 font-semibold' : ''}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>

                    <td className="money py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(inv.grandTotal, inv.currency, inv.currencySymbol)}
                    </td>

                    <td className="money py-3 px-4 text-right font-bold">
                      {inv.status === 'paid' ? (
                        <span className="text-slate-400 font-normal">Settled</span>
                      ) : (
                        <span className="text-slate-900">
                          {formatCurrency(inv.outstandingBalance, inv.currency, inv.currencySymbol)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <Badge status={inv.status} type="invoice" size="sm" />
                    </td>

                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="p-1 text-slate-500 hover:text-emerald-700 transition-colors rounded"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => openDocumentPreview('invoice', inv)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors rounded"
                          title="Inspect Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setActiveView('invoice-edit', inv.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors rounded"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => duplicateInvoice(inv.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors rounded"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          className="p-1 text-slate-400 hover:text-rose-700 transition-colors rounded"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
};
