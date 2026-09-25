import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../context/useAuth";
import { useSEO } from "../hooks/useSEO";
import { 
  ShieldAlert, 
  Clock, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Send, 
  RefreshCw,
  X
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";

interface AppealRecord {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  adminResponse?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export function AccountSuspended() {
  useSEO({
    title: "Hesap Durumu | Genç Sosyal",
    description: "Hesap kısıtlaması ve itiraz yönetim paneli.",
    allowIndexing: false,
  });

  const navigate = useNavigate();
  const { suspensionInfo, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    userId?: number;
    username?: string;
    isPermanent: boolean;
    banReason: string;
    bannedAt?: string | null;
    banExpiresAt?: string | null;
    appeal?: AppealRecord | null;
  }>({
    isPermanent: suspensionInfo?.isPermanent ?? true,
    banReason: suspensionInfo?.banReason || "Topluluk kurallarının ihlali",
    bannedAt: suspensionInfo?.bannedAt,
    banExpiresAt: suspensionInfo?.banExpiresAt,
  });

  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [appealError, setAppealError] = useState<string | null>(null);
  const [appealSuccess, setAppealSuccess] = useState<string | null>(null);

  // Fetch updated status and existing appeal
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const token = suspensionInfo?.suspensionToken;
      const res = await fetch(`/api/v1/auth/suspension-status${token ? `?token=${encodeURIComponent(token)}` : ""}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // If the account was unbanned
          if (json.data.isActive) {
            navigate("/login", { replace: true });
            return;
          }

          setData({
            userId: json.data.userId,
            username: json.data.username,
            isPermanent: json.data.isPermanent,
            banReason: json.data.banReason,
            bannedAt: json.data.bannedAt,
            banExpiresAt: json.data.banExpiresAt,
            appeal: json.data.appeal,
          });
        }
      }
    } catch {
      // Use existing fallback from store
    } finally {
      setLoading(false);
    }
  }, [suspensionInfo, navigate]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {}
    logout();
    navigate("/login", { replace: true });
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppealError(null);
    setAppealSuccess(null);

    const trimmed = appealReason.trim();
    if (trimmed.length < 10) {
      setAppealError("Lütfen itiraz gerekçenizi en az 10 karakter olacak şekilde açıklayınız.");
      return;
    }

    setSubmittingAppeal(true);
    try {
      const token = suspensionInfo?.suspensionToken;
      const res = await fetch("/api/v1/appeals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reason: trimmed,
          suspensionToken: token,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setAppealSuccess(json.data.message || "İtirazınız başarıyla alındı.");
        setAppealReason("");
        setAppealModalOpen(false);
        fetchStatus();
      } else {
        setAppealError(json.error?.message || "İtiraz gönderilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      setAppealError("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const isTemporary = !data.isPermanent && data.banExpiresAt;
  const formattedExpiry = isTemporary && data.banExpiresAt
    ? new Date(data.banExpiresAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] flex items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl p-6 sm:p-8 space-y-6"
      >
        {/* Top Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-7 h-7 stroke-[2]" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isTemporary ? "Hesabın Geçici Olarak Kısıtlandı" : "Hesabın Kısıtlandı"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Genç Sosyal hesabına erişim {isTemporary ? "belirtilen süre boyunca geçici olarak" : "kalıcı olarak"} sınırlandırılmıştır.
            </p>
          </div>
        </div>

        {/* Suspension Details Card */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 dark:border-white/[0.06] space-y-3.5 text-xs sm:text-sm">
          {/* Reason */}
          <div className="space-y-1">
            <span className="text-slate-400 dark:text-slate-500 font-semibold block text-[11px] uppercase tracking-wider">
              Kısıtlama Gerekçesi
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              {data.banReason}
            </p>
          </div>

          <div className="h-px bg-slate-200/60 dark:bg-white/[0.06]" />

          {/* Expiry / Duration */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 dark:text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Kısıtlama Türü
            </span>
            <div className="flex items-center gap-1.5 font-bold">
              {isTemporary ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Geçici Kısıtlama
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Kalıcı Kısıtlama
                </span>
              )}
            </div>
          </div>

          {formattedExpiry && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                Bitiş Tarihi
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedExpiry}
              </span>
            </div>
          )}
        </div>

        {/* Existing Appeal Status Banner */}
        {data.appeal && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
              data.appeal.status === "PENDING"
                ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200"
                : data.appeal.status === "APPROVED"
                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
                : "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {data.appeal.status === "PENDING" && (
                <>
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span>İtirazınız Değerlendiriliyor</span>
                </>
              )}
              {data.appeal.status === "APPROVED" && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>İtirazınız Kabul Edildi!</span>
                </>
              )}
              {data.appeal.status === "REJECTED" && (
                <>
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>İtirazınız Reddedildi</span>
                </>
              )}
            </div>

            <p className="text-xs leading-relaxed opacity-90">
              {data.appeal.status === "PENDING" &&
                "Yönetim ekibimiz itiraz talebinizi inceliyor. Karar verildiğinde durumunuz otomatik güncellenecektir."}
              {data.appeal.status === "APPROVED" &&
                "Hesabınız yeniden aktifleştirilmiştir. Şimdi tekrar giriş yapabilirsiniz."}
              {data.appeal.status === "REJECTED" &&
                (data.appeal.adminResponse ||
                  "İtirazınız incelenmiş ve topluluk kuralları ihlali nedeniyle kısıtlamanın devamına karar verilmiştir.")}
            </p>

            {data.appeal.status === "APPROVED" && (
              <div className="pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Giriş Yap
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Global Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {(!data.appeal || data.appeal.status === "REJECTED") && (
            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setAppealError(null);
                setAppealModalOpen(true);
              }}
            >
              <FileText className="w-4 h-4" />
              <span>İtiraz Et</span>
            </Button>
          )}

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              className="flex-1 flex items-center justify-center gap-1.5"
              onClick={fetchStatus}
              isLoading={loading}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Durumu Yenile</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="flex-1 flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </Button>
          </div>
        </div>

        {/* Help Note */}
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 leading-relaxed">
          Kısıtlama kararlarının haksız olduğunu düşünüyorsanız itiraz talebi oluşturabilir veya topluluk rehberimizi inceleyebilirsiniz.
        </p>
      </motion.div>

      {/* APPEAL MODAL */}
      <AnimatePresence>
        {appealModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#0E131F] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Kısıtlamaya İtiraz Et
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Yönetim ekibine itiraz gerekçenizi iletin
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAppealModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {appealError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                  {appealError}
                </div>
              )}

              <form onSubmit={handleAppealSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    İtiraz Gerekçeniz <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    rows={5}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Hesabınızın neden yanlışlıkla kısıtlandığını veya durumun düzeltilmesini gerektiren açıklamayı buraya yazınız..."
                    className="w-full text-xs sm:text-sm"
                    disabled={submittingAppeal}
                    required
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    En az 10 karakter, en fazla 2000 karakter.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setAppealModalOpen(false)}
                    disabled={submittingAppeal}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={submittingAppeal}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    İtirazı Gönder
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
