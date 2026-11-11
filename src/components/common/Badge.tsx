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

const toneDot: Record<string, string> = {
  default: 'bg-ink-muted',
  neutral: 'bg-ink-muted',
  success: 'bg-teal-700',
  warning: 'bg-[#8A5A12]',
  danger: 'bg-[#8E3B32]',
  info: 'bg-ink',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  type = 'quote',
  size = 'md',
  className = '',
}) => {
  const textSize = size === 'sm' ? 'text-[13px]' : 'text-[14px]';

  if (status) {
    const config =
      type === 'quote'
        ? getQuotationStatusConfig(status as QuotationStatus)
        : getInvoiceStatusConfig(status as InvoiceStatus);

    return (
      <span className={`inline-flex items-center gap-2 font-medium ${textSize} ${config.badgeClass} ${className}`}>
        <span className={`h-1.5 w-1.5 shrink-0 ${config.dotClass}`} />
        <span>{children || config.label}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 font-medium text-ink ${textSize} ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 ${toneDot[variant]}`} />
      {children}
    </span>
  );
};
