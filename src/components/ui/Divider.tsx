import React from 'react';
import { cn } from '../../lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: React.ReactNode;
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px self-stretch bg-slate-200 dark:bg-slate-800/80 my-1', className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn('relative flex items-center justify-center my-4 w-full', className)}
        {...props}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800/80" />
        </div>
        <span className="relative px-3 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('h-px w-full bg-slate-200 dark:bg-slate-800/80 my-3', className)}
      {...props}
    />
  );
}
