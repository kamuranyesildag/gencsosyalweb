import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Shield,
  Users,
  Crown,
  Lock,
  KeyRound,
  Copy,
  RefreshCw,
  UserPlus,
  UserMinus,
  Ban,
  Check,
  X,
  Settings,
  ClipboardList,
  LogOut,
  Trash2,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { useSEO } from "../hooks/useSEO";
import { toast } from "../components/ui/Toast";
import { Avatar } from "../components/ui/Avatar";
import { SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useConfirmStore } from "../components/ui/ConfirmDialog";
import { backdropVariants, modalVariants } from "../lib/motion";
import {
  teamsFetch,
  TEAM_CATEGORY_OPTIONS,
  TEAM_BANNER_COLORS,
  getCategoryLabel,
  getVisibilityLabel,
  getJoinPolicyLabel,
  getRoleLabel,
  getAuditActionLabel,
  type TeamItem,
  type TeamMemberItem,
  type TeamJoinRequestItem,
  type TeamInvitationItem,
  type TeamBanItem,
  type TeamAuditLogItem,
} from "../lib/teamConstants";

type DetailTab = "members" | "requests" | "settings" | "audit";

export function TeamDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const { showConfirm } = useConfirmStore();

  const [team, setTeam] = useState<TeamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("members");

  // Leadership data
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequestItem[]>([]);
  const [sentInvites, setSentInvites] = useState<TeamInvitationItem[]>([]);
  const [bans, setBans] = useState<TeamBanItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<TeamAuditLogItem[]>([]);

  // Action modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyNote, setApplyNote] = useState("");
  const [submittingJoin, setSubmittingJoin] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [banTarget, setBanTarget] = useState<TeamMemberItem | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);

  const [editPositionTarget, setEditPositionTarget] = useState<TeamMemberItem | null>(null);
  const [positionInput, setPositionInput] = useState("");

  // Settings form state (Captain)
  const [savingSettings, setSavingSettings] = useState(false);
  const [formName, setFormName] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formCategory, setFormCategory] = useState("GENEL");
  const [formDescription, setFormDescription] = useState("");
  const [formVisibility, setFormVisibility] = useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PUBLIC");
  const [formJoinPolicy, setFormJoinPolicy] = useState<"OPEN" | "APPROVAL" | "INVITE_ONLY">("APPROVAL");
  const [formMaxMembers, setFormMaxMembers] = useState(15);
  const [formBannerColor, setFormBannerColor] = useState("#2563EB");
  const [formRules, setFormRules] = useState("");
  const [formSkills, setFormSkills] = useState("");
  const [formRecruiting, setFormRecruiting] = useState(true);
  const [formAllowMemberInvites, setFormAllowMemberInvites] = useState(false);
  const [formRequireVerifiedEmail, setFormRequireVerifiedEmail] = useState(false);
  const [formIsLocked, setFormIsLocked] = useState(false);
  const [formInviteCodeEnabled, setFormInviteCodeEnabled] = useState(true);
  const [transferTargetId, setTransferTargetId] = useState<string>("");
  const [rotatingCode, setRotatingCode] = useState(false);

  useSEO({
    title: team ? `${team.name} — Takım | Genç Sosyal` : "Takım Detayı | Genç Sosyal",
    description:
      team?.description ||
      "Genç Sosyal takımlarını inceleyin, ekip arkadaşlarıyla tanışın ve birlikte proje geliştirin.",
    canonicalPath: team?.slug ? `/teams/${team.slug}` : slug ? `/teams/${slug}` : undefined,
    allowIndexing: loading ? undefined : team ? team.visibility === "PUBLIC" : false,
    ogImage: team?.avatarUrl || undefined,
  });

  const isCaptain = team?.myRole === "CAPTAIN";
  const isCoCaptain = team?.myRole === "CO_CAPTAIN";
  const isLeadership = isCaptain || isCoCaptain;
  const canInvite = isLeadership || (Boolean(team?.isMember) && Boolean(team?.allowMemberInvites));

  const syncSettingsForm = (t: TeamItem) => {
    setFormName(t.name);
    setFormTag(t.tag || "");
    setFormCategory(t.category);
    setFormDescription(t.description);
    setFormVisibility(t.visibility);
    setFormJoinPolicy(t.joinPolicy);
    setFormMaxMembers(t.maxMembers);
    setFormBannerColor(t.bannerColor || "#2563EB");
    setFormRules(t.rules || "");
    setFormSkills((t.skillsNeeded || []).join(", "));
    setFormRecruiting(t.isRecruiting);
    setFormAllowMemberInvites(t.allowMemberInvites);
    setFormRequireVerifiedEmail(t.requireVerifiedEmailToJoin);
    setFormIsLocked(t.isLocked);
    setFormInviteCodeEnabled(t.inviteCodeEnabled);
  };

  const loadTeam = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await teamsFetch<TeamItem>(`/teams/${encodeURIComponent(slug)}`);
      if (res.success && res.data) {
        setTeam(res.data);
        syncSettingsForm(res.data);
      } else {
        setTeam(null);
      }
    } catch (err: any) {
      toast.error(err?.message || "Takım bilgileri yüklenemedi.");
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadLeadershipData = useCallback(async () => {
    if (!slug || !isLeadership) return;
    try {
      const [reqRes, invRes, banRes, logRes] = await Promise.all([
        teamsFetch<TeamJoinRequestItem[]>(`/teams/${encodeURIComponent(slug)}/requests`),
        teamsFetch<TeamInvitationItem[]>(`/teams/${encodeURIComponent(slug)}/invitations`),
        teamsFetch<TeamBanItem[]>(`/teams/${encodeURIComponent(slug)}/bans`),
        teamsFetch<TeamAuditLogItem[]>(`/teams/${encodeURIComponent(slug)}/audit-logs`),
      ]);
      if (reqRes.success) setJoinRequests(reqRes.data || []);
      if (invRes.success) setSentInvites(invRes.data || []);
      if (banRes.success) setBans(banRes.data || []);
      if (logRes.success) setAuditLogs(logRes.data || []);
    } catch {
      // silent
    }
  }, [slug, isLeadership]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  useEffect(() => {
    if (isLeadership) {
      loadLeadershipData();
    }
  }, [isLeadership, loadLeadershipData]);

  const handleJoinAction = async (note?: string) => {
    if (!team) return;
    if (!isAuthenticated) {
      openModal();
      return;
    }
    setSubmittingJoin(true);
    try {
      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/join`, {
        method: "POST",
        body: JSON.stringify({ note: note || null }),
      });
      if (res.success) {
        toast.success(res.data?.message || "İşlem tamamlandı.");
        setShowApplyModal(false);
        setApplyNote("");
        await loadTeam();
      }
    } catch (err: any) {
      toast.error(err?.message || "Katılım işlemi başarısız oldu.");
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleLeaveTeam = () => {
    if (!team) return;
    showConfirm(
      {
        title: "Takımdan Ayrıl",
        message: `${team.name} takımından ayrılmak istediğinize emin misiniz?`,
        confirmLabel: "Ayrıl",
        variant: "warning",
      },
      "",
      async () => {
        try {
          const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/leave`, {
            method: "POST",
          });
          if (res.success) {
            toast.success("Takımdan ayrıldınız.");
            await loadTeam();
          }
        } catch (err: any) {
          toast.error(err?.message || "Ayrılma başarısız oldu.");
        }
      }
    );
  };

  const handleCopyInviteCode = async () => {
    if (!team?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(team.inviteCode);
      toast.success("Güvenli davet kodu kopyalandı.");
    } catch {
      toast.error("Kod kopyalanamadı.");
    }
  };

  const handleRotateInviteCode = () => {
    if (!team) return;
    showConfirm(
      {
        title: "Davet Kodunu Yenile",
        message: "Yeni bir güvenli davet kodu oluşturulacak ve eski davet kodu anında geçersiz kılınacaktır.",
        confirmLabel: "Kodu Yenile",
        variant: "primary",
      },
      "",
      async () => {
        setRotatingCode(true);
        try {
          const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/invite-code/rotate`, {
            method: "POST",
          });
          if (res.success) {
            toast.success("Davet kodu yenilendi. Eski kod iptal edildi.");
            await loadTeam();
            await loadLeadershipData();
          }
        } catch (err: any) {
          toast.error(err?.message || "Kod yenilenemedi.");
        } finally {
          setRotatingCode(false);
        }
      }
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !inviteUsername.trim()) return;
    setSendingInvite(true);
    try {
      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/invitations`, {
        method: "POST",
        body: JSON.stringify({
          username: inviteUsername.trim(),
          message: inviteMessage.trim() || null,
        }),
      });
      if (res.success) {
        toast.success(res.data?.message || "Davet gönderildi.");
        setInviteUsername("");
        setInviteMessage("");
        setShowInviteModal(false);
        await loadLeadershipData();
      }
    } catch (err: any) {
      toast.error(err?.message || "Davet gönderilemedi.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRevokeInvite = async (inviteId: number) => {
    if (!team) return;
    try {
      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/invitations/${inviteId}`, {
        method: "DELETE",
      });
      if (res.success) {
        toast.success("Davet geri çekildi.");
        await loadLeadershipData();
      }
    } catch (err: any) {
      toast.error(err?.message || "Davet iptal edilemedi.");
    }
  };

  const handleReviewRequest = async (requestId: number, action: "APPROVE" | "REJECT") => {
    if (!team) return;
    try {
      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/requests/${requestId}`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (res.success) {
        toast.success(res.data?.message || "İşlem tamamlandı.");
        await Promise.all([loadTeam(), loadLeadershipData()]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Başvuru işlenemedi.");
    }
  };

  const handleChangeRole = async (member: TeamMemberItem, nextRole: "CO_CAPTAIN" | "MEMBER") => {
    if (!team) return;
    try {
      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/members/${member.userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.success) {
        toast.success(
          nextRole === "CO_CAPTAIN"
            ? `@${member.username} Yardımcı Kaptan yapıldı.`
            : `@${member.username} standart Üye rolüne alındı.`
        );
        await Promise.all([loadTeam(), loadLeadershipData()]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Rol değiştirilemedi.");
    }
  };

  const handleSavePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !editPositionTarget) return;
    try {
      const res = await teamsFetch(
        `/teams/${encodeURIComponent(team.slug)}/members/${editPositionTarget.userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ position: positionInput.trim() || null }),
        }
      );
      if (res.success) {
        toast.success("Görev unvanı güncellendi.");
        setEditPositionTarget(null);
        await loadTeam();
      }
    } catch (err: any) {
      toast.error(err?.message || "Görev unvanı güncellenemedi.");
    }
  };

  const handleKickMember = (member: TeamMemberItem) => {
    if (!team) return;
    showConfirm(
      {
        title: "Üyeyi Takımdan Çıkar",
        message: `@${member.username} kullanıcısını takımdan çıkarmak istediğinize emin misiniz?`,
        confirmLabel: "Çıkar",
        variant: "warning",
      },
      "",
      async () => {
        try {
          const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/members/${member.userId}`, {
            method: "DELETE",
          });
          if (res.success) {
            toast.success(`@${member.username} takımdan çıkarıldı.`);
            await Promise.all([loadTeam(), loadLeadershipData()]);
          }
        } catch (err: any) {
          toast.error(err?.message || "Üye çıkarılamadı.");
        }
      }
    );
  };

  const handleBanMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !banTarget) return;
    setBanning(true);
    try {
      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/bans/${banTarget.userId}`, {
        method: "POST",
        body: JSON.stringify({ reason: banReason.trim() || null }),
      });
      if (res.success) {
        toast.success(`@${banTarget.username} takımdan engellendi. Davet koduyla dahi tekrar katılamaz.`);
        setBanTarget(null);
        setBanReason("");
        await Promise.all([loadTeam(), loadLeadershipData()]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Engelleme başarısız oldu.");
    } finally {
      setBanning(false);
    }
  };

  const handleUnbanMember = async (banned: TeamBanItem) => {
    if (!team) return;
    try {
      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/bans/${banned.userId}`, {
        method: "DELETE",
      });
      if (res.success) {
        toast.success(`@${banned.username} engeli kaldırıldı.`);
        await loadLeadershipData();
      }
    } catch (err: any) {
      toast.error(err?.message || "Engel kaldırılamadı.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !isCaptain) return;
    setSavingSettings(true);
    try {
      const parsedSkills = formSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length >= 2)
        .slice(0, 8);

      const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: formName.trim(),
          tag: formTag.trim() || null,
          category: formCategory,
          description: formDescription.trim(),
          visibility: formVisibility,
          joinPolicy: formVisibility === "INVITE_ONLY" ? "INVITE_ONLY" : formJoinPolicy,
          maxMembers: formMaxMembers,
          bannerColor: formBannerColor,
          rules: formRules.trim() || null,
          skillsNeeded: parsedSkills,
          isRecruiting: formRecruiting,
          allowMemberInvites: formAllowMemberInvites,
          requireVerifiedEmailToJoin: formRequireVerifiedEmail,
          isLocked: formIsLocked,
          inviteCodeEnabled: formInviteCodeEnabled,
        }),
      });
      if (res.success) {
        toast.success("Takım ve güvenlik ayarları kaydedildi.");
        await Promise.all([loadTeam(), loadLeadershipData()]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Ayarlar kaydedilemedi.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTransferCaptaincy = () => {
    if (!team || !transferTargetId) return;
    const targetMember = team.members?.find((m) => String(m.userId) === transferTargetId);
    if (!targetMember) return;

    showConfirm(
      {
        title: "Kaptanlığı Devret",
        message: `Takım kaptanlığını @${targetMember.username} kullanıcısına devretmek üzeresiniz. Siz Yardımcı Kaptan rolüne geçeceksiniz.`,
        confirmLabel: "Kaptanlığı Devret",
        variant: "warning",
      },
      "",
      async () => {
        try {
          const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}/transfer-captaincy`, {
            method: "POST",
            body: JSON.stringify({ targetUserId: targetMember.userId }),
          });
          if (res.success) {
            toast.success("Takım kaptanlığı başarıyla devredildi.");
            setTransferTargetId("");
            await Promise.all([loadTeam(), loadLeadershipData()]);
          }
        } catch (err: any) {
          toast.error(err?.message || "Kaptanlık devredilemedi.");
        }
      }
    );
  };

  const handleDeleteTeam = () => {
    if (!team) return;
    showConfirm(
      {
        title: "Takımı Kalıcı Olarak Kapat",
        message: `${team.name} takımı kapatılacak, tüm aktif davet kodları ve bekleyen davetler anında iptal edilecektir. Bu işlem geri alınamaz.`,
        confirmLabel: "Takımı Kapat",
        variant: "danger",
      },
      "",
      async () => {
        try {
          const res = await teamsFetch(`/teams/${encodeURIComponent(team.slug)}`, {
            method: "DELETE",
          });
          if (res.success) {
            toast.success("Takım kapatıldı.");
            navigate("/teams");
          }
        } catch (err: any) {
          toast.error(err?.message || "Takım kapatılamadı.");
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <SkeletonList count={4} />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <EmptyState
          icon={<Shield className="w-6 h-6" />}
          title="Takım bulunamadı"
          description="Bu takım kapatılmış olabilir veya bağlantı hatalı olabilir."
          action={{ label: "Takımlara Dön", onClick: () => navigate("/teams") }}
        />
      </div>
    );
  }

  const membersList = team.members || [];
  const otherMembers = membersList.filter((m) => m.userId !== user?.id);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-24 space-y-6">
      {/* Back breadcrumb */}
      <button
        type="button"
        onClick={() => navigate("/teams")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Tüm Takımlar</span>
      </button>

      {/* Main Team Header Card */}
      <section className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-xs">
        <div
          className="h-24 sm:h-28 w-full relative"
          style={{
            background: `linear-gradient(135deg, ${team.bannerColor || "#2563EB"}, #0F2557)`,
          }}
        >
          {team.isLocked && (
            <div className="absolute top-3.5 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/95 text-slate-950 text-xs font-extrabold shadow-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Güvenlik Kilidi Aktif</span>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-7 pb-6 -mt-9 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4 min-w-0">
              <div
                className="w-18 h-18 rounded-2xl border-4 border-white dark:border-[#111B2E] flex items-center justify-center text-white font-black text-lg tracking-tight shadow-md shrink-0"
                style={{ backgroundColor: team.bannerColor || "#2563EB" }}
              >
                {team.tag || team.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 pb-0.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  {team.name}
                </h1>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {getCategoryLabel(team.category)} · {getVisibilityLabel(team.visibility)} ·{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {team.memberCount}/{team.maxMembers} Üye
                  </span>
                </div>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {team.isMember ? (
                <>
                  {canInvite && !team.isLocked && (
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(true)}
                      className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Üye Davet Et</span>
                    </button>
                  )}
                  {!isCaptain && (
                    <button
                      type="button"
                      onClick={handleLeaveTeam}
                      className="h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-rose-50 dark:hover:bg-rose-500/15 text-slate-700 dark:text-slate-200 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Ayrıl</span>
                    </button>
                  )}
                </>
              ) : team.isBanned ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <Ban className="w-4 h-4" />
                  <span>Bu takıma katılımınız engellendi</span>
                </div>
              ) : team.hasPendingRequest ? (
                <div className="h-10 px-4 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-200/70 dark:border-amber-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Başvurun Değerlendiriliyor</span>
                </div>
              ) : team.isLocked || !team.isRecruiting || team.memberCount >= team.maxMembers ? (
                <div className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>
                    {team.isLocked
                      ? "Takım Kilitli"
                      : team.memberCount >= team.maxMembers
                      ? "Kontenjan Dolu"
                      : "Üye Alımı Kapalı"}
                  </span>
                </div>
              ) : team.joinPolicy === "INVITE_ONLY" || team.visibility === "INVITE_ONLY" ? (
                <div className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Yalnızca Davetle Katılım</span>
                </div>
              ) : team.joinPolicy === "OPEN" && team.visibility === "PUBLIC" ? (
                <button
                  type="button"
                  disabled={submittingJoin}
                  onClick={() => handleJoinAction()}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{submittingJoin ? "Katılınıyor..." : "Takıma Katıl"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      openModal();
                      return;
                    }
                    setShowApplyModal(true);
                  }}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Katılım Başvurusu Yap</span>
                </button>
              )}
            </div>
          </div>

          {/* Description & Metadata */}
          <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {team.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              <strong className="text-slate-700 dark:text-slate-200">Katılım:</strong>{" "}
              {getJoinPolicyLabel(team.joinPolicy)}
            </span>
            {team.requireVerifiedEmailToJoin && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Doğrulanmış E-posta Zorunlu
              </span>
            )}
            {team.skillsNeeded && team.skillsNeeded.length > 0 && (
              <span>
                <strong className="text-slate-700 dark:text-slate-200">Aranan Yetkinlikler:</strong>{" "}
                {team.skillsNeeded.join(" · ")}
              </span>
            )}
          </div>

          {team.rules && !team.restricted && (
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06]">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Takım Kuralları
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line">
                {team.rules}
              </p>
            </div>
          )}

          {/* Secure Invite Code Banner for Authorized Members */}
          {team.inviteCode && (
            <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                    Güvenli Davet Kodu {team.inviteCodeEnabled ? "" : "(Devre Dışı)"}
                  </div>
                  <div className="font-mono text-sm font-extrabold tracking-[0.18em] text-slate-900 dark:text-white">
                    {team.inviteCode}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className="h-9 px-3 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-blue-100 dark:hover:bg-white/[0.12] border border-blue-200/70 dark:border-white/10 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopyala</span>
                </button>
                {isLeadership && (
                  <button
                    type="button"
                    disabled={rotatingCode}
                    onClick={handleRotateInviteCode}
                    className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${rotatingCode ? "animate-spin" : ""}`} />
                    <span>Yenile</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Restricted Private Team Notice */}
      {team.restricted ? (
        <div className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-8 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-500 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Bu Takım Gizlilik Koruması Altında
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Üye listesi, takım kuralları ve iç detaylar yalnızca onaylı takım üyeleri tarafından görüntülenebilir.
          </p>
        </div>
      ) : (
        <>
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`h-10 px-4 rounded-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === "members"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Üyeler ({membersList.length})</span>
            </button>

            {isLeadership && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("requests")}
                  className={`h-10 px-4 rounded-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${
                    activeTab === "requests"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Başvurular & Davetler</span>
                  {joinRequests.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-400 text-slate-950">
                      {joinRequests.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`h-10 px-4 rounded-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${
                    activeTab === "settings"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Ayarlar & Güvenlik</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className={`h-10 px-4 rounded-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${
                    activeTab === "audit"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Güvenlik Günlüğü</span>
                </button>
              </>
            )}
          </div>

          {/* TAB 1: MEMBERS */}
          {activeTab === "members" && (
            <div className="space-y-2.5">
              {membersList.map((member) => {
                const isSelf = user?.id === member.userId;
                const canModerateMember =
                  !isSelf &&
                  ((isCaptain && member.role !== "CAPTAIN") ||
                    (isCoCaptain && member.role === "MEMBER"));
                const canEditPos = isSelf || canModerateMember;

                return (
                  <div
                    key={member.userId}
                    className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/profile/${member.username}`} className="shrink-0">
                        <Avatar
                          url={member.avatarUrl}
                          name={member.displayName || member.username}
                          size="md"
                          className="w-11 h-11"
                        />
                      </Link>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/profile/${member.username}`}
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 truncate"
                          >
                            {member.displayName || member.username}
                          </Link>
                          <span className="text-xs text-slate-400">@{member.username}</span>
                          {member.role === "CAPTAIN" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <Crown className="w-3.5 h-3.5" />
                              Kaptan
                            </span>
                          )}
                          {member.role === "CO_CAPTAIN" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              <Shield className="w-3.5 h-3.5" />
                              Yardımcı Kaptan
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{member.position || getRoleLabel(member.role)}</span>
                          {canEditPos && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditPositionTarget(member);
                                setPositionInput(member.position || "");
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              Unvan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Leadership Controls (strict hierarchy enforced in UI + server) */}
                    {canModerateMember && (
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {isCaptain && (
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeRole(member, member.role === "CO_CAPTAIN" ? "MEMBER" : "CO_CAPTAIN")
                            }
                            className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-blue-50 dark:hover:bg-blue-500/15 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            {member.role === "CO_CAPTAIN" ? "Üyeye Düşür" : "Yrd. Kaptan Yap"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleKickMember(member)}
                          className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-amber-50 dark:hover:bg-amber-500/15 text-slate-700 dark:text-slate-200 hover:text-amber-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Çıkar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBanTarget(member);
                            setBanReason("");
                          }}
                          className="h-9 px-3 rounded-xl bg-rose-50 dark:bg-rose-500/12 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Engelle</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: REQUESTS & INVITATIONS (LEADERSHIP) */}
          {activeTab === "requests" && isLeadership && (
            <div className="space-y-6">
              {/* Pending Join Requests */}
              <div className="space-y-3">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Bekleyen Katılım Başvuruları ({joinRequests.length})
                </h2>
                {joinRequests.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] text-center text-sm text-slate-500">
                    Bekleyen katılım başvurusu bulunmuyor.
                  </div>
                ) : (
                  joinRequests.map((reqItem) => (
                    <div
                      key={reqItem.id}
                      className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar
                          url={reqItem.avatarUrl}
                          name={reqItem.displayName || reqItem.username}
                          size="md"
                          className="w-10 h-10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {reqItem.displayName || reqItem.username}
                            </span>
                            <span className="text-xs text-slate-400">@{reqItem.username}</span>
                            {reqItem.emailVerified && (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Doğrulanmış
                              </span>
                            )}
                          </div>
                          {reqItem.note && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                              “{reqItem.note}”
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(reqItem.id, "REJECT")}
                          className="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-rose-50 text-slate-700 dark:text-slate-200 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Reddet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(reqItem.id, "APPROVE")}
                          className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Onayla</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Outgoing Pending Invitations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Gönderilen Bekleyen Davetler ({sentInvites.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Yeni Davet Gönder</span>
                  </button>
                </div>

                {sentInvites.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] text-center text-sm text-slate-500">
                    Bekleyen davet bulunmuyor.
                  </div>
                ) : (
                  sentInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          url={inv.avatarUrl}
                          name={inv.displayName || inv.username || ""}
                          size="sm"
                          className="w-9 h-9"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {inv.displayName || inv.username}{" "}
                            <span className="text-xs font-normal text-slate-400">@{inv.username}</span>
                          </div>
                          {inv.message && (
                            <div className="text-xs text-slate-500 truncate">{inv.message}</div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="h-9 px-3 rounded-xl bg-rose-50 dark:bg-rose-500/12 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer shrink-0"
                      >
                        İptal Et
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FULL TEAM & SECURITY SETTINGS */}
          {activeTab === "settings" && isLeadership && (
            <div className="space-y-6">
              {!isCaptain && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-500/20 text-xs font-medium text-blue-800 dark:text-blue-200">
                  Yardımcı Kaptan olarak ayarları görüntüleyebilirsiniz; temel takım ve güvenlik ayarlarını değiştirme yetkisi yalnızca Takım Kaptanına aittir.
                </div>
              )}

              <form
                onSubmit={handleSaveSettings}
                className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 space-y-5"
              >
                <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Genel Bilgiler ve Güvenlik Politikaları</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Takım Adı</label>
                    <input
                      type="text"
                      disabled={!isCaptain}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      minLength={3}
                      maxLength={80}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Kısa Etiket</label>
                    <input
                      type="text"
                      disabled={!isCaptain}
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      maxLength={10}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm font-mono uppercase text-slate-900 dark:text-white disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Kategori</label>
                    <select
                      disabled={!isCaptain}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white disabled:opacity-60"
                    >
                      {TEAM_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Maksimum Üye Kapasitesi ({formMaxMembers} kişi)
                    </label>
                    <input
                      type="range"
                      disabled={!isCaptain}
                      min={Math.max(2, team.memberCount)}
                      max={50}
                      value={formMaxMembers}
                      onChange={(e) => setFormMaxMembers(Number(e.target.value))}
                      className="w-full accent-blue-600 mt-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Açıklama</label>
                  <textarea
                    disabled={!isCaptain}
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    maxLength={1200}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white resize-none disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Aranan Yetkinlikler (virgülle ayır)
                  </label>
                  <input
                    type="text"
                    disabled={!isCaptain}
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Takım Kuralları</label>
                  <textarea
                    disabled={!isCaptain}
                    rows={3}
                    value={formRules}
                    onChange={(e) => setFormRules(e.target.value)}
                    maxLength={2000}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white resize-none disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Tema Rengi</label>
                  <div className="flex flex-wrap gap-2">
                    {TEAM_BANNER_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        disabled={!isCaptain}
                        onClick={() => setFormBannerColor(c.hex)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-60 ${
                          formBannerColor === c.hex
                            ? "ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-[#111B2E]"
                            : ""
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {formBannerColor === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Controls Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Erişim & Güvenlik Kontrolleri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Görünürlük</label>
                      <select
                        disabled={!isCaptain}
                        value={formVisibility}
                        onChange={(e) => {
                          const v = e.target.value as "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
                          setFormVisibility(v);
                          if (v === "INVITE_ONLY") setFormJoinPolicy("INVITE_ONLY");
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-60"
                      >
                        <option value="PUBLIC">Herkese Açık</option>
                        <option value="PRIVATE">Gizli (Üye Dışına İzole)</option>
                        <option value="INVITE_ONLY">Sadece Davetle</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Katılım Politikası
                      </label>
                      <select
                        disabled={!isCaptain || formVisibility === "INVITE_ONLY"}
                        value={formVisibility === "INVITE_ONLY" ? "INVITE_ONLY" : formJoinPolicy}
                        onChange={(e) => setFormJoinPolicy(e.target.value as "OPEN" | "APPROVAL" | "INVITE_ONLY")}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-60"
                      >
                        <option value="APPROVAL">Kaptan Onayı Gerekli</option>
                        <option value="OPEN">Doğrudan Katılım</option>
                        <option value="INVITE_ONLY">Yalnızca Davet / Kod</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {[
                      {
                        checked: formRecruiting,
                        onChange: setFormRecruiting,
                        title: "Yeni üye alımına açık",
                        desc: "Kapatıldığında yeni başvurular kabul edilmez.",
                      },
                      {
                        checked: formRequireVerifiedEmail,
                        onChange: setFormRequireVerifiedEmail,
                        title: "Doğrulanmış e-posta zorunluluğu",
                        desc: "Yalnızca e-posta doğrulamasını tamamlamış hesaplar katılabilir.",
                      },
                      {
                        checked: formAllowMemberInvites,
                        onChange: setFormAllowMemberInvites,
                        title: "Üyelere davet izni ver",
                        desc: "Kapalıyken sadece Kaptan ve Yardımcı Kaptanlar davet kodu görüp üye davet edebilir.",
                      },
                      {
                        checked: formInviteCodeEnabled,
                        onChange: setFormInviteCodeEnabled,
                        title: "Davet kodu ile katılım aktif",
                        desc: "Kapatıldığında davet koduyla tüm katılımlar anında durdurulur.",
                      },
                      {
                        checked: formIsLocked,
                        onChange: setFormIsLocked,
                        title: "Acil güvenlik kilidi",
                        desc: "Açıldığında davetler, başvurular ve kodla katılımlar dahil tüm girişler tamamen dondurulur.",
                      },
                    ].map((toggle) => (
                      <label key={toggle.title} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isCaptain}
                          checked={toggle.checked}
                          onChange={(e) => toggle.onChange(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <div className="text-xs leading-snug">
                          <div className="font-bold text-slate-800 dark:text-slate-100">{toggle.title}</div>
                          <div className="text-slate-500 dark:text-slate-400">{toggle.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {isCaptain && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold cursor-pointer transition-all"
                    >
                      {savingSettings ? "Kaydediliyor..." : "Ayarları Kaydet"}
                    </button>
                  </div>
                )}
              </form>

              {/* Banned Users Management */}
              <div className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
                  <Ban className="w-4 h-4 text-rose-500" />
                  <span>Engellenen Kullanıcılar ({bans.length})</span>
                </div>
                {bans.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bu takımdan engellenmiş kullanıcı bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {bans.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03]"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {b.displayName || b.username}{" "}
                            <span className="font-normal text-slate-400">@{b.username}</span>
                          </div>
                          {b.reason && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Sebep: {b.reason}
                            </div>
                          )}
                        </div>
                        {isCaptain && (
                          <button
                            type="button"
                            onClick={() => handleUnbanMember(b)}
                            className="h-8 px-3 rounded-xl bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 cursor-pointer shrink-0"
                          >
                            Engeli Kaldır
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Captaincy Transfer & Danger Zone (CAPTAIN ONLY) */}
              {isCaptain && (
                <div className="bg-white dark:bg-[#111B2E] border border-rose-200/70 dark:border-rose-500/20 rounded-3xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Kritik Takım İşlemleri</span>
                  </div>

                  {/* Transfer Captaincy */}
                  {otherMembers.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                          Kaptanlığı Başka Bir Üyeye Devret
                        </label>
                        <select
                          value={transferTargetId}
                          onChange={(e) => setTransferTargetId(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="">Yeni Kaptan Seçin...</option>
                          {otherMembers.map((m) => (
                            <option key={m.userId} value={m.userId}>
                              {m.displayName || m.username} (@{m.username}) — {getRoleLabel(m.role)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        disabled={!transferTargetId}
                        onClick={handleTransferCaptaincy}
                        className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold cursor-pointer shrink-0"
                      >
                        Kaptanlığı Devret
                      </button>
                    </div>
                  )}

                  {/* Delete / Close Team */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Takımı Kapat</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Takım arşivlenir, tüm davet kodları ve bekleyen davetler anında iptal edilir.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteTeam}
                      className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Takımı Kapat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY AUDIT LOGS */}
          {activeTab === "audit" && isLeadership && (
            <div className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Güvenlik ve İşlem Günlüğü</span>
              </div>
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-500">Henüz kayıtlı bir işlem bulunmuyor.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {getAuditActionLabel(log.action)}
                          {log.actor && (
                            <span className="font-normal text-slate-500"> · @{log.actor.username}</span>
                          )}
                          {log.target && log.target.username !== log.actor?.username && (
                            <span className="font-normal text-blue-600 dark:text-blue-400">
                              {" "}
                              → @{log.target.username}
                            </span>
                          )}
                        </div>
                        {log.details && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">{log.details}</div>
                        )}
                      </div>
                      <time className="text-[11px] font-medium text-slate-400 tabular-nums shrink-0">
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL: APPLY WITH NOTE */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowApplyModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Katılım Başvurusu</h2>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={4}
                maxLength={400}
                value={applyNote}
                onChange={(e) => setApplyNote(e.target.value)}
                placeholder="Kendinden, yetkinliklerinden ve takıma nasıl katkı sağlayacağından kısaca bahset (opsiyonel)..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={submittingJoin}
                  onClick={() => handleJoinAction(applyNote)}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingJoin ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: INVITE USER BY USERNAME */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowInviteModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Kullanıcı Davet Et</h2>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSendInvite} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    required
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="Kullanıcı adını girin"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Davet Mesajı (Opsiyonel)</label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Davet notu yazın (opsiyonel)"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {sendingInvite ? "Gönderiliyor..." : "Davet Gönder"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: BAN MEMBER WITH REASON */}
      <AnimatePresence>
        {banTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setBanTarget(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
                  @{banTarget.username} Kullanıcısını Engelle
                </h2>
                <button
                  type="button"
                  onClick={() => setBanTarget(null)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Engellenen kullanıcı takımdan çıkarılır ve engeli kaldırılmadığı sürece davet koduyla dahi tekrar katılamaz.
              </p>
              <form onSubmit={handleBanMember} className="space-y-3.5">
                <textarea
                  rows={3}
                  maxLength={300}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Engelleme sebebi (opsiyonel)..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBanTarget(null)}
                    className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={banning}
                    className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {banning ? "Engelleniyor..." : "Takımdan Engelle"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT MEMBER POSITION / ROLE TITLE */}
      <AnimatePresence>
        {editPositionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setEditPositionTarget(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-sm bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Görev Unvanını Düzenle
              </h2>
              <form onSubmit={handleSavePosition} className="space-y-4">
                <input
                  type="text"
                  maxLength={60}
                  value={positionInput}
                  onChange={(e) => setPositionInput(e.target.value)}
                  placeholder="Görev unvanını girin"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPositionTarget(null)}
                    className="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
