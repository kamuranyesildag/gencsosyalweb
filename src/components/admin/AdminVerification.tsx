import React, { useEffect, useState, useCallback } from "react";
import { fetchApi } from "../../lib/api";
import {
  BadgeCheck,
  Check,
  X,
  Clock,
  Eye,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Search,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Users,
  Calendar,
  Activity,
  RotateCcw,
  MessageSquarePlus,
  Ban,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { VERIFICATION_CATEGORY_META } from "../VerifiedBadge";

interface AdminVerificationItem {
  id: number;
  userId: number;
  category: string;
  status: "pending" | "under_review" | "info_required" | "approved" | "rejected" | "revoked";
  reason: string;
  supportingLinks: string[];
  supportingDocuments: { name: string; type: string; summary: string; uploadedAt: string }[];
  infoRequestMessage?: string | null;
  applicantResponse?: string | null;
  eligibilitySnapshot?: Record<string, any>;
  adminNote?: string | null;
  rejectionReason?: string | null;
  cooldownUntil?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  username: string;
  email: string;
  isVerified: boolean;
  verificationCategory?: string | null;
  verifiedAt?: string | null;
  isMinor?: boolean;
  accountCreatedAt?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  website?: string | null;
  liveEligibility?: {
    isEligible: boolean;
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
    };
  } | null;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "İnceleme Bekliyor",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  under_review: {
    label: "İnceleniyor",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  info_required: {
    label: "Ek Bilgi Gerekli",
    className: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  },
  approved: {
    label: "Onaylandı",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Reddedildi",
    className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  revoked: {
    label: "Doğrulama Kaldırıldı",
    className: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
};

export function AdminVerification() {
  const [requests, setRequests] = useState<AdminVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedReq, setSelectedReq] = useState<AdminVerificationItem | null>(null);
  const [actionType, setActionType] = useState<
    "approved" | "rejected" | "info_required" | "under_review" | "revoked" | null
  >(null);
  const [actionCategory, setActionCategory] = useState<string>("INDIVIDUAL");
  const [adminNote, setAdminNote] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [infoRequestMessage, setInfoRequestMessage] = useState<string>("");
  const [cooldownDays, setCooldownDays] = useState<number>(14);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string>("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetchApi(`/admin/verifications?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRequests(Array.isArray(json.data) ? json.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch verification requests", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openActionModal = (
    req: AdminVerificationItem,
    type: "approved" | "rejected" | "info_required" | "under_review" | "revoked"
  ) => {
    setSelectedReq(req);
    setActionType(type);
    setActionCategory(req.category || "INDIVIDUAL");
    setAdminNote(req.adminNote || "");
    setRejectionReason(req.rejectionReason || "");
    setInfoRequestMessage(req.infoRequestMessage || "");
    setCooldownDays(14);
    setModalError("");
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;

    setModalError("");
    if (actionType === "rejected" && rejectionReason.trim().length < 5) {
      setModalError("Lütfen kullanıcıya iletilecek ret gerekçesini (en az 5 karakter) girin.");
      return;
    }
    if (actionType === "info_required" && infoRequestMessage.trim().length < 5) {
      setModalError("Lütfen talep edilen ek bilgi açıklamasını (en az 5 karakter) girin.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchApi(`/admin/verifications/${selectedReq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          category: actionCategory,
          adminNote: adminNote.trim(),
          rejectionReason: rejectionReason.trim(),
          infoRequestMessage: infoRequestMessage.trim(),
          cooldownDays,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "İşlem gerçekleştirilemedi.");
      }

      setSelectedReq(null);
      setActionType(null);
      await fetchRequests();
    } catch (err: any) {
      setModalError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Filters */}
      <div className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/12 border border-blue-500/25 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--theme-primary-text)] tracking-tight">
                Mavi Tik Başvuruları ve Doğrulama Yönetimi
              </h2>
              <p className="text-xs text-[var(--theme-secondary-text)] mt-0.5">
                Başvuru sahiplerinin gerçek takipçi, hesap yaşı, aktiflik, spam/sahte etkileşim
                risk puanı ve destekleyici belgelerini inceleyerek karar verin.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--theme-secondary-text)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kullanıcı adı veya açıklama ara..."
                className="pl-9 pr-3.5 py-2 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500 w-56"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="INDIVIDUAL">Bireysel</option>
              <option value="CREATOR">İçerik Üreticisi</option>
              <option value="ORGANIZATION">Kurum / Marka</option>
              <option value="COMMUNITY">Topluluk</option>
              <option value="PROJECT">Proje</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-primary-text)] focus:outline-none focus:border-blue-500"
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">İnceleme Bekliyor</option>
              <option value="under_review">İnceleniyor</option>
              <option value="info_required">Ek Bilgi Gerekli</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="revoked">Doğrulama Kaldırıldı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-border)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs text-[var(--theme-secondary-text)]">
            Başvurular ve canlı uygunluk metrikleri yükleniyor...
          </p>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-border)]">
          <BadgeCheck className="w-10 h-10 text-[var(--theme-secondary-text)]/50 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--theme-primary-text)]">
            Eşleşen Mavi Tik Başvurusu Bulunamadı
          </h3>
          <p className="text-xs text-[var(--theme-secondary-text)] mt-1">
            Seçili filtre kriterlerine uygun doğrulama başvurusu bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const metrics = req.liveEligibility?.metrics || (req.eligibilitySnapshot as any) || {};
            const stBadge = STATUS_BADGES[req.status] || STATUS_BADGES.pending;
            const catLabel =
              VERIFICATION_CATEGORY_META[req.category]?.label || req.category || "Bireysel";
            const riskScore = Number(metrics.riskScore || 0);
            const riskFlags: string[] = Array.isArray(metrics.riskFlags) ? metrics.riskFlags : [];

            return (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] space-y-5"
              >
                {/* Applicant Top Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
                  <div className="flex items-center gap-3.5">
                    {req.avatarUrl ? (
                      <img
                        src={req.avatarUrl}
                        alt={req.username}
                        className="w-12 h-12 rounded-full object-cover border border-[var(--theme-border)]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-base">
                        {(req.displayName || req.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`/profile/${req.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base font-bold text-[var(--theme-primary-text)] hover:text-blue-400 inline-flex items-center gap-1"
                        >
                          {req.displayName || req.username}
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                        <span className="text-xs text-[var(--theme-secondary-text)]">
                          @{req.username}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-500/12 text-blue-400 border border-blue-500/25">
                          {catLabel}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${stBadge.className}`}
                        >
                          {stBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--theme-secondary-text)] mt-1">
                        {req.email} • Başvuru No: #{req.id} • Tarih:{" "}
                        <span className="tabular-nums">
                          {new Date(req.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {req.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => openActionModal(req, "under_review")}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        İncelemeye Al
                      </button>
                    )}

                    {(req.status === "rejected" || req.status === "revoked") && (
                      <button
                        type="button"
                        onClick={() => openActionModal(req, "under_review")}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Yeniden İncele
                      </button>
                    )}

                    {req.status !== "approved" && (
                      <>
                        <button
                          type="button"
                          onClick={() => openActionModal(req, "info_required")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                          Ek Bilgi İste
                        </button>
                        <button
                          type="button"
                          onClick={() => openActionModal(req, "approved")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Onayla
                        </button>
                        <button
                          type="button"
                          onClick={() => openActionModal(req, "rejected")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reddet
                        </button>
                      </>
                    )}

                    {(req.status === "approved" || req.isVerified) && (
                      <button
                        type="button"
                        onClick={() => openActionModal(req, "revoked")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Mavi Tiki Geri Al
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Eligibility & Anti-Abuse Risk Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)]">
                    <div className="flex items-center justify-between text-[11px] text-[var(--theme-secondary-text)]">
                      <span>Gerçek Takipçi</span>
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-sm font-bold text-[var(--theme-primary-text)] mt-1 tabular-nums">
                      {Number(metrics.followerCount || 0).toLocaleString("tr-TR")} / 1.000
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)]">
                    <div className="flex items-center justify-between text-[11px] text-[var(--theme-secondary-text)]">
                      <span>Hesap Yaşı</span>
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-sm font-bold text-[var(--theme-primary-text)] mt-1 tabular-nums">
                      {Number(metrics.accountAgeDays || 0)} / 90 gün
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)]">
                    <div className="flex items-center justify-between text-[11px] text-[var(--theme-secondary-text)]">
                      <span>Profil Bütünlüğü</span>
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-sm font-bold text-[var(--theme-primary-text)] mt-1 tabular-nums">
                      %{Number(metrics.profileCompletionScore || 0)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--theme-bg)]/60 border border-[var(--theme-border)]">
                    <div className="flex items-center justify-between text-[11px] text-[var(--theme-secondary-text)]">
                      <span>30 Gün Aktiflik</span>
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-sm font-bold text-[var(--theme-primary-text)] mt-1 tabular-nums">
                      {Number(metrics.postsLast30Days || 0)} gönderi •{" "}
                      {Number(metrics.projectsCount || 0)} proje
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      riskScore >= 40
                        ? "bg-rose-500/10 border-rose-500/30"
                        : "bg-emerald-500/5 border-emerald-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--theme-secondary-text)]">
                      <span>Spam / Sahte Risk</span>
                      <ShieldAlert
                        className={`w-3.5 h-3.5 ${
                          riskScore >= 40 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      />
                    </div>
                    <div
                      className={`text-sm font-bold mt-1 tabular-nums ${
                        riskScore >= 40 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {riskScore} / 100 ({riskScore >= 40 ? "Riskli" : "Temiz"})
                    </div>
                  </div>
                </div>

                {/* Risk Flags Warning if any */}
                {riskFlags.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Sistem Tarafından Tespit Edilen Risk / Manipülasyon Sinyalleri:</span>
                    </div>
                    {riskFlags.map((flag, i) => (
                      <p key={i} className="pl-5">
                        • {flag}
                      </p>
                    ))}
                  </div>
                )}

                {/* Applicant Reason & Supporting Evidence */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-secondary-text)]">
                      Başvuru Açıklaması ve Özgünlük Beyanı
                    </span>
                    <p className="text-xs text-[var(--theme-primary-text)] leading-relaxed whitespace-pre-wrap">
                      {req.reason}
                    </p>
                    {req.bio && (
                      <p className="text-[11px] text-[var(--theme-secondary-text)] pt-2 border-t border-[var(--theme-border)]">
                        <span className="font-semibold">Profil Biyografisi:</span> {req.bio}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--theme-bg)]/50 border border-[var(--theme-border)] space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-secondary-text)]">
                      Destekleyici Bağlantılar ve Korumalı Belgeler
                    </span>

                    {Array.isArray(req.supportingLinks) && req.supportingLinks.length > 0 ? (
                      <div className="space-y-1.5">
                        {req.supportingLinks.map((lnk, idx) => (
                          <a
                            key={idx}
                            href={lnk}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-blue-400 hover:underline truncate"
                          >
                            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{lnk}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--theme-secondary-text)]">
                        Destekleyici bağlantı eklenmemiş.
                      </p>
                    )}

                    {Array.isArray(req.supportingDocuments) &&
                      req.supportingDocuments.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[var(--theme-border)]">
                          {req.supportingDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-[var(--theme-card-bg)] border border-[var(--theme-border)] text-xs"
                            >
                              <div className="flex items-center gap-1.5 font-semibold text-[var(--theme-primary-text)]">
                                <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>{doc.name}</span>
                                <span className="text-[11px] text-blue-400">({doc.type})</span>
                              </div>
                              <p className="text-[var(--theme-secondary-text)] mt-0.5">
                                {doc.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Additional Info Exchange / Admin Notes */}
                {(req.infoRequestMessage ||
                  req.applicantResponse ||
                  req.adminNote ||
                  req.rejectionReason) && (
                  <div className="p-4 rounded-xl bg-[var(--theme-bg)]/40 border border-[var(--theme-border)] space-y-2 text-xs">
                    {req.infoRequestMessage && (
                      <p className="text-amber-300">
                        <span className="font-bold">Talep Edilen Ek Bilgi:</span>{" "}
                        {req.infoRequestMessage}
                      </p>
                    )}
                    {req.applicantResponse && (
                      <p className="text-emerald-300">
                        <span className="font-bold">Kullanıcının Ek Bilgi Yanıtı:</span>{" "}
                        {req.applicantResponse}
                      </p>
                    )}
                    {req.adminNote && (
                      <p className="text-[var(--theme-secondary-text)]">
                        <span className="font-bold text-[var(--theme-primary-text)]">
                          Yönetici İç Notu:
                        </span>{" "}
                        {req.adminNote}
                      </p>
                    )}
                    {req.rejectionReason && (
                      <p className="text-rose-400">
                        <span className="font-bold">Ret / İptal Gerekçesi:</span>{" "}
                        {req.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--theme-card-bg)] border border-[var(--theme-border)] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--theme-primary-text)]">
                {actionType === "approved" && "Mavi Tik Başvurusunu Onayla"}
                {actionType === "rejected" && "Başvuruyu Reddet"}
                {actionType === "info_required" && "Kullanıcıdan Ek Bilgi Talep Et"}
                {actionType === "under_review" && "Başvuruyu İncelemeye Al"}
                {actionType === "revoked" && "Verilen Mavi Tiki Geri Al"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                }}
                className="text-[var(--theme-secondary-text)] hover:text-[var(--theme-primary-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div className="text-xs text-[var(--theme-secondary-text)]">
                Kullanıcı:{" "}
                <span className="font-bold text-[var(--theme-primary-text)]">
                  @{selectedReq.username}
                </span>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                  {modalError}
                </div>
              )}

              {actionType === "approved" && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
                    Onaylanacak Doğrulama Kategorisi
                  </label>
                  <select
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)]"
                  >
                    <option value="INDIVIDUAL">Bireysel</option>
                    <option value="CREATOR">İçerik Üreticisi</option>
                    <option value="ORGANIZATION">Kurum / Marka</option>
                    <option value="COMMUNITY">Topluluk</option>
                    <option value="PROJECT">Proje</option>
                  </select>
                </div>
              )}

              {actionType === "info_required" && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
                    Kullanıcıya İletilecek Ek Bilgi Talebi *
                  </label>
                  <textarea
                    value={infoRequestMessage}
                    onChange={(e) => setInfoRequestMessage(e.target.value)}
                    rows={3}
                    required
                    placeholder="Örn: TEKNOFEST takım kaydınızı veya kurumsal web sitenizdeki resmî bağlantıyı paylaşır mısınız?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)]"
                  />
                </div>
              )}

              {(actionType === "rejected" || actionType === "revoked") && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
                      {actionType === "revoked"
                        ? "Mavi Tik Geri Alma Gerekçesi *"
                        : "Kullanıcıya Gösterilecek Ret Gerekçesi *"}
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      required
                      placeholder="Örn: Özgünlük ve düzenli etkinlik kriterleri karşılanmadığı için başvurunuz onaylanmamıştır."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)]"
                    />
                  </div>

                  {actionType === "rejected" && (
                    <div>
                      <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
                        Yeniden Başvuru Bekleme Süresi (Gün)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={cooldownDays}
                        onChange={(e) => setCooldownDays(Number(e.target.value) || 14)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)] tabular-nums"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-secondary-text)] uppercase tracking-wider mb-1.5">
                  Yönetici Denetim Kaydı Notu (İç Not)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Denetim kaydı (audit log) için isteğe bağlı yönetici notu..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm text-[var(--theme-primary-text)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReq(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-secondary-text)]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  İşlemi Onayla ve Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
