import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../lib/design-tokens';
import { type ButtonVariant } from './Button';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Mandatory for accessibility
  variant?: ButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
  isRounded?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white dark:bg-white dark:hover:bg-slate-100 dark:active:bg-slate-200 dark:text-slate-900 shadow-xs border border-transparent',
  secondary:
    'bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-800 dark:bg-[#161E2E] dark:hover:bg-[#1E293B] dark:text-slate-100 border border-slate-200/80 dark:border-white/[0.08] shadow-xs',
  outline:
    'bg-transparent border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 active:bg-slate-100 dark:border-white/[0.12] dark:hover:border-white/[0.2] dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 shadow-xs',
  ghost:
    'bg-transparent hover:bg-slate-100/80 active:bg-slate-200/80 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs dark:bg-rose-600 dark:hover:bg-rose-500 border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs dark:bg-emerald-600 dark:hover:bg-emerald-500 border border-transparent',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-9 h-9 min-w-[36px] min-h-[36px] p-2 text-sm',
  md: 'w-11 h-11 min-w-[44px] min-h-[44px] p-2.5 text-base',
  lg: 'w-12 h-12 min-w-[48px] min-h-[48px] p-3 text-lg',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      'aria-label': ariaLabel,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      isRounded = true,
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
      <motion.button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={isDisabled}
        aria-busy={isLoading}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        className={cn(
          'inline-flex items-center justify-center shrink-0 select-none relative cursor-pointer transition-colors duration-150',
          variant === 'danger' ? tokens.focus.ringDanger : tokens.focus.ring,
          isRounded ? tokens.radius.pill : tokens.radius.md,
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none shadow-none',
          className
        )}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';
