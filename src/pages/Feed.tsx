import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { useSEO } from "../hooks/useSEO";
import { PostCard } from "../components/PostCard";
import { StoriesBar } from "../components/StoriesBar";
import { HomeCreatePost } from "../components/HomeCreatePost";
import { FeedSuggestedUsers } from "../components/FeedSuggestedUsers";
import { Avatar } from "../components/ui/Avatar";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { fetchApi } from "../lib/api";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useFollowStore } from "../context/useFollowStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { triggerHaptic } from "../utils/haptics";
import { toast } from "../components/ui/Toast";
import {
  Sparkles,
  Users,
  ArrowUp,
  RefreshCw,
  AlertCircle,
  Flame,
  Keyboard,
  X,
  Command,
  Rocket,
  Brain,
  ArrowRight,
  Pin,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Check,
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
  community?: {
    id: number;
    name: string;
    slug: string;
  };
  project?: {
    id: number;
    title: string;
    category: string;
    status?: string;
    imageUrl?: string;
  };
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

type PrimaryFeedTab = "for_you" | "following" | "projects" | "communities";

export function Feed() {
  useSEO({
    title: "Genç Sosyal — Genç Üretici ve Yazılımcı Platformu",
    description:
      "Genç üreticilerin, yazılımcıların ve tasarımcıların projelerini, takımlarını, topluluklarını ve fikirlerini paylaştığı yeni nesil sosyal platform.",
    canonicalPath: "/",
    allowIndexing: true,
  });

  const navigate = useNavigate();
  const [activePrimaryTab, setActivePrimaryTab] = useState<PrimaryFeedTab>("for_you");
  const [feedType, setFeedType] = useState<"for_you" | "following">("for_you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);

  // Featured Projects & Communities for the dedicated tabs & embedded cards
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [featuredCommunities, setFeaturedCommunities] = useState<any[]>([]);
  const [workshopJoined, setWorkshopJoined] = useState(false);
  const [workshopAttendees, setWorkshopAttendees] = useState(324);

  // Keyboard Navigation State
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Time-based personalized greeting
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Günaydın,";
    if (hour >= 12 && hour < 18) return "İyi günler,";
    if (hour >= 18 && hour < 23) return "İyi akşamlar,";
    return "İyi geceler,";
  }, []);

  // Load projects & communities for rich feed tabs
  useEffect(() => {
    fetchApi("/projects?limit=6")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setFeaturedProjects(j.data);
      })
      .catch(() => {});

    fetchApi("/communities?limit=6")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setFeaturedCommunities(j.data);
      })
      .catch(() => {});
  }, []);

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

  // Filtered posts based on activePrimaryTab
  const filteredPosts = useMemo(() => {
    if (activePrimaryTab === "projects") {
      const projFiltered = posts.filter(
        (p) =>
          p.project ||
          /proje|teknofest|github|prototip|sistem|uygulama|kod|yazılım|robot/i.test(p.content)
      );
      return projFiltered.length > 0 ? projFiltered : posts;
    }
    if (activePrimaryTab === "communities") {
      const commFiltered = posts.filter(
        (p) =>
          p.community ||
          /topluluk|kulüp|atölye|etkinlik|takım|buluşma/i.test(p.content)
      );
      return commFiltered.length > 0 ? commFiltered : posts;
    }
    return posts;
  }, [posts, activePrimaryTab]);

  // Keyboard Shortcuts Handlers
  const handleLikeCurrent = useCallback(() => {
    if (focusedIndex < 0 || focusedIndex >= filteredPosts.length) return;
    const post = filteredPosts[focusedIndex];
    if (!post) return;
    const postElem = document.getElementById(`post-index-${focusedIndex}`);
    const likeBtn = postElem?.querySelector<HTMLButtonElement>('[aria-label*="tepki"]');
    if (likeBtn) likeBtn.click();
  }, [focusedIndex, filteredPosts]);

  const handleRepostCurrent = useCallback(() => {
    if (focusedIndex < 0 || focusedIndex >= filteredPosts.length) return;
    const post = filteredPosts[focusedIndex];
    if (!post) return;
    const postElem = document.getElementById(`post-index-${focusedIndex}`);
    const repostBtn = postElem?.querySelector<HTMLButtonElement>('[aria-label*="paylaşım"]');
    if (repostBtn) repostBtn.click();
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

  const handleSelectPrimaryTab = (tab: PrimaryFeedTab) => {
    triggerHaptic("selection");
    if (tab === "following") {
      if (!isAuthenticated) {
        openModal();
        return;
      }
      setFeedType("following");
    } else if (tab === "for_you") {
      setFeedType("for_you");
    }
    setActivePrimaryTab(tab);
  };

  return (
    <section aria-label="Sosyal Akış" className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#080E1A] transition-colors">
      {/* Floating New Posts Pill Notification */}
      <AnimatePresence>
        {newPostsAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="sticky top-[70px] z-30 flex justify-center pointer-events-none py-2"
          >
            <button
              type="button"
              onClick={handleRefreshToNewPosts}
              className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
              <span>Yeni Gönderiler Var</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN FEED CONTAINER */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 pt-3.5 pb-16 flex flex-col gap-3.5">
        {/* 1. PERSONALIZED GREETING & STREAK BANNER (Matching Mockup 5) */}
        <div className="flex items-center justify-between gap-3 px-0.5">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={user ? `/profile/${user.username}` : "/login"}
              className="shrink-0 group"
            >
              <Avatar
                url={user?.avatarUrl}
                name={user?.displayName || user?.username || "Genç Üretici"}
                size="md"
                className="w-11 h-11 rounded-2xl ring-2 ring-white dark:ring-white/10 shadow-xs group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                {greetingText}
              </p>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {user?.displayName || user?.username || "Genç Üretici"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Genç Quiz Quick Action Pill */}
            <button
              type="button"
              onClick={() => navigate("/quiz")}
              title="Genç Quiz Yarışmalarına Katıl"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] shadow-2xs hover:border-amber-400/60 transition-all active:scale-95 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                Genç Quiz
              </span>
            </button>

            {/* Refresh & Keyboard Help */}
            <button
              type="button"
              onClick={handleRefreshFeed}
              title="Akışı Yenile"
              aria-label="Akışı yenile"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#0D1424] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/[0.08] transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-blue-600")} />
            </button>

            <button
              type="button"
              onClick={handleToggleHelpModal}
              title="Klavye Kısayolları (?)"
              aria-label="Klavye kısayollarını göster"
              className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center bg-white dark:bg-[#0D1424] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/[0.08] transition-all active:scale-95 cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stories Bar */}
        <StoriesBar />

        {/* 2. INLINE QUICK COMPOSER ("Bugün ne üretiyorsun?" + Medya | Proje | Etiket) */}
        <HomeCreatePost onPostCreated={handlePostCreated} />

        {/* 3. FEED FILTER PILLS: Senin İçin | Takip Edilenler | Projeler | Topluluklar */}
        <div
          role="tablist"
          aria-label="Akış Kategorileri"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
        >
          {[
            { id: "for_you" as PrimaryFeedTab, label: "Senin İçin" },
            { id: "following" as PrimaryFeedTab, label: "Takip Edilenler" },
            { id: "projects" as PrimaryFeedTab, label: "Projeler" },
            { id: "communities" as PrimaryFeedTab, label: "Topluluklar" },
          ].map((tab) => {
            const isActive = activePrimaryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectPrimaryTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer select-none border",
                  isActive
                    ? "bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-500 shadow-xs"
                    : "bg-white dark:bg-[#0D1424] hover:bg-slate-100/80 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4. "ÖNE ÇIKANLAR" (FEATURED MODULES CAROUSEL) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-sm sm:text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight">
              Öne Çıkanlar
            </h2>
            <Link
              to="/explore"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Tümü
            </Link>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
            {/* Card 1: TEKNOFEST Modülü */}
            <div
              onClick={() => navigate("/teknofest")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/teknofest")}
              className="relative min-w-[250px] sm:min-w-[275px] h-[136px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#0F172A] to-blue-950 p-4 flex flex-col justify-between text-white shadow-sm border border-slate-800/80 cursor-pointer group shrink-0"
            >
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] group-hover:scale-105 transition-transform duration-300" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md text-[11px] font-bold text-sky-300 border border-white/15">
                  <Rocket className="w-3.5 h-3.5 text-sky-400" />
                  <span>TEKNOFEST Modülü</span>
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-sm sm:text-[15px] font-extrabold leading-snug text-white group-hover:text-sky-200 transition-colors">
                  Takımını kur, projeni topluluğa tanıt
                </h3>
              </div>
            </div>

            {/* Card 2: Haftanın Bilgi Quiz'i */}
            <div
              onClick={() => navigate("/quiz")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/quiz")}
              className="min-w-[195px] sm:min-w-[215px] h-[136px] rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-2xs hover:border-blue-500/40 transition-all cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  Genç Quiz Odaları
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Canlı bilgi yarışması
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mt-1.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Başla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Card 3: Projeler Vitrini */}
            <div
              onClick={() => navigate("/projects")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/projects")}
              className="min-w-[195px] sm:min-w-[215px] h-[136px] rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] p-4 flex flex-col justify-between shadow-2xs hover:border-emerald-500/40 transition-all cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  Öğrenci Projeleri
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Açık kaynak & prototipler
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Keşfet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. POSTS STREAM */}
        <div role="feed" aria-label="Sosyal akış" className="w-full flex flex-col gap-3.5">
          {loading ? (
            <div className="w-full flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full bg-white dark:bg-[#0B1329] rounded-2xl border border-slate-200/80 dark:border-white/[0.07] p-4 flex flex-col gap-3 shadow-2xs"
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
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="w-full bg-white dark:bg-[#0B1329] border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                Akış yüklenemedi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
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
            <div className="w-full bg-white dark:bg-[#0B1329] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-7 text-center shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                {feedType === "following" ? (
                  <Users className="w-6 h-6 stroke-[1.75]" />
                ) : (
                  <Sparkles className="w-6 h-6 stroke-[1.75]" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                {feedType === "following"
                  ? "Takip ettiğin kimse yok"
                  : "Henüz gönderi bulunmuyor"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                {feedType === "following"
                  ? "İlgini çeken üreticileri ve geliştiricileri takip ederek akışını zenginleştir."
                  : "İlk gönderiyi paylaşarak toplulukta sohbeti başlatabilirsin!"}
              </p>
              {feedType === "following" ? (
                <button
                  type="button"
                  onClick={() => handleSelectPrimaryTab("for_you")}
                  className="px-4 py-2 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Senin İçin Akışına Git
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

              {feedType === "following" && (
                <div className="mt-8 text-left border-t border-slate-100 dark:border-white/[0.06] pt-6">
                  <FeedSuggestedUsers />
                </div>
              )}
            </div>
          ) : (
            <>
              {filteredPosts.map((post, idx) => (
                <React.Fragment key={post.id}>
                  <PostCard
                    post={post}
                    index={idx}
                    isKeyboardFocused={focusedIndex === idx}
                    onPostDeleted={handlePostDeleted}
                  />
                </React.Fragment>
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#0B1329] border border-slate-200/80 dark:border-white/[0.08] shadow-xs text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>Daha fazla gönderi yükleniyor...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KEYBOARD SHORTCUTS HELP MODAL */}
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
              <div className="pt-1 pb-3 flex justify-center items-center sm:hidden">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

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
                    <span className="text-slate-300 font-medium">{item.label}</span>
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
