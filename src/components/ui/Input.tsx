import React from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

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
            className="text-xs sm:text-sm font-semibold text-slate-700 select-none flex items-center gap-1"
          >
            {label}
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
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
              'w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50/80 border rounded-[12px] text-sm text-slate-900 font-normal placeholder:text-slate-400 transition-all duration-150 ease-out',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon || (clearable && hasValue) || isSuccess ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                : isSuccess
                ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                : 'border-slate-300 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10',
              disabled && 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed select-none',
              className
            )}
            {...props}
          />

          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Metni temizle"
              className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isSuccess && !rightIcon && !(clearable && hasValue) && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-emerald-600">
              <Check className="w-4 h-4" />
            </div>
          )}

          {rightIcon && (!clearable || !hasValue) && !isSuccess && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
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
          <p id={helperId} className="text-xs text-slate-500 font-normal leading-tight">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
