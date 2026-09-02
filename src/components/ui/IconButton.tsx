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
    'bg-slate-900 hover:bg-slate-700 active:bg-slate-800 text-white shadow-sm shadow-slate-500/20 border border-transparent',
  secondary:
    'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/80 shadow-xs',
  outline:
    'bg-transparent border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 active:bg-slate-100 text-slate-700 shadow-xs',
  ghost:
    'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-transparent',
  danger:
    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-500/20 border border-transparent',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-9 h-9 min-w-[36px] min-h-[36px] sm:min-w-[36px] sm:min-h-[36px] p-2 text-sm',
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
        whileTap={isDisabled ? undefined : { scale: 0.94 }}
        className={cn(
          'inline-flex items-center justify-center shrink-0 select-none relative cursor-pointer',
          tokens.transitions.normal,
          variant === 'danger' ? tokens.focus.ringDanger : tokens.focus.ring,
          isRounded ? 'rounded-full' : size === 'sm' ? 'rounded-lg' : 'rounded-xl',
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
