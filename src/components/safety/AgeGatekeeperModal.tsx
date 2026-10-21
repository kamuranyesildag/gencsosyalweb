import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, AlertCircle, Calendar, CheckCircle2, ArrowRight, Loader2, X } from "lucide-react";
import { useAuthStore } from "../../context/useAuth";

export function AgeGatekeeperModal() {
  const { user, setUser, logout } = useAuthStore();
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("gencsosyal_skip_age_gate") === "true";
  });

  const handleSkip = () => {
    localStorage.setItem("gencsosyal_skip_age_gate", "true");
    setDismissed(true);
  };

  // Only show if user is authenticated and hasn't declared birthDate and hasn't dismissed
  const needsVerification = !dismissed && user && !user.birthDate && (user.ageVerificationStatus === "UNVERIFIED" || !user.ageVerificationStatus);

  if (!needsVerification) {
    return null;
  }

  const getAge = (bDateStr: string) => {
    if (!bDateStr) return null;
    const bDate = new Date(bDateStr);
    if (isNaN(bDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = getAge(birthDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setError("Lütfen doğum tarihinizi seçin.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("gencsosyal_token");
      const res = await fetch("/api/v1/child-safety/verify-age", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          birthDate,
          verificationMethod: "DECLARATION"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Doğrulama yapılamadı.");
      }

      setSuccessMsg(data.data?.message || "Yaş bilgileriniz kaydedildi.");
      localStorage.setItem("gencsosyal_skip_age_gate", "true");

      // Refresh /me to update store
      const meRes = await fetch("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.success && meData.data) {
          setUser(meData.data);
        }
      }

      setTimeout(() => {
        setDismissed(true);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white/95 dark:bg-[#0B1329]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/70 dark:border-white/[0.08] overflow-hidden p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Kapat"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Profil Güvenliği
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Doğum Tarihi Tercihi (İsteğe Bağlı)
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Genç Sosyal deneyiminizi size en uygun içerik ve koruma seviyesiyle özelleştirebilmemiz için doğum tarihinizi belirtebilir veya bu adımı dilediğiniz zaman atlayabilirsiniz.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Doğum Tarihiniz
                </label>
                {calculatedAge !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    calculatedAge < 15 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' 
                      : calculatedAge < 18 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {calculatedAge} Yaşında {calculatedAge < 15 ? '(Korumalı Genç)' : calculatedAge < 18 ? '(15-18 Genç)' : '(Yetişkin)'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#080E1A] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {calculatedAge !== null && calculatedAge < 18 && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  🛡️ Hesabınız için güvenli korumalı genç modu ve gizli profil seçenekleri hazırlandı.
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="submit"
                disabled={loading || !birthDate}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet ve Devam Et"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                Şimdilik Atla
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full sm:w-auto px-3 py-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Çıkış
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
