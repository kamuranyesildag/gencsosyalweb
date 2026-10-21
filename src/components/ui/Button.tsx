import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../lib/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  isPill?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs shadow-blue-500/20 border border-blue-500/30',
  secondary:
    'bg-slate-100/90 hover:bg-slate-200/80 active:bg-slate-300 text-slate-800 dark:bg-[#142244] dark:hover:bg-[#1A2D5A] dark:active:bg-[#203870] dark:text-slate-100 border border-slate-200/80 dark:border-white/[0.08] shadow-xs',
  outline:
    'bg-white/40 dark:bg-transparent backdrop-blur-xs border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 active:bg-blue-100/50 dark:border-white/[0.12] dark:hover:border-blue-500/50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200 shadow-xs',
  ghost:
    'bg-transparent hover:bg-slate-100/80 active:bg-slate-200/80 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs dark:bg-rose-600 dark:hover:bg-rose-500 border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs dark:bg-emerald-600 dark:hover:bg-emerald-500 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs font-semibold px-3 py-1.5 min-h-[36px] gap-1.5',
  md: 'text-sm font-semibold px-4 py-2 min-h-[44px] gap-2',
  lg: 'text-base font-semibold px-5 py-2.5 min-h-[48px] gap-2.5',
  icon: 'w-11 h-11 min-h-[44px] min-w-[44px] p-0 justify-center',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      isPill = false,
      className,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none whitespace-nowrap active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer',
          isPill ? tokens.radius.pill : tokens.radius.md,
          variant === 'danger' ? tokens.focus.ringDanger : tokens.focus.ring,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none shadow-none active:scale-100',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
