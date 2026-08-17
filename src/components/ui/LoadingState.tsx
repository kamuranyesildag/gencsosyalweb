import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

export function Spinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  return <Loader2 className={cn('animate-spin text-indigo-600', sizes[size], className)} aria-hidden="true" />;
}

export function LoadingState({
  text = 'Yükleniyor...',
  size = 'md',
  fullPage = false,
  className,
}: LoadingStateProps) {
  const sizeConfig = {
    sm: { spinner: 'w-5 h-5', text: 'text-xs' },
    md: { spinner: 'w-8 h-8', text: 'text-sm' },
    lg: { spinner: 'w-12 h-12', text: 'text-base' },
  };

  const config = sizeConfig[size];

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-6 select-none', className)}>
      <div className="relative flex items-center justify-center">
        <Loader2 className={cn('animate-spin text-indigo-600', config.spinner)} aria-hidden="true" />
      </div>
      {text && (
        <p className={cn('font-medium text-slate-500 tracking-wide', config.text)}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingOverlay({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-30 rounded-inherit',
        className
      )}
    >
      <LoadingState text={text} size="md" />
    </div>
  );
}
