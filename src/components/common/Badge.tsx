import React from 'react';
import type { QuotationStatus, InvoiceStatus } from '../../types';
import { getQuotationStatusConfig, getInvoiceStatusConfig } from '../../utils/formatters';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  status?: QuotationStatus | InvoiceStatus;
  type?: 'quote' | 'invoice';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  type = 'quote',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  if (status) {
    const config =
      type === 'quote'
        ? getQuotationStatusConfig(status as QuotationStatus)
        : getInvoiceStatusConfig(status as InvoiceStatus);

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${config.badgeClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <span>{children || config.label}</span>
      </span>
    );
  }

  const variantMap = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses} ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
