import React, { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftAddon, rightAddon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative flex rounded-lg shadow-sm">
          {leftAddon && (
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
              {leftAddon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-lg border text-sm transition-colors duration-150 py-2 px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
              leftAddon ? 'rounded-l-none' : ''
            } ${rightAddon ? 'rounded-r-none' : ''} ${
              error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'
            } ${className}`}
            {...props}
          />
          {rightAddon && (
            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
              {rightAddon}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
