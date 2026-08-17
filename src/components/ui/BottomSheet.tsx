import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { backdropVariants, bottomSheetVariants } from '../../lib/motion';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  maxHeight?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className,
  maxHeight = 'max-h-[85vh]',
}: BottomSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          {/* Bottom Sheet Card */}
          <motion.div
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'bottom-sheet-title' : undefined}
            className={cn(
              'relative w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col z-10',
              maxHeight,
              className
            )}
          >
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center items-center sm:hidden">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-5 pt-3 pb-3 border-b border-slate-100">
                <div className="flex flex-col space-y-0.5 pr-4">
                  {title && (
                    <h3 id="bottom-sheet-title" className="text-lg font-bold text-slate-900 tracking-tight">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs sm:text-sm text-slate-500 font-normal">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Kapat"
                    className="p-2 -mr-2 -mt-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-5 py-4 overflow-y-auto flex-1 text-slate-700">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
