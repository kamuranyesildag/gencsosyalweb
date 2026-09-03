import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  successMessage?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess = false,
      successMessage,
      options,
      className,
      id,
      disabled,
      required,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    const successId = `${selectId}-success`;

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs sm:text-sm font-semibold text-slate-700 select-none flex items-center gap-1"
          >
            {label}
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : isSuccess && successMessage ? successId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full min-h-[44px] appearance-none pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/80 border rounded-xl text-sm text-slate-900 dark:text-slate-100 font-medium cursor-pointer transition-all duration-150 ease-out',
              error
                ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                : isSuccess
                ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 dark:text-slate-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800/90 focus:bg-white dark:bg-slate-950 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10',
              disabled && 'bg-slate-100 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed select-none',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
            {isSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-rose-600 font-medium leading-tight">
            {error}
          </p>
        ) : isSuccess && successMessage ? (
          <p id={successId} className="text-xs text-emerald-600 font-medium leading-tight">
            {successMessage}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
