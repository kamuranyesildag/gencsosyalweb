import React from 'react';
import { cn } from '../../lib/utils';
import { tokens } from '../../lib/design-tokens';

export type CardVariant = 'default' | 'bordered' | 'flat' | 'elevated' | 'interactive';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-200/80 shadow-xs',
  bordered: 'bg-white border border-slate-200 shadow-none',
  flat: 'bg-slate-50/80 border border-slate-200/60 shadow-none',
  elevated: 'bg-white border border-slate-100 shadow-md shadow-slate-200/50',
  interactive:
    'bg-white border border-slate-200/80 shadow-xs md:hover:shadow-md md:hover:border-indigo-200/90 md:hover:-translate-y-0.5 cursor-pointer active:scale-[0.99] transition-all duration-200 ease-out',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
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
    <h3 className={cn('text-lg font-bold text-slate-900 tracking-tight leading-snug', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-500 font-normal leading-relaxed', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6 pt-0 sm:pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6 pt-2 sm:pt-3 border-t border-slate-100 flex items-center', className)} {...props} />;
}

