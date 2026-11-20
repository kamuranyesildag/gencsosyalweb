import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from 'motion/react';
import { MobileSidebar } from './MobileSidebar';

const G_PATH = 'M 78 28 A 36 36 0 1 0 85 52 L 52 52';

export function MobileSidebarDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

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

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -75 || info.velocity.x < -380) {
      onClose();
    }
  };

  return typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed inset-0 z-[9980] flex md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobil Gezinme Menüsü"
            >
              {/* Frosted Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                aria-hidden="true"
              />

              {/* Modern Floating Rounded Sheet Drawer (swipe left to close) */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
                animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.14 }
                    : { type: 'spring', stiffness: 360, damping: 32, mass: 0.85 }
                }
                drag={shouldReduceMotion ? false : 'x'}
                dragConstraints={{ left: -320, right: 0 }}
                dragElastic={{ left: 0.08, right: 0 }}
                onDragEnd={handleDragEnd}
                className="relative w-[308px] max-w-[86vw] h-full bg-white/98 dark:bg-[#0B1329]/98 backdrop-blur-2xl rounded-r-[28px] shadow-[20px_0_60px_-15px_rgba(15,23,42,0.28)] dark:shadow-[20px_0_60px_-15px_rgba(0,0,0,0.75)] flex flex-col border-r border-slate-200/80 dark:border-white/[0.09] overflow-hidden pt-safe"
              >
                {/* Top Brand Header */}
                <div className="flex items-center justify-between px-4 h-[62px] border-b border-slate-100 dark:border-white/[0.07] shrink-0 bg-gradient-to-r from-blue-50/60 via-transparent to-transparent dark:from-blue-950/25">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#111B33] border border-slate-200/90 dark:border-white/10 shadow-xs flex items-center justify-center shrink-0">
                      <svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                        <path d={G_PATH} stroke="#2563EB" strokeWidth="15" strokeLinecap="butt" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-[15.5px] tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                        Genç <span className="text-blue-600 dark:text-blue-400">Sosyal</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-tight truncate">
                        Genç Üretici Platformu
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Menüyü kapat"
                    className="flex items-center justify-center w-11 h-11 -mr-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.08] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 min-h-0 flex flex-col">
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
