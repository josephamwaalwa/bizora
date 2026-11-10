import React from 'react';
import type { Quotation, Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PrintableDocumentProps {
  document: Quotation | Invoice;
  type: 'quote' | 'invoice';
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({ document, type }) => {
  const isInvoice = type === 'invoice';
  const invoice = isInvoice ? (document as Invoice) : null;
  const quote = !isInvoice ? (document as Quotation) : null;

  const business = document.businessSnapshot;
  const client = document.clientSnapshot;
  const docNumber = isInvoice ? invoice?.invoiceNumber : quote?.quotationNumber;
  const docTitle = isInvoice ? 'TAX INVOICE' : 'QUOTATION';
  const issueDate = document.issueDate;
  const secondaryDateLabel = isInvoice ? 'Due Date' : 'Valid Until';
  const secondaryDate = isInvoice ? invoice?.dueDate : quote?.expiryDate;

  return (
    <div className="print-document-container bg-white text-slate-900 mx-auto max-w-4xl p-6 sm:p-10 border border-slate-200/90 rounded-2xl shadow-elevated print:border-none print:shadow-none print:p-0 print:max-w-none print:rounded-none">
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-navy-900">
        <div className="space-y-2">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-14 max-w-[200px] object-contain mb-2"
            />
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-teal-400 font-extrabold text-xl">
                {business.name.charAt(0) || 'B'}
              </div>
              <span className="text-2xl font-bold tracking-tight text-navy-900">{business.name}</span>
            </div>
          )}
          {business.tagline && (
            <p className="text-xs font-medium text-slate-500 max-w-sm">{business.tagline}</p>
          )}

          <div className="text-xs text-slate-600 space-y-0.5 pt-1">
            {business.address && <p>{business.address}</p>}
            <p>
              {[business.city, business.country, business.postalCode].filter(Boolean).join(', ')}
            </p>
            <p>
              {business.email && <span>{business.email}</span>}
              {business.email && business.phone && <span> • </span>}
              {business.phone && <span>{business.phone}</span>}
            </p>
            {business.website && <p className="text-slate-500">{business.website}</p>}
            <div className="pt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
              {business.taxNumber && <span>Tax/VAT No: <strong className="text-slate-700">{business.taxNumber}</strong></span>}
              {business.registrationNumber && <span>Reg No: <strong className="text-slate-700">{business.registrationNumber}</strong></span>}
            </div>
          </div>
        </div>

        {/* Right side doc title and meta */}
        <div className="text-left sm:text-right space-y-1.5">
          <div className="inline-block px-3 py-1 rounded-md bg-navy-900 text-white font-bold tracking-widest text-xs uppercase mb-1">
            {docTitle}
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight font-mono">{docNumber}</h2>

          <div className="pt-2 text-xs space-y-1">
            <div className="flex sm:justify-end gap-2">
              <span className="text-slate-500">Issue Date:</span>
              <span className="font-semibold text-slate-800">{formatDate(issueDate)}</span>
            </div>
            <div className="flex sm:justify-end gap-2">
              <span className="text-slate-500">{secondaryDateLabel}:</span>
              <span className="font-semibold text-slate-800">{formatDate(secondaryDate)}</span>
            </div>
            {isInvoice && invoice?.quotationId && (
              <div className="flex sm:justify-end gap-2 text-slate-500">
                <span>Quotation Ref:</span>
                <span className="font-mono">{invoice.quotationId}</span>
              </div>
            )}
            <div className="flex sm:justify-end gap-2 pt-1">
              <span className="text-slate-500">Status:</span>
              <span className="uppercase text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {document.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Bill To / Client
          </span>
          <div className="text-sm">
            <h4 className="font-bold text-slate-900 text-base">{client.companyName || client.name}</h4>
            {client.companyName && client.name && (
              <p className="text-xs text-slate-600 mt-0.5">Attn: {client.name}</p>
            )}
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              {client.address && <p>{client.address}</p>}
              <p>{[client.city, client.country].filter(Boolean).join(', ')}</p>
              {client.email && <p>{client.email}</p>}
              {client.phone && <p>{client.phone}</p>}
              {client.vatNumber && (
                <p className="text-[11px] text-slate-500 pt-0.5">VAT No: {client.vatNumber}</p>
              )}
            </div>
          </div>
        </div>

        <div className="sm:text-right flex flex-col sm:items-end justify-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Payment Terms & Currency
          </span>
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              Currency: <strong className="text-slate-800">{document.currency} ({document.currencySymbol})</strong>
            </p>
            {isInvoice ? (
              <p>Payment Due: <strong className="text-slate-800">{formatDate(invoice?.dueDate)}</strong></p>
            ) : (
              <p>Quote Valid For: <strong className="text-slate-800">30 Calendar Days</strong></p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 text-slate-700 uppercase tracking-wider font-semibold">
              <th className="py-3 px-2 text-left w-12">#</th>
              <th className="py-3 px-2 text-left">Description</th>
              <th className="py-3 px-2 text-right w-20">Qty</th>
              <th className="py-3 px-2 text-right w-28">Unit Price ({document.currencySymbol})</th>
              <th className="py-3 px-2 text-right w-32">Total ({document.currencySymbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {document.items.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-2 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                <td className="py-3.5 px-2 text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </td>
                <td className="py-3.5 px-2 text-right text-slate-700 font-mono">{item.quantity}</td>
                <td className="py-3.5 px-2 text-right text-slate-700 font-mono">
                  {formatCurrency(item.unitPrice, document.currency, document.currencySymbol).replace(document.currencySymbol, '').trim()}
                </td>
                <td className="py-3.5 px-2 text-right font-semibold text-slate-900 font-mono">
                  {formatCurrency(item.total, document.currency, document.currencySymbol).replace(document.currencySymbol, '').trim()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Totals & Payment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 pb-8 border-t border-slate-200 page-break-inside-avoid">
        {/* Left side: Banking details or payment notes */}
        <div className="sm:col-span-7 space-y-4">
          {business.bankDetails && business.bankDetails.accountNumber && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <span>Banking & Payment Instructions</span>
              </h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Bank:</span>
                  <span className="font-semibold text-slate-800">{business.bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Account Name:</span>
                  <span className="font-semibold text-slate-800">{business.bankDetails.accountName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Account Number:</span>
                  <span className="font-mono font-semibold text-slate-900">{business.bankDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Branch Code:</span>
                  <span className="font-mono text-slate-800">{business.bankDetails.branchCode}</span>
                </div>
                {business.bankDetails.swiftCode && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">SWIFT Code:</span>
                    <span className="font-mono text-slate-800">{business.bankDetails.swiftCode}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px]">Reference:</span>
                  <span className="font-bold text-navy-900 font-mono">{docNumber}</span>
                </div>
              </div>
            </div>
          )}

          {document.notes && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700 block mb-1">Notes:</span>
              <p className="whitespace-pre-wrap leading-relaxed">{document.notes}</p>
            </div>
          )}
        </div>

        {/* Right side: Calculations */}
        <div className="sm:col-span-5 space-y-2 text-xs">
          <div className="flex justify-between py-1 text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-slate-800">
              {formatCurrency(document.subtotal, document.currency, document.currencySymbol)}
            </span>
          </div>

          {document.discountAmount > 0 && (
            <div className="flex justify-between py-1 text-emerald-700">
              <span>
                Discount {document.discountType === 'percentage' ? `(${document.discountValue}%)` : ''}
              </span>
              <span className="font-mono font-medium">
                - {formatCurrency(document.discountAmount, document.currency, document.currencySymbol)}
              </span>
            </div>
          )}

          {document.taxAmount > 0 && (
            <div className="flex justify-between py-1 text-slate-600">
              <span>
                {document.taxName || 'Tax'} ({document.taxRate}%)
              </span>
              <span className="font-mono font-medium text-slate-800">
                {formatCurrency(document.taxAmount, document.currency, document.currencySymbol)}
              </span>
            </div>
          )}

          <div className="flex justify-between py-2.5 border-t-2 border-slate-800 text-sm font-bold text-navy-900">
            <span>Total</span>
            <span className="font-mono text-base">
              {formatCurrency(document.grandTotal, document.currency, document.currencySymbol)}
            </span>
          </div>

          {isInvoice && (
            <>
              <div className="flex justify-between py-1 text-emerald-700 font-medium">
                <span>Amount Paid</span>
                <span className="font-mono">
                  {formatCurrency(invoice?.amountPaid || 0, document.currency, document.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-300 text-sm font-extrabold text-navy-900 bg-slate-50 px-2 rounded-lg">
                <span>Balance Due</span>
                <span className="font-mono text-base text-rose-600">
                  {formatCurrency(invoice?.outstandingBalance || 0, document.currency, document.currencySymbol)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Terms and Sign-off */}
      {document.terms && (
        <div className="pt-4 pb-6 border-t border-slate-200 text-xs text-slate-500 page-break-inside-avoid">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
            Terms & Conditions
          </span>
          <p className="whitespace-pre-wrap leading-relaxed">{document.terms}</p>
        </div>
      )}

      {/* Signature line for formal commercial validity */}
      <div className="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-slate-100 text-xs page-break-inside-avoid">
        <div>
          <div className="h-10 border-b border-slate-300 w-48 mb-1.5" />
          <p className="font-medium text-slate-700">Authorized Signature</p>
          <p className="text-[11px] text-slate-400">{business.name}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="h-10 border-b border-slate-300 w-36 mb-1.5" />
          <p className="font-medium text-slate-700">Date of Acceptance</p>
          <p className="text-[11px] text-slate-400">Client Sign-off</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
        <p>Bizora • {business.name} • {business.email || business.website}</p>
      </div>
    </div>
  );
};
