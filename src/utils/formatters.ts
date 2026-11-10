import type { QuotationStatus, InvoiceStatus } from '../types';

/**
 * Format currency with Namibian Dollar (NAD) defaults
 * Example: N$ 14,250.00
 */
export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = 'NAD',
  currencySymbol: string = 'N$'
): string {
  const numericAmount = Number(amount) || 0;
  const formattedNumber = new Intl.NumberFormat('en-NA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  // If symbol is provided, use it (e.g. N$ 1,500.00), otherwise use currency code
  const prefix = currencySymbol.trim() || currencyCode;
  return `${prefix} ${formattedNumber}`;
}

/**
 * Format ISO date string into human friendly format
 * Example: 15 Oct 2026
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format relative time (e.g. "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return formatDate(dateString);
}

/**
 * Get display label and color classes for quotation status
 */
export function getQuotationStatusConfig(status: QuotationStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'accepted':
      return {
        label: 'Accepted',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'sent':
      return {
        label: 'Sent',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotClass: 'bg-indigo-500',
      };
    case 'declined':
      return {
        label: 'Declined',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'expired':
      return {
        label: 'Expired',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}

/**
 * Get display label and color classes for invoice status
 */
export function getInvoiceStatusConfig(status: InvoiceStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'partially_paid':
      return {
        label: 'Partially Paid',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'overdue':
      return {
        label: 'Overdue',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'sent':
      return {
        label: 'Sent',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotClass: 'bg-indigo-500',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    bank_transfer: 'Bank Transfer / EFT',
    eft: 'EFT',
    cash: 'Cash',
    credit_card: 'Credit / Debit Card',
    mobile_money: 'Mobile Money / eWallet',
    cheque: 'Cheque',
    other: 'Other',
  };
  return map[method] || method;
}
