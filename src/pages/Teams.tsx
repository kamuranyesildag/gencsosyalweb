import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Users,
  Plus,
  Search,
  KeyRound,
  Lock,
  Mail,
  Check,
  X,
  ArrowRight,
  Crown,
  Sparkles,
} from "lucide-react";
import { useSEO } from "../hooks/useSEO";
import { toast } from "../components/ui/Toast";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { backdropVariants, modalVariants } from "../lib/motion";
import {
  teamsFetch,
  TEAM_CATEGORY_OPTIONS,
  TEAM_BANNER_COLORS,
  getCategoryLabel,
  getVisibilityLabel,
  getJoinPolicyLabel,
  getRoleLabel,
  type TeamItem,
  type TeamInvitationItem,
} from "../lib/teamConstants";

type ActiveTab = "discover" | "my" | "invites";

export function Teams() {
  useSEO({
    title: "Takımlar | Genç Sosyal",
    description:
      "TEKNOFEST, yazılım, tasarım ve bilgi yarışmaları için kendi güvenli takımını kur veya açık takımlara katıl.",
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("discover");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [myTeams, setMyTeams] = useState<TeamItem[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [recruitingOnly, setRecruitingOnly] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joiningByCode, setJoiningByCode] = useState(false);

  // Create form state
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PUBLIC");
  const [joinPolicy, setJoinPolicy] = useState<"OPEN" | "APPROVAL" | "INVITE_ONLY">("APPROVAL");
  const [maxMembers, setMaxMembers] = useState(10);
  const [bannerColor, setBannerColor] = useState<string>("#2563EB");
  const [rules, setRules] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [allowMemberInvites, setAllowMemberInvites] = useState(false);
  const [requireVerifiedEmailToJoin, setRequireVerifiedEmailToJoin] = useState(false);

  const loadDiscover = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (recruitingOnly) params.set("recruiting", "true");
      const res = await teamsFetch<TeamItem[]>(`/teams?${params.toString()}`);
      if (res.success) {
        setTeams(res.data || []);
      }
    } catch (err: any) {
      toast.error(err?.message || "Takımlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, recruitingOnly]);

  const loadPersonalData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [myRes, invRes] = await Promise.all([
        teamsFetch<TeamItem[]>("/teams/my"),
        teamsFetch<TeamInvitationItem[]>("/teams/invitations/me"),
      ]);
      if (myRes.success) setMyTeams(myRes.data || []);
      if (invRes.success) setInvitations(invRes.data || []);
    } catch {
      // silent background sync
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDiscover();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadDiscover]);

  useEffect(() => {
    loadPersonalData();
  }, [loadPersonalData]);

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    setShowCreateModal(true);
  };

  const handleOpenCodeJoin = () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    setShowCodeModal(true);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) {
      toast.error("Takım adı en az 3 karakter olmalıdır.");
      return;
    }
    if (!category) {
      toast.error("Lütfen bir takım kategorisi seçin.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Takım açıklaması en az 10 karakter olmalıdır.");
      return;
    }

    setCreating(true);
    try {
      const parsedSkills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length >= 2)
        .slice(0, 8);

      const res = await teamsFetch<TeamItem>("/teams", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          tag: tag.trim() || null,
          category,
          description: description.trim(),
          visibility,
          joinPolicy: visibility === "INVITE_ONLY" ? "INVITE_ONLY" : joinPolicy,
          maxMembers,
          bannerColor,
          rules: rules.trim() || null,
          skillsNeeded: parsedSkills,
          allowMemberInvites,
          requireVerifiedEmailToJoin,
          isRecruiting: true,
        }),
      });

      if (res.success && res.data?.slug) {
        toast.success("Takımınız güvenle oluşturuldu!");
        setShowCreateModal(false);
        navigate(`/teams/${res.data.slug}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Takım oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inviteCodeInput.trim().toUpperCase();
    if (cleaned.length < 6) {
      toast.error("Lütfen geçerli bir davet kodu girin.");
      return;
    }
    setJoiningByCode(true);
    try {
      const res = await teamsFetch<{ slug: string; name: string; message?: string }>("/teams/join-by-code", {
        method: "POST",
        body: JSON.stringify({ code: cleaned }),
      });
      if (res.success && res.data?.slug) {
        toast.success(res.data.message || "Takıma katıldınız!");
        setShowCodeModal(false);
        setInviteCodeInput("");
        navigate(`/teams/${res.data.slug}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Davet kodu geçersiz.");
    } finally {
      setJoiningByCode(false);
    }
  };

  const handleRespondInvite = async (inviteId: number, action: "ACCEPT" | "DECLINE") => {
    try {
      const res = await teamsFetch<{ message?: string; slug?: string }>(`/teams/invitations/${inviteId}/respond`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (res.success) {
        toast.success(res.data?.message || (action === "ACCEPT" ? "Davet kabul edildi." : "Davet reddedildi."));
        await loadPersonalData();
        if (action === "ACCEPT" && res.data?.slug) {
          navigate(`/teams/${res.data.slug}`);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "İşlem başarısız oldu.");
    }
  };

  const renderTeamCard = (team: TeamItem, index: number) => {
    const capacityPct = Math.min(100, Math.round((team.memberCount / Math.max(1, team.maxMembers)) * 100));
    return (
      <motion.article
        key={team.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.24) }}
        onClick={() => navigate(`/teams/${team.slug}`)}
        className="group relative bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/40 dark:hover:border-blue-400/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
      >
        {/* Top Accent Strip */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: team.bannerColor || "#2563EB" }}
        />

        <div className="p-5 flex-1 flex flex-col gap-3.5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm tracking-tight shrink-0 shadow-xs"
                style={{ backgroundColor: team.bannerColor || "#2563EB" }}
              >
                {team.tag || team.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[15.5px] font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {team.name}
                  </h3>
                  {team.isLocked && (
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-label="Kilitli Takım" />
                  )}
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {getCategoryLabel(team.category)} · {getVisibilityLabel(team.visibility)}
                </div>
              </div>
            </div>

            {team.myRole && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {team.myRole === "CAPTAIN" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                {getRoleLabel(team.myRole)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
            {team.description}
          </p>

          {/* Skills metadata (unboxed clean inline list) */}
          {team.skillsNeeded && team.skillsNeeded.length > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Aranan: </span>
              {team.skillsNeeded.slice(0, 4).join(" · ")}
            </div>
          )}

          {/* Footer metrics & capacity bar */}
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {team.memberCount} / {team.maxMembers} üye
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    team.isLocked
                      ? "text-amber-600 dark:text-amber-400"
                      : team.isRecruiting && team.memberCount < team.maxMembers
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {team.isLocked
                    ? "Kilitli"
                    : team.memberCount >= team.maxMembers
                    ? "Dolu"
                    : team.isRecruiting
                    ? getJoinPolicyLabel(team.joinPolicy)
                    : "Alım Kapalı"}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${capacityPct}%`,
                    backgroundColor: team.bannerColor || "#2563EB",
                  }}
                />
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] group-hover:bg-blue-600 group-hover:text-white text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2557] via-[#1D4ED8] to-[#4F46E5] p-6 sm:p-8 text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl space-y-2.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-blue-100">
              <Shield className="w-4 h-4 text-sky-300" />
              <span>GÜVENLİ TAKIM & PROJE MERKEZİ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Hayalindeki Takımı Kur, Birlikte Üret
            </h1>
            <p className="text-sm sm:text-[15px] text-blue-100/90 leading-relaxed">
              TEKNOFEST projeleri, yazılım ekipleri veya Genç Quiz yarışmaları için rol tabanlı yetkilendirme ve güvenli davet kodlarıyla kendi takımını yönet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenCodeJoin}
              className="h-11 px-4 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>Kod ile Katıl</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-11 px-5 rounded-2xl bg-white hover:bg-blue-50 active:scale-[0.98] text-[#0F2557] font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Takım Kur</span>
            </button>
          </div>
        </div>
      </section>

      {/* Segmented Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "discover" as const, label: "Takımları Keşfet", count: null },
            { id: "my" as const, label: "Takımlarım", count: isAuthenticated ? myTeams.length : null },
            { id: "invites" as const, label: "Gelen Davetler", count: isAuthenticated && invitations.length > 0 ? invitations.length : null },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if ((tab.id === "my" || tab.id === "invites") && !isAuthenticated) {
                    openModal();
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                className={`h-10 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                      active ? "bg-white/20 text-white" : "bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "discover" && (
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recruitingOnly}
              onChange={(e) => setRecruitingOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span>Sadece üye alımı açık olanlar</span>
          </label>
        )}
      </div>

      {/* TAB 1: DISCOVER */}
      {activeTab === "discover" && (
        <div className="space-y-5">
          {/* Search & Category Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Takım adı, etiket veya proje konusu ara..."
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Kategori filtresi"
              className="h-11 px-4 rounded-2xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 cursor-pointer"
            >
              <option value="ALL">Tüm Kategoriler</option>
              {TEAM_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <SkeletonList count={4} />
          ) : teams.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="Henüz eşleşen bir takım bulunamadı"
              description="Arama filtreni değiştirebilir veya ilk takımı hemen kendin kurabilirsin."
              action={{ label: "Yeni Takım Kur", onClick: handleOpenCreate }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team, i) => renderTeamCard(team, i))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY TEAMS */}
      {activeTab === "my" && (
        <div className="space-y-4">
          {myTeams.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-6 h-6" />}
              title="Henüz bir takıma dahil değilsin"
              description="Kendi takımını kurabilir, açık takımlara başvurabilir veya arkadaşından aldığın davet koduyla hemen katılabilirsin."
              action={{ label: "İlk Takımını Kur", onClick: handleOpenCreate }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTeams.map((team, i) => renderTeamCard(team, i))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INCOMING INVITATIONS */}
      {activeTab === "invites" && (
        <div className="space-y-3">
          {invitations.length === 0 ? (
            <EmptyState
              icon={<Mail className="w-6 h-6" />}
              title="Bekleyen takım davetin yok"
              description="Bir takım kaptanı seni kullanıcı adınla davet ettiğinde burada görünecektir."
            />
          ) : (
            invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ backgroundColor: inv.teamBannerColor || "#2563EB" }}
                  >
                    {inv.teamTag || inv.teamName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {inv.teamName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        @{inv.inviterUsername}
                      </span>{" "}
                      seni bu takıma davet etti · {inv.teamMemberCount}/{inv.teamMaxMembers} üye
                    </p>
                    {inv.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.04] rounded-xl px-3 py-2 mt-1.5">
                        “{inv.message}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRespondInvite(inv.id, "DECLINE")}
                    className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-rose-50 dark:hover:bg-rose-500/15 text-slate-700 dark:text-slate-200 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reddet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondInvite(inv.id, "ACCEPT")}
                    className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Kabul Et</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: JOIN BY INVITE CODE */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowCodeModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Davet Kodu ile Katıl
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kaptandan aldığın 10 haneli güvenli kodu gir
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  aria-label="Kapat"
                  className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleJoinByCode} className="space-y-4">
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) =>
                    setInviteCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16))
                  }
                  placeholder="Davet kodunu girin"
                  autoFocus
                  className="w-full h-13 px-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-center font-mono text-lg font-bold tracking-[0.2em] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCodeModal(false)}
                    className="h-11 px-4 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={joiningByCode || inviteCodeInput.length < 6}
                    className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold cursor-pointer transition-all"
                  >
                    {joiningByCode ? "Doğrulanıyor..." : "Takıma Katıl"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE TEAM WITH FULL SETTINGS & SECURITY CONTROLS */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-white/[0.1] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.07] flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Yeni Takım Kur
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Görünürlük, katılım politikası ve güvenlik kurallarını en baştan belirle
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Kapat"
                  className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateTeam} className="overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Takım Adı *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={80}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Takım adını girin"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Kısa Etiket (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={tag}
                      onChange={(e) => setTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      placeholder="Kısa etiket"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Kategori *
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    >
                      <option value="" disabled>
                        Kategori seçin
                      </option>
                      {TEAM_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Maksimum Üye Kapasitesi ({maxMembers} kişi)
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={50}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      className="w-full accent-blue-600 mt-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Takım Açıklaması *
                  </label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={1200}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Takımınızın hedefini, üzerinde çalıştığınız projeleri ve aradığınız takım arkadaşlarını anlatın..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Aranan Yetkinlikler (virgülle ayır, en fazla 8)
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Virgülle ayırarak aranan yetkinlikleri yazın"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>

                {/* Color Palette */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Takım Rengi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEAM_BANNER_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setBannerColor(c.hex)}
                        title={c.label}
                        className={`w-8 h-8 rounded-xl transition-transform cursor-pointer flex items-center justify-center ${
                          bannerColor === c.hex ? "ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-[#111B2E] scale-105" : ""
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {bannerColor === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security & Access Controls Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Gizlilik ve Güvenlik Ayarları</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Görünürlük
                      </label>
                      <select
                        value={visibility}
                        onChange={(e) => {
                          const v = e.target.value as "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
                          setVisibility(v);
                          if (v === "INVITE_ONLY") setJoinPolicy("INVITE_ONLY");
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-900 dark:text-white"
                      >
                        <option value="PUBLIC">Herkese Açık (Listelenir)</option>
                        <option value="PRIVATE">Gizli (Üyeler Dışına Kapalı)</option>
                        <option value="INVITE_ONLY">Sadece Davetle</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Katılım Politikası
                      </label>
                      <select
                        value={visibility === "INVITE_ONLY" ? "INVITE_ONLY" : joinPolicy}
                        disabled={visibility === "INVITE_ONLY"}
                        onChange={(e) => setJoinPolicy(e.target.value as "OPEN" | "APPROVAL" | "INVITE_ONLY")}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-60"
                      >
                        <option value="APPROVAL">Kaptan Onayı Gerekli (Önerilen)</option>
                        <option value="OPEN">Doğrudan Katılım</option>
                        <option value="INVITE_ONLY">Yalnızca Davet veya Kod</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requireVerifiedEmailToJoin}
                        onChange={(e) => setRequireVerifiedEmailToJoin(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                        <strong className="font-semibold">Doğrulanmış e-posta zorunluluğu:</strong> Sadece e-posta adresini doğrulamış üyeler katılabilsin.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowMemberInvites}
                        onChange={(e) => setAllowMemberInvites(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                        <strong className="font-semibold">Üye davet izni:</strong> Normal üyeler de davet kodunu görebilsin ve arkadaşlarını davet edebilsin.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Takım Kuralları (Opsiyonel)
                  </label>
                  <textarea
                    maxLength={2000}
                    rows={2}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="Takım içi çalışma kurallarınızı yazın"
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.07]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="h-11 px-4 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold shadow-xs cursor-pointer transition-all"
                  >
                    {creating ? "Oluşturuluyor..." : "Takımı Oluştur"}
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
