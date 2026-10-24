import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Check, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { triggerHaptic } from "../../utils/haptics";

export interface InfoModalFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeText?: string;
  title: string;
  subtitle?: string;
  features?: InfoModalFeature[];
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  bannerImages?: string[];
  children?: React.ReactNode;
}

export function InfoModal({
  isOpen,
  onClose,
  badgeText,
  title,
  subtitle,
  features,
  primaryActionLabel = "Anlaşıldı",
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  bannerImages,
  children,
}: InfoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            style={{ willChange: "opacity" }}
          />

          {/* Modal / Sheet Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ willChange: "transform, opacity" }}
            className={cn(
              "relative w-full max-w-lg bg-[#0F172A] text-white border border-white/10 shadow-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] transition-colors"
            )}
          >
            {/* Sheet Handle Bar (Mobile) */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                onClose();
              }}
              aria-label="Kapat"
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Graphic Banner Section (Overlapping Collage Style) */}
            <div className="relative w-full pt-6 px-6 pb-2 overflow-hidden flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/25 via-indigo-600/10 to-transparent blur-xl pointer-events-none" />

              <div className="relative w-full max-w-sm h-36 sm:h-40 flex items-center justify-center gap-2 select-none">
                {/* Left Floating Card */}
                <motion.div
                  initial={{ rotate: -8, x: -10, scale: 0.9, opacity: 0 }}
                  animate={{ rotate: -8, x: -10, scale: 0.9, opacity: 0.85 }}
                  transition={{ delay: 0.08, duration: 0.25 }}
                  className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-800 shrink-0 transform -rotate-6"
                >
                  <img
                    src={bannerImages?.[0] || "/assets/aistudio/Screenshot_2026-10-24-15-22-43-673_com.google.android.googlequicksearchbox_78ec8124.jpg"}
                    alt="Banner graphic left"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Center Hero Card */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.03, duration: 0.25 }}
                  className="w-32 sm:w-36 h-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-blue-400/60 shadow-2xl bg-slate-900 shrink-0 z-10"
                >
                  <img
                    src={bannerImages?.[1] || bannerImages?.[0] || "/assets/aistudio/Screenshot_2026-10-24-15-22-43-673_com.google.android.googlequicksearchbox_78ec8124.jpg"}
                    alt="Banner graphic center"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Right Floating Card */}
                <motion.div
                  initial={{ rotate: 8, x: 10, scale: 0.9, opacity: 0 }}
                  animate={{ rotate: 8, x: 10, scale: 0.9, opacity: 0.85 }}
                  transition={{ delay: 0.12, duration: 0.25 }}
                  className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-slate-800 shrink-0 transform rotate-6"
                >
                  <img
                    src={bannerImages?.[2] || bannerImages?.[0] || "/assets/aistudio/Screenshot_2026-10-24-15-22-43-673_com.google.android.googlequicksearchbox_78ec8124.jpg"}
                    alt="Banner graphic right"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6 flex flex-col text-center">
              {badgeText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mx-auto mb-2 border border-blue-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{badgeText}</span>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-2">
                {title}
              </h2>

              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-4 max-w-md mx-auto">
                  {subtitle}
                </p>
              )}

              {/* Feature List */}
              {features && features.length > 0 && (
                <div className="space-y-3 text-left my-2 bg-white/[0.04] border border-white/[0.08] p-4 rounded-2xl">
                  {features.map((feat, idx) => {
                    const Icon = feat.icon || Check;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                            {feat.title}
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-400 leading-normal mt-0.5">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {children}

              {/* Action Buttons */}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    if (onPrimaryAction) onPrimaryAction();
                    else onClose();
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{primaryActionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {secondaryActionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      if (onSecondaryAction) onSecondaryAction();
                      else onClose();
                    }}
                    className="w-full py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {secondaryActionLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
