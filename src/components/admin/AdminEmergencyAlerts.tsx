import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Send,
  Mail,
  Bell,
  Megaphone,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Users,
  Lock,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { fetchApi } from "../../lib/api";
import { toast } from "../ui/Toast";
import type { AdminTab } from "../../pages/Admin";

type EmergencySeverity = "CRITICAL" | "HIGH" | "ELEVATED";
type EmergencyCategory =
  | "CYBER_ATTACK"
  | "DATA_SECURITY"
  | "PHISHING"
  | "SERVICE_OUTAGE"
  | "MAINTENANCE"
  | "OTHER";
type TargetAudience = "ALL_ACTIVE" | "ADMINS_ONLY";
type PreviewChannel = "banner" | "notification" | "email";

interface EmergencyAlertRecord {
  id: number;
  incidentCode: string;
  title: string;
  message: string;
  recommendedAction?: string | null;
  severity: EmergencySeverity;
  category: EmergencyCategory;
  status: "ACTIVE" | "RESOLVED";
  targetAudience: TargetAudience;
  actionLabel?: string | null;
  actionUrl?: string | null;
  sendNotification: boolean;
  sendEmail: boolean;
  showBanner: boolean;
  recipientCount: number;
  notificationSentCount: number;
  emailStatus: string;
  emailAttemptedCount: number;
  emailSentCount: number;
  emailFailedCount: number;
  acknowledgedCount: number;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  createdByUser?: { username: string; displayName: string | null } | null;
  resolvedByUser?: { username: string; displayName: string | null } | null;
}

interface EmergencySummary {
  activeMembersCount: number;
  activeAdminsCount: number;
  activeAlertsCount: number;
  smtpConfigured: boolean;
  smtpFrom: string;
}

interface CrisisPreset {
  id: string;
  label: string;
  severity: EmergencySeverity;
  category: EmergencyCategory;
  title: string;
  message: string;
  recommendedAction: string;
  actionLabel: string;
  actionUrl: string;
}

const REQUIRED_CONFIRM_PHRASE = "ACİL UYARI GÖNDER";

const CATEGORY_OPTIONS: { value: EmergencyCategory; label: string }[] = [
  { value: "CYBER_ATTACK", label: "Siber Saldırı / Güvenlik Olayı" },
  { value: "DATA_SECURITY", label: "Hesap & Veri Güvenliği" },
  { value: "PHISHING", label: "Oltalama (Phishing) Uyarısı" },
  { value: "SERVICE_OUTAGE", label: "Acil Hizmet Kesintisi" },
  { value: "MAINTENANCE", label: "Acil Güvenlik Bakımı" },
  { value: "OTHER", label: "Diğer Acil Bildirim" },
];

const CRISIS_PRESETS: CrisisPreset[] = [
  {
    id: "cyber_attack",
    label: "Siber Saldırı Tespiti",
    severity: "CRITICAL",
    category: "CYBER_ATTACK",
    title: "Platform Genelinde Olağan Dışı Siber Aktivite Uyarısı",
    message:
      "Genç Sosyal sistemlerine yönelik olağan dışı saldırı trafiği tespit edilmiştir. Güvenlik ekibimiz koruma kalkanlarını devreye almıştır. Hesap güvenliğiniz için aktif oturumlarınızı kontrol etmenizi ve şüpheli bağlantılara tıklamamanızı önemle rica ederiz.",
    recommendedAction:
      "Ayarlar > Güvenlik & Oturumlar bölümünden tanımadığınız aktif cihazları sonlandırın.\nAynı şifreyi başka platformlarda kullanıyorsanız şifrenizi hemen güncelleyin.\nGenç Sosyal adına gönderildiği iddia edilen şüpheli bağlantılara şifrenizi girmeyin.",
    actionLabel: "Güvenlik Ayarlarını Kontrol Et",
    actionUrl: "/settings?tab=security",
  },
  {
    id: "phishing",
    label: "Oltalama (Phishing) Uyarısı",
    severity: "HIGH",
    category: "PHISHING",
    title: "Sahte Mesaj ve Oltalama Bağlantılarına Karşı Güvenlik Uyarısı",
    message:
      "Genç Sosyal adını veya mavi tik doğrulamasını taklit eden sahte mesaj ve bağlantılar tespit edilmiştir. Resmi bildirimlerimiz yalnızca Genç Sosyal uygulaması ve resmi e-posta adresimiz üzerinden iletilir.",
    recommendedAction:
      "Şifre, doğrulama kodu veya kişisel bilgi isteyen mesajları kesinlikle yanıtlamayın.\nŞüpheli hesapları profil sayfasındaki Şikayet Et seçeneğiyle bize bildirin.\nBilgilerinizi yanlışlıkla paylaştıysanız hemen şifrenizi değiştirin.",
    actionLabel: "Şifremi ve Oturumlarımı Yönet",
    actionUrl: "/settings?tab=security",
  },
  {
    id: "password_reset",
    label: "Acil Şifre Yenileme Çağrısı",
    severity: "CRITICAL",
    category: "DATA_SECURITY",
    title: "Hesap Güvenliği İçin Acil Şifre Güncelleme Bilgilendirmesi",
    message:
      "Yetkisiz giriş denemelerine karşı tüm üyelerimizin hesap güvenliğini en üst düzeye çıkarmak amacıyla şifrelerini yenilemelerini ve aktif oturum listelerini gözden geçirmelerini öneriyoruz.",
    recommendedAction:
      "Güvenlik Ayarları sayfasından güçlü ve benzersiz bir yeni şifre belirleyin.\nİki adımlı doğrulama (2FA) korumasını aktif hale getirin.\nTanımadığınız tüm cihaz oturumlarını tek tıkla kapatın.",
    actionLabel: "Şifremi Şimdi Güncelle",
    actionUrl: "/settings?tab=security",
  },
  {
    id: "maintenance",
    label: "Acil Güvenlik Bakımı",
    severity: "ELEVATED",
    category: "MAINTENANCE",
    title: "Acil Güvenlik Güncellemesi ve Kısa Süreli Erişim Bilgilendirmesi",
    message:
      "Altyapı güvenliğini güçlendirmek amacıyla plan dışı güvenlik güncellemesi uygulanmaktadır. İşlem süresince bazı özelliklerde kısa süreli gecikmeler yaşanabilir; tüm verileriniz güvendedir.",
    recommendedAction:
      "Çalışmalar tamamlanana kadar uzun gönderi taslaklarınızı cihazınızda yedekleyin.\nGüncelleme tamamlandığında bu uyarı otomatik olarak kaldırılacaktır.",
    actionLabel: "Bildirimleri Görüntüle",
    actionUrl: "/notifications",
  },
];

const SEVERITY_META: Record<
  EmergencySeverity,
  { label: string; textClass: string; surfaceClass: string; bannerBg: string }
> = {
  CRITICAL: {
    label: "Kritik",
    textClass: "text-rose-700 dark:text-rose-400",
    surfaceClass: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60",
    bannerBg: "bg-rose-700 text-white",
  },
  HIGH: {
    label: "Yüksek",
    textClass: "text-amber-700 dark:text-amber-400",
    surfaceClass: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60",
    bannerBg: "bg-amber-600 text-white",
  },
  ELEVATED: {
    label: "Bilgilendirme",
    textClass: "text-blue-700 dark:text-blue-400",
    surfaceClass: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
    bannerBg: "bg-slate-900 text-white",
  },
};

const EMAIL_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: "Tamamlandı", className: "text-emerald-700 dark:text-emerald-400" },
  SENDING: { label: "Gönderiliyor...", className: "text-blue-600 dark:text-blue-400" },
  PARTIAL: { label: "Kısmi Teslim", className: "text-amber-700 dark:text-amber-400" },
  FAILED: { label: "Başarısız", className: "text-rose-700 dark:text-rose-400" },
  UNCONFIGURED: { label: "SMTP Kapalı", className: "text-amber-700 dark:text-amber-400" },
  SKIPPED: { label: "Seçilmedi", className: "text-slate-500 dark:text-slate-400" },
  PENDING: { label: "Sırada", className: "text-slate-600 dark:text-slate-300" },
};

interface AdminEmergencyAlertsProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export function AdminEmergencyAlerts({ onNavigateTab }: AdminEmergencyAlertsProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<EmergencySummary>({
    activeMembersCount: 0,
    activeAdminsCount: 0,
    activeAlertsCount: 0,
    smtpConfigured: false,
    smtpFrom: "",
  });
  const [alerts, setAlerts] = useState<EmergencyAlertRecord[]>([]);

  // Composer state
  const [severity, setSeverity] = useState<EmergencySeverity>("CRITICAL");
  const [category, setCategory] = useState<EmergencyCategory>("CYBER_ATTACK");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [actionLabel, setActionLabel] = useState("Güvenlik Ayarlarını Kontrol Et");
  const [actionUrl, setActionUrl] = useState("/settings?tab=security");
  const [sendNotification, setSendNotification] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("ALL_ACTIVE");
  const [previewChannel, setPreviewChannel] = useState<PreviewChannel>("banner");

  // Confirm & Action states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Resolve modal state
  const [resolvingTarget, setResolvingTarget] = useState<EmergencyAlertRecord | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolvingBusy, setResolvingBusy] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetchApi("/admin/emergency-alerts");
      const json = await res.json();
      if (json?.success && json.data) {
        setSummary(json.data.summary);
        setAlerts(Array.isArray(json.data.alerts) ? json.data.alerts : []);
      } else {
        toast.error(json?.error?.message || "Acil durum kayıtları yüklenemedi.");
      }
    } catch {
      toast.error("Sunucu bağlantısı kurulurken hata oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-poll while any email batch is actively sending
  useEffect(() => {
    const hasSending = alerts.some((a) => a.emailStatus === "SENDING");
    if (!hasSending) return;
    const timer = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [alerts, loadData]);

  const applyPreset = (preset: CrisisPreset) => {
    setSeverity(preset.severity);
    setCategory(preset.category);
    setTitle(preset.title);
    setMessage(preset.message);
    setRecommendedAction(preset.recommendedAction);
    setActionLabel(preset.actionLabel);
    setActionUrl(preset.actionUrl);
    toast.success(`"${preset.label}" şablonu forma uygulandı.`);
  };

  const validateDraft = (): boolean => {
    if (title.trim().length < 4) {
      toast.error("Uyarı başlığı en az 4 karakter olmalıdır.");
      return false;
    }
    if (message.trim().length < 10) {
      toast.error("Uyarı mesajı en az 10 karakter olmalıdır.");
      return false;
    }
    if (!sendNotification && !sendEmail && !showBanner) {
      toast.error("En az bir iletim kanalı seçmelisiniz.");
      return false;
    }
    return true;
  };

  const handleOpenDispatchFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDraft()) return;
    if (targetAudience === "ALL_ACTIVE") {
      setConfirmPhrase("");
      setConfirmModalOpen(true);
    } else {
      executeDispatch();
    }
  };

  const executeDispatch = async () => {
    setDispatching(true);
    try {
      const res = await fetchApi("/admin/emergency-alerts", {
        method: "POST",
        data: {
          title: title.trim(),
          message: message.trim(),
          recommendedAction: recommendedAction.trim() || null,
          severity,
          category,
          targetAudience,
          actionLabel: actionLabel.trim() || null,
          actionUrl: actionUrl.trim() || null,
          sendNotification,
          sendEmail,
          showBanner,
          confirmPhrase: targetAudience === "ALL_ACTIVE" ? confirmPhrase.trim() : undefined,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        toast.error(json?.error?.message || "Acil uyarı gönderilemedi.");
        return;
      }

      toast.success(json.data?.message || "Acil güvenlik uyarısı yayınlandı.");
      setConfirmModalOpen(false);
      setConfirmPhrase("");
      window.dispatchEvent(new Event("gs:emergency-alert-updated"));
      await loadData(true);
    } catch {
      toast.error("Acil uyarı gönderilirken bağlantı hatası oluştu.");
    } finally {
      setDispatching(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (title.trim().length < 4 || message.trim().length < 10) {
      toast.error("Test e-postası için önce başlık ve mesaj alanlarını doldurun.");
      return;
    }
    setSendingTestEmail(true);
    try {
      const res = await fetchApi("/admin/emergency-alerts/test-email", {
        method: "POST",
        data: {
          title: title.trim(),
          message: message.trim(),
          recommendedAction: recommendedAction.trim() || null,
          severity,
          category,
          actionLabel: actionLabel.trim() || null,
          actionUrl: actionUrl.trim() || null,
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        toast.error(json?.error?.message || "Test e-postası gönderilemedi.");
        return;
      }
      toast.success(json.data?.message || "Test e-postası adresinize gönderildi.");
    } catch {
      toast.error("Test e-postası gönderilirken hata oluştu.");
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!resolvingTarget) return;
    setResolvingBusy(true);
    try {
      const res = await fetchApi(`/admin/emergency-alerts/${resolvingTarget.id}/resolve`, {
        method: "POST",
        data: { resolutionNote: resolutionNote.trim() || null },
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        toast.error(json?.error?.message || "Uyarı kapatılamadı.");
        return;
      }
      toast.success(json.data?.message || "Acil uyarı çözüldü olarak işaretlendi.");
      setResolvingTarget(null);
      setResolutionNote("");
      window.dispatchEvent(new Event("gs:emergency-alert-updated"));
      await loadData(true);
    } catch {
      toast.error("Uyarı kapatılırken hata oluştu.");
    } finally {
      setResolvingBusy(false);
    }
  };

  const targetCount =
    targetAudience === "ALL_ACTIVE" ? summary.activeMembersCount : summary.activeAdminsCount;
  const activeSeverityMeta = SEVERITY_META[severity];
  const previewSteps = recommendedAction
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const categoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label || "Acil Güvenlik Olayı";

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Acil Durum & Siber Güvenlik Uyarı Merkezi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Siber saldırı, oltalama veya kritik güvenlik olaylarında Genç Sosyal üyelerine anında uygulama içi bildirim, üst uyarı şeridi ve resmi güvenlik e-postası gönderin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.10] bg-white dark:bg-[#0D1424] text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Durumu Yenile</span>
        </button>
      </div>

      {/* Operational Readiness Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-xl border transition-colors ${
            summary.activeAlertsCount > 0
              ? "bg-rose-50/70 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800/60"
              : "bg-white dark:bg-[#0D1424] border-slate-200/90 dark:border-white/[0.08]"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Platform Güvenlik Durumu
            </span>
            {summary.activeAlertsCount > 0 ? (
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-xl font-bold tabular-nums ${
                summary.activeAlertsCount > 0
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {summary.activeAlertsCount > 0
                ? `${summary.activeAlertsCount} Aktif Acil Uyarı`
                : "Normal Çalışma"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {summary.activeAlertsCount > 0
              ? "Aktif uyarı üyelerin ekranında üst şerit olarak gösteriliyor."
              : "Şu anda yayında olan aktif bir kriz uyarısı bulunmuyor."}
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-[#0D1424] border-slate-200/90 dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ulaşılabilir Üye Havuzu
            </span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {loading ? "—" : summary.activeMembersCount.toLocaleString("tr-TR")}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">aktif üye</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Tatbikat modu için {summary.activeAdminsCount} aktif yönetici hesabı hazır.
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-[#0D1424] border-slate-200/90 dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Acil E-posta Kanalı (SMTP)
            </span>
            <Mail
              className={`w-4 h-4 ${
                summary.smtpConfigured
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span
              className={`text-xl font-bold ${
                summary.smtpConfigured
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {loading ? "—" : summary.smtpConfigured ? "SMTP Hazır" : "SMTP Yapılandırılmadı"}
            </span>
            {!summary.smtpConfigured && onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("smtp")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                SMTP Ayarları
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
            {summary.smtpConfigured
              ? `Gönderici: ${summary.smtpFrom}`
              : "Mail gönderimi için SMTP sekmesinden sunucu bilgilerini kaydedin."}
          </p>
        </div>
      </div>

      {/* Quick Crisis Presets */}
      <div className="bg-white dark:bg-[#0D1424] rounded-xl border border-slate-200/90 dark:border-white/[0.08] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Hızlı Kriz Şablonları
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acil durumlarda saniyeler içinde düzenlenebilir resmi taslak oluşturun.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {CRISIS_PRESETS.map((preset) => {
            const pMeta = SEVERITY_META[preset.severity];
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className={`text-xs font-bold ${pMeta.textClass}`}>{pMeta.label}</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {preset.label}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {preset.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Composer + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Composer Form */}
        <form
          onSubmit={handleOpenDispatchFlow}
          className="lg:col-span-7 bg-white dark:bg-[#0D1424] rounded-xl border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.07] pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Yeni Acil Uyarı Oluştur
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Hedef: {targetCount.toLocaleString("tr-TR")} hesap
            </span>
          </div>

          {/* Severity + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Öncelik Seviyesi
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl">
                {(["CRITICAL", "HIGH", "ELEVATED"] as EmergencySeverity[]).map((lvl) => {
                  const active = severity === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        active
                          ? lvl === "CRITICAL"
                            ? "bg-rose-600 text-white shadow-xs"
                            : lvl === "HIGH"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {SEVERITY_META[lvl].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="emergency-category"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Olay Kategorisi
              </label>
              <select
                id="emergency-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
                className="w-full h-[42px] px-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="emergency-title"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Uyarı Başlığı
              </label>
              <span className="text-[11px] text-slate-400 tabular-nums">{title.length}/160</span>
            </div>
            <input
              id="emergency-title"
              type="text"
              maxLength={160}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Acil durum başlığını net ve anlaşılır şekilde yazın"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Detailed Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="emergency-message"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Resmi Açıklama Metni
              </label>
              <span className="text-[11px] text-slate-400 tabular-nums">{message.length}/3000</span>
            </div>
            <textarea
              id="emergency-message"
              rows={4}
              maxLength={3000}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Olayın kapsamını, etkilenen sistemleri ve üyelerin bilmesi gereken resmi açıklamayı girin"
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
            />
          </div>

          {/* Recommended Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="emergency-steps"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Üyeler İçin Önerilen Güvenlik Adımları (Her satır bir adım)
              </label>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {recommendedAction.length}/1500
              </span>
            </div>
            <textarea
              id="emergency-steps"
              rows={3}
              maxLength={1500}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              placeholder="Her satıra bir önlem adımı yazın (isteğe bağlı)"
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
            />
          </div>

          {/* Action CTA Button config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="emergency-cta-label"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Yönlendirme Buton Metni
              </label>
              <input
                id="emergency-cta-label"
                type="text"
                maxLength={80}
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="Güvenlik Ayarlarını Kontrol Et"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label
                htmlFor="emergency-cta-url"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Yönlendirme Yolu veya Adresi
              </label>
              <input
                id="emergency-cta-url"
                type="text"
                maxLength={500}
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/settings?tab=security"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1120] text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.07]">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              İletim Kanalları
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/[0.10] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Uygulama Bildirimi</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Bildirimler sekmesine düşer
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/[0.10] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Acil E-posta</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {summary.smtpConfigured
                      ? "Üyelerin mailine gider"
                      : "SMTP henüz kapalı"}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/[0.10] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                <input
                  type="checkbox"
                  checked={showBanner}
                  onChange={(e) => setShowBanner(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Üst Uyarı Şeridi</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Sayfa üstünde görünür
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hedef Kitle
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetAudience("ALL_ACTIVE")}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  targetAudience === "ALL_ACTIVE"
                    ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/25"
                    : "border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Tüm Aktif Üyeler ({summary.activeMembersCount.toLocaleString("tr-TR")})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Canlı acil yayın · Çift aşamalı onay gerektirir
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience("ADMINS_ONLY")}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  targetAudience === "ADMINS_ONLY"
                    ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/25"
                    : "border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Sadece Yöneticiler — Tatbikat ({summary.activeAdminsCount})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Üyelere gitmeden bildirim, şerit ve maili test edin
                </div>
              </button>
            </div>
          </div>

          {/* Submit Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.07]">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail || !summary.smtpConfigured}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.12] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {sendingTestEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>Kendime Test Maili Gönder</span>
            </button>

            <button
              type="submit"
              disabled={dispatching}
              className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer disabled:opacity-50 ${
                targetAudience === "ALL_ACTIVE"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {dispatching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {targetAudience === "ALL_ACTIVE"
                  ? "Acil Uyarıyı Tüm Üyelere Gönder"
                  : "Yönetici Tatbikatı Başlat"}
              </span>
            </button>
          </div>
        </form>

        {/* Right: Live Multi-Channel Preview */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0D1424] rounded-xl border border-slate-200/90 dark:border-white/[0.08] p-5 space-y-4 lg:sticky lg:top-[132px]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Canlı Görünüm Önizlemesi
            </h2>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.06] rounded-lg">
              {(
                [
                  { id: "banner", label: "Şerit" },
                  { id: "notification", label: "Bildirim" },
                  { id: "email", label: "E-posta" },
                ] as { id: PreviewChannel; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPreviewChannel(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    previewChannel === tab.id
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {previewChannel === "banner" && (
            <div className="space-y-3">
              <div className={`rounded-xl p-3.5 ${activeSeverityMeta.bannerBg}`}>
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      {title.trim() || "Acil uyarı başlığı burada tek satırda görünür"}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0">
                    Detaylar
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Üyeler uygulamaya girdiklerinde üst çubuğun hemen altında bu şeridi görür ve Detaylar butonuna basarak tam rehberi okuyabilir.
              </p>
            </div>
          )}

          {previewChannel === "notification" && (
            <div className="rounded-xl border border-slate-200 dark:border-white/[0.10] p-4 space-y-2.5 bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${activeSeverityMeta.surfaceClass}`}
                >
                  <ShieldAlert className={`w-5 h-5 ${activeSeverityMeta.textClass}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`font-bold ${activeSeverityMeta.textClass}`}>
                      Genç Sosyal Güvenlik
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeSeverityMeta.label}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {title.trim() || "Acil güvenlik uyarısı başlığı"}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3 whitespace-pre-line">
                    {message.trim() || "Uyarı açıklaması üyelerin Bildirimler sayfasında bu şekilde görünür."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {previewChannel === "email" && (
            <div className="rounded-xl border border-slate-200 dark:border-white/[0.10] overflow-hidden bg-slate-50 dark:bg-[#090F1D]">
              <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424]">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Konu: [{activeSeverityMeta.label.toUpperCase()} GÜVENLİK UYARISI] Genç Sosyal —{" "}
                  {title.trim() || "Başlık"}
                </div>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className={`font-bold ${activeSeverityMeta.textClass}`}>
                    {categoryLabel}
                  </span>
                  <span className="font-mono tabular-nums">GS-SEC-ÖNİZLEME</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {title.trim() || "Acil güvenlik uyarısı başlığı"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {message.trim() || "Resmi açıklama metni burada görüntülenir."}
                </p>
                {previewSteps.length > 0 && (
                  <div className={`p-3 rounded-lg border space-y-1.5 ${activeSeverityMeta.surfaceClass}`}>
                    <div className={`text-[11px] font-bold ${activeSeverityMeta.textClass}`}>
                      Önerilen Güvenlik Adımları
                    </div>
                    {previewSteps.map((step, idx) => (
                      <div key={idx} className="text-slate-800 dark:text-slate-200">
                        <span className="font-mono font-bold mr-1.5">{idx + 1}.</span>
                        {step}
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white font-semibold">
                    <span>{actionLabel.trim() || "Güvenlik Ayarlarını Kontrol Et"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/[0.07]">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span>
              Acil güvenlik e-postaları zorunlu hesap güvenliği bildirimi olarak gönderilir ve tüm denetim kayıtları otomatik saklanır.
            </span>
          </div>
        </div>
      </div>

      {/* Incident History & Delivery Tracking Table */}
      <div className="bg-white dark:bg-[#0D1424] rounded-xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.07] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Gönderilen Acil Uyarı Geçmişi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bildirim teslimi, e-posta dağıtım ilerlemesi ve üye okuma sayıları canlı olarak izlenir.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
            {alerts.length} kayıt
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Acil durum kayıtları yükleniyor...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Henüz Acil Güvenlik Uyarısı Gönderilmedi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Sistemin nasıl çalıştığını denemek için yukarıdan &quot;Sadece Yöneticiler — Tatbikat&quot; seçeneğini kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {alerts.map((item) => {
              const sMeta = SEVERITY_META[item.severity] || SEVERITY_META.CRITICAL;
              const emailMeta =
                EMAIL_STATUS_LABELS[item.emailStatus] || EMAIL_STATUS_LABELS.SKIPPED;
              const catText =
                CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label || item.category;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-5 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {item.incidentCode}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span className={`font-bold ${sMeta.textClass}`}>{sMeta.label}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{catText}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                        ·
                      </span>
                      <span
                        className={
                          item.status === "ACTIVE"
                            ? "font-bold text-rose-600 dark:text-rose-400"
                            : "font-semibold text-emerald-700 dark:text-emerald-400"
                        }
                      >
                        {item.status === "ACTIVE" ? "Yayında (Aktif)" : "Çözüldü"}
                      </span>
                      {item.targetAudience === "ADMINS_ONLY" && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                            ·
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            Tatbikat
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString("tr-TR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      {item.createdByUser && (
                        <span>Gönderen: @{item.createdByUser.username}</span>
                      )}
                      <span>
                        Bildirim: {item.notificationSentCount.toLocaleString("tr-TR")}/
                        {item.recipientCount.toLocaleString("tr-TR")}
                      </span>
                      <span>
                        E-posta:{" "}
                        <strong className={emailMeta.className}>
                          {emailMeta.label}
                          {item.emailAttemptedCount > 0
                            ? ` (${item.emailSentCount}/${item.emailAttemptedCount})`
                            : ""}
                        </strong>
                      </span>
                      <span>Okuyan: {item.acknowledgedCount.toLocaleString("tr-TR")}</span>
                    </div>

                    {item.resolutionNote && (
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 pt-1">
                        Çözüm Notu: {item.resolutionNote}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingTarget(item);
                          setResolutionNote("");
                        }}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Çözüldü Olarak Kapat</span>
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 tabular-nums whitespace-nowrap">
                        {item.resolvedAt
                          ? `Kapatıldı · ${new Date(item.resolvedAt).toLocaleString("tr-TR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}`
                          : "Kapatıldı"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two-Step Confirmation Modal for All-Member Emergency Dispatch */}
      <AnimatePresence>
        {confirmModalOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-emergency-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-md bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-white/[0.12] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3
                      id="confirm-emergency-title"
                      className="text-base font-bold text-slate-900 dark:text-white"
                    >
                      Genel Acil Uyarıyı Onayla
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bu işlem tüm aktif üyelere anında iletilecektir.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  aria-label="Kapat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-1.5 text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                <div>
                  <strong>Hedef Üye Sayısı:</strong> {summary.activeMembersCount.toLocaleString("tr-TR")} aktif üye
                </div>
                <div>
                  <strong>Seçili Kanallar:</strong>{" "}
                  {[
                    sendNotification && "Uygulama Bildirimi",
                    sendEmail && (summary.smtpConfigured ? "Acil E-posta" : "E-posta (SMTP kapalı)"),
                    showBanner && "Üst Uyarı Şeridi",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                <div>
                  <strong>Başlık:</strong> {title}
                </div>
              </div>

              <div>
                <label
                  htmlFor="emergency-confirm-phrase"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Onaylamak için aşağıya <strong className="font-mono">{REQUIRED_CONFIRM_PHRASE}</strong> yazın:
                </label>
                <input
                  id="emergency-confirm-phrase"
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  placeholder={REQUIRED_CONFIRM_PHRASE}
                  autoComplete="off"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-white/[0.15] bg-white dark:bg-[#0B1120] text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.12] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={executeDispatch}
                  disabled={
                    dispatching ||
                    confirmPhrase.trim().toLocaleUpperCase("tr-TR") !== REQUIRED_CONFIRM_PHRASE
                  }
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-45 text-white text-xs font-bold cursor-pointer"
                >
                  {dispatching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Acil Uyarıyı Yayınla</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolve Active Alert Modal */}
      <AnimatePresence>
        {resolvingTarget && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolve-emergency-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-md bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200 dark:border-white/[0.12] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    id="resolve-emergency-title"
                    className="text-base font-bold text-slate-900 dark:text-white"
                  >
                    Acil Uyarıyı Çözüldü Olarak Kapat
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {resolvingTarget.incidentCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setResolvingTarget(null)}
                  aria-label="Kapat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Bu işlem aktif üst uyarı şeridini tüm üyeler için hemen kaldırır. İsteğe bağlı olarak denetim kaydına düşecek bir çözüm notu ekleyebilirsiniz.
              </p>

              <div>
                <label
                  htmlFor="emergency-resolution-note"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Çözüm Notu (İsteğe bağlı)
                </label>
                <textarea
                  id="emergency-resolution-note"
                  rows={3}
                  maxLength={1000}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Saldırı engellendi ve sistemler normal akışına döndü."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0B1120] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingTarget(null)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.12] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleResolveAlert}
                  disabled={resolvingBusy}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                >
                  {resolvingBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Uyarıyı Kapat</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
