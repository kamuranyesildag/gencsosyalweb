import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { backdropVariants, sheetVariants } from '../../lib/motion';

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
  maxHeight = 'max-h-[88vh] sm:max-h-[85vh]',
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

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop with dark blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md z-[9999]"
          />

          {/* Bottom Sheet Card */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'bottom-sheet-title' : undefined}
            className={cn(
              'relative w-full sm:max-w-lg bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#020408] text-slate-100 backdrop-blur-2xl rounded-t-[32px] sm:rounded-3xl border border-white/15 shadow-2xl shadow-black/80 overflow-hidden flex flex-col z-[10000]',
              maxHeight,
              className
            )}
          >
            {/* Grab Handle */}
            <div className="pt-3.5 pb-1 flex justify-center items-center shrink-0">
              <div className="w-12 h-1.5 bg-white/20 hover:bg-white/35 transition-colors rounded-full cursor-grab active:cursor-grabbing" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-6 pt-2 pb-3.5 border-b border-white/10 shrink-0">
                <div className="flex flex-col space-y-0.5 pr-4">
                  {title && (
                    <h3 id="bottom-sheet-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Kapat"
                    className="p-2 -mr-2 -mt-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all shrink-0 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto flex-1 text-slate-200 min-h-0">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
