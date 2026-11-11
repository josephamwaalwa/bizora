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
          <label htmlFor={inputId} className="mb-2 block text-[14px] font-medium leading-snug text-ink">
            {label} {props.required && <span className="text-[#8E3B32]">*</span>}
          </label>
        )}
        <div className="relative flex">
          {leftAddon && (
            <span className="inline-flex h-11 items-center border border-r-0 border-line bg-paper-sunken px-3 text-[15px] text-ink-secondary font-mono">
              {leftAddon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block h-11 w-full border bg-white px-3 text-[16px] text-ink transition-colors placeholder:text-ink-muted focus:outline-none focus:border-ink disabled:bg-paper-sunken disabled:text-ink-muted disabled:cursor-not-allowed ${
              leftAddon ? '' : ''
            } ${
              error ? 'border-[#8E3B32] focus:border-[#8E3B32]' : 'border-line'
            } ${className}`}
            {...props}
          />
          {rightAddon && (
            <span className="inline-flex h-11 items-center border border-l-0 border-line bg-paper-sunken px-3 text-[15px] text-ink-secondary font-mono">
              {rightAddon}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-[13px] font-medium text-[#8E3B32]">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-[13px] text-ink-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
