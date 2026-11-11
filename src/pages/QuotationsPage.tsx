import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { QuotationStatus } from '../types';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  FileCheck,
  FileText,
} from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const {
    quotations,
    searchQuery: globalSearch,
    setActiveView,
    openDocumentPreview,
    duplicateQuotation,
    convertQuotationToInvoice,
    deleteQuotation,
    showConfirmDialog,
    businessProfile,
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuotationStatus>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'number'>('date-desc');

  const currency = businessProfile.defaultCurrency;
  const symbol = businessProfile.currencySymbol;

  const effectiveSearch = (globalSearch || localSearch).trim().toLowerCase();

  const filteredQuotations = useMemo(() => {
    return quotations
      .filter((q) => {
        if (statusFilter !== 'all' && q.status !== statusFilter) return false;

        if (!effectiveSearch) return true;
        const numberMatch = q.quotationNumber.toLowerCase().includes(effectiveSearch);
        const clientMatch =
          q.clientSnapshot.name.toLowerCase().includes(effectiveSearch) ||
          (q.clientSnapshot.companyName && q.clientSnapshot.companyName.toLowerCase().includes(effectiveSearch));
        const itemMatch = q.items.some((item) => item.description.toLowerCase().includes(effectiveSearch));
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
        if (sortBy === 'number') {
          return b.quotationNumber.localeCompare(a.quotationNumber);
        }
        return 0;
      });
  }, [quotations, statusFilter, effectiveSearch, sortBy]);

  const totalValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);
  const acceptedCount = quotations.filter((q) => q.status === 'accepted').length;
  const pendingCount = quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length;

  const handleDelete = (id: string, quoteNumber: string) => {
    showConfirmDialog({
      title: `Delete Quotation ${quoteNumber}?`,
      message: 'Are you sure you want to delete this quotation? This action cannot be undone.',
      confirmLabel: 'Delete Quotation',
      isDestructive: true,
      onConfirm: () => deleteQuotation(id),
    });
  };

  return (
    <div className="space-y-12">
      <PageHeader
        kicker="Proposals"
        title="Quotations"
        description="Prepare estimates, follow client decisions, and turn accepted work into invoices."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveView('quotation-new')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create quotation
          </Button>
        }
      />

      <div className="grid grid-cols-1 border-y border-line sm:grid-cols-3">
        <div className="py-6 sm:pr-8">
          <p className="text-[14px] text-ink-secondary">Total quoted</p>
          <p className="figure-sm mt-3">{formatCurrency(totalValue, currency, symbol)}</p>
          <p className="meta mt-2">{quotations.length} proposals</p>
        </div>
        <div className="border-t border-line py-6 sm:border-t-0 sm:border-l sm:border-line sm:px-8">
          <p className="text-[14px] text-ink-secondary">Accepted</p>
          <p className="figure-sm mt-3">
            {acceptedCount}
            <span className="ml-2 text-[15px] font-normal text-ink-secondary">
              {quotations.length > 0 ? Math.round((acceptedCount / quotations.length) * 100) : 0}%
            </span>
          </p>
          <p className="meta mt-2">Signed off or converted</p>
        </div>
        <div className="border-t border-line py-6 sm:border-t-0 sm:border-l sm:border-line sm:pl-8">
          <p className="text-[14px] text-ink-secondary">Pending</p>
          <p className="figure-sm mt-3">{pendingCount}</p>
          <p className="meta mt-2">Awaiting a decision</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'draft', label: 'Draft' },
            { id: 'sent', label: 'Sent' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'declined', label: 'Declined' },
            { id: 'expired', label: 'Expired' },
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
              placeholder="Search quotations"
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
            <option value="amount-desc">Highest amount</option>
            <option value="number">Document number</option>
          </select>
        </div>
      </div>

      {/* Quotations Ledger Table */}
      {filteredQuotations.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title={quotations.length === 0 ? 'No quotations created yet' : 'No matching quotations found'}
          description={
            quotations.length === 0
              ? 'Draft your first quotation to present clean, branded pricing proposals to potential clients.'
              : 'Try clearing your search terms or choosing another filter.'
          }
          actionLabel="Create Quotation"
          onAction={() => setActiveView('quotation-new')}
        />
      ) : (
        <div className="overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Quotation</th>
                  <th>Client</th>
                  <th>Issued</th>
                  <th>Expires</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quo) => (
                  <tr
                    key={quo.id}
                    className="cursor-pointer"
                    onClick={() => openDocumentPreview('quote', quo)}
                  >
                    <td className="num font-medium">
                      {quo.quotationNumber}
                    </td>

                    <td>
                      <div className="font-medium">{quo.clientSnapshot.name}</div>
                      {quo.clientSnapshot.companyName && (
                        <div className="mt-0.5 text-[13px] text-ink-secondary">{quo.clientSnapshot.companyName}</div>
                      )}
                    </td>

                    <td className="text-ink-secondary">
                      {formatDate(quo.issueDate)}
                    </td>

                    <td className="text-ink-secondary">
                      {formatDate(quo.expiryDate)}
                    </td>

                    <td className="num text-right font-medium">
                      {formatCurrency(quo.grandTotal, quo.currency, quo.currencySymbol)}
                    </td>

                    <td>
                      <Badge status={quo.status} type="quote" />
                    </td>

                    <td
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {quo.status !== 'declined' && !quo.convertedInvoiceId && (
                          <button
                            onClick={() => convertQuotationToInvoice(quo.id)}
                            className="p-2 text-ink-muted hover:text-ink"
                            title="Convert to Invoice"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}

                        {quo.convertedInvoiceId && (
                          <span
                            className="p-2 text-ink-muted"
                            title="Already converted to invoice"
                          >
                            <FileCheck className="h-4 w-4" />
                          </span>
                        )}

                        <button
                          onClick={() => openDocumentPreview('quote', quo)}
                          className="p-2 text-ink-muted hover:text-ink"
                          title="Inspect Document"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setActiveView('quotation-edit', quo.id)}
                          className="p-2 text-ink-muted hover:text-ink"
                          title="Edit Quotation"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => duplicateQuotation(quo.id)}
                          className="p-2 text-ink-muted hover:text-ink"
                          title="Duplicate Quotation"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(quo.id, quo.quotationNumber)}
                          className="p-2 text-ink-muted hover:text-[#8E3B32]"
                          title="Delete Quotation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
};
