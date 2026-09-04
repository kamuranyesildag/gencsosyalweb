import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../lib/design-tokens';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'verified'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  isPill?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
  default: {
    bg: 'bg-slate-100 dark:bg-[#161E2E] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]',
    dot: 'bg-slate-500',
  },
  neutral: {
    bg: 'bg-slate-100 dark:bg-[#161E2E] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]',
    dot: 'bg-slate-500',
  },
  primary: {
    bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/40',
    dot: 'bg-blue-500',
  },
  brand: {
    bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/40',
    dot: 'bg-blue-500',
  },
  secondary: {
    bg: 'bg-slate-100 dark:bg-[#161E2E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]',
    dot: 'bg-slate-400',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/40',
    dot: 'bg-rose-500',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-800/40',
    dot: 'bg-sky-500',
  },
  verified: {
    bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40 font-semibold',
    dot: 'bg-blue-500',
  },
  outline: {
    bg: 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/[0.14]',
    dot: 'bg-slate-400',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] font-semibold px-2 py-0.5 gap-1',
  md: 'text-xs font-semibold px-2.5 py-0.5 gap-1.5',
  lg: 'text-sm font-semibold px-3 py-1 gap-2',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      icon,
      isPill = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const currentVariant = variantStyles[variant] || variantStyles.default;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border font-medium whitespace-nowrap select-none shrink-0 transition-colors',
          isPill ? tokens.radius.pill : tokens.radius.sm,
          currentVariant.bg,
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {variant === 'verified' && !icon && (
          <span className="inline-flex shrink-0 items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-600 text-white mr-0.5">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        )}
        {dot && (
          <span
            className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', currentVariant.dot)}
            aria-hidden="true"
          />
        )}
        {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';
