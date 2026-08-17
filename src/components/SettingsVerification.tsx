import React, { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  Info, 
  ShieldCheck, 
  Sparkles,
  Send
} from "lucide-react";
import { useAuthStore } from "../context/useAuth";
import { Button } from "./ui/Button";

export function SettingsVerification() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "success" as "success" | "error" });

  const loadRequests = async () => {
    try {
      const res = await fetchApi("/verification/me");
      const json = await res.json();
      if (json.success) {
        setRequests(json.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showMsg("Lütfen başvuru gerekçenizi belirtin.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetchApi("/verification", {
        method: "POST",
        data: { reason: reason.trim() },
      });
      const json = await res.json();
      if (json.success) {
        setReason("");
        showMsg("Başvurunuz başarıyla alındı. Ekibimiz en kısa sürede inceleyecektir.");
        loadRequests();
      } else {
        showMsg(json.error?.message || "Başvuru alınamadı.", "error");
      }
    } catch (e) {
      console.error(e);
      showMsg("Bağlantı hatası.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRequest = requests.find(
    (r) => r.status === "pending" || r.status === "under_review"
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          Hesap Doğrulama (Mavi Rozet)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Özgün üreticileri, resmi toplulukları ve doğrulanmış yetenekleri öne çıkaran mavi rozet sistemi.
        </p>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border shadow-xs ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 1. Verified State */}
      {user?.isVerified ? (
        <div className="p-6 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-100/80 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 fill-indigo-600/10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Hesabınız Doğrulandı</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Tebrikler! Profiliniz doğrulanmış hesap rozetine sahiptir ve aramalarda öncelikli olarak listelenir.
          </p>
        </div>
      ) : activeRequest ? (
        /* 2. Pending / Under Review State */
        <div className="p-6 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-amber-900">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-950">Değerlendirme Aşamasında</h3>
              <p className="text-xs text-amber-800 font-medium">
                Başvurunuz yetkili moderatörlerimiz tarafından inceleniyor.
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-amber-100 text-xs">
            <span className="font-bold text-amber-700 uppercase tracking-wider block mb-1">
              Başvuru Tarihi
            </span>
            <span className="text-slate-900 font-semibold">
              {new Date(activeRequest.createdAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      ) : (
        /* 3. New Application Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex gap-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Topluluğa değer katan, aktif proje üreten ve platform kurallarına uyan geliştiriciler ve tasarımcılar doğrulanmış rozet alabilir. Lütfen projelerinizi ve katkılarınızı özetleyin.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Neden doğrulanmak istiyorsunuz?
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                {reason.length}/1000
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Geliştirdiğim açık kaynak projeler, topluluk etkinlikleri ve çalışmalarım..."
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              disabled={!reason.trim()}
              leftIcon={<Send className="w-4 h-4" />}
              className="rounded-2xl font-bold w-full sm:w-auto shadow-xs"
            >
              Başvuruyu Gönder
            </Button>
          </div>
        </form>
      )}

      {/* 4. History List */}
      {requests.length > 0 && (
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Geçmiş Başvurular
          </h3>
          <div className="space-y-2.5">
            {requests.map((req) => {
              const statusMap: Record<string, { label: string; bg: string; text: string }> = {
                approved: {
                  label: "Onaylandı",
                  bg: "bg-emerald-50 border-emerald-200",
                  text: "text-emerald-700",
                },
                rejected: {
                  label: "Reddedildi",
                  bg: "bg-rose-50 border-rose-200",
                  text: "text-rose-700",
                },
                under_review: {
                  label: "İnceleniyor",
                  bg: "bg-amber-50 border-amber-200",
                  text: "text-amber-700",
                },
                pending: {
                  label: "Bekliyor",
                  bg: "bg-slate-100 border-slate-200",
                  text: "text-slate-700",
                },
              };

              const st = statusMap[req.status] || statusMap.pending;

              return (
                <div
                  key={req.id}
                  className="p-4 border border-slate-200/70 rounded-2xl bg-slate-50/50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${st.bg} ${st.text}`}
                    >
                      {st.label}
                    </span>
                  </div>

                  {req.status === "rejected" && req.rejectionReason && (
                    <div className="mt-1 p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium">
                      <span className="font-bold block mb-0.5">Red Sebebi:</span>
                      {req.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
