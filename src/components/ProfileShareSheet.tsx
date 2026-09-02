import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Share2, QrCode, Check, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "./ui/Toast";
import { Button } from "./ui/Button";

interface ProfileShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export function ProfileShareSheet({ isOpen, onClose, profile }: ProfileShareSheetProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowQR(false);
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const profileUrl = `${window.location.origin}/profile/${profile.username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profil bağlantısı panoya kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Bağlantı kopyalanamadı.");
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName || profile.username} | Genç Sosyal`,
          text: `${profile.displayName || profile.username} adlı kullanıcının Genç Sosyal profiline göz at!`,
          url: profileUrl,
        });
        onClose();
      } catch (err) {
        console.error("Paylaşım iptal edildi:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-x-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Profili Paylaş"
      >
        {/* Backdrop Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal / BottomSheet Content */}
        <motion.div
          initial={{ 
            y: "100%", 
            opacity: 0, 
            scale: 0.95 
          }}
          animate={{ 
            y: 0, 
            opacity: 1, 
            scale: 1 
          }}
          exit={{ 
            y: "100%", 
            opacity: 0, 
            scale: 0.95 
          }}
          transition={{ 
            type: "spring", 
            damping: 28, 
            stiffness: 320 
          }}
          className="relative w-full sm:max-w-md bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Mobile Drag Indicator */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {showQR && (
                <button
                  type="button"
                  onClick={() => setShowQR(false)}
                  aria-label="Geri"
                  className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                </button>
              )}
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {showQR ? "Profil QR Kodu" : "Profili Paylaş"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!showQR ? (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-3"
                >
                  {/* Copy Link Option */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-200/80 active:scale-[0.99] transition-all text-left group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-100/60 text-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm">
                        {copied ? "Bağlantı Kopyalandı!" : "Bağlantıyı Kopyala"}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {profileUrl}
                      </div>
                    </div>
                  </button>

                  {/* QR Code Option */}
                  <button
                    type="button"
                    onClick={() => setShowQR(true)}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-200/80 active:scale-[0.99] transition-all text-left group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-100/60 text-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm">QR Kod ile Paylaş</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Kamera ile okutulabilir QR kodu görüntüleyin
                      </div>
                    </div>
                  </button>

                  {/* Native Web Share Option */}
                  <button
                    type="button"
                    onClick={handleWebShare}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-200/80 active:scale-[0.99] transition-all text-left group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-100/60 text-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm">Sistem Paylaşımı</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Cihazınızın paylaşım menüsünü açın
                      </div>
                    </div>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="qr-view"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-md mb-4 inline-block">
                    <QRCodeSVG
                      value={profileUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                      className="rounded-xl"
                    />
                  </div>

                  <p className="text-slate-600 font-medium text-xs sm:text-sm mb-6 max-w-xs leading-relaxed">
                    Kamera veya QR okuyucu ile taratarak{" "}
                    <span className="font-bold text-slate-900">@{profile.username}</span> profiline
                    ulaşabilirsiniz.
                  </p>

                  <div className="w-full flex gap-3">
                    <Button
                      variant="secondary"
                      size="md"
                      className="flex-1"
                      onClick={() => setShowQR(false)}
                    >
                      Geri
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1 font-bold"
                      leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      onClick={handleCopy}
                    >
                      {copied ? "Kopyalandı" : "Kopyala"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
