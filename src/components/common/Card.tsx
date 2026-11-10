import React, { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl transition-all duration-150';

  const variantStyles = {
    default: 'border border-slate-200/90 shadow-card',
    elevated: 'border border-slate-200/80 shadow-elevated',
    flat: 'border border-slate-200 bg-slate-50/50',
    interactive: 'border border-slate-200/90 shadow-card hover:shadow-elevated hover:border-indigo-300/80 cursor-pointer',
  }[variant];

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  return (
    <div className={`${baseStyles} ${variantStyles} ${paddingStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
