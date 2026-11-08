import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { fetchApi } from "../lib/api";
import { useSEO } from "../hooks/useSEO";
import {
  Users,
  ArrowLeft,
  MoreVertical,
  AlertTriangle,
  UserCheck,
  UserPlus,
  LogOut,
  FileText,
  ShieldCheck,
  Shield,
  Crown,
  Lock,
  Globe,
  Share2,
  Copy,
  Trash2,
  Clock,
  BookOpen,
  Calendar,
  Info,
} from "lucide-react";
import { PostCard } from "../components/PostCard";
import { CreatePost } from "../components/CreatePost";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { ReportDialog } from "../components/ReportDialog";
import { CommunityMembers } from "../components/CommunityMembers";
import { CommunityManagementModal } from "../components/CommunityManagementModal";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { toast } from "../components/ui/Toast";
import { confirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "../components/ui/Dropdown";

export function CommunityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"posts" | "members" | "about">("posts");
  const [showManageModal, setShowManageModal] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const {
    data: posts,
    setData: setPosts,
    loading: loadingPosts,
    loadingMore,
    hasMore,
    loadInitial,
    loadMore,
    addItem,
  } = usePagination(community ? `/communities/${community.id}/posts` : "");

  useSEO({
    title: community
      ? `${community.name} — Topluluk | Genç Sosyal`
      : "Topluluk Detayı | Genç Sosyal",
    description: community?.description
      ? community.description.length < 110
        ? `${community.description}. ${community.name} topluluğuna katılın, tartışmalara dahil olun ve üretin.`
        : community.description.substring(0, 155)
      : "Genç Sosyal topluluğuna katılın, tartışmalara dahil olun ve genç üreticilerle iş birliği yapın.",
    canonicalPath: slug ? `/communities/${slug}` : undefined,
    ogImage: community?.avatarUrl,
  });

  const loadCommunity = async () => {
    try {
      const res = await fetchApi(`/communities/${slug}`);
      const json = await res.json();
      if (json.success) {
        setCommunity(json.data);
      } else {
        setCommunity(null);
      }
    } catch (e) {
      console.error(e);
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [slug]);

  useEffect(() => {
    if (community && (!community.isPrivate || community.isMember)) {
      loadInitial();
    }
  }, [community?.id, community?.isMember, community?.isPrivate, loadInitial]);

  const handleJoin = async () => {
    if (!isAuthenticated) return openModal();
    setIsJoining(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/join`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        if (json.data?.status === "PENDING") {
          setCommunity((prev: any) => ({ ...prev, hasPendingRequest: true }));
          toast.success("Katılım isteğiniz topluluk yöneticilerine iletildi.");
        } else {
          setCommunity((prev: any) => ({
            ...prev,
            isMember: true,
            role: "MEMBER",
            memberCount: (prev.memberCount || 0) + 1,
          }));
          toast.success("Topluluğa katıldınız!");
        }
      } else {
        toast.error(json.error?.message || "İşlem başarısız.");
      }
    } catch (e) {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!isAuthenticated) return openModal();

    if (community.ownerId === user?.id) {
      toast.error(
        "Topluluk kurucusu topluluktan ayrılamaz. Sahipliği devredin veya topluluğu silin."
      );
      return;
    }

    if (
      !(await confirmDialog(
        "Topluluktan Ayrıl",
        "Topluluktan ayrılmak istediğinize emin misiniz?"
      ))
    ) {
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/leave`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCommunity((prev: any) => ({
          ...prev,
          isMember: false,
          role: null,
          isModerator: false,
          memberCount: Math.max(0, (prev.memberCount || 1) - 1),
        }));
        toast.success("Topluluktan ayrıldınız.");
      } else {
        toast.error(json.error?.message || "Ayrılma işlemi başarısız.");
      }
    } catch (e) {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Topluluk bağlantısı kopyalandı!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: community.name,
          text: community.description || `${community.name} topluluğu`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full max-w-5xl mx-auto min-h-screen bg-transparent p-6 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] bg-white dark:bg-[#080E1A]">
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="Topluluk Bulunamadı"
          description="Aradığınız topluluk mevcut değil veya silinmiş olabilir."
          action={{
            label: "Topluluklara Dön",
            onClick: () => navigate("/communities"),
          }}
        />
      </div>
    );
  }

  const isOwner = user?.id === community.ownerId || community.role === "OWNER";
  const isModerator =
    isOwner || ["admin", "OWNER", "MODERATOR"].includes(community.role);
  const isMember = Boolean(community.isMember);
  const isPrivateGated = Boolean(community.isPrivate) && !isMember;

  const formattedCreatedDate = community.createdAt
    ? new Date(community.createdAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const parsedRules = community.rules
    ? String(community.rules)
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto min-h-screen bg-slate-50/40 dark:bg-[#080E1A] transition-colors">
      {/* Sticky Top Header */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white dark:bg-[#080E1A] border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/communities")}
            aria-label="Topluluklara Dön"
            className="w-9 h-9 flex items-center justify-center -ml-1 rounded-xl bg-slate-100 dark:bg-[#111A2E] hover:bg-slate-200/80 dark:hover:bg-[#18243F] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4.5 h-4.5 stroke-[2]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {community.name}
            </h1>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              c/{community.slug} · {community.category || "Genel"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isModerator && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              }
              onClick={() => setShowManageModal(true)}
              className="rounded-xl font-bold border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              Yönetim Merkezi
            </Button>
          )}

          <button
            type="button"
            onClick={handleShare}
            aria-label="Topluluğu Paylaş"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#111A2E] transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* More Menu */}
          <Dropdown>
            <DropdownTrigger>
              <button
                type="button"
                aria-label="Diğer Seçenekler"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#111A2E] transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4.5 h-4.5" />
              </button>
            </DropdownTrigger>
            <DropdownContent
              align="right"
              className="w-52 border-slate-200/80 dark:border-white/[0.08]"
            >
              {isModerator && (
                <DropdownItem
                  icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
                  onClick={() => setShowManageModal(true)}
                  className="font-semibold text-blue-600"
                >
                  Topluluk Yönetimi
                </DropdownItem>
              )}

              <DropdownItem
                icon={<Share2 className="w-4 h-4 text-slate-600" />}
                onClick={handleShare}
              >
                Paylaş
              </DropdownItem>

              <DropdownItem
                icon={<Copy className="w-4 h-4 text-slate-600" />}
                onClick={handleCopyLink}
              >
                Bağlantıyı Kopyala
              </DropdownItem>

              {isMember && !isOwner && (
                <DropdownItem
                  icon={<LogOut className="w-4 h-4 text-rose-600" />}
                  onClick={handleLeave}
                  className="text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 font-semibold"
                >
                  Topluluktan Ayrıl
                </DropdownItem>
              )}

              {isOwner && (
                <>
                  <DropdownItem
                    icon={<Crown className="w-4 h-4 text-amber-600" />}
                    onClick={() => setShowManageModal(true)}
                    className="text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                  >
                    Sahipliği Devret
                  </DropdownItem>
                  <DropdownItem
                    icon={<Trash2 className="w-4 h-4 text-rose-600" />}
                    onClick={() => setShowManageModal(true)}
                    className="text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 font-semibold"
                  >
                    Topluluğu Sil
                  </DropdownItem>
                </>
              )}

              <DropdownItem
                icon={<AlertTriangle className="w-4 h-4 text-slate-500" />}
                onClick={() => setShowReportDialog(true)}
                className="text-slate-600 dark:text-slate-400"
              >
                Topluluğu Bildir
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </header>

      {/* Editorial Community Hero Header */}
      <section className="bg-white dark:bg-[#0D1424] border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        {/* Cover Banner */}
        {community.coverUrl ? (
          <div className="h-32 sm:h-44 w-full bg-slate-100 dark:bg-[#111A2E] overflow-hidden border-b border-slate-200/60 dark:border-white/[0.06]">
            <img
              src={community.coverUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-16 sm:h-24 w-full bg-slate-100/80 dark:bg-[#111A2E] border-b border-slate-200/60 dark:border-white/[0.06]" />
        )}

        <div className="px-4 sm:px-6 pb-5">
          {/* Identity Lockup + Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8 sm:-mt-10 mb-4">
            <div className="flex items-end gap-4 min-w-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 dark:bg-[#131F38] border-4 border-white dark:border-[#0D1424] shadow-xs flex items-center justify-center shrink-0 overflow-hidden text-blue-600 dark:text-blue-400 font-extrabold text-2xl">
                {community.avatarUrl ? (
                  <img
                    src={community.avatarUrl}
                    alt={community.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(community.name || "T").trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 pb-0.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  {community.name}
                </h2>

                {/* Unboxed Metadata Line */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    c/{community.slug}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{community.category || "Genel"}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    {community.isPrivate ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Özel Topluluk
                        </span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Herkese Açık</span>
                      </>
                    )}
                  </span>

                  {community.role && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                        {isOwner ? (
                          <>
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span>Kurucu</span>
                          </>
                        ) : isModerator ? (
                          <>
                            <Shield className="w-3 h-3" />
                            <span>Yönetici</span>
                          </>
                        ) : (
                          <span>Üye</span>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Membership Action */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {isMember ? (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<UserCheck className="w-4 h-4 text-emerald-600" />}
                  onClick={() => {
                    if (isOwner) {
                      setShowManageModal(true);
                    } else {
                      handleLeave();
                    }
                  }}
                  isLoading={isJoining}
                  className="rounded-xl font-bold"
                >
                  {isOwner ? "Kurucu (Yönet)" : "Üyesiniz · Ayrıl"}
                </Button>
              ) : community.isPrivate ? (
                community.hasPendingRequest ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled
                    leftIcon={<Clock className="w-4 h-4 text-amber-500" />}
                    className="rounded-xl font-bold opacity-85"
                  >
                    Onay Bekliyor
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    onClick={handleJoin}
                    isLoading={isJoining}
                    className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Katılım İsteği Gönder
                  </Button>
                )
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={handleJoin}
                  isLoading={isJoining}
                  className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Topluluğa Katıl
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mb-4">
              {community.description}
            </p>
          )}

          {/* Tabular Metrics & Founder Row */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/[0.06] tabular-nums">
            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {community.memberCount || 0}
              </span>
              <span>üye</span>
            </button>

            <span aria-hidden="true">·</span>

            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {community.postCount || 0}
              </span>
              <span>gönderi</span>
            </button>

            {community.owner?.username && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <span>Kurucu:</span>
                  <Link
                    to={`/profile/${community.owner.username}`}
                    className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                  >
                    @{community.owner.username}
                  </Link>
                </span>
              </>
            )}

            {formattedCreatedDate && (
              <>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedCreatedDate}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#0A101D] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === "posts"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Gönderiler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer tabular-nums ${
              activeTab === "members"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Üyeler ({community.memberCount || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === "about"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hakkında & Kurallar</span>
          </button>
        </div>
      </section>

      {/* Main Workspace: 2-Column on Desktop */}
      <div className="flex-1 p-4 sm:p-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Column */}
          <div className="lg:col-span-8 min-w-0">
            {activeTab === "posts" ? (
              <div className="space-y-4">
                {isPrivateGated ? (
                  <div className="p-8 sm:p-12 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        Bu Özel Bir Topluluktur
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Paylaşılan gönderileri, tartışmaları ve çalışmaları görüntülemek için katılım isteği gönderin. Yöneticiler onayladığında topluluk akışına erişebilirsiniz.
                      </p>
                    </div>
                    {!community.hasPendingRequest && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleJoin}
                        isLoading={isJoining}
                        leftIcon={<UserPlus className="w-4 h-4" />}
                        className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Katılım İsteği Gönder
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Post Composer for Community Members */}
                    {community.isMember && (
                      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] p-3 sm:p-4">
                        <CreatePost
                          communityId={community.id}
                          onPostCreated={(newPost) => {
                            addItem(newPost);
                            setCommunity((prev: any) => ({
                              ...prev,
                              postCount: (prev?.postCount || 0) + 1,
                            }));
                          }}
                        />
                      </div>
                    )}

                    {loadingPosts ? (
                      <div className="space-y-4">
                        <SkeletonCard />
                        <SkeletonCard />
                      </div>
                    ) : posts.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <InfiniteScroll
                          items={posts}
                          hasMore={hasMore}
                          isLoading={loadingMore}
                          onLoadMore={loadMore}
                          renderItem={(post) => (
                            <PostCard
                              key={post.id}
                              post={post}
                              onPostDeleted={(id) => {
                                setPosts((prev) => prev.filter((p) => p.id !== id));
                                setCommunity((prev: any) => ({
                                  ...prev,
                                  postCount: Math.max(0, (prev?.postCount || 1) - 1),
                                }));
                              }}
                            />
                          )}
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] p-8">
                        <EmptyState
                          icon={<FileText className="w-7 h-7" />}
                          title="Henüz Gönderi Yok"
                          description={
                            isMember
                              ? "Bu toplulukta henüz bir paylaşım yapılmadı. İlk gönderiyi yukarıdaki alandan siz paylaşın!"
                              : "Bu toplulukta henüz bir paylaşım yapılmadı. Katılarak ilk tartışmayı başlatabilirsiniz."
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : activeTab === "members" ? (
              <CommunityMembers
                communityId={community.id}
                isOwner={isOwner}
                isModerator={isModerator}
                currentUserId={user?.id || 0}
                onMemberCountChanged={(delta) => {
                  setCommunity((prev: any) => ({
                    ...prev,
                    memberCount: Math.max(0, (prev?.memberCount || 0) + delta),
                  }));
                }}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] space-y-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    <span>Topluluk Hakkında</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {community.description || "Bu topluluk için henüz detaylı bir açıklama eklenmemiş."}
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] space-y-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    <span>Topluluk Kuralları</span>
                  </h3>
                  {parsedRules.length > 0 ? (
                    <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {parsedRules.map((rule: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 dark:border-white/[0.05] last:border-0 last:pb-0"
                        >
                          <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="leading-relaxed">
                            {rule.replace(/^\d+[\.\)\-]\s*/, "")}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Bu topluluk için özel kural listesi tanımlanmamış. Genç Sosyal genel topluluk ilkeleri geçerlidir.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Contextual Sidebar (Desktop) */}
          <aside className="hidden lg:flex lg:col-span-4 flex-col gap-4 sticky top-[132px]">
            {/* About Card */}
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Topluluk Bilgisi
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {community.description || "Genç Sosyal çalışma ve üretim topluluğu."}
              </p>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Kategori</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {community.category || "Genel"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Erişim</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {community.isPrivate ? "Özel (Onaylı)" : "Herkese Açık"}
                  </span>
                </div>

                {formattedCreatedDate && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Kuruluş</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formattedCreatedDate}
                    </span>
                  </div>
                )}
              </div>

              {community.owner && (
                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Topluluk Kurucusu
                  </div>
                  <Link
                    to={`/profile/${community.owner.username}`}
                    className="flex items-center gap-2.5 p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <Avatar
                      url={community.owner.avatarUrl}
                      name={community.owner.displayName || community.owner.username}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {community.owner.displayName || community.owner.username}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        @{community.owner.username}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Rules Card */}
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1424] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Topluluk Kuralları
                </h3>
                <BookOpen className="w-4 h-4 text-slate-400" />
              </div>

              {parsedRules.length > 0 ? (
                <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {parsedRules.map((rule: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 pb-2 border-b border-slate-100 dark:border-white/[0.05] last:border-0 last:pb-0"
                    >
                      <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="leading-relaxed">
                        {rule.replace(/^\d+[\.\)\-]\s*/, "")}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Saygılı, yapıcı ve üretime odaklı iletişim kurun. Spam veya konu dışı paylaşımlardan kaçının.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Community Management Modal */}
      {showManageModal && (
        <CommunityManagementModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          community={community}
          currentUserId={user?.id || 0}
          onCommunityUpdated={(updated) => {
            setCommunity((prev: any) => ({ ...prev, ...updated }));
          }}
          onCommunityDeleted={() => {
            navigate("/communities");
          }}
        />
      )}

      {/* Report Community Dialog */}
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetType="community"
        targetId={community.id}
      />
    </div>
  );
}
