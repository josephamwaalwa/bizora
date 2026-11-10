import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { QuotationStatus } from '../types';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Trash2,
  ArrowRightCircle,
  FileCheck,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
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

  // Active search query
  const effectiveSearch = (globalSearch || localSearch).trim().toLowerCase();

  // Filter & Sort
  const filteredQuotations = useMemo(() => {
    return quotations
      .filter((q) => {
        // Status match
        if (statusFilter !== 'all' && q.status !== statusFilter) return false;

        // Search match
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

  // Quotation metrics
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
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quotations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, track, and convert client proposals into billable invoices.
          </p>
        </div>
        <Button
          variant="indigo"
          size="md"
          onClick={() => setActiveView('quotation-new')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Quotation
        </Button>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Quoted Value</p>
            <p className="text-lg font-bold text-slate-900 font-mono">
              {formatCurrency(totalValue, currency, symbol)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Accepted Quotes</p>
            <p className="text-lg font-bold text-slate-900">
              {acceptedCount} <span className="text-xs font-normal text-slate-500">({quotations.length > 0 ? Math.round((acceptedCount / quotations.length) * 100) : 0}%)</span>
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending Quotes</p>
            <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
          </div>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
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
                placeholder="Search quotes or items..."
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
              <option value="amount-desc">Highest Value</option>
              <option value="number">Doc Number</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Quotations Table */}
      {filteredQuotations.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title={quotations.length === 0 ? 'No quotations created yet' : 'No matching quotations found'}
          description={
            quotations.length === 0
              ? 'Draft your first quotation to present clean, branded pricing proposals to potential clients.'
              : 'Try adjusting your search terms or status filters.'
          }
          actionLabel="Create Quotation"
          onAction={() => setActiveView('quotation-new')}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((quo) => (
                  <tr
                    key={quo.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => openDocumentPreview('quote', quo)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {quo.quotationNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{quo.clientSnapshot.name}</div>
                      {quo.clientSnapshot.companyName && (
                        <div className="text-[11px] text-slate-500">{quo.clientSnapshot.companyName}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{formatDate(quo.issueDate)}</td>

                    <td className="py-3.5 px-4 text-slate-600">{formatDate(quo.expiryDate)}</td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(quo.grandTotal, quo.currency, quo.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge status={quo.status} type="quote" size="sm" />
                    </td>

                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Convert to invoice action */}
                        {quo.status !== 'declined' && !quo.convertedInvoiceId && (
                          <button
                            onClick={() => convertQuotationToInvoice(quo.id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Convert into Invoice"
                          >
                            <ArrowRightCircle className="w-4 h-4" />
                          </button>
                        )}

                        {quo.convertedInvoiceId && (
                          <span
                            className="p-1.5 text-teal-600"
                            title="Already converted to invoice"
                          >
                            <FileCheck className="w-4 h-4" />
                          </span>
                        )}

                        <button
                          onClick={() => openDocumentPreview('quote', quo)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View / Print Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setActiveView('quotation-edit', quo.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Quotation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicateQuotation(quo.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Duplicate Quotation"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(quo.id, quo.quotationNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Quotation"
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
