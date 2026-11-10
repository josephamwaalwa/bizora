import type { BusinessProfile, Client, Quotation, Invoice, ActivityLog, PaymentRecord } from '../types';
import {
  initialBusinessProfile,
  initialClients,
  initialQuotations,
  initialInvoices,
  initialActivities,
} from './seedData';
import { calculateInvoiceBalances, determineUpdatedInvoiceStatus } from '../utils/calculations';
import { generateId } from '../utils/idGenerator';

const KEYS = {
  PROFILE: 'bizora_business_profile_v1',
  CLIENTS: 'bizora_clients_v1',
  QUOTATIONS: 'bizora_quotations_v1',
  INVOICES: 'bizora_invoices_v1',
  ACTIVITIES: 'bizora_activities_v1',
  INITIALIZED: 'bizora_has_initialized_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  /**
   * Initializes local storage with rich sample data on first run
   */
  init(): void {
    const hasInitialized = localStorage.getItem(KEYS.INITIALIZED);
    if (!hasInitialized) {
      this.resetToDemoData();
    }
  },

  resetToDemoData(): void {
    safeSet(KEYS.PROFILE, initialBusinessProfile);
    safeSet(KEYS.CLIENTS, initialClients);
    safeSet(KEYS.QUOTATIONS, initialQuotations);
    safeSet(KEYS.INVOICES, initialInvoices);
    safeSet(KEYS.ACTIVITIES, initialActivities);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  },

  clearAllData(): void {
    const emptyProfile: BusinessProfile = {
      ...initialBusinessProfile,
      name: 'My Business',
      tagline: 'Professional Services',
      logoUrl: '',
      email: '',
      phone: '',
      address: '',
      city: 'Windhoek',
      country: 'Namibia',
      website: '',
      taxNumber: '',
      registrationNumber: '',
      nextQuoteNumber: 1,
      nextInvoiceNumber: 1,
      bankDetails: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        branchCode: '',
      },
      updatedAt: new Date().toISOString(),
    };
    safeSet(KEYS.PROFILE, emptyProfile);
    safeSet(KEYS.CLIENTS, []);
    safeSet(KEYS.QUOTATIONS, []);
    safeSet(KEYS.INVOICES, []);
    safeSet(KEYS.ACTIVITIES, [
      {
        id: generateId('act'),
        type: 'settings_updated',
        title: 'Workspace Initialized',
        description: 'Clean slate started.',
        timestamp: new Date().toISOString(),
      },
    ]);
  },

  // Business Profile
  getBusinessProfile(): BusinessProfile {
    return safeGet<BusinessProfile>(KEYS.PROFILE, initialBusinessProfile);
  },

  saveBusinessProfile(profile: BusinessProfile): BusinessProfile {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    safeSet(KEYS.PROFILE, updated);
    this.addActivity({
      type: 'settings_updated',
      title: 'Business Profile Updated',
      description: `Settings updated for ${profile.name}`,
    });
    return updated;
  },

  incrementQuoteNumber(): number {
    const profile = this.getBusinessProfile();
    const current = profile.nextQuoteNumber || 1;
    profile.nextQuoteNumber = current + 1;
    safeSet(KEYS.PROFILE, profile);
    return current;
  },

  incrementInvoiceNumber(): number {
    const profile = this.getBusinessProfile();
    const current = profile.nextInvoiceNumber || 1;
    profile.nextInvoiceNumber = current + 1;
    safeSet(KEYS.PROFILE, profile);
    return current;
  },

  // Clients
  getClients(): Client[] {
    return safeGet<Client[]>(KEYS.CLIENTS, []);
  },

  getClientById(id: string): Client | undefined {
    return this.getClients().find((c) => c.id === id);
  },

  saveClient(client: Partial<Client> & { name: string; email: string }): Client {
    const clients = this.getClients();
    const now = new Date().toISOString();
    let saved: Client;

    if (client.id) {
      const idx = clients.findIndex((c) => c.id === client.id);
      if (idx !== -1) {
        saved = { ...clients[idx], ...client, updatedAt: now } as Client;
        clients[idx] = saved;
      } else {
        saved = {
          ...client,
          id: client.id,
          phone: client.phone || '',
          address: client.address || '',
          createdAt: now,
          updatedAt: now,
        } as Client;
        clients.unshift(saved);
      }
    } else {
      saved = {
        ...client,
        id: generateId('cli'),
        phone: client.phone || '',
        address: client.address || '',
        createdAt: now,
        updatedAt: now,
      } as Client;
      clients.unshift(saved);
      this.addActivity({
        type: 'client_created',
        title: `Client Added: ${saved.name}`,
        description: saved.companyName ? `Company: ${saved.companyName}` : `Email: ${saved.email}`,
        referenceId: saved.id,
      });
    }

    safeSet(KEYS.CLIENTS, clients);
    return saved;
  },

  deleteClient(id: string): boolean {
    const clients = this.getClients();
    const filtered = clients.filter((c) => c.id !== id);
    if (filtered.length !== clients.length) {
      safeSet(KEYS.CLIENTS, filtered);
      return true;
    }
    return false;
  },

  // Quotations
  getQuotations(): Quotation[] {
    return safeGet<Quotation[]>(KEYS.QUOTATIONS, []);
  },

  getQuotationById(id: string): Quotation | undefined {
    return this.getQuotations().find((q) => q.id === id);
  },

  saveQuotation(quote: Quotation): Quotation {
    const quotations = this.getQuotations();
    const idx = quotations.findIndex((q) => q.id === quote.id);
    const now = new Date().toISOString();
    const itemToSave = { ...quote, updatedAt: now };

    if (idx !== -1) {
      quotations[idx] = itemToSave;
    } else {
      quotations.unshift(itemToSave);
      this.addActivity({
        type: 'quote_created',
        title: `Quotation ${quote.quotationNumber} Created`,
        description: `For ${quote.clientSnapshot.name || 'Client'} (${quote.currencySymbol} ${quote.grandTotal.toLocaleString()})`,
        referenceId: quote.id,
      });
    }

    safeSet(KEYS.QUOTATIONS, quotations);
    return itemToSave;
  },

  deleteQuotation(id: string): boolean {
    const quotes = this.getQuotations();
    const filtered = quotes.filter((q) => q.id !== id);
    if (filtered.length !== quotes.length) {
      safeSet(KEYS.QUOTATIONS, filtered);
      return true;
    }
    return false;
  },

  // Invoices
  getInvoices(): Invoice[] {
    return safeGet<Invoice[]>(KEYS.INVOICES, []);
  },

  getInvoiceById(id: string): Invoice | undefined {
    return this.getInvoices().find((inv) => inv.id === id);
  },

  saveInvoice(invoice: Invoice): Invoice {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex((i) => i.id === invoice.id);
    const now = new Date().toISOString();

    // Recalculate balances and auto status
    const { amountPaid, outstandingBalance } = calculateInvoiceBalances(invoice.grandTotal, invoice.payments || []);
    const updatedStatus = determineUpdatedInvoiceStatus(invoice.status, invoice.grandTotal, amountPaid, invoice.dueDate);

    const itemToSave: Invoice = {
      ...invoice,
      amountPaid,
      outstandingBalance,
      status: updatedStatus,
      updatedAt: now,
    };

    if (idx !== -1) {
      invoices[idx] = itemToSave;
    } else {
      invoices.unshift(itemToSave);
      this.addActivity({
        type: 'invoice_created',
        title: `Invoice ${invoice.invoiceNumber} Created`,
        description: `For ${invoice.clientSnapshot.name || 'Client'} (${invoice.currencySymbol} ${invoice.grandTotal.toLocaleString()})`,
        referenceId: invoice.id,
      });
    }

    safeSet(KEYS.INVOICES, invoices);
    return itemToSave;
  },

  deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices();
    const filtered = invoices.filter((i) => i.id !== id);
    if (filtered.length !== invoices.length) {
      safeSet(KEYS.INVOICES, filtered);
      return true;
    }
    return false;
  },

  recordPayment(invoiceId: string, paymentData: Omit<PaymentRecord, 'id' | 'invoiceId' | 'recordedAt'>): Invoice | undefined {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) return undefined;

    const newPayment: PaymentRecord = {
      id: generateId('pay'),
      invoiceId,
      amount: Number(paymentData.amount) || 0,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference,
      notes: paymentData.notes,
      recordedAt: new Date().toISOString(),
    };

    const updatedPayments = [...(invoice.payments || []), newPayment];
    const { amountPaid, outstandingBalance } = calculateInvoiceBalances(invoice.grandTotal, updatedPayments);
    const updatedStatus = determineUpdatedInvoiceStatus(invoice.status, invoice.grandTotal, amountPaid, invoice.dueDate);

    const updatedInvoice: Invoice = {
      ...invoice,
      payments: updatedPayments,
      amountPaid,
      outstandingBalance,
      status: updatedStatus,
      updatedAt: new Date().toISOString(),
    };

    this.saveInvoice(updatedInvoice);

    this.addActivity({
      type: 'payment_recorded',
      title: `Payment of ${invoice.currencySymbol} ${newPayment.amount.toLocaleString()} Recorded`,
      description: `Applied to ${invoice.invoiceNumber}. Remaining balance: ${invoice.currencySymbol} ${outstandingBalance.toLocaleString()}`,
      referenceId: invoice.id,
    });

    return updatedInvoice;
  },

  // Activity Logs
  getActivities(): ActivityLog[] {
    return safeGet<ActivityLog[]>(KEYS.ACTIVITIES, []);
  },

  addActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const activities = this.getActivities();
    const newLog: ActivityLog = {
      ...activity,
      id: generateId('act'),
      timestamp: new Date().toISOString(),
    };
    activities.unshift(newLog);
    // Keep last 40 logs
    safeSet(KEYS.ACTIVITIES, activities.slice(0, 40));
  },

  exportBackupJson(): string {
    const data = {
      profile: this.getBusinessProfile(),
      clients: this.getClients(),
      quotations: this.getQuotations(),
      invoices: this.getInvoices(),
      activities: this.getActivities(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.profile && Array.isArray(data.clients)) {
        safeSet(KEYS.PROFILE, data.profile);
        safeSet(KEYS.CLIENTS, data.clients || []);
        safeSet(KEYS.QUOTATIONS, data.quotations || []);
        safeSet(KEYS.INVOICES, data.invoices || []);
        safeSet(KEYS.ACTIVITIES, data.activities || []);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  },
};
