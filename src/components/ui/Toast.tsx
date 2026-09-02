import React from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toastVariants } from '../../lib/motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastOptions {
  title?: string;
  duration?: number;
  action?: ToastMessage['action'];
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType, options?: ToastOptions | number) => void;
  removeToast: (id: string) => void;
}

// Deduping cache: tracks message -> timestamp to avoid spamming
const recentToasts = new Map<string, number>();
const DEDUPE_INTERVAL_MS = 2000;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type, options) => {
    const now = Date.now();
    const key = `${type}:${message}`;
    const lastFired = recentToasts.get(key);

    if (lastFired && now - lastFired < DEDUPE_INTERVAL_MS) {
      // Ignore duplicate toast within cooldown
      return;
    }
    recentToasts.set(key, now);

    // Clean up old dedupe keys periodically
    if (recentToasts.size > 50) {
      for (const [k, time] of recentToasts.entries()) {
        if (now - time > 10000) recentToasts.delete(k);
      }
    }

    const opts: ToastOptions =
      typeof options === 'number'
        ? { duration: options }
        : options || {};

    const duration = opts.duration ?? (type === 'error' ? 5500 : 4000);
    const id = Math.random().toString(36).substring(2, 9);

    set((state) => {
      // Limit visible toasts on screen to 4 maximum
      const existing = state.toasts.slice(-3);
      return {
        toasts: [
          ...existing,
          {
            id,
            title: opts.title,
            message,
            type,
            duration,
            action: opts.action,
          },
        ],
      };
    });

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (msg: string, options?: ToastOptions | number, action?: ToastMessage['action']) => {
    const opts = typeof options === 'number' ? { duration: options, action } : options;
    useToastStore.getState().addToast(msg, 'success', opts);
  },
  error: (msg: string, options?: ToastOptions | number, action?: ToastMessage['action']) => {
    const opts = typeof options === 'number' ? { duration: options, action } : options;
    useToastStore.getState().addToast(msg, 'error', opts);
  },
  warning: (msg: string, options?: ToastOptions | number, action?: ToastMessage['action']) => {
    const opts = typeof options === 'number' ? { duration: options, action } : options;
    useToastStore.getState().addToast(msg, 'warning', opts);
  },
  info: (msg: string, options?: ToastOptions | number, action?: ToastMessage['action']) => {
    const opts = typeof options === 'number' ? { duration: options, action } : options;
    useToastStore.getState().addToast(msg, 'info', opts);
  },
};

const toastConfig: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    border: string;
    iconColor: string;
    iconBg: string;
    defaultTitle: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-200/90',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    defaultTitle: 'Başarılı',
  },
  error: {
    icon: AlertCircle,
    border: 'border-rose-200/90',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    defaultTitle: 'Bir sorun oluştu',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-200/90',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    defaultTitle: 'Dikkat',
  },
  info: {
    icon: Info,
    border: 'border-sky-200/90',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
    defaultTitle: 'Bilgi',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-label="Bildirimler"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => {
          const config = toastConfig[t.type] || toastConfig.info;
          const Icon = config.icon;
          const title = t.title;

          return (
            <motion.div
              key={t.id}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-slate-900/10 border text-slate-800 bg-white select-none',
                config.border
              )}
            >
              <div className={cn('shrink-0 w-8 h-8 rounded-xl flex items-center justify-center', config.iconBg)}>
                <Icon className={cn('w-4.5 h-4.5', config.iconColor)} aria-hidden="true" />
              </div>

              <div className="flex-1 text-sm leading-snug break-words pt-0.5">
                {title && <p className="font-bold text-slate-900 mb-0.5 text-sm">{title}</p>}
                <p className={cn('text-slate-600', !title && 'font-medium text-slate-800')}>{t.message}</p>
              </div>

              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="shrink-0 text-xs font-bold text-slate-900 hover:text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {t.action.label}
                </button>
              )}

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Bildirimi kapat"
                className="shrink-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
