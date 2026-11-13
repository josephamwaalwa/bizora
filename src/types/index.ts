export type CurrencyCode = 'NAD' | 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType?: string;
  swiftCode?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  logoSize?: number;
  logoFit?: 'contain' | 'cover';
  logoAlignment?: 'left' | 'center' | 'right';
  logoPadding?: number;
  logoBackgroundTransparent?: boolean;
  logoBackgroundColor?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  website?: string;
  taxNumber?: string; // e.g. VAT / TIN
  registrationNumber?: string; // Company Reg No.
  defaultCurrency: CurrencyCode;
  currencySymbol: string;
  defaultTaxName: string; // e.g. VAT
  defaultTaxRate: number; // e.g. 15 or 0 (configurable)
  isTaxEnabled: boolean;
  quotePrefix: string;
  invoicePrefix: string;
  nextQuoteNumber: number;
  nextInvoiceNumber: number;
  defaultTermsQuotation: string;
  defaultTermsInvoice: string;
  defaultNotes: string;
  bankDetails: BankDetails;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  vatNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientSnapshot: Client;
  businessSnapshot: BusinessProfile;
  issueDate: string;
  expiryDate: string;
  currency: string;
  currencySymbol: string;
  items: LineItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxName: string;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
  convertedInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue';

export type PaymentMethod = 'bank_transfer' | 'cash' | 'credit_card' | 'eft' | 'mobile_money' | 'cheque' | 'other';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  recordedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  clientId: string;
  clientSnapshot: Client;
  businessSnapshot: BusinessProfile;
  issueDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  items: LineItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxName: string;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  outstandingBalance: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  payments: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'quote_created' | 'quote_converted' | 'quote_status' | 'invoice_created' | 'payment_recorded' | 'invoice_status' | 'client_created' | 'settings_updated';
  title: string;
  description: string;
  timestamp: string;
  referenceId?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'quotations'
  | 'quotation-new'
  | 'quotation-edit'
  | 'invoices'
  | 'invoice-new'
  | 'invoice-edit'
  | 'clients'
  | 'client-detail'
  | 'settings';
