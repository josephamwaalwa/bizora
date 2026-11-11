import React from 'react';
import { useApp } from '../../context/AppContext';
import { PrintableDocument } from './PrintableDocument';
import { Button } from '../common/Button';
import {
  Printer,
  Edit2,
  Copy,
  ArrowRight,
  CreditCard,
  X,
  FileCheck,
} from 'lucide-react';
import type { Quotation, Invoice, QuotationStatus, InvoiceStatus } from '../../types';

export const DocumentPreviewModal: React.FC = () => {
  const {
    previewDocument,
    closeDocumentPreview,
    setActiveView,
    duplicateQuotation,
    duplicateInvoice,
    convertQuotationToInvoice,
    updateQuotationStatus,
    updateInvoiceStatus,
    openPaymentModal,
  } = useApp();

  if (!previewDocument) return null;

  const { type, data } = previewDocument;
  const isInvoice = type === 'invoice';
  const invoice = isInvoice ? (data as Invoice) : null;
  const quote = !isInvoice ? (data as Quotation) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    closeDocumentPreview();
    if (isInvoice) {
      setActiveView('invoice-edit', invoice?.id);
    } else {
      setActiveView('quotation-edit', quote?.id);
    }
  };

  const handleDuplicate = () => {
    if (isInvoice && invoice) {
      const dup = duplicateInvoice(invoice.id);
      if (dup) closeDocumentPreview();
    } else if (quote) {
      const dup = duplicateQuotation(quote.id);
      if (dup) closeDocumentPreview();
    }
  };

  const handleConvertToInvoice = () => {
    if (quote) {
      convertQuotationToInvoice(quote.id);
    }
  };

  const handleRecordPayment = () => {
    if (invoice) {
      openPaymentModal(invoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs document-preview-backdrop">
      {/* Top action toolbar (hidden on print) */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 sm:px-8 py-3 text-white no-print shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {isInvoice ? 'Invoice' : 'Quotation'}
          </span>
          <span className="font-mono text-sm font-bold text-white tracking-wide">
            {isInvoice ? invoice?.invoiceNumber : quote?.quotationNumber}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status quick changer */}
          <div className="flex items-center gap-1.5 bg-slate-800 rounded px-2 py-1 border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status:</span>
            {isInvoice ? (
              <select
                value={invoice?.status}
                onChange={(e) => updateInvoiceStatus(invoice!.id, e.target.value as InvoiceStatus)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="draft" className="bg-slate-900 text-white">Draft</option>
                <option value="sent" className="bg-slate-900 text-white">Sent</option>
                <option value="partially_paid" className="bg-slate-900 text-white">Partially Paid</option>
                <option value="paid" className="bg-slate-900 text-white">Paid</option>
                <option value="overdue" className="bg-slate-900 text-white">Overdue</option>
              </select>
            ) : (
              <select
                value={quote?.status}
                onChange={(e) => updateQuotationStatus(quote!.id, e.target.value as QuotationStatus)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="draft" className="bg-slate-900 text-white">Draft</option>
                <option value="sent" className="bg-slate-900 text-white">Sent</option>
                <option value="accepted" className="bg-slate-900 text-white">Accepted</option>
                <option value="declined" className="bg-slate-900 text-white">Declined</option>
                <option value="expired" className="bg-slate-900 text-white">Expired</option>
              </select>
            )}
          </div>

          {/* Quotation: Convert to Invoice */}
          {!isInvoice && quote?.status !== 'declined' && !quote?.convertedInvoiceId && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowRight className="w-3.5 h-3.5 text-teal-600" />}
              onClick={handleConvertToInvoice}
            >
              Convert to Invoice
            </Button>
          )}

          {/* Quotation already converted indicator */}
          {!isInvoice && quote?.convertedInvoiceId && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded">
              <FileCheck className="w-3.5 h-3.5 text-teal-400" />
              Converted
            </span>
          )}

          {/* Invoice: Record Payment */}
          {isInvoice && invoice?.status !== 'paid' && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleRecordPayment}
            >
              Record Payment
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={handleEdit}
          >
            Edit
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy className="w-3.5 h-3.5" />}
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            Print / Save PDF
          </Button>

          <button
            onClick={closeDocumentPreview}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-1"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desk Preview Container */}
      <div className="py-8 sm:py-12 px-3 sm:px-6 flex justify-center bg-slate-200/60 print:bg-white print:p-0">
        <PrintableDocument document={data} type={type} />
      </div>
    </div>
  );
};
