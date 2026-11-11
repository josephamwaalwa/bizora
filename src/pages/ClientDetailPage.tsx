import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Receipt,
  Eye,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export const ClientDetailPage: React.FC = () => {
  const {
    activeEntityId,
    setActiveView,
    clients,
    quotations,
    invoices,
    openDocumentPreview,
    openPaymentModal,
    convertQuotationToInvoice,
    businessProfile,
  } = useApp();

  const client = clients.find((c) => c.id === activeEntityId);
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations'>('invoices');

  const currency = businessProfile.defaultCurrency;
  const symbol = businessProfile.currencySymbol;

  if (!client) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setActiveView('clients')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Clients
        </Button>
        <div className="p-6 bg-white border border-slate-200/80 rounded-md">
          <p className="text-sm text-slate-500">Client profile not found.</p>
        </div>
      </div>
    );
  }

  const clientQuotes = quotations.filter((q) => q.clientId === client.id);
  const clientInvoices = invoices.filter((i) => i.clientId === client.id);

  const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = clientInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
  const totalQuoted = clientQuotes.reduce((sum, q) => sum + q.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('clients')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Clients
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{client.name}</h2>
            {client.companyName && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3 text-slate-400" />
                <span>{client.companyName}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('quotation-new')}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            New Quotation
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveView('invoice-new')}
            leftIcon={<Receipt className="w-3.5 h-3.5" />}
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Client Contact & Tax Profile Strip */}
      <div className="border border-slate-200/80 rounded-md bg-white p-5 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Account Representative
            </span>
            <p className="font-semibold text-slate-900">{client.name}</p>
            {client.companyName && <p className="text-slate-600 mt-0.5">{client.companyName}</p>}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Direct Contact
            </span>
            <p className="flex items-center gap-1.5 text-slate-700">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{client.email}</span>
            </p>
            {client.phone && (
              <p className="flex items-center gap-1.5 text-slate-700 font-mono mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{client.phone}</span>
              </p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Address & Tax ID
            </span>
            {client.address ? (
              <p className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{client.address}</span>
              </p>
            ) : (
              <p className="text-slate-400">No physical address stored</p>
            )}
            {client.vatNumber && (
              <p className="font-mono text-[11px] text-slate-600 mt-0.5">VAT: {client.vatNumber}</p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Account Notes
            </span>
            <p className="text-slate-600 italic leading-relaxed text-[11px]">
              {client.notes || 'No specific terms or preferences noted.'}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Ledger Strip */}
      <div className="border border-slate-200/80 rounded-md bg-white shadow-subtle overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Invoiced</span>
            <p className="text-xl font-bold text-slate-900 font-mono mt-1">
              {formatCurrency(totalInvoiced, currency, symbol)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{clientInvoices.length} invoices</p>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Collected Cash</span>
            <p className="text-xl font-bold text-slate-900 font-mono mt-1">
              {formatCurrency(totalPaid, currency, symbol)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Settled to date</p>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Outstanding Due</span>
            <p className="text-xl font-bold font-mono mt-1 text-slate-900">
              {formatCurrency(totalOutstanding, currency, symbol)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Pending collection</p>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quoted Proposals</span>
            <p className="text-xl font-bold text-slate-900 font-mono mt-1">
              {formatCurrency(totalQuoted, currency, symbol)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{clientQuotes.length} quotations</p>
          </div>
        </div>
      </div>

      {/* Tabs: Invoices vs Quotations */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'invoices'
              ? 'bg-navy-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Invoices ({clientInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === 'quotations'
              ? 'bg-navy-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Quotations ({clientQuotes.length})</span>
        </button>
      </div>

      {/* Tab: Invoices Ledger */}
      {activeTab === 'invoices' && (
        <div className="border border-slate-200/80 rounded-md bg-white shadow-subtle overflow-hidden">
          {clientInvoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No invoices created for {client.name} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-4 font-normal">Invoice #</th>
                    <th className="py-2.5 px-3 font-normal">Issue Date</th>
                    <th className="py-2.5 px-3 font-normal">Due Date</th>
                    <th className="py-2.5 px-4 font-normal text-right">Total</th>
                    <th className="py-2.5 px-4 font-normal text-right">Balance Due</th>
                    <th className="py-2.5 px-3 font-normal text-center">Status</th>
                    <th className="py-2.5 px-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => openDocumentPreview('invoice', inv)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{formatDate(inv.issueDate)}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{formatDate(inv.dueDate)}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(inv.grandTotal, inv.currency, inv.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
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
                            title="Inspect Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
      )}

      {/* Tab: Quotations Ledger */}
      {activeTab === 'quotations' && (
        <div className="border border-slate-200/80 rounded-md bg-white shadow-subtle overflow-hidden">
          {clientQuotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No quotations created for {client.name} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-4 font-normal">Quote #</th>
                    <th className="py-2.5 px-3 font-normal">Issue Date</th>
                    <th className="py-2.5 px-3 font-normal">Expiry Date</th>
                    <th className="py-2.5 px-4 font-normal text-right">Total Amount</th>
                    <th className="py-2.5 px-3 font-normal text-center">Status</th>
                    <th className="py-2.5 px-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientQuotes.map((quo) => (
                    <tr
                      key={quo.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => openDocumentPreview('quote', quo)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {quo.quotationNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{formatDate(quo.issueDate)}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{formatDate(quo.expiryDate)}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(quo.grandTotal, quo.currency, quo.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge status={quo.status} type="quote" size="sm" />
                      </td>
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {quo.status !== 'declined' && !quo.convertedInvoiceId && (
                            <button
                              onClick={() => convertQuotationToInvoice(quo.id)}
                              className="p-1 text-slate-500 hover:text-teal-700 transition-colors rounded"
                              title="Convert to Invoice"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openDocumentPreview('quote', quo)}
                            className="p-1 text-slate-400 hover:text-slate-800 transition-colors rounded"
                            title="Inspect Quotation"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
      )}
    </div>
  );
};
