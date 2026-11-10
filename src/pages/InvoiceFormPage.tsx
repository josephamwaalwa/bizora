import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import type { LineItem, Invoice, Client, InvoiceStatus } from '../types';
import { calculateDocumentFinancials, calculateLineItemTotal, calculateInvoiceBalances } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generateId, formatDocNumber } from '../utils/idGenerator';
import { StorageService } from '../services/storage';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Building,
  User,
  Calendar,
  DollarSign,
  Receipt,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const InvoiceFormPage: React.FC = () => {
  const {
    activeEntityId,
    setActiveView,
    invoices,
    clients,
    quotations,
    businessProfile,
    saveInvoice,
    saveClient,
    openDocumentPreview,
    addToast,
  } = useApp();

  const isEditing = Boolean(activeEntityId);
  const existingInvoice = isEditing ? invoices.find((i) => i.id === activeEntityId) : null;

  // Selected Client
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (existingInvoice) return existingInvoice.clientId;
    if (clients.length > 0) return clients[0].id;
    return '';
  });

  // Client quick creation toggle
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => {
    if (existingInvoice) return existingInvoice.invoiceNumber;
    const nextNum = businessProfile.nextInvoiceNumber || 1;
    return formatDocNumber(businessProfile.invoicePrefix || 'INV-', nextNum);
  });

  const [quotationId, setQuotationId] = useState<string>(existingInvoice?.quotationId || '');

  const [issueDate, setIssueDate] = useState<string>(() => {
    return existingInvoice?.issueDate || new Date().toISOString().split('T')[0];
  });

  const [dueDate, setDueDate] = useState<string>(() => {
    if (existingInvoice?.dueDate) return existingInvoice.dueDate;
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const [status, setStatus] = useState<InvoiceStatus>(() => {
    return existingInvoice?.status || 'sent';
  });

  const [currency, setCurrency] = useState(existingInvoice?.currency || businessProfile.defaultCurrency || 'NAD');
  const [currencySymbol, setCurrencySymbol] = useState(existingInvoice?.currencySymbol || businessProfile.currencySymbol || 'N$');

  // Line items
  const [items, setItems] = useState<LineItem[]>(() => {
    if (existingInvoice && existingInvoice.items.length > 0) {
      return existingInvoice.items;
    }
    return [
      {
        id: generateId('item'),
        description: 'Professional Services / Development Retainer',
        quantity: 1,
        unitPrice: 8500,
        total: 8500,
      },
    ];
  });

  // Discounts & Tax
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    existingInvoice?.discountType || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<number>(existingInvoice?.discountValue || 0);

  const [isTaxEnabled, setIsTaxEnabled] = useState<boolean>(() => {
    if (existingInvoice) return existingInvoice.taxRate > 0;
    return businessProfile.isTaxEnabled ?? true;
  });
  const [taxName, setTaxName] = useState<string>(existingInvoice?.taxName || businessProfile.defaultTaxName || 'VAT');
  const [taxRate, setTaxRate] = useState<number>(() => {
    if (existingInvoice) return existingInvoice.taxRate;
    return businessProfile.defaultTaxRate ?? 15;
  });

  // Notes & Terms
  const [notes, setNotes] = useState<string>(
    existingInvoice?.notes ?? businessProfile.defaultNotes
  );
  const [terms, setTerms] = useState<string>(
    existingInvoice?.terms ?? businessProfile.defaultTermsInvoice
  );

  const [errorMsg, setErrorMsg] = useState('');

  // Live recalculations
  const financials = calculateDocumentFinancials({
    items,
    discountType,
    discountValue,
    isTaxEnabled,
    taxRate: isTaxEnabled ? taxRate : 0,
    taxName,
  });

  const currentPayments = existingInvoice?.payments || [];
  const { amountPaid, outstandingBalance } = calculateInvoiceBalances(financials.grandTotal, currentPayments);

  const currentClient = clients.find((c) => c.id === selectedClientId) || existingInvoice?.clientSnapshot;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: generateId('item'),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      addToast({
        type: 'warning',
        title: 'At least one line item is required.',
      });
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'unitPrice', val: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        const q = field === 'quantity' ? Number(val) : item.quantity;
        const p = field === 'unitPrice' ? Number(val) : item.unitPrice;
        updated.total = calculateLineItemTotal(q, p);
        return updated;
      })
    );
  };

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      setErrorMsg('Client name is required.');
      return;
    }
    const created = saveClient({
      name: newClientName.trim(),
      companyName: newClientCompany.trim() || undefined,
      email: newClientEmail.trim() || `${newClientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: newClientPhone.trim(),
      address: newClientAddress.trim(),
    });
    setSelectedClientId(created.id);
    setIsAddingNewClient(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
  };

  const handleSave = (viewAfterSave: boolean = false) => {
    setErrorMsg('');

    if (!selectedClientId && !currentClient) {
      setErrorMsg('Please select or add a client.');
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setErrorMsg('Please enter a description for all line items.');
      return;
    }

    const clientToSave: Client = currentClient || {
      id: selectedClientId || generateId('cli'),
      name: 'Client',
      email: '',
      phone: '',
      address: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isEditing) {
      StorageService.incrementInvoiceNumber();
    }

    const invoiceToSave: Invoice = {
      id: existingInvoice?.id || generateId('inv'),
      invoiceNumber: invoiceNumber.trim() || 'INV-0001',
      quotationId: quotationId.trim() || undefined,
      clientId: clientToSave.id,
      clientSnapshot: clientToSave,
      businessSnapshot: businessProfile,
      issueDate,
      dueDate,
      currency,
      currencySymbol,
      items,
      subtotal: financials.subtotal,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountAmount: financials.discountAmount,
      taxName: isTaxEnabled ? taxName : 'None',
      taxRate: isTaxEnabled ? Number(taxRate) : 0,
      taxAmount: financials.taxAmount,
      grandTotal: financials.grandTotal,
      amountPaid,
      outstandingBalance,
      status,
      notes: notes.trim() || undefined,
      terms: terms.trim() || undefined,
      payments: currentPayments,
      createdAt: existingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveInvoice(invoiceToSave);

    if (viewAfterSave) {
      openDocumentPreview('invoice', invoiceToSave);
    }
    setActiveView('invoices');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('invoices')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditing ? `Edit Invoice ${invoiceNumber}` : 'Create New Invoice'}
            </h2>
            <p className="text-xs text-slate-500">
              Generate commercial billing documents with automated VAT and banking instructions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => handleSave(false)}>
            Save as Draft
          </Button>
          <Button
            variant="indigo"
            size="md"
            onClick={() => handleSave(true)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Save & View Preview
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: Business Snapshot Info */}
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  From: Business Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Edit in Settings
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Business</span>
                <span className="font-semibold text-slate-900">{businessProfile.name}</span>
                <p className="text-slate-500">{businessProfile.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Account</span>
                <span className="text-slate-700">{businessProfile.bankDetails.bankName || 'FNB Namibia'}</span>
                <p className="font-mono text-slate-500">{businessProfile.bankDetails.accountNumber || 'Acc: Not set'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tax / TIN</span>
                <span className="text-slate-700">{businessProfile.taxNumber || 'Not set'}</span>
                <p className="text-slate-500">{businessProfile.defaultCurrency} ({businessProfile.currencySymbol})</p>
              </div>
            </div>
          </Card>

          {/* SECTION B: Client Selection */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Bill To: Client Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNewClient(!isAddingNewClient)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {isAddingNewClient ? 'Select existing client' : '+ Add new client'}
              </button>
            </div>

            {isAddingNewClient ? (
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/40 space-y-3">
                <p className="text-xs font-semibold text-teal-900">Add New Client Quickly</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Client Full Name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Helena Shipanga"
                    required
                  />
                  <Input
                    label="Company Name (Optional)"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    placeholder="e.g. Dunes Logistics CC"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@business.na"
                  />
                  <Input
                    label="Phone Number"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+264 61 000 000"
                  />
                </div>
                <Input
                  label="Physical / Billing Address"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Street, City, Namibia"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="secondary" size="sm" onClick={() => setIsAddingNewClient(false)}>
                    Cancel
                  </Button>
                  <Button variant="indigo" size="sm" onClick={handleQuickAddClient}>
                    Save & Select Client
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {clients.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2">
                    No clients created yet.{' '}
                    <button
                      type="button"
                      onClick={() => setIsAddingNewClient(true)}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      Click here to add your first client.
                    </button>
                  </div>
                ) : (
                  <Select
                    label="Select Client"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    options={clients.map((c) => ({
                      value: c.id,
                      label: `${c.name}${c.companyName ? ` (${c.companyName})` : ''}`,
                    }))}
                  />
                )}

                {currentClient && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-0.5 text-slate-600 border border-slate-200">
                    <p className="font-semibold text-slate-900">{currentClient.name}</p>
                    {currentClient.companyName && <p>{currentClient.companyName}</p>}
                    <p>{currentClient.email} • {currentClient.phone}</p>
                    {currentClient.address && <p>{currentClient.address}</p>}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* SECTION C & D: Line Items */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Itemized Charges & Services
                </h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 font-mono mt-2">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        label="Item / Service Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="e.g. Monthly Retainer & Support Agreement"
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-6 p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      required
                    />
                    <Input
                      label={`Unit Price (${currencySymbol})`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                    <div>
                      <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Line Total
                      </span>
                      <div className="h-9 flex items-center px-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-800 font-mono font-bold text-sm">
                        {formatCurrency(item.total, currency, currencySymbol)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Terms & Notes */}
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Notes & Payment Terms
            </h3>
            <Textarea
              label="Notes to Client"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Thank you for your partnership! Please include the invoice number on your EFT reference."
              rows={2}
            />
            <Textarea
              label="Terms & Conditions"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Specify interest on late payments, bank charges, etc."
              rows={3}
            />
          </Card>
        </div>

        {/* Right Sidebar: Meta & Financials (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Invoice Metadata Card */}
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Invoice Settings</span>
            </h3>

            <Input
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />

            {/* Quotation link if applicable */}
            <Select
              label="Linked Quotation (Optional)"
              value={quotationId}
              onChange={(e) => setQuotationId(e.target.value)}
            >
              <option value="">No linked quotation</option>
              {quotations.map((q) => (
                <option key={q.id} value={q.quotationNumber}>
                  {q.quotationNumber} — {q.clientSnapshot.name} ({formatCurrency(q.grandTotal, q.currency, q.currencySymbol)})
                </option>
              ))}
            </Select>

            <Select
              label="Invoice Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent to Client' },
                { value: 'partially_paid', label: 'Partially Paid' },
                { value: 'paid', label: 'Paid in Full' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Issue Date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Currency Code"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="NAD"
              />
              <Input
                label="Currency Symbol"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="N$"
              />
            </div>
          </Card>

          {/* Financial Breakdown Card */}
          <Card padding="md" className="space-y-4 bg-slate-50/60">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>Financial Summary</span>
            </h3>

            {/* Discount Configuration */}
            <div className="space-y-2 pt-1">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Discount
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  options={[
                    { value: 'percentage', label: 'Percent (%)' },
                    { value: 'fixed', label: `Fixed (${currencySymbol})` },
                  ]}
                />
                <Input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Tax Configuration (Configurable!) */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Configurable Tax
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={isTaxEnabled}
                    onChange={(e) => setIsTaxEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Apply Tax</span>
                </label>
              </div>

              {isTaxEnabled && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Input
                    label="Tax Name"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    placeholder="VAT"
                  />
                  <Input
                    label="Rate (%)"
                    type="number"
                    min="0"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    placeholder="15"
                  />
                </div>
              )}
            </div>

            {/* Live Calculation Output */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">
                  {formatCurrency(financials.subtotal, currency, currencySymbol)}
                </span>
              </div>

              {financials.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span className="font-mono">
                    - {formatCurrency(financials.discountAmount, currency, currencySymbol)}
                  </span>
                </div>
              )}

              {isTaxEnabled && financials.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>
                    {taxName} ({taxRate}%)
                  </span>
                  <span className="font-mono font-medium">
                    {formatCurrency(financials.taxAmount, currency, currencySymbol)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-baseline text-slate-900">
                <span className="font-bold text-sm">Grand Total</span>
                <span className="font-mono font-extrabold text-lg text-navy-900">
                  {formatCurrency(financials.grandTotal, currency, currencySymbol)}
                </span>
              </div>

              {currentPayments.length > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium pt-1">
                  <span>Payments Recorded</span>
                  <span className="font-mono">
                    {formatCurrency(amountPaid, currency, currencySymbol)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-700">Balance Due</span>
                <span className="font-mono font-extrabold text-base text-rose-600">
                  {formatCurrency(outstandingBalance, currency, currencySymbol)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="indigo"
                size="lg"
                className="w-full"
                onClick={() => handleSave(true)}
              >
                Save & Preview Invoice
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
