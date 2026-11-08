import React, { useEffect, useState, useCallback } from "react";
import { fetchApi } from "../lib/api";
import {
  BadgeCheck,
  Clock,
  XCircle,
  Send,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Link as LinkIcon,
  FileText,
  Plus,
  Trash2,
  Users,
  Calendar,
  UserCheck,
  Activity,
  Sparkles,
  Building2,
  Rocket,
  Lock,
  Info,
} from "lucide-react";
import { VERIFICATION_CATEGORY_META } from "./VerifiedBadge";

interface CriterionResult {
  key: string;
  label: string;
  passed: boolean;
  currentValue: string | number;
  requiredValue: string | number;
  summary: string;
  reasonIfUnmet?: string;
}

interface EligibilityReport {
  userId: number;
  category: string;
  isEligible: boolean;
  canApplyNow: boolean;
  blockingReason: string | null;
  cooldownUntil: string | null;
  metrics: {
    followerCount: number;
    requiredFollowers: number;
    accountAgeDays: number;
    requiredAccountAgeDays: number;
    profileCompletionScore: number;
    missingProfileFields: string[];
    postsLast30Days: number;
    commentsLast30Days: number;
    projectsCount: number;
    communitiesOwnedCount: number;
    riskScore: number;
    riskFlags: string[];
    highRiskViolationsCount: number;
    recentApplicationsCount30d: number;
  };
  criteria: {
    followers: CriterionResult;
    accountAge: CriterionResult;
    profileCompleteness: CriterionResult;
    activity: CriterionResult;
    originality: CriterionResult;
    reliability: CriterionResult;
    communityGuidelines: CriterionResult;
  };
}

interface SupportingDocInput {
  name: string;
  type: string;
  summary: string;
}

interface VerificationRequestItem {
  id: number;
  category: string;
  status: "pending" | "under_review" | "info_required" | "approved" | "rejected" | "revoked";
  reason: string;
  supportingLinks: string[];
  supportingDocuments: { name: string; type: string; summary: string; uploadedAt: string }[];
  infoRequestMessage?: string | null;
  applicantResponse?: string | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
  cooldownUntil?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

const CATEGORY_OPTIONS = [
  {
    id: "INDIVIDUAL",
    label: "Bireysel",
    subtitle: "Tanınan veya topluluk içinde bilinirliği bulunan kişiler",
    icon: UserCheck,
  },
  {
    id: "CREATOR",
    label: "İçerik Üreticisi",
    subtitle: "Düzenli ve özgün içerik üreten hesaplar",
    icon: Sparkles,
  },
  {
    id: "ORGANIZATION",
    label: "Kurum / Marka",
    subtitle: "Resmî kurumlar, şirketler, kulüpler ve markalar",
    icon: Building2,
  },
  {
    id: "COMMUNITY",
    label: "Topluluk",
    subtitle: "Gerçek ve aktif topluluk hesapları",
    icon: Users,
  },
  {
    id: "PROJECT",
    label: "Proje",
    subtitle: "TEKNOFEST projeleri, teknoloji takımları ve özgün öğrenci projeleri",
    icon: Rocket,
  },
] as const;

const STATUS_META: Record<
  string,
  { label: string; badgeClass: string; description: string }
> = {
  draft: {
    label: "Başvuru hazırlanıyor",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    description: "Uygunluk kriterlerini inceleyip başvuru formunu doldurabilirsiniz.",
  },
  pending: {
    label: "İnceleme bekliyor",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    description: "Başvurunuz alındı ve moderasyon inceleme sırasına eklendi.",
  },
  under_review: {
    label: "İnceleniyor",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    description: "Başvurunuz şu anda Genç Sosyal doğrulama ekibi tarafından inceleniyor.",
  },
  info_required: {
    label: "Ek bilgi gerekli",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    description: "İnceleme ekibi başvurunuzu değerlendirmek için sizden ek bilgi talep etti.",
  },
  approved: {
    label: "Onaylandı",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    description: "Hesabınız doğrulandı ve Mavi Tik rozetiniz aktif.",
  },
  rejected: {
    label: "Reddedildi",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    description: "Başvurunuz kriterleri karşılamadığı için onaylanmadı.",
  },
  revoked: {
    label: "Doğrulama Kaldırıldı",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    description: "Hesabınızın mavi tik doğrulaması yönetici kararıyla kaldırıldı.",
  },
};

export function SettingsVerification() {
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityReport | null>(null);
  const [currentVerification, setCurrentVerification] = useState<{
    isVerified: boolean;
    verificationCategory: string | null;
    verifiedAt: string | null;
    isMinor: boolean;
  }>({
    isVerified: false,
    verificationCategory: null,
    verifiedAt: null,
    isMinor: false,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("INDIVIDUAL");
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Application form state
  const [reason, setReason] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [supportingLinks, setSupportingLinks] = useState<string[]>([]);
  const [supportingDocs, setSupportingDocs] = useState<SupportingDocInput[]>([]);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Resmî / Kurumsal Referans");
  const [docSummary, setDocSummary] = useState("");

  // Additional info response state (when status === 'info_required')
  const [applicantResponse, setApplicantResponse] = useState("");
  const [extraLinkInput, setExtraLinkInput] = useState("");
  const [extraLinks, setExtraLinks] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchVerificationState = useCallback(
    async (categoryToCheck: string, isInitial = false) => {
      if (isInitial) setLoading(true);
      else setRecalculating(true);

      try {
        const res = await fetchApi(
          `/verification/me?category=${encodeURIComponent(categoryToCheck)}`
        );
        const json = await res.json();
        if (json.success) {
          setRequests(Array.isArray(json.data) ? json.data : []);
          if (json.eligibility) setEligibility(json.eligibility);
          if (json.currentVerification) setCurrentVerification(json.currentVerification);
        }
      } catch (err) {
        console.error("Failed to fetch verification state", err);
      } finally {
        setLoading(false);
        setRecalculating(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchVerificationState(selectedCategory, true);
  }, [fetchVerificationState, selectedCategory]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setError("");
  };

  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Destekleyici bağlantı http:// veya https:// ile başlamalıdır.");
      return;
    }
    if (supportingLinks.length >= 5) {
      setError("En fazla 5 destekleyici bağlantı ekleyebilirsiniz.");
      return;
    }
    if (!supportingLinks.includes(trimmed)) {
      setSupportingLinks([...supportingLinks, trimmed]);
    }
    setLinkInput("");
    setError("");
  };

  const handleRemoveLink = (idx: number) => {
    setSupportingLinks(supportingLinks.filter((_, i) => i !== idx));
  };

  const handleAddDoc = () => {
    if (!docName.trim() || !docSummary.trim()) {
      setError("Belge/referans adı ve kısa açıklaması zorunludur.");
      return;
    }
    if (supportingDocs.length >= 5) {
      setError("En fazla 5 adet destekleyici belge/referans kaydı ekleyebilirsiniz.");
      return;
    }
    setSupportingDocs([
      ...supportingDocs,
      {
        name: docName.trim(),
        type: docType,
        summary: docSummary.trim(),
      },
    ]);
    setDocName("");
    setDocSummary("");
    setError("");
  };

  const handleRemoveDoc = (idx: number) => {
    setSupportingDocs(supportingDocs.filter((_, i) => i !== idx));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (reason.trim().length < 30) {
      setError(
        "Lütfen başvuru açıklamanızı ve özgünlük gerekçenizi en az 30 karakter olacak şekilde yazın."
      );
      return;
    }

    setSubmitting(true);
    try {
      const finalLinks = [...supportingLinks];
      if (linkInput.trim() && /^https?:\/\//i.test(linkInput.trim()) && finalLinks.length < 5) {
        finalLinks.push(linkInput.trim());
      }

      const res = await fetchApi("/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          reason: reason.trim(),
          supportingLinks: finalLinks,
          supportingDocuments: supportingDocs,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.eligibility) setEligibility(json.eligibility);
        throw new Error(json.error?.message || "Başvuru gönderilemedi.");
      }

      setReason("");
      setLinkInput("");
      setSupportingLinks([]);
      setSupportingDocs([]);
      setSuccessMsg(
        "Mavi tik doğrulama başvurunuz başarıyla alındı ve inceleme sırasına eklendi."
      );
      await fetchVerificationState(selectedCategory);
    } catch (err: any) {
      setError(err.message || "Başvuru sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondInfoRequest = async (reqId: number, e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (applicantResponse.trim().length < 10) {
      setError("Lütfen talep edilen ek bilgiyi en az 10 karakter olacak şekilde açıklayın.");
      return;
    }

    setSubmitting(true);
    try {
      const linksToSend = [...extraLinks];
      if (extraLinkInput.trim() && /^https?:\/\//i.test(extraLinkInput.trim())) {
        linksToSend.push(extraLinkInput.trim());
      }

      const res = await fetchApi(`/verification/${reqId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantResponse: applicantResponse.trim(),
          supportingLinks: linksToSend,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Ek bilgi gönderilemedi.");
      }

      setApplicantResponse("");
      setExtraLinkInput("");
      setExtraLinks([]);
      setSuccessMsg("Ek bilgileriniz kaydedildi ve başvurunuz tekrar incelemeye alındı.");
      await fetchVerificationState(selectedCategory);
    } catch (err: any) {
      setError(err.message || "Yanıt gönderilirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-[var(--theme-secondary-text)]">
          Hesap doğrulama kriterleri ve başvuru geçmişi yükleniyor...
        </p>
      </div>
    );
  }

  const activeRequest = requests.find((r) =>
    ["pending", "under_review", "info_required"].includes(r.status)
  );
  const latestRequest = requests[0] || null;
  const currentStatusKey = currentVerification.isVerified
    ? "approved"
    : activeRequest
    ? activeRequest.status
    : latestRequest?.status === "rejected"
    ? "rejected"
    : "draft";
  const statusInfo = STATUS_META[currentStatusKey] || STATUS_META.draft;

  const criteriaList: CriterionResult[] = eligibility
    ? [
        eligibility.criteria.followers,
        eligibility.criteria.accountAge,
        eligibility.criteria.profileCompleteness,
        eligibility.criteria.activity,
        eligibility.criteria.originality,
        eligibility.criteria.reliability,
        eligibility.criteria.communityGuidelines,
      ]
    : [];

  const passedCriteriaCount = criteriaList.filter((c) => c.passed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & What Blue Badge Means */}
      <div className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--theme-border)]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/12 border border-blue-500/25 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-[var(--theme-primary-text)] tracking-tight">
                  Mavi Tik Doğrulama Sistemi
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${statusInfo.badgeClass}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-[var(--theme-secondary-text)] mt-1 leading-relaxed">
                Genç Sosyal&apos;de mavi tik; hesabın gerçek bir kişiyi, içerik üreticisini,
                kurumu, aktif bir topluluğu veya TEKNOFEST / teknoloji projesini özgün ve
                güvenilir biçimde temsil ettiğini doğrular.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <div className="p-3.5 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)]">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              Satın Alınamaz
            </p>
            <p className="text-xs text-[var(--theme-secondary-text)] leading-relaxed">
              Mavi tik hiçbir zaman ücretli satılmaz veya otomatik verilmez; yalnızca kriterleri
              sağlayan hesaplara inceleme sonunda verilir.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)]">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              Proje &amp; Topluluk Desteği
            </p>
            <p className="text-xs text-[var(--theme-secondary-text)] leading-relaxed">
              TEKNOFEST takımları, öğrenci projeleri ve aktif topluluklar yalnızca takipçi
              sayısıyla değil; özgünlük ve üretim faaliyetiyle de değerlendirilir.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)]">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              Veri Güvenliği
            </p>
            <p className="text-xs text-[var(--theme-secondary-text)] leading-relaxed">
              Destekleyici referanslar yalnızca yetkili yöneticiler tarafından görülür. T.C. Kimlik
              Numarası gibi hassas veriler asla talep edilmez.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Active Verified Banner if Already Approved */}
      {currentVerification.isVerified && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-emerald-400">
                  Hesabınız Doğrulanmış (Mavi Tik Aktif)
                </h3>
                {currentVerification.verificationCategory && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {VERIFICATION_CATEGORY_META[currentVerification.verificationCategory]?.label ||
                      currentVerification.verificationCategory}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--theme-secondary-text)] mt-1">
                Rozetiniz profilinizde, gönderilerinizde, yorumlarınızda ve arama sonuçlarında
                aktif olarak gösterilmektedir.
              </p>
            </div>
          </div>
          {currentVerification.verifiedAt && (
            <div className="text-xs text-[var(--theme-secondary-text)] tabular-nums shrink-0">
              Onay Tarihi:{" "}
              {new Date(currentVerification.verifiedAt).toLocaleDateString("tr-TR")}
            </div>
          )}
        </div>
      )}

      {/* 3. Active Application Status / Info Required / Rejection Notice */}
      {activeRequest && (
        <div className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-[var(--theme-primary-text)]">
                  Mevcut Başvuru Durumu:{" "}
                  {STATUS_META[activeRequest.status]?.label || activeRequest.status}
                </h3>
                <p className="text-xs text-[var(--theme-secondary-text)] mt-0.5">
                  Kategori:{" "}
                  <span className="font-semibold text-[var(--theme-primary-text)]">
                    {VERIFICATION_CATEGORY_META[activeRequest.category]?.label ||
                      activeRequest.category}
                  </span>{" "}
                  • Başvuru Tarihi:{" "}
                  <span className="tabular-nums">
                    {new Date(activeRequest.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-semibold border ${
                STATUS_META[activeRequest.status]?.badgeClass || ""
              }`}
            >
              {STATUS_META[activeRequest.status]?.label}
            </span>
          </div>

          <p className="text-sm text-[var(--theme-secondary-text)] bg-[var(--theme-bg)]/60 p-3.5 rounded-xl border border-[var(--theme-border)]">
            {STATUS_META[activeRequest.status]?.description}
          </p>

          {activeRequest.status === "info_required" && (
            <form
              onSubmit={(e) => handleRespondInfoRequest(activeRequest.id, e)}
              className="p-5 rounded-xl bg-amber-500/8 border border-amber-500/30 space-y-4"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    Yönetici Ek Bilgi Talebi
                  </h4>
                  <p className="text-sm text-[var(--theme-primary-text)] mt-1">
                    {activeRequest.infoRequestMessage ||
                      "Lütfen projenizi, topluluğunuzu veya kimlik/kurum temsilinizi doğrulayan ek açıklama ve bağlantıları paylaşın."}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
                  Yanıtınız ve Ek Açıklamanız
                </label>
                <textarea
                  value={applicantResponse}
                  onChange={(e) => setApplicantResponse(e.target.value)}
                  rows={3}
                  maxLength={1500}
                  required
                  placeholder="Talep edilen bilgileri buraya detaylıca yazın..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
                  Ek Doğrulama Bağlantısı (İsteğe Bağlı)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={extraLinkInput}
                    onChange={(e) => setExtraLinkInput(e.target.value)}
                    placeholder="https://github.com/... veya resmî proje sayfası"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        extraLinkInput.trim() &&
                        /^https?:\/\//i.test(extraLinkInput.trim())
                      ) {
                        setExtraLinks([...extraLinks, extraLinkInput.trim()]);
                        setExtraLinkInput("");
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/25 transition-colors"
                  >
                    Ekle
                  </button>
                </div>
                {extraLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extraLinks.map((lnk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs text-blue-400"
                      >
                        {lnk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Ek Bilgileri İncelemeye Gönder
              </button>
            </form>
          )}
        </div>
      )}

      {/* Latest Rejected Notice */}
      {!currentVerification.isVerified &&
        !activeRequest &&
        latestRequest?.status === "rejected" && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>Son Başvurunuz Reddedildi</span>
            </div>
            {latestRequest.rejectionReason && (
              <p className="text-sm text-[var(--theme-primary-text)]">
                <span className="font-semibold text-rose-300">Ret Gerekçesi:</span>{" "}
                {latestRequest.rejectionReason}
              </p>
            )}
            {latestRequest.cooldownUntil &&
              new Date(latestRequest.cooldownUntil).getTime() > Date.now() && (
                <p className="text-xs text-[var(--theme-secondary-text)] tabular-nums">
                  Yeniden başvuru açılış tarihi:{" "}
                  <span className="font-semibold text-[var(--theme-primary-text)]">
                    {new Date(latestRequest.cooldownUntil).toLocaleDateString("tr-TR")}
                  </span>
                </p>
              )}
          </div>
        )}

      {/* 4. Live Metrics Summary Cards */}
      {eligibility && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
            <div className="flex items-center justify-between text-xs text-[var(--theme-secondary-text)] mb-1.5">
              <span>Gerçek Takipçi</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-[var(--theme-primary-text)] tabular-nums">
              {eligibility.metrics.followerCount.toLocaleString("tr-TR")}{" "}
              <span className="text-xs font-normal text-[var(--theme-secondary-text)]">
                / {eligibility.metrics.requiredFollowers.toLocaleString("tr-TR")}
              </span>
            </div>
            <p className="text-[11px] text-[var(--theme-secondary-text)] mt-1">
              {eligibility.criteria.followers.passed
                ? "Kriter karşılandı"
                : selectedCategory === "PROJECT" || selectedCategory === "COMMUNITY"
                ? "Aktif proje/topluluk ile esnek"
                : "En az 1.000 takipçi gerekli"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
            <div className="flex items-center justify-between text-xs text-[var(--theme-secondary-text)] mb-1.5">
              <span>Hesap Yaşı</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-[var(--theme-primary-text)] tabular-nums">
              {eligibility.metrics.accountAgeDays}{" "}
              <span className="text-xs font-normal text-[var(--theme-secondary-text)]">
                / {eligibility.metrics.requiredAccountAgeDays} gün
              </span>
            </div>
            <p className="text-[11px] text-[var(--theme-secondary-text)] mt-1">
              {eligibility.criteria.accountAge.passed
                ? "90 gün şartı tamamlandı"
                : `${Math.max(
                    1,
                    eligibility.metrics.requiredAccountAgeDays -
                      eligibility.metrics.accountAgeDays
                  )} gün kaldı`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
            <div className="flex items-center justify-between text-xs text-[var(--theme-secondary-text)] mb-1.5">
              <span>Profil Bütünlüğü</span>
              <UserCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-[var(--theme-primary-text)] tabular-nums">
              %{eligibility.metrics.profileCompletionScore}
            </div>
            <p className="text-[11px] text-[var(--theme-secondary-text)] mt-1 truncate">
              {eligibility.criteria.profileCompleteness.passed
                ? "Tüm zorunlu alanlar tam"
                : `${eligibility.metrics.missingProfileFields.length} eksik bilgi var`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
            <div className="flex items-center justify-between text-xs text-[var(--theme-secondary-text)] mb-1.5">
              <span>30 Günlük Etkinlik</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-[var(--theme-primary-text)] tabular-nums">
              {eligibility.metrics.postsLast30Days} gönderi
            </div>
            <p className="text-[11px] text-[var(--theme-secondary-text)] mt-1 tabular-nums">
              {eligibility.metrics.projectsCount} proje •{" "}
              {eligibility.metrics.communitiesOwnedCount} topluluk
            </p>
          </div>
        </div>
      )}

      {/* 5. Category Selection */}
      <div className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--theme-primary-text)]">
              1. Doğrulama Kategorisi Seçin
            </h3>
            <p className="text-xs text-[var(--theme-secondary-text)] mt-0.5">
              Hesabınızın temsil ettiği kimliğe en uygun kategoriyi seçin. Uygunluk kriterleri
              seçtiğiniz kategoriye göre hesaplanır.
            </p>
          </div>
          {recalculating && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CATEGORY_OPTIONS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-blue-500/12 border-blue-500 text-[var(--theme-primary-text)] shadow-sm"
                    : "bg-[var(--theme-bg)]/50 border-[var(--theme-border)] text-[var(--theme-secondary-text)] hover:border-blue-500/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={`w-5 h-5 ${
                      isSelected ? "text-blue-400" : "text-[var(--theme-secondary-text)]"
                    }`}
                  />
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--theme-primary-text)]">
                    {cat.label}
                  </div>
                  <p className="text-[11px] text-[var(--theme-secondary-text)] mt-1 leading-snug">
                    {cat.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. 7-Item Eligibility Checklist */}
      {eligibility && (
        <div className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[var(--theme-primary-text)]">
                2. Başvuru Uygunluk Kontrol Listesi
              </h3>
              <p className="text-xs text-[var(--theme-secondary-text)] mt-0.5">
                Mavi tik başvurusu gönderebilmek için aşağıdaki 7 asgari kriterin karşılanması
                gerekmektedir.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-primary-text)] tabular-nums">
              {passedCriteriaCount} / {criteriaList.length} Kriter Uygun
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criteriaList.map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-xl border transition-colors ${
                  item.passed
                    ? "bg-emerald-500/5 border-emerald-500/25"
                    : "bg-amber-500/5 border-amber-500/25"
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--theme-primary-text)]">
                        {item.label}
                      </span>
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          item.passed ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {item.currentValue}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--theme-secondary-text)] mt-1 leading-relaxed">
                      {item.summary}
                    </p>
                    {!item.passed && item.reasonIfUnmet && (
                      <p className="text-xs text-amber-300/90 mt-1.5 font-medium">
                        • {item.reasonIfUnmet}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Application Form (Shown if not already verified and no active application) */}
      {!currentVerification.isVerified && !activeRequest && (
        <form
          onSubmit={handleSubmitApplication}
          className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] space-y-5"
        >
          <div>
            <h3 className="text-base font-bold text-[var(--theme-primary-text)]">
              3. Mavi Tik Doğrulama Başvuru Formu
            </h3>
            <p className="text-xs text-[var(--theme-secondary-text)] mt-0.5">
              Seçilen Kategori:{" "}
              <span className="font-semibold text-blue-400">
                {VERIFICATION_CATEGORY_META[selectedCategory]?.label}
              </span>{" "}
              — Şartları karşılamak mavi tikin otomatik verileceği anlamına gelmez; başvurunuz
              yönetici ekibi tarafından incelenir.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Minor / Privacy Protection Notice */}
          <div className="p-3.5 rounded-xl bg-blue-500/8 border border-blue-500/20 flex items-start gap-2.5 text-xs text-[var(--theme-secondary-text)]">
            <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--theme-primary-text)]">
                Gizlilik ve Güvenlik Uyarısı:
              </span>{" "}
              Başvuru açıklamanızda veya referans kayıtlarınızda{" "}
              <strong>T.C. Kimlik Numarası</strong>, pasaport/ehliyet fotoğrafı veya açık ev
              adresi paylaşmayın. Paylaştığınız referans bilgileri yalnızca yetkili yöneticiler
              tarafından incelenir ve herkese açık yayınlanmaz.
            </div>
          </div>

          {/* Reason / Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider">
                Başvuru Açıklaması ve Özgünlük Gerekçesi *
              </label>
              <span className="text-xs text-[var(--theme-secondary-text)] tabular-nums">
                {reason.length} / 1500 (en az 30 karakter)
              </span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={1500}
              required
              placeholder={
                selectedCategory === "PROJECT"
                  ? "TEKNOFEST veya teknoloji projenizin adını, takım rolünüzü, projenin amacını ve başarılarını açıklayın..."
                  : selectedCategory === "COMMUNITY"
                  ? "Topluluğunuzun amacını, aktif üye etkinliklerini ve Genç Sosyal'deki çalışmalarını açıklayın..."
                  : "Hesabınızın neden doğrulanması gerektiğini, çalışmalarınızı ve topluluk içindeki bilinirliğinizi açıklayın..."
              }
              className="w-full px-4 py-3 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)] placeholder:text-[var(--theme-secondary-text)]/60 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Supporting Links */}
          <div>
            <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
              Destekleyici Bağlantılar (Resmî Web Sitesi, GitHub, TEKNOFEST, LinkedIn vb.)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-[var(--theme-secondary-text)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://github.com/kullanici veya https://teknofest.org/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--theme-bg)] hover:bg-blue-500/15 text-[var(--theme-primary-text)] hover:text-blue-400 border border-[var(--theme-border)] text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Bağlantı Ekle
              </button>
            </div>

            {supportingLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {supportingLinks.map((lnk, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs text-blue-400"
                  >
                    <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[260px]">{lnk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="text-[var(--theme-secondary-text)] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Protected Supporting Document / Reference Summaries */}
          <div className="p-4 rounded-xl bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-[var(--theme-primary-text)] uppercase tracking-wider">
                  Destekleyici Belge / Kurumsal Referans Kaydı (Yalnızca Yöneticiye Görünür)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Belge / Sertifika / Takım Adı"
                maxLength={120}
                className="px-3.5 py-2 rounded-xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
              />
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
              >
                <option value="TEKNOFEST / Yarışma Kaydı">TEKNOFEST / Yarışma Kaydı</option>
                <option value="Öğrenci Kulübü / Topluluk Belgesi">
                  Öğrenci Kulübü / Topluluk Belgesi
                </option>
                <option value="Resmî / Kurumsal Referans">Resmî / Kurumsal Referans</option>
                <option value="Portfolyo / Basın Yansıması">Portfolyo / Basın Yansıması</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={docSummary}
                  onChange={(e) => setDocSummary(e.target.value)}
                  placeholder="Belge no veya doğrulama açıklaması"
                  maxLength={400}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddDoc}
                  className="px-3 py-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/25 shrink-0"
                >
                  Ekle
                </button>
              </div>
            </div>

            {supportingDocs.length > 0 && (
              <div className="space-y-2 pt-1">
                {supportingDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--theme-card-bg)] border border-[var(--theme-border)] text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-[var(--theme-primary-text)]">
                        {doc.name}
                      </span>{" "}
                      <span className="text-blue-400">({doc.type})</span>
                      <p className="text-[var(--theme-secondary-text)] truncate mt-0.5">
                        {doc.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-[var(--theme-secondary-text)] hover:text-rose-400 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocking explanation if not eligible */}
          {eligibility && !eligibility.canApplyNow && eligibility.blockingReason && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300 text-xs leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold">Başvuru Şu Anda Gönderilemiyor:</span>{" "}
                {eligibility.blockingReason}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || Boolean(eligibility && !eligibility.canApplyNow)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-45 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Mavi Tik Başvurusu Gönder
            </button>
          </div>
        </form>
      )}

      {/* 8. Application History */}
      {requests.length > 0 && (
        <div className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] space-y-4">
          <h3 className="text-base font-bold text-[var(--theme-primary-text)]">
            Başvuru Geçmişi
          </h3>
          <div className="space-y-3">
            {requests.map((req) => {
              const st = STATUS_META[req.status] || STATUS_META.pending;
              const catLabel =
                VERIFICATION_CATEGORY_META[req.category]?.label || req.category || "Bireysel";
              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)] space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-500/12 text-blue-400 border border-blue-500/25">
                        {catLabel}
                      </span>
                      <span className="text-xs text-[var(--theme-secondary-text)] tabular-nums">
                        {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${st.badgeClass}`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--theme-primary-text)] leading-relaxed">
                    {req.reason}
                  </p>
                  {req.rejectionReason && (
                    <p className="text-xs text-rose-400 pt-1">
                      <span className="font-semibold">Ret Gerekçesi:</span>{" "}
                      {req.rejectionReason}
                    </p>
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
