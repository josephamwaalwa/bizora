import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { formatCurrency } from '../../utils/formatters';
import type { PaymentMethod } from '../../types';
import { CreditCard } from 'lucide-react';

export const RecordPaymentModal: React.FC = () => {
  const { paymentModalInvoice, closePaymentModal, recordPayment } = useApp();

  const invoice = paymentModalInvoice;
  const balance = invoice?.outstandingBalance ?? 0;

  const [amount, setAmount] = useState<number>(balance);
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('eft');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }
    if (numAmount > balance + 0.01) {
      setError(`Amount cannot exceed the remaining balance of ${formatCurrency(balance, invoice.currency, invoice.currencySymbol)}`);
      return;
    }

    recordPayment(invoice.id, {
      amount: numAmount,
      paymentDate,
      paymentMethod,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={!!invoice}
      onClose={closePaymentModal}
      title={
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-700" />
          <span>Record Payment • {invoice.invoiceNumber}</span>
        </div>
      }
      subtitle={`Customer Account: ${invoice.clientSnapshot.name || 'Client'}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Balance Card: Flat and Structured */}
        <div className="rounded border border-slate-200 bg-slate-50/70 p-3.5 flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Invoiced</span>
            <span className="money font-semibold text-slate-800 text-sm">
              {formatCurrency(invoice.grandTotal, invoice.currency, invoice.currencySymbol)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Balance Outstanding</span>
            <span className="money font-bold text-sm text-slate-900">
              {formatCurrency(balance, invoice.currency, invoice.currencySymbol)}
            </span>
          </div>
        </div>

        <Input
          label="Payment Amount"
          type="number"
          step="0.01"
          min="0.01"
          max={balance}
          value={amount}
          onChange={(e) => {
            setAmount(parseFloat(e.target.value) || 0);
            setError('');
          }}
          leftAddon={invoice.currencySymbol}
          error={error}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'eft', label: 'EFT / Bank Transfer' },
              { value: 'credit_card', label: 'Credit / Debit Card' },
              { value: 'cash', label: 'Cash' },
              { value: 'mobile_money', label: 'Mobile Money / eWallet' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>

        <Input
          label="Reference / Transaction ID"
          placeholder="e.g. FNB-EFT-99410"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          helperText="Bank statement or payment receipt reference"
        />

        <Textarea
          label="Payment Notes"
          placeholder="Optional notes regarding this installment..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="secondary" size="sm" type="button" onClick={closePaymentModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
