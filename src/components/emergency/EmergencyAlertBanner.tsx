import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  ChevronRight,
  X,
  CheckCircle2,
  ExternalLink,
  Lock,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../context/useAuth";

export interface ActiveEmergencyAlert {
  id: number;
  incidentCode: string;
  title: string;
  message: string;
  recommendedAction?: string | null;
  severity: "CRITICAL" | "HIGH" | "ELEVATED";
  category: string;
  targetAudience?: string;
  actionLabel?: string | null;
  actionUrl?: string | null;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  CYBER_ATTACK: "Siber Saldırı / Güvenlik Olayı",
  DATA_SECURITY: "Hesap & Veri Güvenliği",
  PHISHING: "Oltalama (Phishing) Uyarısı",
  SERVICE_OUTAGE: "Acil Hizmet Kesintisi",
  MAINTENANCE: "Acil Güvenlik Bakımı",
  OTHER: "Acil Platform Bildirimi",
};

const SEVERITY_META = {
  CRITICAL: {
    label: "Kritik Güvenlik Uyarısı",
    barClass:
      "bg-rose-700 dark:bg-rose-950/95 text-white border-b border-rose-800/80 dark:border-rose-500/40",
    modalAccentText: "text-rose-700 dark:text-rose-400",
    modalSoftBg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50",
    primaryBtn: "bg-rose-600 hover:bg-rose-700 text-white",
    Icon: ShieldAlert,
  },
  HIGH: {
    label: "Yüksek Öncelikli Uyarı",
    barClass:
      "bg-amber-600 dark:bg-amber-950/95 text-white border-b border-amber-700/80 dark:border-amber-500/40",
    modalAccentText: "text-amber-700 dark:text-amber-400",
    modalSoftBg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
    primaryBtn: "bg-amber-600 hover:bg-amber-700 text-white",
    Icon: AlertTriangle,
  },
  ELEVATED: {
    label: "Güvenlik Bilgilendirmesi",
    barClass:
      "bg-slate-900 dark:bg-slate-900 text-white border-b border-slate-700 dark:border-white/15",
    modalAccentText: "text-blue-700 dark:text-blue-400",
    modalSoftBg: "bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700",
    primaryBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    Icon: Info,
  },
};

const GUEST_DISMISS_KEY = "gs_dismissed_emergency_alerts";

const getGuestDismissedIds = (): number[] => {
  try {
    const raw = sessionStorage.getItem(GUEST_DISMISS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "number") : [];
  } catch {
    return [];
  }
};

const saveGuestDismissedId = (id: number) => {
  try {
    const prev = getGuestDismissedIds();
    if (!prev.includes(id)) {
      sessionStorage.setItem(GUEST_DISMISS_KEY, JSON.stringify([...prev, id]));
    }
  } catch {}
};

const isSafeInternalPath = (url: string) =>
  url.startsWith("/") && !url.startsWith("//") && !url.includes("..");

const isSafeExternalUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export function EmergencyAlertBanner() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ActiveEmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ActiveEmergencyAlert | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  const loadActiveAlerts = useCallback(async () => {
    try {
      const res = await fetchApi("/emergency-alerts/active");
      if (!res.ok) return;
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        const guestDismissed = !isAuthenticated ? getGuestDismissedIds() : [];
        const visible = (json.data as ActiveEmergencyAlert[]).filter(
          (item) => !guestDismissed.includes(item.id)
        );
        setAlerts(visible);
        setSelectedAlert((curr) =>
          curr ? visible.find((item) => item.id === curr.id) || null : null
        );
      }
    } catch {
      // Fail silently on transient network issues
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadActiveAlerts();
    const interval = setInterval(loadActiveAlerts, 90_000);
    const handleFocus = () => loadActiveAlerts();
    const handleCustomUpdate = () => loadActiveAlerts();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("gs:emergency-alert-updated", handleCustomUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("gs:emergency-alert-updated", handleCustomUpdate);
    };
  }, [loadActiveAlerts]);

  const handleAcknowledge = async (alertId: number) => {
    setAcknowledgingId(alertId);
    try {
      if (isAuthenticated) {
        await fetchApi(`/emergency-alerts/${alertId}/acknowledge`, { method: "POST" });
      } else {
        saveGuestDismissedId(alertId);
      }
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setSelectedAlert((curr) => (curr?.id === alertId ? null : curr));
    } catch {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setSelectedAlert((curr) => (curr?.id === alertId ? null : curr));
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleActionNavigate = (alert: ActiveEmergencyAlert) => {
    const target = (alert.actionUrl || "/settings?tab=security").trim();
    setSelectedAlert(null);
    if (isSafeInternalPath(target)) {
      navigate(target);
      return;
    }
    if (isSafeExternalUrl(target)) {
      window.location.assign(target);
    }
  };

  if (alerts.length === 0) return null;

  const topAlert = alerts[0];
  const meta = SEVERITY_META[topAlert.severity] || SEVERITY_META.CRITICAL;
  const SeverityIcon = meta.Icon;

  const actionSteps = (selectedAlert?.recommendedAction || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  return (
    <>
      <div
        role="alert"
        aria-live="assertive"
        className={`w-full relative z-30 transition-colors ${meta.barClass}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedAlert(topAlert)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-lg"
          >
            <SeverityIcon className="w-4 h-4 shrink-0 text-white" aria-hidden="true" />
            <div className="min-w-0 flex items-center gap-2 text-xs sm:text-[13px] leading-snug">
              <span className="font-bold whitespace-nowrap shrink-0 hidden sm:inline">
                {meta.label}
              </span>
              <span className="hidden sm:inline opacity-60" aria-hidden="true">
                ·
              </span>
              <span className="font-semibold truncate group-hover:underline">
                {topAlert.title}
              </span>
              {topAlert.targetAudience === "ADMINS_ONLY" && (
                <span className="text-[11px] font-medium opacity-80 whitespace-nowrap shrink-0">
                  (Yönetici Tatbikatı)
                </span>
              )}
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedAlert(topAlert)}
              className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[34px] rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <span>Detaylar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleAcknowledge(topAlert.id)}
              disabled={acknowledgingId === topAlert.id}
              aria-label="Acil uyarıyı kapat"
              title="Okudum, kapat"
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Official Incident Details Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0D1424] rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-white/[0.10] shadow-2xl"
            >
              {(() => {
                const detailMeta = SEVERITY_META[selectedAlert.severity] || SEVERITY_META.CRITICAL;
                const DetailIcon = detailMeta.Icon;
                return (
                  <div className="p-5 sm:p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${detailMeta.modalSoftBg}`}
                        >
                          <DetailIcon className={`w-5 h-5 ${detailMeta.modalAccentText}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className={`font-bold ${detailMeta.modalAccentText}`}>
                              {detailMeta.label}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{selectedAlert.incidentCode}</span>
                          </div>
                          <h2
                            id="emergency-modal-title"
                            className="text-lg font-bold text-slate-900 dark:text-white leading-snug mt-1"
                          >
                            {selectedAlert.title}
                          </h2>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAlert(null)}
                        aria-label="Pencereyi kapat"
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-white/[0.07] py-2.5">
                      <span>{CATEGORY_LABELS[selectedAlert.category] || "Acil Bildirim"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {new Date(selectedAlert.createdAt).toLocaleString("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {selectedAlert.message}
                    </div>

                    {actionSteps.length > 0 && (
                      <div className={`p-4 rounded-xl border space-y-2.5 ${detailMeta.modalSoftBg}`}>
                        <h3 className={`text-xs font-bold ${detailMeta.modalAccentText}`}>
                          Önerilen Güvenlik Adımları
                        </h3>
                        <ol className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                          {actionSteps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2.5">
                              <span
                                className={`font-mono text-xs font-bold tabular-nums mt-0.5 ${detailMeta.modalAccentText}`}
                              >
                                {index + 1}.
                              </span>
                              <span className="leading-snug">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <Lock className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      <p className="leading-relaxed">
                        Genç Sosyal ekibi sizden hiçbir zaman şifrenizi veya tek kullanımlık doğrulama kodunuzu istemez.
                      </p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.07]">
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(selectedAlert.id)}
                        disabled={acknowledgingId === selectedAlert.id}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.12] text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Okudum, Anladım</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleActionNavigate(selectedAlert)}
                        className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${detailMeta.primaryBtn}`}
                      >
                        <span>{selectedAlert.actionLabel || "Güvenlik Ayarlarına Git"}</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
