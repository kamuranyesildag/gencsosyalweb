import React from 'react';
import { Sparkles } from 'lucide-react';
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
        'flex flex-col items-center justify-center text-center p-6 sm:p-12 rounded-3xl bg-slate-50/70 border border-dashed border-slate-200/90 my-4',
        className
      )}
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-900 mb-4 shadow-xs">
        {icon || <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />}
      </div>

      <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 max-w-md">
        {title}
      </h4>

      {description && (
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-4 sm:mb-6">
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
