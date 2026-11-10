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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-navy-900 hover:bg-navy-800 text-white shadow-subtle focus:ring-navy-900',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-subtle focus:ring-indigo-600',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-subtle hover:border-slate-400 focus:ring-slate-400',
    outline: 'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-400',
    ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-subtle focus:ring-rose-500',
    success: 'bg-teal-600 hover:bg-teal-700 text-white shadow-subtle focus:ring-teal-500',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
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
