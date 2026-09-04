import React from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../lib/design-tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  successMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess = false,
      successMessage,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      className,
      id,
      disabled,
      required,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const successId = `${inputId}-success`;

    const hasValue = value !== undefined && value !== '' && value !== null;

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center gap-1"
          >
            {label}
            {required && <span className="text-rose-500 font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : isSuccess && successMessage ? successId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D121D] border rounded-xl text-sm text-slate-900 dark:text-slate-100 font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 ease-out',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon || (clearable && hasValue) || isSuccess ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-rose-400 bg-rose-50/30 text-rose-900 dark:bg-rose-950/20 dark:border-rose-500/50 dark:text-rose-200 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                : isSuccess
                ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 dark:text-slate-100 dark:bg-emerald-950/20 dark:border-emerald-500/50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                : 'border-slate-200 dark:border-white/[0.12] focus:bg-white dark:focus:bg-[#131927] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/30',
              disabled && 'bg-slate-100 dark:bg-[#161E2E]/60 border-slate-200 dark:border-white/[0.06] text-slate-400 dark:text-slate-600 cursor-not-allowed select-none',
              className
            )}
            {...props}
          />

          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Metni temizle"
              className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isSuccess && !rightIcon && !(clearable && hasValue) && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" />
            </div>
          )}

          {rightIcon && (!clearable || !hasValue) && !isSuccess && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-tight">
            {error}
          </p>
        ) : isSuccess && successMessage ? (
          <p id={successId} className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
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

Input.displayName = 'Input';
