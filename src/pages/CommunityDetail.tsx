import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchApi } from "../lib/api";
import { useSEO } from "../hooks/useSEO";
import { 
  Users, 
  ArrowLeft, 
  MoreVertical, 
  AlertTriangle, 
  Sparkles, 
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
  Settings,
  Trash2,
  Clock,
  BookOpen
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
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "../components/ui/Dropdown";

export function CommunityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"posts" | "members" | "rules">("posts");
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
    title: community ? `${community.name} | Genç Sosyal` : undefined,
    description: community?.description ? community.description.substring(0, 150) : undefined,
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
      const res = await fetchApi(`/communities/${community.id}/join`, { method: "POST" });
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
            memberCount: (prev.memberCount || 0) + 1
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
    
    // Owner Departure Rule check
    if (community.ownerId === user?.id) {
      toast.error("Topluluk kurucusu topluluktan ayrılamaz. Sahipliği devredin veya topluluğu silin.");
      return;
    }

    if (!(await confirmDialog(
      "Topluluktan Ayrıl",
      "Topluluktan ayrılmak istediğinize emin misiniz?"
    ))) {
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/leave`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCommunity((prev: any) => ({
          ...prev,
          isMember: false,
          role: null,
          isModerator: false,
          memberCount: Math.max(0, (prev.memberCount || 1) - 1)
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
      navigator.share({
        title: community.name,
        text: community.description || `${community.name} topluluğu`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto min-h-screen bg-transparent p-6 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] bg-white dark:bg-slate-950">
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="Topluluk Bulunamadı"
          description="Aradığınız topluluk mevcut değil veya silinmiş olabilir."
          action={{
            label: "Topluluklara Dön",
            onClick: () => navigate("/communities")
          }}
        />
      </div>
    );
  }

  const isOwner = user?.id === community.ownerId || community.role === "OWNER";
  const isModerator = isOwner || ['admin', 'OWNER', 'MODERATOR'].includes(community.role);
  const isMember = Boolean(community.isMember);
  const isPrivateGated = Boolean(community.isPrivate) && !isMember;

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto min-h-screen bg-transparent">
      {/* Sticky Header */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white/90 dark:bg-[#070A10]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Geri"
            className="w-9 h-9 flex items-center justify-center -ml-1 rounded-xl bg-slate-100 dark:bg-[#161E2E] hover:bg-slate-200/80 dark:hover:bg-[#1f293d] text-slate-700 dark:text-slate-200 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {community.name}
            </h1>
            <div className="text-[11px] text-slate-400 font-medium">
              c/{community.slug}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Management Center Button for Owner/Moderator */}
          {isModerator && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              onClick={() => setShowManageModal(true)}
              className="rounded-xl font-bold border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              Yönet
            </Button>
          )}

          {/* More Menu */}
          <Dropdown>
            <DropdownTrigger>
              <button
                type="button"
                aria-label="Diğer Seçenekler"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <MoreVertical className="w-4.5 h-4.5" />
              </button>
            </DropdownTrigger>
            <DropdownContent align="right" className="w-52 border-slate-200/80 dark:border-white/[0.08]">
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

      {/* Community Hero Header */}
      <div className="p-6 sm:p-8 border-b border-slate-200/80 dark:border-white/[0.08] text-center flex flex-col items-center bg-white dark:bg-[#0D121D] transition-colors relative overflow-hidden">
        {/* Community Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-xs flex items-center justify-center mb-3.5 overflow-hidden">
          {community.avatarUrl ? (
            <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            <Users className="w-10 h-10 text-blue-600 dark:text-blue-400 stroke-[1.8]" />
          )}
        </div>

        {/* Badges: Category & Privacy */}
        <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
            {community.category || "Genel"}
          </span>

          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            community.isPrivate
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}>
            {community.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {community.isPrivate ? "Özel" : "Herkese Açık"}
          </span>

          {community.role && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
              isOwner
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                : isModerator
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-slate-300"
            }`}>
              {isOwner ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
              {isOwner ? "Kurucu" : isModerator ? "Yönetici" : "Üye"}
            </span>
          )}
        </div>

        {/* Community Name */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
          {community.name}
        </h2>

        {/* Counts & Meta */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
          <span className="text-blue-600 dark:text-blue-400 font-bold">{community.memberCount || 0} Üye</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>{community.postCount || 0} Gönderi</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>c/{community.slug}</span>
        </div>

        {/* Description */}
        {community.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed mb-5">
            {community.description}
          </p>
        )}

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          {isMember ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<UserCheck className="w-4 h-4 text-emerald-600" />}
                onClick={() => {
                  if (isOwner) {
                    toast.info("Topluluk kurucususunuz.");
                  } else {
                    handleLeave();
                  }
                }}
                isLoading={isJoining}
                className="rounded-xl font-bold"
              >
                {isOwner ? "Topluluk Kurucususunuz" : "Üyesiniz (Ayrıl)"}
              </Button>
            </div>
          ) : community.isPrivate ? (
            community.hasPendingRequest ? (
              <Button
                variant="secondary"
                size="md"
                disabled
                leftIcon={<Clock className="w-4 h-4 text-amber-500 animate-spin" />}
                className="rounded-xl font-bold opacity-80"
              >
                İstek İletildi (Onay Bekliyor)
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={handleJoin}
                isLoading={isJoining}
                className="rounded-xl font-bold shadow-xs"
              >
                Katılım İsteği Gönder
              </Button>
            )
          ) : (
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={handleJoin}
              isLoading={isJoining}
              className="rounded-xl font-bold shadow-xs"
            >
              Topluluğa Katıl
            </Button>
          )}
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 bg-white/90 dark:bg-[#070A10]/90 backdrop-blur-md sticky top-[60px] z-10 transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
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
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "members"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Üyeler ({community.memberCount || 0})</span>
        </button>

        {community.rules && (
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "rules"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kurallar</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 pb-24">
        {activeTab === "posts" ? (
          <div>
            {/* Private Community Gate Notice */}
            {isPrivateGated ? (
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Bu Özel Bir Topluluktur
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Paylaşılan gönderileri, tartışmaları ve projeleri görüntülemek için lütfen katılım isteği gönderin. Topluluk yöneticileri isteğinizi onayladığında içeriklere erişebilirsiniz.
                </p>
                {!community.hasPendingRequest && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleJoin}
                    isLoading={isJoining}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    className="rounded-xl font-bold"
                  >
                    Katılım İsteği Gönder
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Create Post Banner if member */}
                {community.isMember && (
                  <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#0D121D]/50">
                    <CreatePost
                      communityId={community.id}
                      onPostCreated={(newPost) => {
                        addItem(newPost);
                        setCommunity((prev: any) => ({
                          ...prev,
                          postCount: (prev?.postCount || 0) + 1
                        }));
                      }}
                    />
                  </div>
                )}

                {loadingPosts ? (
                  <div className="p-4 sm:p-6 space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="p-2 sm:p-4 flex flex-col gap-3">
                    <InfiniteScroll
                      items={posts}
                      hasMore={hasMore}
                      isLoading={loadingMore}
                      onLoadMore={loadMore}
                      renderItem={(post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                        />
                      )}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <EmptyState
                      icon={<FileText className="w-7 h-7" />}
                      title="Henüz Gönderi Yok"
                      description="Bu toplulukta henüz bir paylaşım yapılmadı. İlk gönderiyi siz paylaşın!"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ) : activeTab === "members" ? (
          <div className="p-4 sm:p-6">
            <CommunityMembers
              communityId={community.id}
              isOwner={isOwner}
              isModerator={isModerator}
              currentUserId={user?.id || 0}
              onMemberCountChanged={(delta) => {
                setCommunity((prev: any) => ({
                  ...prev,
                  memberCount: Math.max(0, (prev?.memberCount || 0) + delta)
                }));
              }}
            />
          </div>
        ) : (
          <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D121D] space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-blue-600" />
                Topluluk Kuralları
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {community.rules}
              </p>
            </div>
          </div>
        )}
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
