import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, AlertCircle, Calendar, CheckCircle2, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "../../context/useAuth";

export function AgeGatekeeperModal() {
  const { user, setUser, setSuspension, logout } = useAuthStore();
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Only show if user is authenticated and ageVerificationStatus is UNVERIFIED or missing
  const needsVerification = user && (user.ageVerificationStatus === "UNVERIFIED" || !user.ageVerificationStatus);

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
        if (data?.error?.code === "AGE_RESTRICTED_UNDER_15") {
          // Underage suspension
          if (data.error.suspension) {
            setSuspension(data.error.suspension);
            window.location.href = "/account-suspended";
            return;
          }
          setError(data.error.message || "15 yaş altı kullanıcıların platformu kullanması mevzuat gereği kısıtlanmıştır.");
          return;
        }
        throw new Error(data?.error?.message || "Doğrulama yapılamadı.");
      }

      setSuccessMsg(data.data?.message || "Yaş doğrulamanız başarıyla tamamlandı.");

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
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Yasal Mevzuat Uyumu
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Yaş Doğrulaması Zorunluluğu
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          10 Ekim 2026 tarihinde yayımlanan <strong>Sosyal Ağ Sağlayıcı Tarafından Çocuklara Özgü Ayrıştırılmış Hizmet Sunulması ve Yaş Doğrulama Yönetmeliği</strong> gereğince platformumuzda yaş tespiti yapılması yasal zorunluluktur. Devam edebilmek için lütfen doğum tarihinizi onaylayınız.
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
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                      : calculatedAge < 18 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {calculatedAge} Yaşında {calculatedAge < 15 ? '(Yasaklı Yaş)' : calculatedAge < 18 ? '(15-18 Genç)' : '(Yetişkin)'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {calculatedAge !== null && calculatedAge < 15 && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 font-medium">
                  ⚠️ Yönetmelik gereği 15 yaşından küçüklerin sosyal ağ hesabı bulundurması kanunen yasaktır. Bu yaş onaylandığında hesap dondurulacaktır.
                </p>
              )}

              {calculatedAge !== null && calculatedAge >= 15 && calculatedAge < 18 && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  🛡️ Hesabınız 15-18 yaş korumalı moda geçirilecek, yabancılardan doğrudan mesaj kısıtlaması ve gizli profil otomatik devreye alınacaktır.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !birthDate}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Doğrula ve Devam Et"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Çıkış Yap
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
