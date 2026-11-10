import type { LineItem, InvoiceStatus, PaymentRecord } from '../types';

export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  const q = Number(quantity) || 0;
  const p = Number(unitPrice) || 0;
  return Math.round((q * p) * 100) / 100;
}

export interface CalculationInput {
  items: LineItem[];
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  isTaxEnabled?: boolean;
  taxRate?: number;
  taxName?: string;
}

export interface FinancialCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export function calculateDocumentFinancials(input: CalculationInput): FinancialCalculationResult {
  const subtotal = (input.items || []).reduce((sum, item) => {
    return sum + (Number(item.total) || 0);
  }, 0);

  const discountType = input.discountType || 'percentage';
  const discountVal = Math.max(0, Number(input.discountValue) || 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * Math.min(100, discountVal)) / 100;
  } else {
    discountAmount = Math.min(subtotal, discountVal);
  }
  discountAmount = Math.round(discountAmount * 100) / 100;

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  let taxAmount = 0;
  if (input.isTaxEnabled && input.taxRate && input.taxRate > 0) {
    taxAmount = (taxableAmount * Number(input.taxRate)) / 100;
    taxAmount = Math.round(taxAmount * 100) / 100;
  }

  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    taxableAmount,
    taxAmount,
    grandTotal,
  };
}

export function calculateInvoiceBalances(grandTotal: number, payments: PaymentRecord[] = []): {
  amountPaid: number;
  outstandingBalance: number;
} {
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const roundedPaid = Math.round(totalPaid * 100) / 100;
  const balance = Math.max(0, Math.round((grandTotal - roundedPaid) * 100) / 100);

  return {
    amountPaid: roundedPaid,
    outstandingBalance: balance,
  };
}

export function determineUpdatedInvoiceStatus(
  currentStatus: InvoiceStatus,
  grandTotal: number,
  amountPaid: number,
  dueDateString?: string
): InvoiceStatus {
  if (currentStatus === 'draft' && amountPaid <= 0) {
    return 'draft';
  }

  if (grandTotal > 0 && amountPaid >= grandTotal - 0.001) {
    return 'paid';
  }

  if (amountPaid > 0 && amountPaid < grandTotal) {
    return 'partially_paid';
  }

  // Check if overdue
  if (dueDateString) {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!isNaN(dueDate.getTime()) && dueDate < today && amountPaid < grandTotal) {
      return 'overdue';
    }
  }

  if (currentStatus === 'overdue' && dueDateString) {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate >= today) {
      return 'sent';
    }
  }

  return currentStatus || 'sent';
}
