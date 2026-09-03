import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, BadgeCheck, ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useNavigate } from "react-router";

export function VerificationBottomSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"none" | "pending" | "under_review" | "approved" | "rejected">("none");

  useEffect(() => {
    if (isOpen) {
      if (user?.isVerified) {
        setStatus("approved");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      fetchApi("/verification/me")
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data.length > 0) {
            const active = json.data.find((r: any) => r.status === "pending" || r.status === "under_review");
            if (active) {
              setStatus(active.status);
            } else {
              const rejected = json.data.find((r: any) => r.status === "rejected");
              if (rejected) {
                setStatus("rejected");
              } else {
                setStatus("none");
              }
            }
          } else {
            setStatus("none");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, user?.isVerified]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Durum kontrol ediliyor...</p>
        </div>
      );
    }

    if (status === "approved" || user?.isVerified) {
      return (
        <div className="py-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full" />
            <BadgeCheck className="w-24 h-24 text-white fill-blue-500 relative z-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Doğrulanmış Hesap</h3>
          <p className="text-slate-600 dark:text-slate-300 max-w-[280px]">
            Bu hesap Genç Sosyal tarafından onaylanmıştır. Tanınmış bir kişi veya markayı temsil eder.
          </p>
        </div>
      );
    }

    if (status === "pending" || status === "under_review") {
      return (
        <div className="py-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Başvuru İnceleniyor</h3>
          <p className="text-slate-600 dark:text-slate-300 max-w-[280px]">
            Doğrulama başvurunuz ekibimiz tarafından değerlendiriliyor. Lütfen sonucu bekleyin.
          </p>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="py-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Başvuru Onaylanmadı</h3>
          <p className="text-slate-600 dark:text-slate-300 max-w-[280px]">
            Gerekli kriterleri sağlamadığınız için başvurunuz onaylanmadı.
          </p>
          <button
            onClick={() => { onClose(); navigate('/settings?tab=verification'); }}
            className="mt-6 font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Yeniden Başvur <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <BadgeCheck className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mavi Tik Alın</h3>
        <p className="text-slate-600 dark:text-slate-300 max-w-[280px] mb-8">
          Gerçek kişi veya tanınmış bir marka olduğunuzu kanıtlayın, güven kazanın.
        </p>
        <button
          onClick={() => { onClose(); navigate('/settings?tab=verification'); }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl py-4 transition-transform active:scale-[0.98] shadow-lg shadow-blue-500/25"
        >
          Hemen Başvur
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                aria-label="Kapat"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
