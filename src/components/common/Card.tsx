import React, { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'subtle' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white';

  const variantStyles = {
    default: 'border-t border-line',
    flat: 'border-t border-line',
    subtle: 'border-t border-line bg-paper',
    interactive: 'border-t border-line hover:bg-paper-sunken cursor-pointer',
  }[variant];

  const paddingStyles = {
    none: 'p-0',
    sm: 'px-0 py-6',
    md: 'px-0 py-8',
    lg: 'px-0 py-10',
  }[padding];

  return (
    <div className={`${baseStyles} ${variantStyles} ${paddingStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
