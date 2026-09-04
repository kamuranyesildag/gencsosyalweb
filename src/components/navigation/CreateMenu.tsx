import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { PenTool, Rocket, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { backdropVariants, bottomSheetVariants } from '../../lib/motion';

export function CreateMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs"
              />

              <motion.div
                variants={bottomSheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-sheet-title"
                className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-[#0D121D] rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-200/80 dark:border-white/[0.08] shadow-xl pb-[var(--sab,0px)] overflow-hidden max-h-[85vh] flex flex-col transition-colors"
              >
                {/* Drag Handle */}
                <div className="w-10 h-1 bg-slate-200 dark:bg-white/[0.12] rounded-full mx-auto my-2.5 shrink-0" />

                <div className="px-5 pb-6 pt-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3
                        id="create-sheet-title"
                        className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                      >
                        Yeni İçerik Oluştur
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Toplulukla paylaşmak istediğin türü seç
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Kapat"
                      className="flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#161E2E] text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Option 1: New Post */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/create')}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#161E2E]/60 hover:bg-slate-100 dark:hover:bg-[#161E2E] border border-slate-200/60 dark:border-white/[0.06] transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                        <PenTool className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Yeni Gönderi
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Düşüncelerini, sorularını veya güncellemelerini paylaş
                        </div>
                      </div>
                    </button>

                    {/* Option 2: New Project */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/settings?tab=projects')}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#161E2E]/60 hover:bg-slate-100 dark:hover:bg-[#161E2E] border border-slate-200/60 dark:border-white/[0.06] transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                        <Rocket className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Yeni Proje
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Portfolyona yeni bir proje, fikir veya prototip ekle
                        </div>
                      </div>
                    </button>

                    {/* Option 3: New Community */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/communities')}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#161E2E]/60 hover:bg-slate-100 dark:hover:bg-[#161E2E] border border-slate-200/60 dark:border-white/[0.06] transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                        <Users className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          Yeni Topluluk
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Ortak ilgi alanları ve çalışma grupları için topluluk kur
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;
}
