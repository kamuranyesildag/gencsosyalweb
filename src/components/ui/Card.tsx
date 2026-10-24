import React from 'react';
import { cn } from '../../lib/utils';
import { tokens } from '../../lib/design-tokens';

export type CardVariant = 'default' | 'bordered' | 'flat' | 'elevated' | 'interactive' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white dark:bg-[#0B1329] border border-slate-200/80 dark:border-white/[0.07] shadow-xs',
  bordered:
    'bg-white dark:bg-[#0B1329] border border-slate-200 dark:border-white/[0.10] shadow-none',
  flat:
    'bg-slate-50 dark:bg-[#101C38]/60 border border-slate-200/60 dark:border-white/[0.05] shadow-none',
  elevated:
    'bg-white dark:bg-[#0E1730] border border-slate-200/80 dark:border-white/[0.08] shadow-md dark:shadow-black/40',
  interactive:
    'bg-white dark:bg-[#0B1329] border border-slate-200/80 dark:border-white/[0.07] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.14] cursor-pointer transition-all duration-150 ease-out',
  glass:
    'bg-white/90 dark:bg-[#0B1329]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] shadow-xs',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3.5',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'none', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden transition-all',
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6 pb-2 sm:pb-3 flex flex-col space-y-1.5', className)} {...props} />;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-snug', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6 pt-0 sm:pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6 pt-2 sm:pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center', className)} {...props} />;
}
