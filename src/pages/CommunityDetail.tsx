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
    title: community ? `${community.name} - Genç Sosyal Topluluğu` : undefined,
    description: community?.description ? community.description.substring(0, 150) : undefined,
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
      <header className="sticky top-16 z-20 bg-white dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Geri"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {community.name}
          </h1>
        </div>

        <Dropdown>
          <DropdownTrigger>
            <button
              type="button"
              aria-label="Diğer Seçenekler"
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-900 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownTrigger>
          <DropdownContent align="right">
            <DropdownItem
              icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
              onClick={() => setShowReportDialog(true)}
              className="text-rose-600"
            >
              Topluluğu Bildir
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </header>

      {/* Community Hero Header */}
      <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 text-center flex flex-col items-center bg-gradient-to-b from-slate-50/70 to-white">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-950 rounded-3xl border-4 border-slate-100 dark:border-slate-800 shadow-md flex items-center justify-center mb-4 overflow-hidden">
          {community.avatarUrl ? (
            <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            <Users className="w-12 h-12 text-slate-900 dark:text-slate-100 stroke-[1.8]" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-1">
          {community.name}
        </h2>
        <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          {community.memberCount || 0} Üye &bull; c/{community.slug}
        </div>

        {community.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed mb-6">
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
            >
              Topluluğa Katıl
            </Button>
          )}
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 bg-white dark:bg-slate-950 sticky top-28 z-10">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 py-3.5 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "posts"
              ? "border-slate-900 text-slate-900 dark:text-slate-100"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Gönderiler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 py-3.5 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "members"
              ? "border-slate-900 text-slate-900 dark:text-slate-100"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          Üyeler ({community.memberCount || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 pb-24">
        {activeTab === "posts" ? (
          <div>
            {community.isMember && (
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <CreatePost
                  communityId={community.id}
                  onPostCreated={(newPost) => addItem(newPost)}
                />
              </div>
            )}

            {loadingPosts ? (
              <div className="p-6 space-y-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : posts.length > 0 ? (
              <div className="divide-y divide-slate-100"><InfiniteScroll items={posts} hasMore={hasMore} isLoading={loadingMore} onLoadMore={loadMore} renderItem={(post) => (
                    <PostCard key={post.id} post={post} onPostDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
                  )} /></div>
            ) : (
              <EmptyState
                icon={<FileText className="w-7 h-7" />}
                title="Henüz Gönderi Yok"
                description="Bu toplulukta henüz bir paylaşım yapılmadı. İlk gönderiyi siz paylaşın!"
              />
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
