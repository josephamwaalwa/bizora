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
  const secondaryDateLabel = isInvoice ? 'Payment Due' : 'Valid Until';
  const secondaryDate = isInvoice ? invoice?.dueDate : quote?.expiryDate;

  return (
    <div className="print-document-container bg-white text-slate-900 mx-auto w-full max-w-[210mm] min-h-[297mm] p-10 sm:p-14 shadow-paper print:shadow-none print:p-0 print:m-0 print:max-w-none print:min-h-0 text-[13px] leading-normal font-sans">
      {/* 1. LETTERHEAD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8 pb-8 border-b border-slate-300">
        {/* Company Identity */}
        <div className="space-y-2 max-w-sm">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-12 max-w-[180px] object-contain object-left mb-2"
            />
          ) : (
            <div className="mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans uppercase">
                {business.name}
              </h1>
            </div>
          )}

          {business.tagline && (
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              {business.tagline}
            </p>
          )}

          <div className="text-xs text-slate-600 space-y-0.5 pt-1">
            {business.address && <p>{business.address}</p>}
            <p>{[business.city, business.country, business.postalCode].filter(Boolean).join(', ')}</p>
            <p className="pt-0.5">
              {business.email && <span>{business.email}</span>}
              {business.email && business.phone && <span> • </span>}
              {business.phone && <span>{business.phone}</span>}
            </p>
            {business.website && <p className="text-slate-500">{business.website}</p>}
            
            {(business.taxNumber || business.registrationNumber) && (
              <div className="pt-1.5 flex flex-wrap gap-x-4 text-[11px] text-slate-500 font-mono">
                {business.taxNumber && <span>Tax/VAT: {business.taxNumber}</span>}
                {business.registrationNumber && <span>Reg: {business.registrationNumber}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Document Classification & Metadata */}
        <div className="text-left sm:text-right space-y-3">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
              {docTitle}
            </h2>
            <p className="font-mono text-base font-semibold text-slate-700 mt-1">
              {docNumber}
            </p>
          </div>

          <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200">
            <div className="flex sm:justify-end gap-3">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold">Issue Date:</span>
              <span className="font-medium text-slate-800 font-mono">{formatDate(issueDate)}</span>
            </div>
            <div className="flex sm:justify-end gap-3">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold">{secondaryDateLabel}:</span>
              <span className="font-medium text-slate-800 font-mono">{formatDate(secondaryDate)}</span>
            </div>
            {isInvoice && invoice?.quotationId && (
              <div className="flex sm:justify-end gap-3 text-slate-500">
                <span className="uppercase text-[10px] tracking-wider font-semibold">Quote Ref:</span>
                <span className="font-mono">{invoice.quotationId}</span>
              </div>
            )}
            <div className="flex sm:justify-end items-center gap-2 pt-1">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold">Status:</span>
              <span className="font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 border border-slate-300 rounded text-slate-700 bg-slate-50">
                {document.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECIPIENT INFORMATION (BILL TO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-300">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
            Bill To
          </span>
          <div className="text-xs space-y-0.5">
            <h4 className="font-bold text-slate-900 text-sm">{client.companyName || client.name}</h4>
            {client.companyName && client.name && (
              <p className="text-slate-600 font-medium">Attn: {client.name}</p>
            )}
            {client.address && <p className="text-slate-600 pt-0.5">{client.address}</p>}
            <p className="text-slate-600">{[client.city, client.country].filter(Boolean).join(', ')}</p>
            <p className="text-slate-600 pt-0.5">
              {client.email && <span>{client.email}</span>}
              {client.email && client.phone && <span> • </span>}
              {client.phone && <span>{client.phone}</span>}
            </p>
            {client.vatNumber && (
              <p className="text-[11px] font-mono text-slate-500 pt-0.5">VAT No: {client.vatNumber}</p>
            )}
          </div>
        </div>

        <div className="sm:text-right flex flex-col sm:items-end justify-start">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
            Terms & Specifications
          </span>
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              Currency: <strong className="text-slate-800 font-mono">{document.currency} ({document.currencySymbol})</strong>
            </p>
            {isInvoice ? (
              <p>Due Date: <strong className="text-slate-800 font-mono">{formatDate(invoice?.dueDate)}</strong></p>
            ) : (
              <p>Validity: <strong className="text-slate-800">30 Calendar Days</strong></p>
            )}
          </div>
        </div>
      </div>

      {/* 3. ITEMISED TABLE */}
      <div className="py-6">
        <table className="stationery-table w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-t-2 border-b-2 border-slate-900 text-slate-700 text-[10px] uppercase tracking-wider font-bold">
              <th className="py-2.5 px-1 text-left w-10">#</th>
              <th className="py-2.5 px-3 text-left">Description</th>
              <th className="py-2.5 px-3 text-right w-16">Qty</th>
              <th className="py-2.5 px-3 text-right w-28">Unit Price ({document.currencySymbol})</th>
              <th className="py-2.5 px-2 text-right w-32">Total ({document.currencySymbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {document.items.map((item, index) => (
              <tr key={item.id} className="align-top">
                <td className="py-3 px-1 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                <td className="py-3 px-3 text-slate-900 font-normal whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </td>
                <td className="py-3 px-3 text-right text-slate-700 font-mono text-xs">{item.quantity}</td>
                <td className="py-3 px-3 text-right text-slate-700 font-mono text-xs">
                  {formatCurrency(item.unitPrice, document.currency, document.currencySymbol).replace(document.currencySymbol, '').trim()}
                </td>
                <td className="py-3 px-2 text-right font-semibold text-slate-900 font-mono text-xs">
                  {formatCurrency(item.total, document.currency, document.currencySymbol).replace(document.currencySymbol, '').trim()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. FINANCIAL SUMMARY & TOTALS */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-4 pb-8 border-t border-slate-300 page-break-inside-avoid">
        {/* Left side: Notes */}
        <div className="w-full sm:max-w-md space-y-4">
          {document.notes && (
            <div className="text-xs text-slate-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Notes
              </span>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{document.notes}</p>
            </div>
          )}

          {/* Banking Information (Clean tabular layout, no bubble cards) */}
          {business.bankDetails && business.bankDetails.accountNumber && (
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Payment & Banking Details
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 font-sans">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Bank:</span>
                  <span className="font-medium text-slate-800">{business.bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Account Name:</span>
                  <span className="font-medium text-slate-800">{business.bankDetails.accountName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Account Number:</span>
                  <span className="font-mono font-semibold text-slate-900">{business.bankDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Branch Code:</span>
                  <span className="font-mono text-slate-800">{business.bankDetails.branchCode}</span>
                </div>
                {business.bankDetails.swiftCode && (
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">SWIFT / BIC:</span>
                    <span className="font-mono text-slate-800">{business.bankDetails.swiftCode}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{docNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Calculation Breakdown */}
        <div className="w-full sm:w-72 space-y-2 text-xs">
          <div className="flex justify-between py-1 text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-slate-800">
              {formatCurrency(document.subtotal, document.currency, document.currencySymbol)}
            </span>
          </div>

          {document.discountAmount > 0 && (
            <div className="flex justify-between py-1 text-slate-700">
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

          {/* Grand Total */}
          <div className="flex justify-between py-2 border-t border-b-2 border-slate-900 text-sm font-bold text-slate-900">
            <span className="uppercase tracking-wider">Total</span>
            <span className="font-mono text-base font-extrabold">
              {formatCurrency(document.grandTotal, document.currency, document.currencySymbol)}
            </span>
          </div>

          {/* Invoice-Specific Payment Reconciliation */}
          {isInvoice && (
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between py-0.5 text-slate-600">
                <span>Amount Paid</span>
                <span className="font-mono font-medium text-slate-800">
                  {formatCurrency(invoice?.amountPaid || 0, document.currency, document.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-t border-slate-300 font-bold text-slate-900">
                <span className="uppercase tracking-wider text-xs">Balance Due</span>
                <span className="font-mono text-base font-extrabold text-slate-900">
                  {formatCurrency(invoice?.outstandingBalance || 0, document.currency, document.currencySymbol)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. TERMS & CONDITIONS */}
      {document.terms && (
        <div className="pt-4 pb-6 border-t border-slate-200 text-[11px] text-slate-500 page-break-inside-avoid">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
            Terms & Conditions
          </span>
          <p className="whitespace-pre-wrap leading-relaxed">{document.terms}</p>
        </div>
      )}

      {/* 6. FORMAL SIGN-OFF LINES */}
      <div className="grid grid-cols-2 gap-12 pt-8 mt-4 border-t border-slate-200 text-xs page-break-inside-avoid">
        <div>
          <div className="h-10 border-b border-slate-400 w-48 mb-1.5" />
          <p className="font-semibold text-slate-800">Authorized Signature</p>
          <p className="text-[11px] text-slate-500">{business.name}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="h-10 border-b border-slate-400 w-48 mb-1.5" />
          <p className="font-semibold text-slate-800">Client Acceptance Signature</p>
          <p className="text-[11px] text-slate-500">{client.name}</p>
        </div>
      </div>

      {/* 7. STATIONERY FOOTER */}
      <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans tracking-wide">
        <p>Bizora Corporate Document • {business.name} • {business.email || business.website}</p>
      </div>
    </div>
  );
};
