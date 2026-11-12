import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Receipt } from 'lucide-react';

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

  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalInvoicedPortfolio = totalRevenuePaid + outstandingBalanceTotal;
  const paidRatio = totalInvoicedPortfolio > 0 ? (totalRevenuePaid / totalInvoicedPortfolio) * 100 : 0;
  const outstandingRatio = totalInvoicedPortfolio > 0 ? (outstandingBalanceTotal / totalInvoicedPortfolio) * 100 : 0;

  return (
    <div className="space-y-14 lg:space-y-16">
      <PageHeader
        kicker="Overview"
        title={businessProfile.name}
        description={`Financial position in ${currency} (${symbol}). Figures are drawn from the live ledger.`}
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveView('quotation-new')}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              New quotation
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveView('invoice-new')}
              leftIcon={<Receipt className="h-4 w-4" />}
            >
              New invoice
            </Button>
          </>
        }
      />

      <section className="border-t border-line pt-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-7 lg:pr-12">
            <p className="text-[15px] font-medium text-ink-secondary">Collected</p>
            <p className="figure mt-4">{formatCurrency(totalRevenuePaid, currency, symbol)}</p>
            <p className="mt-4 text-[15px] text-ink-secondary">
              {invoices.filter((i) => i.status === 'paid').length} invoices fully settled
            </p>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-line lg:pl-12">
            <p className="text-[15px] font-medium text-ink-secondary">Outstanding</p>
            <p className="figure mt-4">{formatCurrency(outstandingBalanceTotal, currency, symbol)}</p>
            <p className="mt-4 text-[15px] text-ink-secondary">
              {outstandingInvoices.length} open {outstandingInvoices.length === 1 ? 'account' : 'accounts'}
              {overdueInvoices.length > 0 && (
                <span className="text-[#8E3B32]"> · {overdueInvoices.length} overdue</span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[14px] text-ink-secondary">
            <span>
              Collected <span className="num text-ink">{paidRatio.toFixed(0)}%</span>
            </span>
            <span>
              Outstanding <span className="num text-ink">{outstandingRatio.toFixed(0)}%</span>
            </span>
          </div>
          <div className="flex h-[3px] w-full bg-line">
            <div style={{ width: `${paidRatio}%` }} className="bg-ink" />
            <div style={{ width: `${outstandingRatio}%` }} className="bg-teal-600" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 border-y border-line sm:grid-cols-3">
        <div className="py-6 sm:pr-8 sm:border-r sm:border-line">
          <p className="text-[14px] text-ink-secondary">Invoiced</p>
          <p className="figure-sm mt-3">{formatCurrency(totalInvoicesValue, currency, symbol)}</p>
          <p className="meta mt-2">{totalInvoicesCount} invoices</p>
        </div>
        <div className="border-t border-line py-6 sm:border-t-0 sm:px-8 sm:border-r sm:border-line">
          <p className="text-[14px] text-ink-secondary">Quoted</p>
          <p className="figure-sm mt-3">{formatCurrency(totalQuotationsValue, currency, symbol)}</p>
          <p className="meta mt-2">{totalQuotationsCount} quotations</p>
        </div>
        <div className="border-t border-line py-6 sm:border-t-0 sm:pl-8">
          <p className="text-[14px] text-ink-secondary">Pending quotations</p>
          <p className="figure-sm mt-3">{formatCurrency(pendingQuotationsValue, currency, symbol)}</p>
          <p className="meta mt-2">{pendingQuotationsCount} awaiting a decision</p>
        </div>
      </section>

      {!hasAnyDocuments ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="No documents yet"
          description="Create a quotation or invoice to start tracking what you have billed and what is still outstanding."
          actionLabel="Create quotation"
          onAction={() => setActiveView('quotation-new')}
          secondaryActionLabel="Create invoice"
          onSecondaryAction={() => setActiveView('invoice-new')}
        />
      ) : (
        <section>
          <div className="mb-2 flex items-end justify-between gap-4">
            <h2 className="section-title">Recent invoices</h2>
            <button
              onClick={() => setActiveView('invoices')}
              className="text-[15px] text-ink-secondary hover:text-ink"
            >
              All invoices
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Issued</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th className="text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} onClick={() => openDocumentPreview('invoice', inv)} className="cursor-pointer">
                    <td className="num font-medium">{inv.invoiceNumber}</td>
                    <td>{inv.clientSnapshot.name}</td>
                    <td className="text-ink-secondary">{formatDate(inv.issueDate)}</td>
                    <td className="money text-right font-medium">
                      {formatCurrency(inv.grandTotal, inv.currency, inv.currencySymbol)}
                    </td>
                    <td>
                      <Badge status={inv.status} type="invoice" />
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => openPaymentModal(inv)}
                          className="text-[14px] text-ink-secondary hover:text-ink"
                        >
                          Record payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {recentQuotations.length > 0 && (
        <section>
          <div className="mb-2 flex items-end justify-between gap-4">
            <h2 className="section-title">Recent quotations</h2>
            <button
              onClick={() => setActiveView('quotations')}
              className="text-[15px] text-ink-secondary hover:text-ink"
            >
              All quotations
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Quotation</th>
                  <th>Client</th>
                  <th>Issued</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th className="text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map((quo) => (
                  <tr key={quo.id} onClick={() => openDocumentPreview('quote', quo)} className="cursor-pointer">
                    <td className="num font-medium">{quo.quotationNumber}</td>
                    <td>{quo.clientSnapshot.name}</td>
                    <td className="text-ink-secondary">{formatDate(quo.issueDate)}</td>
                    <td className="money text-right font-medium">
                      {formatCurrency(quo.grandTotal, quo.currency, quo.currencySymbol)}
                    </td>
                    <td>
                      <Badge status={quo.status} type="quote" />
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      {quo.status !== 'declined' && !quo.convertedInvoiceId && (
                        <button
                          onClick={() => convertQuotationToInvoice(quo.id)}
                          className="text-[14px] text-ink-secondary hover:text-ink"
                        >
                          Convert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {recentClients.length > 0 && (
        <section>
          <div className="mb-2 flex items-end justify-between gap-4">
            <h2 className="section-title">Clients</h2>
            <button
              onClick={() => setActiveView('clients')}
              className="text-[15px] text-ink-secondary hover:text-ink"
            >
              All clients
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th className="text-right">Collected</th>
                  <th className="text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client) => {
                  const clientInvoices = invoices.filter((i) => i.clientId === client.id);
                  const clientPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
                  const clientDue = clientInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
                  return (
                    <tr
                      key={client.id}
                      onClick={() => setActiveView('client-detail', client.id)}
                      className="cursor-pointer"
                    >
                      <td className="font-medium">{client.name}</td>
                      <td className="text-ink-secondary">{client.companyName || '—'}</td>
                      <td className="money text-right">{formatCurrency(clientPaid, currency, symbol)}</td>
                      <td className={`money text-right ${clientDue > 0 ? 'text-[#8E3B32]' : 'text-ink-secondary'}`}>
                        {clientDue > 0 ? formatCurrency(clientDue, currency, symbol) : 'Clear'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
