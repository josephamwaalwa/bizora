import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import type { LineItem, Quotation, Client, QuotationStatus } from '../types';
import { calculateDocumentFinancials, calculateLineItemTotal } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generateId, formatDocNumber } from '../utils/idGenerator';
import { StorageService } from '../services/storage';
import {
  Plus,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const QuotationFormPage: React.FC = () => {
  const {
    activeEntityId,
    setActiveView,
    quotations,
    clients,
    businessProfile,
    saveQuotation,
    saveClient,
    openDocumentPreview,
    addToast,
  } = useApp();

  const isEditing = Boolean(activeEntityId);
  const existingQuote = isEditing ? quotations.find((q) => q.id === activeEntityId) : null;

  // Selected Client
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (existingQuote) return existingQuote.clientId;
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

  // Quotation Meta
  const [quotationNumber, setQuotationNumber] = useState<string>(() => {
    if (existingQuote) return existingQuote.quotationNumber;
    const nextNum = businessProfile.nextQuoteNumber || 1;
    return formatDocNumber(businessProfile.quotePrefix || 'QUO-', nextNum);
  });

  const [issueDate, setIssueDate] = useState<string>(() => {
    return existingQuote?.issueDate || new Date().toISOString().split('T')[0];
  });

  const [expiryDate, setExpiryDate] = useState<string>(() => {
    if (existingQuote?.expiryDate) return existingQuote.expiryDate;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [status, setStatus] = useState<QuotationStatus>(() => {
    return existingQuote?.status || 'draft';
  });

  const [currency, setCurrency] = useState(existingQuote?.currency || businessProfile.defaultCurrency || 'NAD');
  const [currencySymbol, setCurrencySymbol] = useState(existingQuote?.currencySymbol || businessProfile.currencySymbol || 'N$');

  // Line items
  const [items, setItems] = useState<LineItem[]>(() => {
    if (existingQuote && existingQuote.items.length > 0) {
      return existingQuote.items;
    }
    return [
      {
        id: generateId('item'),
        description: 'Professional Consulting / Project Services',
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
      },
    ];
  });

  // Discounts & Tax
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    existingQuote?.discountType || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<number>(existingQuote?.discountValue || 0);

  const [isTaxEnabled, setIsTaxEnabled] = useState<boolean>(() => {
    if (existingQuote) return existingQuote.taxRate > 0;
    return businessProfile.isTaxEnabled ?? true;
  });
  const [taxName, setTaxName] = useState<string>(existingQuote?.taxName || businessProfile.defaultTaxName || 'VAT');
  const [taxRate, setTaxRate] = useState<number>(() => {
    if (existingQuote) return existingQuote.taxRate;
    return businessProfile.defaultTaxRate ?? 15;
  });

  // Notes & Terms
  const [notes, setNotes] = useState<string>(
    existingQuote?.notes ?? businessProfile.defaultNotes
  );
  const [terms, setTerms] = useState<string>(
    existingQuote?.terms ?? businessProfile.defaultTermsQuotation
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

  const currentClient = clients.find((c) => c.id === selectedClientId) || existingQuote?.clientSnapshot;

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
      StorageService.incrementQuoteNumber();
    }

    const quoteToSave: Quotation = {
      id: existingQuote?.id || generateId('quo'),
      quotationNumber: quotationNumber.trim() || 'QUO-0001',
      clientId: clientToSave.id,
      clientSnapshot: clientToSave,
      businessSnapshot: businessProfile,
      issueDate,
      expiryDate,
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
      status,
      notes: notes.trim() || undefined,
      terms: terms.trim() || undefined,
      convertedInvoiceId: existingQuote?.convertedInvoiceId,
      createdAt: existingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveQuotation(quoteToSave);

    if (viewAfterSave) {
      openDocumentPreview('quote', quoteToSave);
    }
    setActiveView('quotations');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('quotations')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back
          </Button>
          <div>
            <span className="page-kicker block mb-1">
              Quotation Editor
            </span>
            <h2 className="page-title">
              {isEditing ? `Edit Quotation ${quotationNumber}` : 'Create New Quotation'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleSave(false)}>
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave(true)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Save & Inspect
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: Business Information */}
          <div className="border border-slate-200/80 rounded-md bg-white p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                Sender Information
              </span>
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Configure in Settings
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block">Business</span>
                <span className="font-semibold text-slate-900">{businessProfile.name}</span>
                <p className="text-slate-500">{businessProfile.email}</p>
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block">Location</span>
                <span className="text-slate-700">{businessProfile.address || 'Windhoek, Namibia'}</span>
                <p className="text-slate-500">{businessProfile.phone}</p>
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block">Tax / Registration</span>
                <span className="text-slate-700 font-mono">{businessProfile.taxNumber || 'No VAT set'}</span>
                <p className="text-slate-500 font-mono">{businessProfile.defaultCurrency} ({businessProfile.currencySymbol})</p>
              </div>
            </div>
          </div>

          {/* SECTION B: Client Selection */}
          <div className="border border-slate-200/80 rounded-md bg-white p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                Client (Bill To)
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNewClient(!isAddingNewClient)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                {isAddingNewClient ? 'Select existing client' : '+ Quick add client'}
              </button>
            </div>

            {isAddingNewClient ? (
              <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Quick Add Client Record
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Client Contact Name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Helena Shipanga"
                    required
                  />
                  <Input
                    label="Company Name"
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
                  label="Billing Address"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Street, City, Namibia"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="secondary" size="sm" onClick={() => setIsAddingNewClient(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleQuickAddClient}>
                    Save & Select
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {clients.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2">
                    No clients registered.{' '}
                    <button
                      type="button"
                      onClick={() => setIsAddingNewClient(true)}
                      className="font-semibold text-slate-900 underline"
                    >
                      Click here to add one.
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
                  <div className="mt-3 p-3 bg-slate-50 rounded text-xs space-y-0.5 text-slate-600 border border-slate-200">
                    <p className="font-semibold text-slate-900">{currentClient.name}</p>
                    {currentClient.companyName && <p>{currentClient.companyName}</p>}
                    <p>{currentClient.email} • {currentClient.phone}</p>
                    {currentClient.address && <p>{currentClient.address}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION C & D: Line Items */}
          <div className="border border-slate-200/80 rounded-md bg-white p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                Itemised Services & Products
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded border border-slate-200 bg-slate-50/40 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono text-slate-400 mt-2 font-bold">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        label="Description of Service / Product"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="e.g. Website Redesign & Technical SEO Audit"
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-5 p-1.5 text-slate-400 hover:text-rose-700 transition-colors"
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
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                        Line Total
                      </span>
                      <div className="money h-8 flex items-center px-2.5 rounded border border-slate-200 bg-slate-100 text-slate-800 font-bold text-xs">
                        {formatCurrency(item.total, currency, currencySymbol)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION F: Terms & Notes */}
          <div className="border border-slate-200/80 rounded-md bg-white p-5 shadow-subtle space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans block border-b border-slate-100 pb-2">
              Proposal Notes & Contractual Terms
            </span>
            <Textarea
              label="Notes to Client"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide scope context or delivery expectations..."
              rows={2}
            />
            <Textarea
              label="Terms & Conditions"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Specify payment schedule, validity, scope revisions, etc."
              rows={3}
            />
          </div>
        </div>

        {/* Right Sidebar: Meta & Financials (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Card */}
          <div className="border border-slate-200/80 rounded-md bg-white p-4 shadow-subtle space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans block border-b border-slate-100 pb-2">
              Quotation Metadata
            </span>

            <Input
              label="Quotation Number"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              required
            />

            <Select
              label="Quotation Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as QuotationStatus)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent to Client' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'declined', label: 'Declined' },
                { value: 'expired', label: 'Expired' },
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
                label="Expiry Date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="NAD"
              />
              <Input
                label="Symbol"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="N$"
              />
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="border border-slate-200/80 rounded-md bg-white p-4 shadow-subtle space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans block border-b border-slate-100 pb-2">
              Financial Summary
            </span>

            {/* Discount Configuration */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
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

            {/* Tax Configuration */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                  Tax Calculation
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={isTaxEnabled}
                    onChange={(e) => setIsTaxEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <span>Apply</span>
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

            {/* Calculation Totals */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="money font-medium">
                  {formatCurrency(financials.subtotal, currency, currencySymbol)}
                </span>
              </div>

              {financials.discountAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Discount</span>
                  <span className="money">
                    - {formatCurrency(financials.discountAmount, currency, currencySymbol)}
                  </span>
                </div>
              )}

              {isTaxEnabled && financials.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>
                    {taxName} ({taxRate}%)
                  </span>
                  <span className="money font-medium">
                    {formatCurrency(financials.taxAmount, currency, currencySymbol)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-900 flex justify-between items-baseline text-slate-900">
                <span className="font-bold text-xs uppercase tracking-wider">Grand Total</span>
                <span className="money font-extrabold text-base">
                  {formatCurrency(financials.grandTotal, currency, currencySymbol)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => handleSave(true)}
              >
                Save & Preview Quotation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
