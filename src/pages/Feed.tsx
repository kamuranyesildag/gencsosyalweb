import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useSEO } from "../hooks/useSEO";
import { PostCard } from "../components/PostCard";
import { StoriesBar } from "../components/StoriesBar";
import { HomeCreatePost } from "../components/HomeCreatePost";
import { FeedSuggestedUsers } from "../components/FeedSuggestedUsers";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useFollowStore } from "../context/useFollowStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { triggerHaptic } from "../utils/haptics";
import {
  Sparkles,
  Users,
  ArrowUp,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  BarChart2,
  Flame,
  Layers,
  Keyboard,
  X,
  Command,
} from "lucide-react";
import { Skeleton } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface Post {
  id: number;
  content: string;
  media?: any[];
  likeCount: number;
  commentCount: number;
  repostCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isSaved?: boolean;
  createdAt: string;
  visibility?: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
  postType?: "NORMAL" | "POLL" | "SENSITIVE";
  contentWarning?: string;
  pollData?: any;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified?: boolean;
    isFollowing?: boolean;
    followsMe?: boolean;
  };
}

type FeedFilter = "all" | "media" | "polls" | "popular";

export function Feed() {
  useSEO({
    title: "Akış — Keşfet ve Paylaş | Genç Sosyal",
    description: "Genç Sosyal akışında genç yazılımcıların ve üreticilerin en yeni projelerini, güncel fikirlerini ve teknoloji paylaşımlarını canlı takip edin.",
    canonicalPath: "/home",
  });

  const navigate = useNavigate();
  const [feedType, setFeedType] = useState<"for_you" | "following">("for_you");
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);

  // Keyboard Navigation State
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Load feed posts
  const loadPosts = useCallback(
    async (currentPage: number, type: "for_you" | "following", reset = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const endpoint =
          type === "following"
            ? `/feed/following?page=${currentPage}&limit=10`
            : `/feed/for-you?page=${currentPage}&limit=10`;

        let res = await fetchApi(endpoint);
        // Fallback to /feed if /feed/for-you is not available
        if (!res.ok && type === "for_you") {
          res = await fetchApi(`/feed?page=${currentPage}&limit=10`);
        }

        if (!res.ok) {
          if (reset) {
            setError("Gönderiler alınırken bir sorun oluştu.");
          }
          setHasMore(false);
          return;
        }

        const json = await res.json();

        if (json.success && (json.data || json.posts)) {
          let fetchedPosts: Post[] = [];
          if (Array.isArray(json.data)) {
            fetchedPosts = json.data;
          } else if (Array.isArray(json.data?.posts)) {
            fetchedPosts = json.data.posts;
          } else if (Array.isArray(json.posts)) {
            fetchedPosts = json.posts;
          }

          if (type === "following") {
            fetchedPosts = fetchedPosts.map((p) => ({
              ...p,
              user: { ...p.user, isFollowing: true },
            }));
          }

          // Sync any already followed authors to useFollowStore
          fetchedPosts.forEach((p) => {
            if (p.user?.id && (p.user.isFollowing || type === "following")) {
              useFollowStore.getState().syncFromUser(p.user.id, true);
            }
          });

          if (reset) {
            setPosts(fetchedPosts);
            setFocusedIndex(-1);
          } else {
            setPosts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const uniqueNew = fetchedPosts.filter((p) => !existingIds.has(p.id));
              return [...prev, ...uniqueNew];
            });
          }

          const backendHasMore =
            typeof json.data?.hasMore === "boolean"
              ? json.data.hasMore
              : typeof json.hasMore === "boolean"
              ? json.hasMore
              : fetchedPosts.length >= 10;
          setHasMore(backendHasMore);
        } else {
          if (reset) {
            setError(json.error?.message || "Gönderiler yüklenemedi.");
          }
          setHasMore(false);
        }
      } catch (err) {
        console.error("Feed fetch error:", err);
        if (reset) {
          setError("Sunucuya bağlanırken bir hata oluştu.");
        }
        setHasMore(false);
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial & Tab Change Load
  useEffect(() => {
    setPage(1);
    setNewPostsAvailable(false);
    loadPosts(1, feedType, true);
  }, [feedType, loadPosts]);

  // Synchronize global follow changes across current feed posts
  useEffect(() => {
    const handleUserFollowToggled = (e: CustomEvent) => {
      const targetUserId = Number(e.detail?.userId);
      const isFollowing = Boolean(e.detail?.isFollowing);
      if (!targetUserId) return;

      setPosts((prev) =>
        prev.map((p) =>
          Number(p.user?.id) === targetUserId
            ? { ...p, user: { ...p.user, isFollowing } }
            : p
        )
      );
    };

    window.addEventListener("user_follow_toggled", handleUserFollowToggled as EventListener);
    return () => {
      window.removeEventListener("user_follow_toggled", handleUserFollowToggled as EventListener);
    };
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore || posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadPosts(nextPage, feedType, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [loading, loadingMore, hasMore, posts.length, feedType, loadPosts]);

  const handlePostDeleted = (deletedId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handlePostCreated = (newPost: any) => {
    triggerHaptic("medium");
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleRefreshToNewPosts = () => {
    triggerHaptic("medium");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNewPostsAvailable(false);
    setPage(1);
    loadPosts(1, feedType, true);
  };

  // Client-side quick filter for active tab
  const filteredPosts = useMemo(() => {
    if (activeFilter === "media") {
      return posts.filter((p) => p.media && p.media.length > 0);
    }
    if (activeFilter === "polls") {
      return posts.filter((p) => p.postType === "POLL");
    }
    if (activeFilter === "popular") {
      return [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }
    return posts;
  }, [posts, activeFilter]);

  // Keyboard Shortcuts Handlers
  const handleLikeCurrent = useCallback(() => {
    if (focusedIndex < 0 || focusedIndex >= filteredPosts.length) return;
    const post = filteredPosts[focusedIndex];
    if (!post) return;
    const postElem = document.getElementById(`post-index-${focusedIndex}`);
    const likeBtn = postElem?.querySelector<HTMLButtonElement>('[aria-label*="tepki"]');
    if (likeBtn) {
      likeBtn.click();
    }
  }, [focusedIndex, filteredPosts]);

  const handleRepostCurrent = useCallback(() => {
    if (focusedIndex < 0 || focusedIndex >= filteredPosts.length) return;
    const post = filteredPosts[focusedIndex];
    if (!post) return;
    const postElem = document.getElementById(`post-index-${focusedIndex}`);
    const repostBtn = postElem?.querySelector<HTMLButtonElement>('[aria-label*="paylaşım"]');
    if (repostBtn) {
      repostBtn.click();
    }
  }, [focusedIndex, filteredPosts]);

  const handleFocusCompose = useCallback(() => {
    triggerHaptic("light");
    const composeElem = document.getElementById("home-create-post");
    if (composeElem) {
      composeElem.scrollIntoView({ behavior: "smooth", block: "center" });
      const textarea = composeElem.querySelector<HTMLTextAreaElement>("textarea, button");
      if (textarea) textarea.click();
    }
  }, []);

  const handleToggleHelpModal = useCallback(() => {
    triggerHaptic("light");
    setShowKeyboardHelp((prev) => !prev);
  }, []);

  const handleRefreshFeed = useCallback(() => {
    triggerHaptic("medium");
    setPage(1);
    loadPosts(1, feedType, true);
  }, [feedType, loadPosts]);

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    postsLength: filteredPosts.length,
    focusedIndex,
    setFocusedIndex,
    onLikeCurrent: handleLikeCurrent,
    onRepostCurrent: handleRepostCurrent,
    onFocusCompose: handleFocusCompose,
    onToggleHelpModal: handleToggleHelpModal,
    onRefreshFeed: handleRefreshFeed,
  });

  return (
    <section aria-label="Sosyal Akış" className="w-full min-h-screen">
      {/* 1. LIQUID GLASS STICKY FEED HEADER */}
      <header className="sticky top-[54px] md:top-[60px] z-20 bg-white/75 dark:bg-[#080E1A]/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-all py-2.5 shadow-2xs">
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 flex flex-col gap-2">
          {/* Main Segmented Switcher & Tool Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex p-1 bg-slate-100/80 dark:bg-white/[0.06] backdrop-blur-md rounded-2xl border border-slate-200/70 dark:border-white/[0.08] shadow-inner">
              {/* For You Button */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  setFeedType("for_you");
                }}
                className={cn(
                  "relative px-4 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer select-none",
                  feedType === "for_you"
                    ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <span>Sana Özel</span>
              </button>

              {/* Following Button */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  if (!isAuthenticated) return openModal();
                  setFeedType("following");
                }}
                className={cn(
                  "relative px-4 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer select-none",
                  feedType === "following"
                    ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <span>Takip Edilenler</span>
              </button>
            </div>

            {/* Right Header Action Icons */}
            <div className="flex items-center gap-1.5">
              {/* Keyboard Shortcuts Trigger */}
              <button
                type="button"
                onClick={handleToggleHelpModal}
                title="Klavye Kısayolları (?)"
                aria-label="Klavye kısayollarını göster"
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] transition-all active:scale-95 cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* Quick Refresh Button */}
              <button
                type="button"
                onClick={handleRefreshFeed}
                title="Akışı Yenile (.)"
                aria-label="Akışı yenile"
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-blue-500")} />
              </button>
            </div>
          </div>

          {/* Liquid Glass Sub-Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all" as FeedFilter, label: "Tümü", icon: Layers },
              { id: "media" as FeedFilter, label: "Medyalılar", icon: ImageIcon },
              { id: "polls" as FeedFilter, label: "Anketler", icon: BarChart2 },
              { id: "popular" as FeedFilter, label: "Popüler", icon: Flame },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setActiveFilter(f.id);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none border",
                    isActive
                      ? "bg-blue-600/90 text-white border-blue-500 shadow-xs shadow-blue-500/20 scale-[1.02]"
                      : "bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100/80 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-white/[0.06]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Floating New Posts Pill Notification */}
      <AnimatePresence>
        {newPostsAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="sticky top-[125px] z-30 flex justify-center pointer-events-none py-2"
          >
            <button
              type="button"
              onClick={handleRefreshToNewPosts}
              className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600/90 dark:bg-blue-600/90 hover:bg-blue-700 backdrop-blur-xl active:scale-95 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30 border border-blue-400/30 transition-all cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
              <span>Yeni Gönderiler Var</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FEED CONTENT FLOW */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 pt-3 pb-12 flex flex-col gap-3">
        {/* Stories Bar */}
        <StoriesBar />

        {/* Inline Create Post Quick Composer */}
        <HomeCreatePost onPostCreated={handlePostCreated} />

        {/* 3. POSTS STREAM */}
        <div role="feed" aria-label="Sosyal akış" className="w-full flex flex-col gap-3">
          {loading ? (
            /* Frosted Skeleton Loading State */
            <div className="w-full flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full bg-white/70 dark:bg-[#0B1329]/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/[0.07] p-4 flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-3.5 w-full rounded-md" />
                  <Skeleton className="h-3.5 w-4/5 rounded-md" />
                  <Skeleton className="h-44 sm:h-56 w-full rounded-xl mt-1" />
                  <div className="flex items-center gap-2 pt-1">
                    <Skeleton className="h-7 w-14 rounded-lg" />
                    <Skeleton className="h-7 w-14 rounded-lg" />
                    <Skeleton className="h-7 w-14 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Liquid Glass Error Card */
            <div className="w-full bg-white/80 dark:bg-[#0B1329]/80 backdrop-blur-md border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-200/50 dark:border-rose-900/50">
                <AlertCircle className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                Akış yüklenemedi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
                {error}
              </p>
              <button
                type="button"
                onClick={() => loadPosts(1, feedType, true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tekrar Dene</span>
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            /* Liquid Glass Empty State */
            <div className="w-full bg-white/80 dark:bg-[#0B1329]/80 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-7 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-200/50 dark:border-blue-900/50">
                {feedType === "following" ? (
                  <Users className="w-6 h-6 stroke-[1.75]" />
                ) : (
                  <Sparkles className="w-6 h-6 stroke-[1.75]" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                {activeFilter !== "all"
                  ? "Bu filtrede henüz gönderi bulunamadı"
                  : feedType === "following"
                  ? "Takip ettiğin kimse yok"
                  : "Henüz gönderi bulunmuyor"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                {activeFilter !== "all"
                  ? "Filtreyi temizleyerek tüm akış içeriklerini görüntüleyebilirsin."
                  : feedType === "following"
                  ? "İlgini çeken üreticileri ve geliştiricileri takip ederek akışını zenginleştir."
                  : "İlk gönderiyi paylaşarak toplulukta sohbeti başlatabilirsin!"}
              </p>
              {activeFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="px-4 py-2 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Tüm Gönderileri Göster
                </button>
              ) : feedType === "following" ? (
                <button
                  type="button"
                  onClick={() => setFeedType("for_you")}
                  className="px-4 py-2 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Sana Özel Akışa Git
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) openModal();
                    else navigate("/create");
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  İlk Gönderiyi Paylaş
                </button>
              )}

              {/* Discovery in empty state */}
              {feedType === "following" && (
                <div className="mt-8 text-left border-t border-slate-100 dark:border-white/[0.06] pt-6">
                  <FeedSuggestedUsers />
                </div>
              )}
            </div>
          ) : (
            /* Posts Stream */
            <>
              {filteredPosts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={idx}
                  isKeyboardFocused={focusedIndex === idx}
                  onPostDeleted={handlePostDeleted}
                />
              ))}

              {/* End of Feed Discovery */}
              {!hasMore && (
                <div className="pt-3 pb-6 flex flex-col gap-4">
                  <FeedSuggestedUsers />
                  <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500 font-medium select-none">
                    Tüm güncel gönderileri gördün ✨
                  </div>
                </div>
              )}
            </>
          )}

          {/* Infinite Scroll Trigger & Loader */}
          {hasMore && !loading && posts.length > 0 && (
            <div ref={loadMoreRef} className="py-6 flex justify-center">
              {loadingMore && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#0B1329]/80 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] shadow-xs text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>Daha fazla gönderi yükleniyor...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. KEYBOARD SHORTCUTS HELP MODAL */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyboardHelp(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.8 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#0F172A] via-[#090D16] to-[#020408] text-white backdrop-blur-2xl rounded-t-[32px] sm:rounded-3xl border border-white/15 shadow-2xl shadow-black/90 p-5 sm:p-6 z-10 overflow-hidden"
            >
              {/* Grab Handle */}
              <div className="pt-1 pb-3 flex justify-center items-center sm:hidden">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 text-white flex items-center justify-center">
                    <Command className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Klavye Kısayolları
                    </h3>
                    <p className="text-xs text-slate-400">
                      Akışta hızlı gezinti için klavyenizi kullanın
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowKeyboardHelp(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="py-4 space-y-2">
                {[
                  { keys: ["J", "↓"], label: "Sonraki gönderiye odaklan" },
                  { keys: ["K", "↑"], label: "Önceki gönderiye odaklan" },
                  { keys: ["L"], label: "Odaklanılan gönderiyi beğen" },
                  { keys: ["R"], label: "Odaklanılan gönderiyi yeniden paylaş" },
                  { keys: ["C"], label: "Yeni gönderi oluşturma kutusuna odaklan" },
                  { keys: ["."], label: "Akışı en baştan yenile" },
                  { keys: ["?", "H"], label: "Kısayollar menüsünü göster / kapat" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <span className="text-slate-300 font-medium">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15 text-[11px] font-mono font-bold text-white shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => setShowKeyboardHelp(false)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Anlaşıldı
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
