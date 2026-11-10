import React from 'react';
import { useApp } from '../../context/AppContext';
import { PrintableDocument } from './PrintableDocument';
import { Button } from '../common/Button';
import {
  Printer,
  Edit,
  Copy,
  ArrowRightCircle,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-sm document-preview-backdrop">
      {/* Top action toolbar (hidden on print) */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-navy-800 bg-navy-900/95 px-4 sm:px-8 py-3.5 text-white backdrop-blur-md no-print">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              {isInvoice ? 'Invoice Preview' : 'Quotation Preview'}
            </span>
            <span className="font-mono text-sm font-bold text-white">
              {isInvoice ? invoice?.invoiceNumber : quote?.quotationNumber}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status quick changer */}
          <div className="flex items-center gap-1.5 bg-navy-800 rounded-lg px-2 py-1 border border-navy-700">
            <span className="text-[11px] text-slate-400">Status:</span>
            {isInvoice ? (
              <select
                value={invoice?.status}
                onChange={(e) => updateInvoiceStatus(invoice!.id, e.target.value as InvoiceStatus)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="draft" className="bg-navy-900 text-white">Draft</option>
                <option value="sent" className="bg-navy-900 text-white">Sent</option>
                <option value="partially_paid" className="bg-navy-900 text-white">Partially Paid</option>
                <option value="paid" className="bg-navy-900 text-white">Paid</option>
                <option value="overdue" className="bg-navy-900 text-white">Overdue</option>
              </select>
            ) : (
              <select
                value={quote?.status}
                onChange={(e) => updateQuotationStatus(quote!.id, e.target.value as QuotationStatus)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="draft" className="bg-navy-900 text-white">Draft</option>
                <option value="sent" className="bg-navy-900 text-white">Sent</option>
                <option value="accepted" className="bg-navy-900 text-white">Accepted</option>
                <option value="declined" className="bg-navy-900 text-white">Declined</option>
                <option value="expired" className="bg-navy-900 text-white">Expired</option>
              </select>
            )}
          </div>

          {/* Quotation: Convert to Invoice */}
          {!isInvoice && quote?.status !== 'declined' && !quote?.convertedInvoiceId && (
            <Button
              variant="indigo"
              size="sm"
              leftIcon={<ArrowRightCircle className="w-4 h-4" />}
              onClick={handleConvertToInvoice}
            >
              Convert to Invoice
            </Button>
          )}

          {/* Quotation already converted badge */}
          {!isInvoice && quote?.convertedInvoiceId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-lg">
              <FileCheck className="w-3.5 h-3.5" />
              Converted
            </span>
          )}

          {/* Invoice: Record Payment */}
          {isInvoice && invoice?.status !== 'paid' && (
            <Button
              variant="success"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={handleRecordPayment}
            >
              Record Payment
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Edit className="w-3.5 h-3.5" />}
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
            className="bg-teal-600 hover:bg-teal-500 text-white"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print / Save PDF
          </Button>

          <button
            onClick={closeDocumentPreview}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white transition-colors"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document Canvas Container */}
      <div className="py-6 sm:py-10 px-2 sm:px-6">
        <PrintableDocument document={data} type={type} />
      </div>
    </div>
  );
};
