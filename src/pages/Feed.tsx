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
import { Sparkles, Users, ArrowUp, RefreshCw, AlertCircle, Image as ImageIcon, BarChart2, Flame, Layers } from "lucide-react";
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

          if (reset) {
            setPosts(fetchedPosts);
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
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleRefreshToNewPosts = () => {
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

  return (
    <section aria-label="Sosyal Akış" className="w-full min-h-screen">
      {/* 1. ULTRA-MODERN STICKY FEED HEADER WITH ROUNDED PILL TABS */}
      <header className="sticky top-[60px] z-20 bg-white/85 dark:bg-[#080E1A]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-colors py-2.5">
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 flex flex-col gap-2">
          {/* Main Segmented Pill Switcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex p-1 bg-slate-100/90 dark:bg-white/[0.06] backdrop-blur-md rounded-full border border-slate-200/70 dark:border-white/[0.06] shadow-xs">
              {/* For You Pill Button */}
              <button
                type="button"
                onClick={() => setFeedType("for_you")}
                className={cn(
                  "relative px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none",
                  feedType === "for_you"
                    ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <span>Sana Özel</span>
              </button>

              {/* Following Pill Button */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) return openModal();
                  setFeedType("following");
                }}
                className={cn(
                  "relative px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none",
                  feedType === "following"
                    ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <span>Takip Edilenler</span>
              </button>
            </div>

            {/* Quick Refresh Circular Button */}
            <button
              type="button"
              onClick={() => {
                setPage(1);
                loadPosts(1, feedType, true);
              }}
              title="Akışı Yenile"
              aria-label="Akışı yenile"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.06] transition-all active:scale-90 cursor-pointer shadow-xs"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-blue-500")} />
            </button>
          </div>

          {/* Quick Sub-Filter Round Pill Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all" as FeedFilter, label: "✨ Tümü", icon: Layers },
              { id: "media" as FeedFilter, label: "📷 Medyalılar", icon: ImageIcon },
              { id: "polls" as FeedFilter, label: "📊 Anketler", icon: BarChart2 },
              { id: "popular" as FeedFilter, label: "🔥 Popüler", icon: Flame },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer active:scale-95 select-none",
                  activeFilter === f.id
                    ? "bg-blue-600 text-white shadow-xs shadow-blue-500/25 border border-blue-500"
                    : "bg-white/70 dark:bg-[#101C38]/70 hover:bg-slate-100 dark:hover:bg-[#142244] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Floating New Posts Pill Notification */}
      <AnimatePresence>
        {newPostsAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[138px] z-30 flex justify-center pointer-events-none py-2"
          >
            <button
              type="button"
              onClick={handleRefreshToNewPosts}
              className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-xl shadow-blue-500/30 border border-blue-400/30 transition-all cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Yeni Gönderiler Geldi</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FEED CONTENT FLOW */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 pt-3 flex flex-col gap-3 sm:gap-3.5">
        {/* Stories Bar */}
        <StoriesBar />

        {/* Inline Create Post Quick Composer with Round Buttons */}
        <HomeCreatePost onPostCreated={handlePostCreated} />

        {/* 3. POSTS STREAM */}
        <div role="feed" aria-label="Sosyal akış" className="w-full flex flex-col gap-3 sm:gap-3.5">
          {loading ? (
            /* Modern Rounded Skeleton Loading State */
            <div className="w-full flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full bg-white/90 dark:bg-[#0B1329]/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-4/5 rounded-full" />
                  <Skeleton className="h-48 sm:h-60 w-full rounded-2xl mt-1" />
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Modern Error State with Round Button */
            <div className="w-full bg-white/90 dark:bg-[#0B1329]/90 backdrop-blur-xl border border-rose-200/80 dark:border-rose-900/40 rounded-3xl p-6 sm:p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tekrar Dene</span>
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            /* Modern Empty State with Round Buttons */
            <div className="w-full bg-white/90 dark:bg-[#0B1329]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3.5">
                {feedType === "following" ? (
                  <Users className="w-6 h-6 stroke-[1.75]" />
                ) : (
                  <Sparkles className="w-6 h-6 stroke-[1.75]" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                {activeFilter !== "all"
                  ? "Bu filtrede gönderi bulunamadı"
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
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  Tüm Gönderileri Göster
                </button>
              ) : feedType === "following" ? (
                <button
                  type="button"
                  onClick={() => setFeedType("for_you")}
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
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
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
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
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}

              {/* End of Feed Discovery */}
              {!hasMore && (
                <div className="pt-2 pb-6 flex flex-col gap-3">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#0B1329]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>Daha fazla gönderi yükleniyor...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
