import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PenTool, Rocket, Users, X, Sparkles } from 'lucide-react';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          <motion.div
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-sheet-title"
            className="relative z-10 w-full bg-white rounded-t-3xl border-t border-slate-200/90 shadow-2xl pb-safe overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 shrink-0" />

            <div className="px-5 sm:px-6 pb-6 pt-1">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 id="create-sheet-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Yeni İçerik Oluştur
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toplulukla paylaşmak istediğin türü seç</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Kapat"
                  className="flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('/home')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 hover:border-slate-200 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <PenTool className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-base group-hover:text-slate-900 transition-colors">
                      Yeni Gönderi
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      Düşüncelerini, sorularını veya güncellemelerini paylaş
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/settings?tab=projects')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/70 hover:border-emerald-200 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Rocket className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      Yeni Proje
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      Portfolyona yeni bir proje, fikir veya prototip ekle
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('/communities')}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 hover:border-amber-200 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                      Yeni Topluluk
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">
                      Ortak ilgi alanları ve çalışma grupları için topluluk kur
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
