import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { fetchApi } from "../lib/api";
import { PostCard } from "../components/PostCard";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { ProfileShareSheet } from "../components/ProfileShareSheet";
import { ReportDialog } from "../components/ReportDialog";
import { ProfileProjects } from "../components/ProfileProjects";
import { InfiniteScroll } from "../components/InfiniteScroll";
import { RichText } from "../components/RichText";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownDivider } from "../components/ui/Dropdown";
import { Skeleton, SkeletonCircle, SkeletonText, SkeletonList } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { confirmDialog } from "../components/ui/ConfirmDialog";
import { toast } from "../components/ui/Toast";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { usePagination } from "../hooks/usePagination";
import { useSEO } from "../hooks/useSEO";
import { 
  ArrowLeft, 
  Calendar, 
  Link as LinkIcon, 
  MapPin, 
  Mail, 
  Settings, 
  Users, 
  UserCheck,
  CheckCircle2, 
  MoreHorizontal, 
  AlertTriangle, 
  Shield, 
  Share2, 
  FileText, 
  FolderGit2, 
  ExternalLink,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";

export type ProfileTab = "posts" | "projects" | "followers" | "following";

export function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const [showVerification, setShowVerification] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useSEO({
    allowIndexing: profile?.allowIndexing ?? true,
    title: profile ? `${profile.displayName || profile.username} (@${profile.username}) - Genç Sosyal` : undefined,
    description: profile?.bio ? profile.bio.substring(0, 150) : undefined,
  });

  const postsQuery = usePagination(profile ? `/users/${profile.id}/posts` : "");
  const followersQuery = usePagination(profile ? `/users/${profile.id}/followers` : "");
  const followingQuery = usePagination(profile ? `/users/${profile.id}/following` : "");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/users/${username}`);
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
          setFollowing(json.data.isFollowing);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error(e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  useEffect(() => {
    if (profile) {
      if (activeTab === "posts") postsQuery.loadInitial();
      if (activeTab === "followers") followersQuery.loadInitial();
      if (activeTab === "following") followingQuery.loadInitial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, activeTab]);

  const handleFollow = async () => {
    if (!isAuthenticated) return openModal();
    if (!profile || isFollowLoading) return;

    setIsFollowLoading(true);
    const nextState = !following;
    setFollowing(nextState);

    // Optimistic follower count update
    setProfile((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        followersCount: Math.max(0, (prev.followersCount || 0) + (nextState ? 1 : -1)),
      };
    });

    try {
      const res = await fetchApi(`/users/${profile.id}/follow`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (!res.ok) {
        // Revert on failure
        setFollowing(!nextState);
        setProfile((prev: any) => ({
          ...prev,
          followersCount: Math.max(0, (prev.followersCount || 0) + (nextState ? -1 : 1)),
        }));
        toast.error("İşlem gerçekleştirilemedi.");
      } else {
        toast.success(nextState ? `@${profile.username} takip ediliyor` : `Takip bırakıldı`);
      }
    } catch (e) {
      console.error(e);
      setFollowing(!nextState);
      setProfile((prev: any) => ({
        ...prev,
        followersCount: Math.max(0, (prev.followersCount || 0) + (nextState ? -1 : 1)),
      }));
      toast.error("İşlem gerçekleştirilemedi.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    if (
      await confirmDialog(
        "Kullanıcıyı Engelle",
        `@${profile.username} adlı kullanıcıyı engellemek istediğinize emin misiniz?`
      )
    ) {
      try {
        const res = await fetchApi(`/users/${profile.id}/block`, { method: "POST" });
        if (res.ok) {
          toast.success(`@${profile.username} engellendi.`);
          navigate("/feed");
        } else {
          toast.error("Engelleme işlemi başarısız oldu.");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) return openModal();
    if (!profile) return;
    try {
      const res = await fetchApi("/messages/conversations", {
        method: "POST",
        data: { targetUserId: profile.id },
      });
      const json = await res.json();
      if (json.success) {
        navigate(`/messages/${json.data.id}`);
      } else {
        toast.error("Sohbet başlatılamadı.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Bağlantı hatası.");
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-white dark:bg-slate-950">
        {/* Sticky Header Skeleton */}
        <div className="sticky top-0 md:top-[60px] z-20 bg-white dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
          <Skeleton variant="circular" className="w-9 h-9" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>

        {/* Cover Skeleton */}
        <Skeleton variant="rectangular" className="h-32 sm:h-44 md:h-48 w-full" />

        {/* Profile Info Skeleton */}
        <div className="px-4 sm:px-6 relative pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-end -mt-10 sm:-mt-14 mb-4">
            <div className="p-1 bg-white dark:bg-slate-950 rounded-full">
              <SkeletonCircle className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <Skeleton className="h-6 w-44 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
            <SkeletonText lines={2} className="mt-3 max-w-lg" />
          </div>
        </div>

        {/* Feed Skeleton */}
        <SkeletonList count={3} className="p-4" />
      </div>
    );
  }

  // 2. User Not Found State
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 min-h-[60vh] bg-white dark:bg-slate-950">
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Kullanıcı Bulunamadı"
          description="Aradığınız profil mevcut değil, silinmiş veya kullanıcı adı değiştirilmiş olabilir."
          action={{
            label: "Akışa Dön",
            onClick: () => navigate("/feed"),
          }}
        />
      </div>
    );
  }

  const isMe = currentUser?.username === profile.username;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-slate-950 select-none">
      {/* STICKY TOP APP BAR */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white/95 dark:bg-[#030712]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/90 h-[56px] md:h-[60px] px-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <IconButton
            aria-label="Geri Dön"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full shrink-0 -ml-1 text-slate-700 hover:text-indigo-600 dark:text-indigo-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {profile.displayName || profile.username}
              </h1>
              {profile.isVerified && <VerifiedBadge iconClassName="w-5 h-5" targetUser={{ username: profile.username, isVerified: !!profile.isVerified }} />}
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">
              {profile.postsCount !== undefined ? `${profile.postsCount} gönderi` : `@${profile.username}`}
            </p>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-1">
          <IconButton
            aria-label="Profili Paylaş"
            variant="ghost"
            size="sm"
            onClick={() => setShowShare(true)}
            className="rounded-full text-slate-500 hover:text-indigo-600 dark:text-indigo-400"
          >
            <Share2 className="w-4.5 h-4.5" />
          </IconButton>
        </div>
      </header>

      {/* COVER IMAGE */}
      {/* COVER IMAGE */}
      <div className="relative h-32 sm:h-44 md:h-52 bg-slate-200 dark:bg-slate-800 w-full overflow-hidden shrink-0 group">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Kapak" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-500 via-slate-600 to-violet-700">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
      </div>

      {/* PROFILE INFO HEADER */}
      <div className="px-4 sm:px-6 pb-5 border-b border-slate-100 dark:border-slate-800 relative">
        {/* Avatar and Main Actions Row */}
        <div className="flex justify-between items-end -mt-10 sm:-mt-14 md:-mt-16 mb-3">
          {/* Avatar with White Border */}
          <div className="p-1 bg-white dark:bg-slate-950 rounded-full shadow-xs shrink-0 z-10">
            <Avatar
              url={profile.avatarUrl}
              name={profile.displayName || profile.username}
              size="xl"
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 ring-4 ring-white dark:ring-[#030712] bg-white dark:bg-[#030712]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {!isMe ? (
              <>
                <IconButton
                  aria-label="Mesaj Gönder"
                  variant="secondary"
                  size="md"
                  onClick={handleMessage}
                  className="rounded-full text-slate-700 shadow-xs"
                >
                  <Mail className="w-4.5 h-4.5" />
                </IconButton>

                <Button
                  variant={following ? "secondary" : "primary"}
                  size="md"
                  isLoading={isFollowLoading}
                  onClick={handleFollow}
                  className={`rounded-full px-5 font-bold transition-all shadow-xs ${
                    following
                      ? "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                      : "shadow-slate-500/20"
                  }`}
                >
                  {following ? "Takip Ediliyor" : "Takip Et"}
                </Button>

                {/* More Menu Dropdown */}
                <Dropdown>
                  <DropdownTrigger>
                    <div
                      role="button"
                      aria-label="Daha fazla seçenek"
                      className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800/90 flex items-center justify-center text-slate-600 hover:bg-slate-50 dark:bg-slate-900 hover:text-slate-900 dark:text-slate-100 transition-colors shadow-xs"
                    >
                      <MoreHorizontal className="w-4.5 h-4.5" />
                    </div>
                  </DropdownTrigger>
                  <DropdownContent align="right" width="w-48">
                    <DropdownItem
                      icon={<Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                      onClick={() => setShowShare(true)}
                    >
                      Profili Paylaş
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem
                      icon={<Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                      onClick={handleBlock}
                    >
                      Kullanıcıyı Engelle
                    </DropdownItem>
                    <DropdownItem
                      icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
                      isDanger
                      onClick={() => setShowReportDialog(true)}
                    >
                      Profili Bildir
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </>
            ) : (
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Settings className="w-4 h-4" />}
                onClick={() => navigate("/settings")}
                className="rounded-full px-5 font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm transition-all"
              >
                Profili Düzenle
              </Button>
            )}
          </div>
        </div>

        {/* User Identity Details */}
        <div className="mt-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {profile.displayName || profile.username}
            </h2>
            {profile.isVerified && <VerifiedBadge iconClassName="w-5 h-5" targetUser={{ username: profile.username, isVerified: !!profile.isVerified }} />}
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-3 text-slate-800 dark:text-slate-100 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            <RichText text={profile.bio} />
          </div>
        )}

        {/* Meta Info Rows (Location, Website, Date) */}
        <div className="flex flex-wrap gap-2.5 mt-4 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium">
          {profile.location && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 dark:text-slate-100 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {new Date(profile.createdAt).toLocaleDateString("tr-TR", {
                month: "long",
                year: "numeric",
              })}{" "}
              katıldı
            </span>
          </div>
        </div>

        {/* Followers & Following Counts */}
        <div className="flex items-center gap-6 mt-5 text-sm select-none">
          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className="group/stat inline-flex items-baseline gap-1.5 focus:outline-none"
          >
            <span className="font-extrabold text-slate-900 dark:text-slate-100 group-hover/stat:text-slate-900 dark:text-slate-100 transition-colors">
              {profile.followingCount || 0}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium group-hover/stat:text-slate-700">Takip Edilen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("followers")}
            className="group/stat inline-flex items-baseline gap-1.5 focus:outline-none"
          >
            <span className="font-extrabold text-slate-900 dark:text-slate-100 group-hover/stat:text-slate-900 dark:text-slate-100 transition-colors">
              {profile.followersCount || 0}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium group-hover/stat:text-slate-700">Takipçi</span>
          </button>
        </div>

        {/* Mutual Followers Display */}
        {profile.mutualFollowers && profile.mutualFollowers.length > 0 && (
          <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex -space-x-2 shrink-0">
              {profile.mutualFollowers.slice(0, 3).map((mf: any) => (
                <Avatar
                  key={mf.id}
                  url={mf.avatarUrl}
                  name={mf.displayName || mf.username}
                  size="sm"
                  className="ring-2 ring-white"
                />
              ))}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {profile.mutualFollowers[0].displayName || profile.mutualFollowers[0].username}
              </span>
              {profile.mutualFollowersCount > 1 && (
                <span>
                  {" "}ve{" "}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {profile.mutualFollowersCount - 1} diğer takip ettiğin kişi
                  </span>
                </span>
              )}{" "}
              takip ediyor
            </div>
          </div>
        )}
      </div>

      {/* PROFILE TABS */}
      <div
        className="sticky top-[56px] md:top-[120px] z-10 bg-white/95 dark:bg-[#030712]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-2 sm:px-4 transition-colors"
        role="tablist"
        aria-label="Profil Sekmeleri"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "posts"}
          onClick={() => setActiveTab("posts")}
          className={`relative flex-1 py-3.5 text-xs sm:text-sm font-bold transition-colors text-center ${
            activeTab === "posts" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-indigo-600 dark:text-indigo-400"
          }`}
        >
          <span>Gönderiler</span>
          {activeTab === "posts" && (
            <motion.div
              layoutId="profileActiveTabIndicator"
              className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[3px] bg-indigo-600 dark:bg-indigo-500 rounded-t-full"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "projects"}
          onClick={() => setActiveTab("projects")}
          className={`relative flex-1 py-3.5 text-xs sm:text-sm font-bold transition-colors text-center ${
            activeTab === "projects" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-indigo-600 dark:text-indigo-400"
          }`}
        >
          <span>Projeler</span>
          {activeTab === "projects" && (
            <motion.div
              layoutId="profileActiveTabIndicator"
              className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[3px] bg-indigo-600 dark:bg-indigo-500 rounded-t-full"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "followers"}
          onClick={() => setActiveTab("followers")}
          className={`relative flex-1 py-3.5 text-xs sm:text-sm font-bold transition-colors text-center ${
            activeTab === "followers" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-indigo-600 dark:text-indigo-400"
          }`}
        >
          <span>Takipçiler</span>
          {activeTab === "followers" && (
            <motion.div
              layoutId="profileActiveTabIndicator"
              className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[3px] bg-indigo-600 dark:bg-indigo-500 rounded-t-full"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "following"}
          onClick={() => setActiveTab("following")}
          className={`relative flex-1 py-3.5 text-xs sm:text-sm font-bold transition-colors text-center ${
            activeTab === "following" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-indigo-600 dark:text-indigo-400"
          }`}
        >
          <span>Takip Edilenler</span>
          {activeTab === "following" && (
            <motion.div
              layoutId="profileActiveTabIndicator"
              className="absolute bottom-0 inset-x-2 sm:inset-x-4 h-[3px] bg-indigo-600 dark:bg-indigo-500 rounded-t-full"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
        </button>
      </div>

      {/* TAB CONTENT STREAM */}
      <div className="flex-1 w-full pb-20">
        {/* 1. Posts Tab */}
        {activeTab === "posts" && (
          postsQuery.loading ? (
            <SkeletonList count={3} className="p-4" />
          ) : postsQuery.data.length > 0 ? (
            <InfiniteScroll
    items={postsQuery.data}
    hasMore={postsQuery.hasMore}
    isLoading={postsQuery.loadingMore}
    onLoadMore={postsQuery.loadMore}
    renderItem={(post) => (<PostCard key={post.id} post={{ ...post, user: profile }} />)}
  />
          ) : (
            <div className="px-4 py-8 max-w-md mx-auto">
              <EmptyState
                icon={<FileText className="w-7 h-7" />}
                title="Henüz Gönderi Yok"
                description={
                  isMe
                    ? "Düşüncelerini, projelerini veya güncellemelerini akışta ilk gönderinle paylaş."
                    : "Bu kullanıcı henüz hiçbir gönderi paylaşmadı."
                }
                action={
                  isMe
                    ? {
                        label: "İlk Gönderini Paylaş",
                        onClick: () => navigate("/feed"),
                      }
                    : undefined
                }
              />
            </div>
          )
        )}

        {/* 2. Projects Tab */}
        {activeTab === "projects" && profile && <ProfileProjects userId={profile.id} />}

        {/* 3. Followers / Following Tabs */}
        {(activeTab === "followers" || activeTab === "following") && (
          (activeTab === "followers" ? followersQuery : followingQuery).loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <SkeletonCircle size="md" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (activeTab === "followers" ? followersQuery : followingQuery).data.length > 0 ? (
            <InfiniteScroll
    items={(activeTab === "followers" ? followersQuery : followingQuery).data}
    hasMore={(activeTab === "followers" ? followersQuery : followingQuery).hasMore}
    isLoading={(activeTab === "followers" ? followersQuery : followingQuery).loadingMore}
    onLoadMore={(activeTab === "followers" ? followersQuery : followingQuery).loadMore}
    renderItem={(u) => {const user = u.follower || u.following || u;
                return (
                  <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3.5 p-4 hover:bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 transition-colors group"
                  >
                    <Avatar
                      url={user.avatarUrl}
                      name={user.displayName || user.username}
                      size="md"
                      className="ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:text-slate-100 transition-colors truncate text-sm sm:text-base">
                          {user.displayName || user.username}
                        </span>
                        {user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} targetUser={{ username: user.username, isVerified: !!user.isVerified }} />}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5 line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                );}}
  />
          ) : (
            <div className="px-4 py-8 max-w-md mx-auto">
              <EmptyState
                icon={activeTab === "followers" ? <Users className="w-7 h-7" /> : <UserCheck className="w-7 h-7" />}
                title={activeTab === "followers" ? "Henüz Takipçi Yok" : "Takip Edilen Kimse Yok"}
                description={
                  activeTab === "followers"
                    ? "Bu kullanıcının henüz takipçisi bulunmuyor."
                    : "Bu kullanıcı henüz kimseyi takip etmiyor."
                }
              />
            </div>
          )
        )}
      </div>

      {/* MODALS AND SHEETS */}
      <ProfileShareSheet
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        profile={profile}
      />
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetType="user"
        targetId={profile.id}
      />
    </div>
  );
}
