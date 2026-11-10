import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type {
  BusinessProfile,
  Client,
  Quotation,
  Invoice,
  ActivityLog,
  ActiveView,
  Toast,
  QuotationStatus,
  InvoiceStatus,
  PaymentRecord,
} from '../types';
import { StorageService } from '../services/storage';
import { generateId, formatDocNumber } from '../utils/idGenerator';
import { calculateDocumentFinancials } from '../utils/calculations';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface AppContextType {
  // Navigation
  activeView: ActiveView;
  activeEntityId: string | null;
  setActiveView: (view: ActiveView, entityId?: string | null) => void;

  // Data
  businessProfile: BusinessProfile;
  clients: Client[];
  quotations: Quotation[];
  invoices: Invoice[];
  activities: ActivityLog[];

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Business Actions
  updateBusinessProfile: (profile: BusinessProfile) => void;

  // Client Actions
  saveClient: (client: Partial<Client> & { name: string; email: string }) => Client;
  deleteClient: (id: string) => void;

  // Quotation Actions
  saveQuotation: (quote: Quotation) => Quotation;
  deleteQuotation: (id: string) => void;
  duplicateQuotation: (id: string) => Quotation | undefined;
  convertQuotationToInvoice: (quotationId: string) => Invoice | undefined;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;

  // Invoice Actions
  saveInvoice: (invoice: Invoice) => Invoice;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => Invoice | undefined;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  recordPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'invoiceId' | 'recordedAt'>) => void;

  // Document Preview Modal
  previewDocument: { type: 'quote' | 'invoice'; data: Quotation | Invoice } | null;
  openDocumentPreview: (type: 'quote' | 'invoice', data: Quotation | Invoice) => void;
  closeDocumentPreview: () => void;

  // Payment Recording Modal
  paymentModalInvoice: Invoice | null;
  openPaymentModal: (invoice: Invoice) => void;
  closePaymentModal: () => void;

  // Confirm Dialog
  confirmDialog: ConfirmDialogState;
  showConfirmDialog: (params: Omit<ConfirmDialogState, 'isOpen'>) => void;
  hideConfirmDialog: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // System
  resetToDemoData: () => void;
  clearAllData: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveViewInternal] = useState<ActiveView>('dashboard');
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain states
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    StorageService.init();
    return StorageService.getBusinessProfile();
  });
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [activities, setActivities] = useState<ActivityLog[]>(() => StorageService.getActivities());

  // Modals & Feedback
  const [previewDocument, setPreviewDocument] = useState<{ type: 'quote' | 'invoice'; data: Quotation | Invoice } | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const refreshData = useCallback(() => {
    setBusinessProfile(StorageService.getBusinessProfile());
    setClients(StorageService.getClients());
    setQuotations(StorageService.getQuotations());
    setInvoices(StorageService.getInvoices());
    setActivities(StorageService.getActivities());
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId('toast');
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirmDialog = useCallback((params: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({ ...params, isOpen: true });
  }, []);

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setActiveView = useCallback((view: ActiveView, entityId: string | null = null) => {
    setActiveViewInternal(view);
    setActiveEntityId(entityId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Business Profile
  const updateBusinessProfile = useCallback((profile: BusinessProfile) => {
    const saved = StorageService.saveBusinessProfile(profile);
    setBusinessProfile(saved);
    refreshData();
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Business profile and preferences updated successfully.',
    });
  }, [refreshData, addToast]);

  // Clients
  const saveClient = useCallback((clientData: Partial<Client> & { name: string; email: string }) => {
    const saved = StorageService.saveClient(clientData);
    refreshData();
    addToast({
      type: 'success',
      title: clientData.id ? 'Client Updated' : 'Client Added',
      message: `${saved.name} has been saved.`,
    });
    return saved;
  }, [refreshData, addToast]);

  const deleteClient = useCallback((id: string) => {
    const client = clients.find((c) => c.id === id);
    const success = StorageService.deleteClient(id);
    if (success) {
      refreshData();
      addToast({
        type: 'info',
        title: 'Client Removed',
        message: `${client?.name || 'Client'} was removed.`,
      });
      if (activeView === 'client-detail' && activeEntityId === id) {
        setActiveView('clients');
      }
    }
  }, [clients, refreshData, addToast, activeView, activeEntityId, setActiveView]);

  // Quotations
  const saveQuotation = useCallback((quote: Quotation) => {
    const saved = StorageService.saveQuotation(quote);
    refreshData();
    addToast({
      type: 'success',
      title: 'Quotation Saved',
      message: `${saved.quotationNumber} has been saved successfully.`,
    });
    return saved;
  }, [refreshData, addToast]);

  const deleteQuotation = useCallback((id: string) => {
    const quote = quotations.find((q) => q.id === id);
    const success = StorageService.deleteQuotation(id);
    if (success) {
      refreshData();
      addToast({
        type: 'info',
        title: 'Quotation Deleted',
        message: `Quotation ${quote?.quotationNumber || id} was deleted.`,
      });
      if (previewDocument?.data.id === id) {
        setPreviewDocument(null);
      }
      if (activeView === 'quotation-edit' && activeEntityId === id) {
        setActiveView('quotations');
      }
    }
  }, [quotations, refreshData, addToast, previewDocument, activeView, activeEntityId, setActiveView]);

  const duplicateQuotation = useCallback((id: string) => {
    const original = quotations.find((q) => q.id === id);
    if (!original) return undefined;

    const nextNum = StorageService.incrementQuoteNumber();
    const newNumber = formatDocNumber(businessProfile.quotePrefix || 'QUO-', nextNum);

    const duplicated: Quotation = {
      ...original,
      id: generateId('quo'),
      quotationNumber: newNumber,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      convertedInvoiceId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveQuotation(duplicated);
    refreshData();
    addToast({
      type: 'success',
      title: 'Quotation Duplicated',
      message: `Created duplicate ${newNumber} from ${original.quotationNumber}.`,
    });
    return duplicated;
  }, [quotations, businessProfile, refreshData, addToast]);

  const updateQuotationStatus = useCallback((id: string, status: QuotationStatus) => {
    const quote = quotations.find((q) => q.id === id);
    if (!quote) return;

    const updated = { ...quote, status };
    StorageService.saveQuotation(updated);
    refreshData();
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `${quote.quotationNumber} status changed to ${status}.`,
    });

    if (previewDocument && previewDocument.data.id === id) {
      setPreviewDocument({ type: 'quote', data: updated });
    }
  }, [quotations, refreshData, addToast, previewDocument]);

  const convertQuotationToInvoice = useCallback((quotationId: string) => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) return undefined;

    const nextNum = StorageService.incrementInvoiceNumber();
    const newInvoiceNumber = formatDocNumber(businessProfile.invoicePrefix || 'INV-', nextNum);

    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const financials = calculateDocumentFinancials({
      items: quote.items,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      isTaxEnabled: quote.taxRate > 0,
      taxRate: quote.taxRate,
      taxName: quote.taxName,
    });

    const newInvoice: Invoice = {
      id: generateId('inv'),
      invoiceNumber: newInvoiceNumber,
      quotationId: quote.id,
      clientId: quote.clientId,
      clientSnapshot: quote.clientSnapshot,
      businessSnapshot: quote.businessSnapshot || businessProfile,
      issueDate,
      dueDate,
      currency: quote.currency,
      currencySymbol: quote.currencySymbol,
      items: [...quote.items],
      subtotal: financials.subtotal,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      discountAmount: financials.discountAmount,
      taxName: quote.taxName,
      taxRate: quote.taxRate,
      taxAmount: financials.taxAmount,
      grandTotal: financials.grandTotal,
      amountPaid: 0,
      outstandingBalance: financials.grandTotal,
      status: 'sent',
      notes: quote.notes,
      terms: businessProfile.defaultTermsInvoice,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mark quotation as accepted
    const updatedQuote: Quotation = {
      ...quote,
      status: 'accepted',
      convertedInvoiceId: newInvoice.id,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveQuotation(updatedQuote);
    StorageService.saveInvoice(newInvoice);

    StorageService.addActivity({
      type: 'quote_converted',
      title: `Quotation ${quote.quotationNumber} Converted`,
      description: `Created Invoice ${newInvoiceNumber} for ${quote.clientSnapshot.name}`,
      referenceId: newInvoice.id,
    });

    refreshData();
    addToast({
      type: 'success',
      title: 'Converted to Invoice',
      message: `${quote.quotationNumber} was successfully converted into ${newInvoiceNumber}.`,
    });

    // Open newly converted invoice preview
    setPreviewDocument({ type: 'invoice', data: newInvoice });
    return newInvoice;
  }, [quotations, businessProfile, refreshData, addToast]);

  // Invoices
  const saveInvoice = useCallback((invoice: Invoice) => {
    const saved = StorageService.saveInvoice(invoice);
    refreshData();
    addToast({
      type: 'success',
      title: 'Invoice Saved',
      message: `${saved.invoiceNumber} has been saved successfully.`,
    });
    return saved;
  }, [refreshData, addToast]);

  const deleteInvoice = useCallback((id: string) => {
    const invoice = invoices.find((i) => i.id === id);
    const success = StorageService.deleteInvoice(id);
    if (success) {
      refreshData();
      addToast({
        type: 'info',
        title: 'Invoice Deleted',
        message: `Invoice ${invoice?.invoiceNumber || id} was deleted.`,
      });
      if (previewDocument?.data.id === id) {
        setPreviewDocument(null);
      }
      if (activeView === 'invoice-edit' && activeEntityId === id) {
        setActiveView('invoices');
      }
    }
  }, [invoices, refreshData, addToast, previewDocument, activeView, activeEntityId, setActiveView]);

  const duplicateInvoice = useCallback((id: string) => {
    const original = invoices.find((i) => i.id === id);
    if (!original) return undefined;

    const nextNum = StorageService.incrementInvoiceNumber();
    const newNumber = formatDocNumber(businessProfile.invoicePrefix || 'INV-', nextNum);

    const duplicated: Invoice = {
      ...original,
      id: generateId('inv'),
      invoiceNumber: newNumber,
      status: 'draft',
      payments: [],
      amountPaid: 0,
      outstandingBalance: original.grandTotal,
      quotationId: undefined,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveInvoice(duplicated);
    refreshData();
    addToast({
      type: 'success',
      title: 'Invoice Duplicated',
      message: `Created duplicate ${newNumber} from ${original.invoiceNumber}.`,
    });
    return duplicated;
  }, [invoices, businessProfile, refreshData, addToast]);

  const updateInvoiceStatus = useCallback((id: string, status: InvoiceStatus) => {
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) return;

    const updated = { ...invoice, status };
    StorageService.saveInvoice(updated);
    refreshData();
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `${invoice.invoiceNumber} status changed to ${status}.`,
    });

    if (previewDocument && previewDocument.data.id === id) {
      setPreviewDocument({ type: 'invoice', data: updated });
    }
  }, [invoices, refreshData, addToast, previewDocument]);

  const recordPayment = useCallback((invoiceId: string, paymentData: Omit<PaymentRecord, 'id' | 'invoiceId' | 'recordedAt'>) => {
    const updated = StorageService.recordPayment(invoiceId, paymentData);
    if (updated) {
      refreshData();
      addToast({
        type: 'success',
        title: 'Payment Recorded',
        message: `${updated.currencySymbol} ${paymentData.amount.toLocaleString()} received for ${updated.invoiceNumber}.`,
      });

      if (previewDocument && previewDocument.data.id === invoiceId) {
        setPreviewDocument({ type: 'invoice', data: updated });
      }
      setPaymentModalInvoice(null);
    }
  }, [refreshData, addToast, previewDocument]);

  // Preview & Payment Modals
  const openDocumentPreview = useCallback((type: 'quote' | 'invoice', data: Quotation | Invoice) => {
    setPreviewDocument({ type, data });
  }, []);

  const closeDocumentPreview = useCallback(() => {
    setPreviewDocument(null);
  }, []);

  const openPaymentModal = useCallback((invoice: Invoice) => {
    setPaymentModalInvoice(invoice);
  }, []);

  const closePaymentModal = useCallback(() => {
    setPaymentModalInvoice(null);
  }, []);

  // System Resets
  const resetToDemoData = useCallback(() => {
    StorageService.resetToDemoData();
    refreshData();
    addToast({
      type: 'success',
      title: 'Demo Data Restored',
      message: 'Workspace has been repopulated with sample clients, quotations, and invoices.',
    });
  }, [refreshData, addToast]);

  const clearAllData = useCallback(() => {
    StorageService.clearAllData();
    refreshData();
    setActiveView('dashboard');
    addToast({
      type: 'warning',
      title: 'Workspace Cleared',
      message: 'All records have been reset. You now have a clean slate.',
    });
  }, [refreshData, setActiveView, addToast]);

  // Keep state in sync if window focuses or changes occur
  useEffect(() => {
    const handleStorageChange = () => refreshData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshData]);

  return (
    <AppContext.Provider
      value={{
        activeView,
        activeEntityId,
        setActiveView,
        businessProfile,
        clients,
        quotations,
        invoices,
        activities,
        searchQuery,
        setSearchQuery,
        updateBusinessProfile,
        saveClient,
        deleteClient,
        saveQuotation,
        deleteQuotation,
        duplicateQuotation,
        convertQuotationToInvoice,
        updateQuotationStatus,
        saveInvoice,
        deleteInvoice,
        duplicateInvoice,
        updateInvoiceStatus,
        recordPayment,
        previewDocument,
        openDocumentPreview,
        closeDocumentPreview,
        paymentModalInvoice,
        openPaymentModal,
        closePaymentModal,
        confirmDialog,
        showConfirmDialog,
        hideConfirmDialog,
        toasts,
        addToast,
        removeToast,
        resetToDemoData,
        clearAllData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
