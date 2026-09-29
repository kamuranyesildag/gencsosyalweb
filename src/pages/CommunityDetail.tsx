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
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PostCard } from "../components/PostCard";
import { CreatePost } from "../components/CreatePost";
import { usePagination } from "../hooks/usePagination";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { ReportDialog } from "../components/ReportDialog";
import { CommunityMembers } from "../components/CommunityMembers";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { toast } from "../components/ui/Toast";
import { confirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "../components/ui/Dropdown";

export function CommunityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
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

  useEffect(() => {
    if (community) {
      loadInitial();
    }
  }, [community?.id, loadInitial]);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApi(`/communities/${slug}`);
        const json = await res.json();
        if (json.success) setCommunity(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleJoin = async () => {
    if (!isAuthenticated) return openModal();
    setIsJoining(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/join`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setCommunity((prev: any) =>
          prev
            ? { ...prev, isMember: true, memberCount: (prev.memberCount || 0) + 1 }
            : prev
        );
        toast.success("Topluluğa katıldınız!");
      } else {
        toast.error(json.error?.message || "Bir hata oluştu.");
      }
    } catch (e) {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (community.ownerId === user?.id) {
      toast.error("Topluluk kurucusu ayrılamaz.");
      return;
    }
    if (!(await confirmDialog("Onay", "Bu topluluktan ayrılmak istediğinize emin misiniz?"))) return;
    setIsJoining(true);
    try {
      const res = await fetchApi(`/communities/${community.id}/leave`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCommunity((prev: any) =>
          prev
            ? { ...prev, isMember: false, memberCount: Math.max(0, (prev.memberCount || 1) - 1) }
            : prev
        );
        toast.success("Topluluktan ayrıldınız.");
      } else {
        toast.error(json.error?.message || "Bir hata oluştu.");
      }
    } catch (e) {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsJoining(false);
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

  const isOwner = user?.id === community.ownerId;

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto min-h-screen bg-transparent">
      {/* Header */}
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
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {community.name}
          </h1>
        </div>

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
          <DropdownContent align="right" className="w-44 border-slate-200/80 dark:border-white/[0.08]">
            <DropdownItem
              icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
              onClick={() => setShowReportDialog(true)}
              className="text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
            >
              Topluluğu Bildir
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </header>

      {/* Community Hero Header */}
      <div className="p-6 sm:p-8 border-b border-slate-200/80 dark:border-white/[0.08] text-center flex flex-col items-center bg-white dark:bg-[#0D121D] transition-colors">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-xs flex items-center justify-center mb-3.5 overflow-hidden">
          {community.avatarUrl ? (
            <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            <Users className="w-10 h-10 text-blue-600 dark:text-blue-400 stroke-[1.8]" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
          {community.name}
        </h2>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{community.memberCount || 0} Üye</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>c/{community.slug}</span>
        </div>

        {community.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed mb-5">
            {community.description}
          </p>
        )}

        <div className="flex items-center gap-3">
          {community.isMember ? (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<UserCheck className="w-4 h-4 text-emerald-600" />}
              onClick={handleLeave}
              isLoading={isJoining}
              className="rounded-xl font-bold"
            >
              {isOwner ? "Kurucu (Üyesiniz)" : "Ayrıl"}
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
      </div>

      {/* Tab Content */}
      <div className="flex-1 pb-24">
        {activeTab === "posts" ? (
          <div>
            {community.isMember && (
              <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#0D121D]/50">
                <CreatePost
                  communityId={community.id}
                  onPostCreated={(newPost) => addItem(newPost)}
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
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <CommunityMembers
              communityId={community.id}
              isOwnerOrAdmin={isOwner}
              currentUserId={user?.id || 0}
            />
          </div>
        )}
      </div>

      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetType="community"
        targetId={community.id}
      />
    </div>
  );
}
