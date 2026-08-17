import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
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
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    dot: 'bg-indigo-600',
  },
  primary: {
    bg: 'bg-indigo-600 text-white border-transparent',
    dot: 'bg-white',
  },
  secondary: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
  success: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
  info: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
    dot: 'bg-sky-500',
  },
  verified: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-bold',
    dot: 'bg-indigo-600',
  },
  outline: {
    bg: 'bg-transparent text-slate-700 border-slate-300',
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
    const currentVariant = variantStyles[variant];

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border font-medium whitespace-nowrap select-none shrink-0 transition-colors',
          isPill ? 'rounded-full' : 'rounded-md',
          currentVariant.bg,
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {variant === 'verified' && !icon && (
          <span className="inline-flex shrink-0 items-center justify-center w-3.5 h-3.5 rounded-full bg-indigo-600 text-white mr-0.5">
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
