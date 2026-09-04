import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileSidebar } from './MobileSidebar';

export function MobileSidebarDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Mobil Gezinme Çekmecesi">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="relative w-[280px] max-w-[85vw] h-full bg-white dark:bg-[#0D121D] shadow-xl flex flex-col transition-colors border-r border-slate-200/80 dark:border-white/[0.08]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 h-[60px] border-b border-slate-200/80 dark:border-white/[0.08] shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-blue-600 p-0.5 flex items-center justify-center text-white shadow-xs">
                      <Hexagon className="w-4 h-4 fill-transparent stroke-white stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                      Genç Sosyal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Kapat"
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#161E2E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <MobileSidebar onItemClick={onClose} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;
}
