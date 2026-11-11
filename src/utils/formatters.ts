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
 * Format relative time (e.g. "2h ago", "Yesterday")
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
      return { label: 'Accepted', badgeClass: 'text-teal-800', dotClass: 'bg-teal-700' };
    case 'sent':
      return { label: 'Sent', badgeClass: 'text-ink', dotClass: 'bg-ink' };
    case 'declined':
      return { label: 'Declined', badgeClass: 'text-[#8E3B32]', dotClass: 'bg-[#8E3B32]' };
    case 'expired':
      return { label: 'Expired', badgeClass: 'text-ink-muted', dotClass: 'bg-ink-muted' };
    case 'draft':
    default:
      return { label: 'Draft', badgeClass: 'text-ink-secondary', dotClass: 'bg-line-strong' };
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
      return { label: 'Paid', badgeClass: 'text-teal-800', dotClass: 'bg-teal-700' };
    case 'partially_paid':
      return { label: 'Partially paid', badgeClass: 'text-[#8A5A12]', dotClass: 'bg-[#8A5A12]' };
    case 'overdue':
      return { label: 'Overdue', badgeClass: 'text-[#8E3B32]', dotClass: 'bg-[#8E3B32]' };
    case 'sent':
      return { label: 'Sent', badgeClass: 'text-ink', dotClass: 'bg-ink' };
    case 'draft':
    default:
      return { label: 'Draft', badgeClass: 'text-ink-secondary', dotClass: 'bg-line-strong' };
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
