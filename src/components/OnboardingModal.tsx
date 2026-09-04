import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../context/useAuth";
import { Sparkles, Users, ArrowRight, X } from "lucide-react";
import { SuggestedUsers } from "./SuggestedUsers";

export function OnboardingModal() {
  const user = useAuthStore(state => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Only show if user is logged in, hasn't completed onboarding, and hasn't dismissed it in local session
    if (user && user.onboardingCompleted === false) {
      const hasDismissed = sessionStorage.getItem("onboardingDismissed");
      if (!hasDismissed) {
        setIsOpen(true);
      }
    }
  }, [user]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("onboardingDismissed", "true");
  };

  return typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
                  Hoş Geldin, {user?.displayName || user?.username}!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px] leading-relaxed mb-8">
                  Genç Sosyal'e katıldığın için çok mutluyuz. Topluluğu keşfetmen ve ilk etkileşimlerini başlatman için sana bazı önerilerimiz var.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2 group"
                >
                  <span>Başlayalım</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Takip Önerileri</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">İlginizi çekebilecek kişiler</p>
                  </div>
                </div>
                
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto mb-6 min-h-[300px]">
                  <SuggestedUsers onFollowChange={() => {
                    window.dispatchEvent(new Event("refreshOnboarding"));
                  }} />
                </div>

                <div className="flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:bg-slate-900 rounded-2xl transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Ana Sayfaya Git</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  ) : null;
}
