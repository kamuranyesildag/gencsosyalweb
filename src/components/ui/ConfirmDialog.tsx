import React, { useEffect } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button, type ButtonVariant } from './Button';
import { backdropVariants, modalVariants } from '../../lib/motion';
import { cn } from '../../lib/utils';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  showConfirm: (
    titleOrOptions: string | ConfirmDialogOptions,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmDialogState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Onayla',
  cancelLabel: 'İptal',
  variant: 'danger',
  onConfirm: () => {},
  onCancel: () => {},
  showConfirm: (titleOrOptions, message = '', onConfirm = () => {}, onCancel = () => {}) => {
    if (typeof titleOrOptions === 'object') {
      set({
        isOpen: true,
        title: titleOrOptions.title,
        message: titleOrOptions.message,
        confirmLabel: titleOrOptions.confirmLabel || 'Onayla',
        cancelLabel: titleOrOptions.cancelLabel || 'İptal',
        variant: titleOrOptions.variant || 'danger',
        onConfirm,
        onCancel,
      });
    } else {
      set({
        isOpen: true,
        title: titleOrOptions,
        message,
        confirmLabel: 'Onayla',
        cancelLabel: 'İptal',
        variant: 'danger',
        onConfirm,
        onCancel,
      });
    }
  },
  close: () => set({ isOpen: false }),
}));

export const confirmDialog = (
  titleOrOptions: string | ConfirmDialogOptions,
  message?: string
): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    useConfirmStore.getState().showConfirm(
      titleOrOptions,
      message,
      () => {
        useConfirmStore.getState().close();
        resolve(true);
      },
      () => {
        useConfirmStore.getState().close();
        resolve(false);
      }
    );
  });
};

export interface DeclarativeConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Onayla',
  cancelLabel = 'İptal',
  variant = 'danger',
  isLoading = false,
}: DeclarativeConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  const buttonVariant: ButtonVariant =
    variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => {
              if (!isLoading) onClose();
            }}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="relative w-full sm:max-w-md bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#020408] text-white rounded-t-[32px] sm:rounded-3xl border border-white/15 shadow-2xl shadow-black/90 overflow-hidden z-10 p-5 sm:p-6"
          >
            {/* Grab Handle */}
            <div className="pt-1 pb-3 flex justify-center items-center sm:hidden">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div
                className={cn(
                  'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
                  variant === 'danger'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : variant === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/10 text-white border border-white/15'
                )}
              >
                {variant === 'danger' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 id="confirm-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {title}
                </h3>
                <p id="confirm-desc" className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-1">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="md"
                disabled={isLoading}
                onClick={onClose}
                className="rounded-xl border-white/20 text-slate-200 hover:bg-white/10"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={buttonVariant}
                size="md"
                isLoading={isLoading}
                onClick={onConfirm}
                className="rounded-xl"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialogContainer() {
  const { isOpen, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel, close } =
    useConfirmStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
        close();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel, close]);

  const buttonVariant: ButtonVariant =
    variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => {
              onCancel();
              close();
            }}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="relative w-full sm:max-w-md bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#020408] text-white rounded-t-[32px] sm:rounded-3xl border border-white/15 shadow-2xl shadow-black/90 overflow-hidden z-10 p-5 sm:p-6"
          >
            {/* Grab Handle */}
            <div className="pt-1 pb-3 flex justify-center items-center sm:hidden">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div
                className={cn(
                  'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
                  variant === 'danger'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : variant === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/10 text-white border border-white/15'
                )}
              >
                {variant === 'danger' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 id="confirm-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {title}
                </h3>
                <p id="confirm-desc" className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-1">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  onCancel();
                  close();
                }}
                className="rounded-xl border-white/20 text-slate-200 hover:bg-white/10"
              >
                {cancelLabel || 'İptal'}
              </Button>
              <Button
                variant={buttonVariant}
                size="md"
                onClick={() => {
                  onConfirm();
                  close();
                }}
                className="rounded-xl"
              >
                {confirmLabel || 'Onayla'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
