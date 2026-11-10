import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  FileText,
  Receipt,
  DollarSign,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    quotations,
    invoices,
    clients,
    businessProfile,
    setActiveView,
    openDocumentPreview,
    openPaymentModal,
    convertQuotationToInvoice,
  } = useApp();

  const currency = businessProfile.defaultCurrency;
  const symbol = businessProfile.currencySymbol;

  // 1. Calculations from actual data
  const totalQuotationsCount = quotations.length;
  const totalQuotationsValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  const pendingQuotations = quotations.filter((q) => q.status === 'sent' || q.status === 'draft');
  const pendingQuotationsCount = pendingQuotations.length;
  const pendingQuotationsValue = pendingQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  const totalInvoicesCount = invoices.length;
  const totalInvoicesValue = invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);

  const outstandingInvoices = invoices.filter((i) => i.status !== 'paid');
  const outstandingBalanceTotal = invoices.reduce((sum, i) => sum + (i.outstandingBalance || 0), 0);

  const totalRevenuePaid = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  const hasAnyDocuments = quotations.length > 0 || invoices.length > 0;

  // Recent data
  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Revenue visualization calculations
  const maxFinancial = Math.max(totalRevenuePaid + outstandingBalanceTotal, totalQuotationsValue, 1);
  const paidPercent = Math.min(100, Math.round((totalRevenuePaid / maxFinancial) * 100));
  const outstandingPercent = Math.min(100, Math.round((outstandingBalanceTotal / maxFinancial) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-950 p-6 rounded-2xl text-white shadow-elevated">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Namibian Business Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {businessProfile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor quotes, track outstanding balances, and streamline invoicing in {currency} ({symbol}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="indigo"
            size="md"
            onClick={() => setActiveView('quotation-new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Quote
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setActiveView('invoice-new')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            leftIcon={<Receipt className="w-4 h-4 text-teal-300" />}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenuePaid, currency, symbol)}
          subtitle="Collected payments"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          trend={{ value: `${invoices.filter((i) => i.status === 'paid').length} paid invoices`, isPositive: true }}
          onClick={() => setActiveView('invoices')}
        />

        <StatCard
          title="Outstanding"
          value={formatCurrency(outstandingBalanceTotal, currency, symbol)}
          subtitle={`${outstandingInvoices.length} unpaid invoice(s)`}
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
          trend={
            overdueInvoices.length > 0
              ? { value: `${overdueInvoices.length} overdue`, isPositive: false }
              : { value: 'None overdue', isPositive: true }
          }
          onClick={() => setActiveView('invoices')}
        />

        <StatCard
          title="Total Invoiced"
          value={formatCurrency(totalInvoicesValue, currency, symbol)}
          subtitle={`${totalInvoicesCount} invoice(s) generated`}
          icon={<Receipt className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
          onClick={() => setActiveView('invoices')}
        />

        <StatCard
          title="Pending Quotes"
          value={formatCurrency(pendingQuotationsValue, currency, symbol)}
          subtitle={`${pendingQuotationsCount} awaiting client approval`}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
          onClick={() => setActiveView('quotations')}
        />

        <StatCard
          title="Total Quotations"
          value={totalQuotationsCount}
          subtitle={`Valued at ${formatCurrency(totalQuotationsValue, currency, symbol)}`}
          icon={<FileText className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-700"
          onClick={() => setActiveView('quotations')}
        />
      </div>

      {/* Financial Health Visualization */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Cash Flow & Invoicing Performance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live breakdown of paid revenue versus pending collections.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Collected: {formatCurrency(totalRevenuePaid, currency, symbol)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span>Outstanding: {formatCurrency(outstandingBalanceTotal, currency, symbol)}</span>
            </div>
          </div>
        </div>

        {/* Progress bar visual */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${paidPercent}%` }}
              className="bg-emerald-500 transition-all duration-500 hover:opacity-90"
              title={`Paid: ${paidPercent}%`}
            />
            <div
              style={{ width: `${outstandingPercent}%` }}
              className="bg-rose-500 transition-all duration-500 hover:opacity-90"
              title={`Outstanding: ${outstandingPercent}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0%</span>
            <span>Total Value: {formatCurrency(totalRevenuePaid + outstandingBalanceTotal, currency, symbol)}</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      {!hasAnyDocuments ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="No business documents created yet"
          description="Get started by creating your first client and professional quotation or invoice. Bizora will automatically compute taxes and balances."
          actionLabel="Create First Quotation"
          onAction={() => setActiveView('quotation-new')}
          secondaryActionLabel="Create First Invoice"
          onSecondaryAction={() => setActiveView('invoice-new')}
        />
      ) : (
        /* Main Dual Column: Recent Invoices & Recent Quotes */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card padding="none">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Recent Invoices</h3>
              </div>
              <button
                onClick={() => setActiveView('invoices')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View all ({invoices.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentInvoices.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No invoices generated yet.</div>
              ) : (
                recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                        <Badge status={inv.status} type="invoice" size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {inv.clientSnapshot.name || 'Unnamed Client'}
                      </p>
                      <p className="text-[11px] text-slate-400">Due {formatDate(inv.dueDate)}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 font-mono">
                          {formatCurrency(inv.grandTotal, inv.currency, inv.currencySymbol)}
                        </p>
                        {inv.status !== 'paid' && (
                          <p className="text-[11px] font-medium text-rose-600 font-mono">
                            Due: {formatCurrency(inv.outstandingBalance, inv.currency, inv.currencySymbol)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {inv.status !== 'paid' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Record Payment"
                            onClick={() => openPaymentModal(inv)}
                            className="p-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          title="Preview Invoice"
                          onClick={() => openDocumentPreview('invoice', inv)}
                          className="p-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Quotations */}
          <Card padding="none">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Recent Quotations</h3>
              </div>
              <button
                onClick={() => setActiveView('quotations')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View all ({quotations.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentQuotations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No quotations drafted yet.</div>
              ) : (
                recentQuotations.map((quo) => (
                  <div
                    key={quo.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {quo.quotationNumber}
                        </span>
                        <Badge status={quo.status} type="quote" size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {quo.clientSnapshot.name || 'Unnamed Client'}
                      </p>
                      <p className="text-[11px] text-slate-400">Expires {formatDate(quo.expiryDate)}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 font-mono">
                          {formatCurrency(quo.grandTotal, quo.currency, quo.currencySymbol)}
                        </p>
                        <p className="text-[11px] text-slate-500">{quo.items.length} item(s)</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {quo.status !== 'declined' && !quo.convertedInvoiceId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Convert to Invoice"
                            onClick={() => convertQuotationToInvoice(quo.id)}
                            className="p-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          title="Preview Quote"
                          onClick={() => openDocumentPreview('quote', quo)}
                          className="p-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Recent Clients Section */}
      <Card padding="none">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Active Clients</h3>
          </div>
          <button
            onClick={() => setActiveView('clients')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Client directory ({clients.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {recentClients.map((client) => {
            const clientInvoices = invoices.filter((i) => i.clientId === client.id);
            const clientTotalPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);

            return (
              <div
                key={client.id}
                onClick={() => setActiveView('client-detail', client.id)}
                className="p-4 hover:bg-slate-50/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{client.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{client.companyName || client.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 text-slate-500">
                  <span>{clientInvoices.length} Invoices</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatCurrency(clientTotalPaid, currency, symbol)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
