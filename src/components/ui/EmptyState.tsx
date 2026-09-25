import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 sm:p-10 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/[0.06] my-4',
        className
      )}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3.5 shadow-xs">
        {icon || <Inbox className="w-6 h-6 stroke-[1.75]" />}
      </div>

      <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 max-w-md tracking-tight">
        {title}
      </h4>

      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-4 sm:mb-6">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant="primary"
              size="md"
              leftIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="ghost"
              size="md"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
