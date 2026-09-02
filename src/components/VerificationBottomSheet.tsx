import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Loader2, UserCircle, Search, ShieldCheck, XCircle, ArrowRight } from "lucide-react";
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

  const getStageState = (stage: number) => {
    if (status === "none") return "idle";
    
    if (status === "pending") {
      if (stage === 1) return "active";
      return "idle";
    }
    if (status === "under_review") {
      if (stage === 1) return "completed";
      if (stage === 2) return "active";
      return "idle";
    }
    if (status === "approved") {
      if (stage === 1) return "completed";
      if (stage === 2) return "completed";
      if (stage === 3) return "active";
    }
    if (status === "rejected") {
      if (stage === 1) return "completed";
      if (stage === 2) return "completed";
      if (stage === 3) return "rejected";
    }
    return "idle";
  };

  const stage1 = getStageState(1);
  const stage2 = getStageState(2);
  const stage3 = getStageState(3);

  let desc = "Mavi tik için başvuru yapabilirsiniz.";
  if (status === "pending") desc = "Doğrulama başvurunuz başarıyla oluşturuldu.";
  if (status === "under_review") desc = "Başvurunuz Genç Sosyal doğrulama ekibi tarafından inceleniyor.";
  if (status === "approved") desc = "Bu hesap doğrulama sürecini başarıyla tamamladı.";
  if (status === "rejected") desc = "Doğrulama başvurusu onaylanmadı.";

  let btnText = "Doğrulanmış Hesap Başvurusu Yap";
  if (status === "pending") btnText = "Başvurun Bekliyor";
  if (status === "under_review") btnText = "Başvurun İnceleniyor";
  if (status === "approved") btnText = "Başvurunuz Onaylandı";
  if (status === "rejected") btnText = "Tekrar Başvuru Yap";

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
      />
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto text-white flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold tracking-tight text-white">Bu hesap hakkında</h2>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex-1 flex flex-col items-center">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="w-full">
              <div className="relative flex items-center justify-between w-full max-w-[280px] mx-auto mb-10">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-in-out ${stage1 === 'completed' ? (stage2 === 'completed' ? 'w-full' : 'w-1/2') : 'w-0'}`} />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`flex items-center justify-center rounded-full transition-all duration-500 ${
                    stage1 === 'active' ? 'w-14 h-14 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110' :
                    stage1 === 'completed' ? 'w-10 h-10 bg-blue-500' :
                    'w-10 h-10 bg-slate-800'
                  }`}>
                    {stage1 === 'completed' ? <Check className="w-5 h-5 text-white" /> : <UserCircle className={`w-5 h-5 ${stage1 === 'active' ? 'text-white' : 'text-slate-400'}`} />}
                  </div>
                  <span className={`text-xs font-bold ${stage1 === 'active' ? 'text-white' : 'text-slate-400'}`}>Başvuran</span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`flex items-center justify-center rounded-full transition-all duration-500 ${
                    stage2 === 'active' ? 'w-14 h-14 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110' :
                    stage2 === 'completed' ? 'w-10 h-10 bg-blue-500' :
                    'w-10 h-10 bg-slate-800'
                  }`}>
                    {stage2 === 'completed' ? <Check className="w-5 h-5 text-white" /> : <Search className={`w-5 h-5 ${stage2 === 'active' ? 'text-white' : 'text-slate-400'}`} />}
                  </div>
                  <span className={`text-xs font-bold ${stage2 === 'active' ? 'text-white' : 'text-slate-400'}`}>İnceleniyor</span>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`flex items-center justify-center rounded-full transition-all duration-500 ${
                    stage3 === 'active' ? 'w-14 h-14 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110' :
                    stage3 === 'rejected' ? 'w-14 h-14 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110' :
                    stage3 === 'completed' ? 'w-10 h-10 bg-emerald-500' :
                    'w-10 h-10 bg-slate-800'
                  }`}>
                    {stage3 === 'active' || stage3 === 'completed' ? <ShieldCheck className="w-6 h-6 text-white" /> : 
                     stage3 === 'rejected' ? <XCircle className="w-6 h-6 text-white" /> : 
                     <ShieldCheck className="w-5 h-5 text-slate-400" />}
                  </div>
                  <span className={`text-xs font-bold ${stage3 === 'active' ? 'text-emerald-400' : stage3 === 'rejected' ? 'text-red-400' : 'text-slate-400'}`}>
                    {stage3 === 'rejected' ? 'Reddedildi' : 'Doğrulandı'}
                  </span>
                </div>
              </div>

              <div className="text-center bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <p className="text-[15px] leading-relaxed text-slate-300 font-medium">
                  {desc}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 mt-auto">
          <button
            onClick={() => {
              onClose();
              navigate('/settings?tab=verification');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-500 hover:to-slate-500 text-white font-bold text-[15px] rounded-2xl py-4 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {btnText} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
