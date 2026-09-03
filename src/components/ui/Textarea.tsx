import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  successMessage?: string;
  autoResize?: boolean;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      isSuccess = false,
      successMessage,
      autoResize = false,
      showCount = false,
      maxLength,
      className,
      id,
      disabled,
      required,
      value,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const successId = `${textareaId}-success`;

    const count = typeof value === 'string' ? value.length : 0;

    // Handle auto resize
    useEffect(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [value, autoResize]);

    const setMergedRef = (element: HTMLTextAreaElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-xs sm:text-sm font-semibold text-slate-700 select-none flex items-center gap-1"
            >
              {label}
              {required && <span className="text-rose-500 font-bold">*</span>}
            </label>
          )}
          {showCount && maxLength && (
            <span
              className={cn(
                'text-xs font-medium',
                count >= maxLength ? 'text-rose-600 font-semibold' : 'text-slate-400'
              )}
            >
              {count}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={setMergedRef}
          id={textareaId}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : isSuccess && successMessage ? successId : helperText ? helperId : undefined
          }
          className={cn(
            'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border rounded-[12px] text-sm text-slate-900 dark:text-slate-100 font-normal placeholder:text-slate-400 transition-all duration-150 ease-out resize-y min-h-[80px]',
            error
              ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
              : isSuccess
              ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 dark:text-slate-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
              : 'border-slate-300 focus:bg-white dark:bg-slate-950 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10',
            disabled && 'bg-slate-100 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed select-none',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
