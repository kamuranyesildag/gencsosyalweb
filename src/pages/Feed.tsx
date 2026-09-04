import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { PostCard } from "../components/PostCard";
import { StoriesBar } from "../components/StoriesBar";
import { FeedSuggestedUsers } from "../components/FeedSuggestedUsers";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { Sparkles, Users, ArrowUp, RefreshCw } from "lucide-react";
import { Skeleton } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";

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

export function Feed() {
  const navigate = useNavigate();
  const [feedType, setFeedType] = useState<"for_you" | "following">("for_you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const firstPostIdRef = useRef<number | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Load feed posts
  const loadPosts = useCallback(
    async (currentPage: number, type: "for_you" | "following", reset = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (reset) {
        setLoading(true);
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
            if (fetchedPosts.length > 0) {
              firstPostIdRef.current = fetchedPosts[0].id;
            }
          } else {
            setPosts((prev) => {
              // Deduplicate by post id
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
          setHasMore(false);
        }
      } catch (err) {
        console.error("Feed fetch error:", err);
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
      { threshold: 0.1, rootMargin: "200px" }
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

  const handleRefreshToNewPosts = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNewPostsAvailable(false);
    setPage(1);
    loadPosts(1, feedType, true);
  };

  return (
    <main className="w-full min-h-screen pb-16">
      {/* 1. STICKY FEED HEADER (60px high, blurred liquid glass) */}
      <header className="sticky top-[60px] z-20 bg-white/85 dark:bg-[#0D121D]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        <div className="flex h-12 w-full max-w-2xl mx-auto">
          {/* For You Tab */}
          <button
            type="button"
            onClick={() => setFeedType("for_you")}
            className="flex-1 relative flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span
              className={
                feedType === "for_you"
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }
            >
              Sana Özel
            </span>
            {feedType === "for_you" && (
              <motion.div
                layoutId="feed-tab-indicator"
                className="absolute bottom-0 h-0.5 w-12 bg-blue-600 rounded-full"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>

          {/* Following Tab */}
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) return openModal();
              setFeedType("following");
            }}
            className="flex-1 relative flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span
              className={
                feedType === "following"
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }
            >
              Takip Edilenler
            </span>
            {feedType === "following" && (
              <motion.div
                layoutId="feed-tab-indicator"
                className="absolute bottom-0 h-0.5 w-16 bg-blue-600 rounded-full"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        </div>
      </header>

      {/* Floating New Posts Pill Notification */}
      <AnimatePresence>
        {newPostsAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[118px] z-30 flex justify-center pointer-events-none py-2"
          >
            <button
              type="button"
              onClick={handleRefreshToNewPosts}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-full shadow-lg transition-all cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Yeni Gönderiler Var</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FEED CONTENT FLOW */}
      <div className="w-full max-w-2xl mx-auto pt-3">
        {/* Stories Bar */}
        <StoriesBar />

        {/* 3. POSTS STREAM */}
        <div role="feed" aria-label="Sosyal akış" className="w-full">
          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-3 px-2 sm:px-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 flex gap-3.5"
                >
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-4/5 rounded-md" />
                    <Skeleton className="h-48 w-full rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl mx-2 sm:mx-4 p-8 text-center my-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3.5">
                {feedType === "following" ? (
                  <Users className="w-6 h-6 stroke-[1.75]" />
                ) : (
                  <Sparkles className="w-6 h-6 stroke-[1.75]" />
                )}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                {feedType === "following"
                  ? "Takip ettiğin kimse yok"
                  : "Henüz gönderi bulunmuyor"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-sm mx-auto mb-5 leading-relaxed">
                {feedType === "following"
                  ? "İlgini çeken üreticileri ve geliştiricileri takip ederek akışını zenginleştir."
                  : "İlk gönderiyi paylaşarak toplulukta sohbeti başlatabilirsin!"}
              </p>
              {feedType === "following" ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setFeedType("for_you")}
                  className="rounded-xl font-semibold shadow-xs"
                >
                  Sana Özel Akışa Git
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) openModal();
                    else navigate("/create");
                  }}
                  className="rounded-xl font-semibold shadow-xs"
                >
                  İlk Gönderiyi Paylaş
                </Button>
              )}

              {/* Discovery in empty state */}
              {feedType === "following" && (
                <div className="mt-8 text-left border-t border-slate-100 dark:border-white/[0.06] pt-6">
                  <FeedSuggestedUsers />
                </div>
              )}
            </div>
          ) : (
            /* Posts List */
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}

              {/* End of Feed Discovery / Suggested Users */}
              {!hasMore && (
                <div className="pt-3 pb-6">
                  <FeedSuggestedUsers />
                  <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Tüm gönderileri gördün ✨
                  </div>
                </div>
              )}
            </>
          )}

          {/* Infinite Scroll Trigger & Loader */}
          {hasMore && !loading && posts.length > 0 && (
            <div ref={loadMoreRef} className="py-6 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Daha fazla gönderi yükleniyor...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
