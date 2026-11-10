import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
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
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Clients
        </Button>
        <Card padding="md">
          <p className="text-sm text-slate-500">Client not found.</p>
        </Card>
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
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('clients')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Clients
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{client.name}</h2>
            {client.companyName && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.companyName}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('quotation-new')}
            leftIcon={<FileText className="w-4 h-4 text-indigo-600" />}
          >
            Create Quote
          </Button>
          <Button
            variant="indigo"
            size="sm"
            onClick={() => setActiveView('invoice-new')}
            leftIcon={<Receipt className="w-4 h-4" />}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Client Summary & Contact Info Card */}
      <Card padding="md" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Contact</span>
            <p className="font-semibold text-slate-900 text-sm">{client.name}</p>
            {client.companyName && <p className="text-slate-600">{client.companyName}</p>}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Information</span>
            <p className="flex items-center gap-1.5 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{client.email}</span>
            </p>
            {client.phone && (
              <p className="flex items-center gap-1.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.phone}</span>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Location & Tax</span>
            {client.address ? (
              <p className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{client.address}</span>
              </p>
            ) : (
              <p className="text-slate-400">No physical address stored</p>
            )}
            {client.vatNumber && (
              <p className="text-slate-500 font-mono text-[11px]">VAT No: {client.vatNumber}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Internal Notes</span>
            <p className="text-slate-600 italic leading-relaxed">
              {client.notes || 'No specific notes recorded for this client.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Client Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Invoiced</p>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(totalInvoiced, currency, symbol)}
          </p>
          <span className="text-[11px] text-slate-400">{clientInvoices.length} invoice(s)</span>
        </Card>

        <Card padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Collected Revenue</p>
          <p className="text-lg font-bold text-emerald-600 font-mono mt-1">
            {formatCurrency(totalPaid, currency, symbol)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Settled to date</span>
        </Card>

        <Card padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Outstanding Due</p>
          <p className={`text-lg font-bold font-mono mt-1 ${totalOutstanding > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {formatCurrency(totalOutstanding, currency, symbol)}
          </p>
          <span className="text-[11px] text-slate-400">Balance pending</span>
        </Card>

        <Card padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Quoted Proposals</p>
          <p className="text-lg font-bold text-indigo-700 font-mono mt-1">
            {formatCurrency(totalQuoted, currency, symbol)}
          </p>
          <span className="text-[11px] text-slate-400">{clientQuotes.length} quotation(s)</span>
        </Card>
      </div>

      {/* Tab Selector: Invoices vs Quotations */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'invoices'
              ? 'bg-navy-900 text-white shadow-subtle'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices ({clientInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'quotations'
              ? 'bg-navy-900 text-white shadow-subtle'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotations ({clientQuotes.length})</span>
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card padding="none" className="overflow-hidden">
          {clientInvoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No invoices created for {client.name} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => openDocumentPreview('invoice', inv)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(inv.issueDate)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(inv.dueDate)}</td>
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
                            <Button
                              variant="secondary"
                              size="sm"
                              className="p-1.5"
                              title="Record Payment"
                              onClick={() => openPaymentModal(inv)}
                            >
                              <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="p-1.5"
                            title="Preview Invoice"
                            onClick={() => openDocumentPreview('invoice', inv)}
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <Card padding="none" className="overflow-hidden">
          {clientQuotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No quotations created for {client.name} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Quote #</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientQuotes.map((quo) => (
                    <tr
                      key={quo.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => openDocumentPreview('quote', quo)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {quo.quotationNumber}
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
                          {quo.status !== 'declined' && !quo.convertedInvoiceId && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="p-1.5"
                              title="Convert to Invoice"
                              onClick={() => convertQuotationToInvoice(quo.id)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="p-1.5"
                            title="Preview Quote"
                            onClick={() => openDocumentPreview('quote', quo)}
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
