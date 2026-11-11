import React, { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'indigo' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-normal transition-colors duration-150 rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'h-10 px-3.5 text-[15px] gap-2',
    md: 'h-11 px-4 text-[16px] gap-2',
    lg: 'h-12 px-5 text-[16px] gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-white hover:bg-paper-sunken text-ink border border-line-strong',
    outline: 'bg-transparent border border-line-strong text-ink hover:bg-paper-sunken',
    ghost: 'bg-transparent text-ink-secondary hover:text-ink hover:bg-paper-sunken',
    danger: 'bg-[#8E3B32] hover:bg-[#742F28] text-white',
    success: 'bg-teal-700 hover:bg-teal-800 text-white',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
