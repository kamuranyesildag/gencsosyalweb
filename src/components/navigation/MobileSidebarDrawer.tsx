import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileSidebar } from './MobileSidebar';

export function MobileSidebarDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

  return typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-[280px] max-w-[80vw] h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col transition-colors border-r border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-indigo-600 p-0.5 flex items-center justify-center text-white">
                  <Hexagon className="w-4 h-4 fill-white/20 stroke-white stroke-[2.2]" />
                </div>
                <span className="font-black text-[17px] tracking-tight text-slate-900 dark:text-white">Genç Sosyal</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Kapat"
                className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <MobileSidebar onItemClick={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;
}
