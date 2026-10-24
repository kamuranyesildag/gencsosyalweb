import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

export interface InfoModalFeature {
  icon?: React.ComponentType<{ className?: string }>;
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
  children?: React.ReactNode;
  className?: string;
}

export function InfoModal({
  isOpen,
  onClose,
  badgeText = "Aşamalı Doğrulama",
  title,
  subtitle,
  features,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  className,
}: InfoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative w-full sm:max-w-lg bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#020408] text-white backdrop-blur-2xl rounded-t-[32px] sm:rounded-3xl border border-white/15 shadow-2xl shadow-black/90 overflow-hidden flex flex-col z-[10000] max-h-[88vh] sm:max-h-[85vh]",
              className
            )}
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Grab Handle for Mobile */}
            <div className="pt-3 pb-1 flex justify-center items-center sm:hidden shrink-0">
              <div className="w-12 h-1.5 bg-white/20 hover:bg-white/35 transition-colors rounded-full" />
            </div>

            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="absolute top-3.5 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
              {/* Badge & Title Block */}
              <div className="text-center space-y-2 pt-1">
                {badgeText && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{badgeText}</span>
                  </div>
                )}
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Features List */}
              {features && features.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  {features.map((feat, fIdx) => {
                    const Icon = feat.icon || ShieldCheck;
                    return (
                      <div key={fIdx} className="flex items-start gap-3">
                        <div className="w-9.5 h-9.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {feat.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-normal mt-0.5">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Custom Children */}
              {children}
            </div>

            {/* Fixed Footer Action Buttons */}
            {(primaryActionLabel || secondaryActionLabel) && (
              <div className="p-4 sm:p-5 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-2.5 shrink-0">
                {secondaryActionLabel && (
                  <button
                    type="button"
                    onClick={onSecondaryAction || onClose}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    {secondaryActionLabel}
                  </button>
                )}
                {primaryActionLabel && (
                  <button
                    type="button"
                    onClick={onPrimaryAction || onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{primaryActionLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
