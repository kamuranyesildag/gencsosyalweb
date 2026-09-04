import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, BadgeCheck, ShieldAlert, Clock, CheckCircle2, Circle } from "lucide-react";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useNavigate } from "react-router";

export function VerificationBottomSheet({ isOpen, onClose, targetUser }: { isOpen: boolean; onClose: () => void; targetUser?: { username: string; isVerified: boolean } }) {
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
        .catch(() => {
          setStatus("none");
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
        <div className="py-6 flex flex-col items-center text-center">
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
        <div className="py-4 flex flex-col">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Başvuru İnceleniyor</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Mavi tik başvurunuz ekibimiz tarafından değerlendiriliyor.
            </p>
          </div>

          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent mt-2">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-6">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:p-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Başvuru Alındı</h4>
                <p className="text-xs text-slate-500 mt-1">Gerekli belgeler ve bilgiler sistemimize ulaştı.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-6">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 bg-amber-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Loader2 className="w-3 h-3 animate-spin" />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:p-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Ekip İncelemesi</h4>
                <p className="text-xs text-slate-500 mt-1">Topluluk yöneticilerimiz kriterleri kontrol ediyor.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Circle className="w-2 h-2 fill-current" />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:p-0">
                <h4 className="font-bold text-slate-400 text-sm">Karar Aşaması</h4>
                <p className="text-xs text-slate-400 mt-1">İnceleme sonucuna göre mavi tik tanımlanacak.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Başvuru Onaylanmadı</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-[280px]">
            Gerekli doğrulama kriterlerini sağlamadığınız için başvurunuz maalesef onaylanmadı.
          </p>
          <button
            onClick={() => { onClose(); navigate('/settings?tab=verification'); }}
            className="mt-6 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl py-3 transition-colors"
          >
            Eksikleri Giderip Tekrar Başvur
          </button>
        </div>
      );
    }

    return (
      <div className="py-4 flex flex-col">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <BadgeCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mavi Tik Alın</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Gerçek kişi veya marka olduğunuzu kanıtlayın.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-[11px] uppercase tracking-wider">Nasıl Alınır?</h4>
          <ul className="space-y-3.5">
            <li className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Profil bilgilerinizi (fotoğraf, bio) eksiksiz doldurun.</span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Topluluk kurallarına uygun paylaşımlar yapın.</span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Ayarlar &gt; Doğrulama menüsünden formu gönderin.</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={() => { onClose(); navigate('/settings?tab=verification'); }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3.5 transition-transform active:scale-[0.98] shadow-md shadow-blue-500/20"
        >
          Doğrulama Talebi Oluştur
        </button>
      </div>
    );
  };

  return typeof document !== "undefined" ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="absolute top-4 right-4 z-10 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur">
              <button
                onClick={onClose}
                aria-label="Kapat"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;
}
