import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { X, Hexagon, Sparkles, Heart, MessageCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuthModalStore } from '../../context/useAuthModal';
import { useAuthStore } from '../../context/useAuth';
import { Button } from '../ui/Button';

export function LoginBottomSheet() {
  const { isOpen, closeModal } = useAuthModalStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, closeModal]);

  if (isAuthenticated) return null;

  return typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Bottom Sheet / Centered Dialog */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-md bg-white dark:bg-slate-950 rounded-t-[28px] sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle for Mobile */}
            <div className="pt-3 pb-1 flex justify-center items-center sm:hidden">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>

            {/* Header / Close button */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100">
                  <Hexagon className="w-4 h-4 fill-current" />
                </div>
                <span>Genç Sosyal</span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-900 transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 flex flex-col">
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                Topluluğa katıl, deneyimi kaçırma!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Beğenmek, yorum yapmak, projelerini paylaşmak ve diğer gençlerle bağlantı kurmak için hesabına giriş yap veya anında kaydol.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 gap-2.5 my-5 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center shrink-0">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span>Gönderilerle etkileşime geç ve kaydet</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>Kendi projelerini ve fikirlerini paylaş</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <span>Üretici topluluklarla doğrudan iletişim kur</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<LogIn className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    closeModal();
                    navigate('/login');
                  }}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => {
                    closeModal();
                    navigate('/register');
                  }}
                >
                  Ücretsiz Hesap Oluştur
                </Button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4 mb-1">
                Devam ederek Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;
}
