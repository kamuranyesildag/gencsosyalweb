import React from 'react';
import { AlertCircle, RotateCcw, WifiOff, FileQuestion, ServerCrash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export type ErrorVariant = 'generic' | 'network' | 'not-found' | 'server';

export interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  fullPage?: boolean;
  className?: string;
}

const variantDefaults: Record<
  ErrorVariant,
  { icon: React.ComponentType<{ className?: string }>; title: string; message: string }
> = {
  generic: {
    icon: AlertCircle,
    title: 'Bir şeyler ters gitti',
    message: 'İçerik yüklenirken veya işlem gerçekleştirilirken beklenmeyen bir hata oluştu.',
  },
  network: {
    icon: WifiOff,
    title: 'Bağlantı hatası',
    message: 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
  },
  'not-found': {
    icon: FileQuestion,
    title: 'İçerik bulunamadı',
    message: 'Aradığınız sayfa veya içerik mevcut değil, taşınmış ya da silinmiş olabilir.',
  },
  server: {
    icon: ServerCrash,
    title: 'Sunucu hatası',
    message: 'Sunucularımızda geçici bir sorun yaşanıyor. Lütfen biraz sonra tekrar deneyin.',
  },
};

export function ErrorState({
  variant = 'generic',
  title,
  message,
  onRetry,
  retryLabel = 'Tekrar Dene',
  secondaryAction,
  fullPage = false,
  className,
}: ErrorStateProps) {
  const defaults = variantDefaults[variant] || variantDefaults.generic;
  const displayTitle = title || defaults.title;
  const displayMessage = message || defaults.message;
  const Icon = defaults.icon;

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-3xl bg-rose-50/40 border border-rose-100 max-w-md mx-auto my-4',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>

      <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
        {displayTitle}
      </h4>

      <p className="text-sm text-slate-600 leading-relaxed mb-6">
        {displayMessage}
      </p>

      {(onRetry || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <Button
              variant="danger"
              size="md"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="secondary"
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

  if (fullPage) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
