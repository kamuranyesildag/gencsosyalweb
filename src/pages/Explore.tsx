import { useSEO } from "../hooks/useSEO";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Search,
  X,
  Hash,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Bookmark,
  SlidersHorizontal,
  Code2,
  Cpu,
  Bot,
  FlaskConical,
  Lightbulb,
  GraduationCap,
  PenTool,
  Rocket,
  Heart,
  ChevronRight,
  Check,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { Avatar } from "../components/ui/Avatar";
import { PostCard } from "../components/PostCard";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle, SkeletonList } from "../components/ui/Skeleton";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { toast } from "../components/ui/Toast";
import { cn } from "../lib/utils";

export type ExploreTab = "all" | "users" | "posts" | "tags";

const EXPLORE_CATEGORIES = [
  {
    id: "yazilim",
    label: "Yazılım",
    query: "yazilim",
    icon: Code2,
    bg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
  },
  {
    id: "yapayzeka",
    label: "Yapay Zekâ",
    query: "yapayzeka",
    icon: Cpu,
    bg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
  },
  {
    id: "robotik",
    label: "Robotik",
    query: "robotik",
    icon: Bot,
    bg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
  },
  {
    id: "bilim",
    label: "Bilim",
    query: "bilim",
    icon: FlaskConical,
    bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "girisim",
    label: "Girişim",
    query: "girisim",
    icon: Lightbulb,
    bg: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
  },
  {
    id: "egitim",
    label: "Eğitim",
    query: "egitim",
    icon: GraduationCap,
    bg: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
  },
  {
    id: "tasarim",
    label: "Tasarım",
    query: "tasarim",
    icon: PenTool,
    bg: "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400",
  },
  {
    id: "teknofest",
    label: "TEKNOFEST",
    query: "teknofest",
    icon: Rocket,
    bg: "bg-slate-900 dark:bg-blue-600 text-sky-400 dark:text-white",
    isSpecialRoute: "/teknofest",
  },
];

export function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<ExploreTab>("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Discovery hub state (100% real database records)
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const [joinedCommIds, setJoinedCommIds] = useState<Set<number>>(new Set());

  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  useSEO({
    title: query.trim()
      ? `"${query}" Arama Sonuçları | Genç Sosyal`
      : "Keşfet — Trend Projeler ve Topluluklar | Genç Sosyal",
    description:
      "Genç Sosyal Keşfet ile trend teknoloji projelerini, popüler yazılım etiketlerini, aktif toplulukları ve üretken genç geliştiricileri anında keşfedin.",
    canonicalPath: "/explore",
    allowIndexing: !query.trim(),
  });

  // Load discovery hub sections on mount from real endpoints
  useEffect(() => {
    fetchApi("/hashtags/trending/top?limit=6")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setTrendingTags(j.data);
      })
      .catch(() => {});

    fetchApi("/projects?limit=4")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setProjects(j.data);
      })
      .catch(() => {});

    fetchApi("/users/suggestions?limit=6")
      .then((r) => r.json())
      .then((j) => {
        const list = Array.isArray(j.data)
          ? j.data
          : Array.isArray(j.data?.suggestions)
          ? j.data.suggestions
          : [];
        setSuggestedUsers(list);
      })
      .catch(() => {});

    fetchApi("/communities?limit=4")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setCommunities(j.data);
          const initialJoined = new Set<number>();
          j.data.forEach((c: any) => {
            if (c.isMember) initialJoined.add(c.id);
          });
          setJoinedCommIds(initialJoined);
        }
      })
      .catch(() => {});

    fetchApi("/feed?page=1&limit=4")
      .then((r) => r.json())
      .then((j) => {
        const list = Array.isArray(j.data)
          ? j.data
          : Array.isArray(j.data?.posts)
          ? j.data.posts
          : [];
        setPopularPosts(list.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  // Live search effect
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const searchType = activeTab === "all" ? "posts" : activeTab;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi(
          `/search?q=${encodeURIComponent(query.trim())}&type=${searchType}`
        );
        const json = await res.json();
        if (json.success) {
          setResults(json.data || []);
        } else {
          setError(json.error?.message || "Arama sırasında bir hata oluştu.");
          setResults([]);
        }
      } catch (e: any) {
        console.error(e);
        setError("Arama sunucusuna bağlanılamadı.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
  };

  const handleFollowToggle = async (targetUser: any) => {
    if (!isAuthenticated) return openModal();
    const uid = Number(targetUser.id);
    const isNowFollowed = !followedIds.has(uid);

    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (isNowFollowed) next.add(uid);
      else next.delete(uid);
      return next;
    });

    try {
      const res = await fetchApi(`/users/${uid}/follow`, {
        method: isNowFollowed ? "POST" : "DELETE",
      });
      if (res.ok) {
        toast.success(isNowFollowed ? "Takip edildi!" : "Takipten çıkıldı");
      }
    } catch {
      toast.error("İşlem gerçekleştirilemedi");
    }
  };

  const handleJoinCommunity = async (comm: any) => {
    if (!isAuthenticated) return openModal();
    const cid = Number(comm.id);
    if (joinedCommIds.has(cid)) {
      navigate(`/communities/${comm.slug}`);
      return;
    }

    setJoinedCommIds((prev) => new Set(prev).add(cid));
    try {
      const res = await fetchApi(`/communities/${cid}/join`, { method: "POST" });
      if (res.ok) {
        toast.success(`${comm.name} topluluğuna katıldınız!`);
      }
    } catch {
      toast.error("Katılım işlemi başarısız");
    }
  };

  const isSearching = query.trim().length >= 2;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto min-h-screen bg-[#F8FAFC] dark:bg-[#080E1A] transition-colors pb-24">
      {/* 1. STICKY HEADER & SEARCH BAR (Matching Mockup 3) */}
      <div className="sticky top-0 md:top-[60px] z-20 bg-[#F8FAFC]/95 dark:bg-[#080E1A]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 pt-3.5 pb-3 space-y-3 transition-colors">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Keşfet
          </h1>
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) openModal();
              else navigate("/bookmarks");
            }}
            aria-label="Kaydedilenler"
            title="Kaydedilenler"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#0D1424] border border-slate-200/90 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Bookmark className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Search Input + Dark Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Kişi, proje, topluluk veya #etiket ara"
              className="w-full bg-white dark:bg-[#0D1424] rounded-2xl pl-10 pr-9 py-2.5 outline-none border border-slate-200/90 dark:border-white/[0.1] focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm shadow-2xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Keşfet Arama"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Aramayı temizle"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const nextTab: Record<ExploreTab, ExploreTab> = {
                all: "users",
                users: "posts",
                posts: "tags",
                tags: "all",
              };
              setActiveTab(nextTab[activeTab]);
            }}
            aria-label="Filtrele"
            title="Sekme Değiştir"
            className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Filter Pills: Tümü | Kullanıcı | Gönderi | Hashtag */}
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Keşfet Filtreleri"
        >
          {[
            { id: "all" as ExploreTab, label: "Tümü", icon: null },
            { id: "users" as ExploreTab, label: "Kullanıcı", icon: Users },
            { id: "posts" as ExploreTab, label: "Gönderi", icon: FileText },
            { id: "tags" as ExploreTab, label: "Hashtag", icon: Hash },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20"
                    : "bg-white dark:bg-[#0D1424] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SEARCH RESULTS OR RICH DISCOVERY HUB */}
      <div className="flex-1 px-4 pt-4 space-y-6">
        {isSearching ? (
          /* ACTIVE SEARCH RESULTS */
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08]"
                  >
                    <SkeletonCircle size="md" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon={<AlertCircle className="w-8 h-8 text-rose-500" />}
                title="Arama Başarısız"
                description={error}
                action={{
                  label: "Tekrar Dene",
                  onClick: () => {
                    const q = query;
                    setQuery("");
                    setTimeout(() => setQuery(q), 50);
                  },
                }}
              />
            ) : results.length === 0 ? (
              <EmptyState
                icon={<Search className="w-8 h-8 text-slate-400" />}
                title="Sonuç Bulunamadı"
                description={`"${query}" aramasıyla eşleşen sonuç bulunamadı.`}
              />
            ) : activeTab === "users" ? (
              <div className="space-y-2.5">
                {results.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.username}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/40 transition-all group"
                  >
                    <Avatar
                      url={u.avatarUrl}
                      name={u.displayName || u.username}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {u.displayName || u.username}
                        </span>
                        {u.isVerified && <VerifiedBadge iconClassName="w-4 h-4" />}
                      </div>
                      <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-xl text-xs font-bold">
                      Profili Gör
                    </Button>
                  </Link>
                ))}
              </div>
            ) : activeTab === "tags" ? (
              <div className="space-y-2.5">
                {results.map((tag) => (
                  <Link
                    key={tag.id || tag.name}
                    to={`/hashtags/${encodeURIComponent(tag.name)}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#0D1424] border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        #{tag.name}
                      </div>
                      <div className="text-xs text-slate-500">{tag.postCount || 0} gönderi</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={(id) =>
                      setResults((prev) => prev.filter((p: any) => p.id !== id))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* RICH DISCOVERY HUB (Matching Mockup 3) */
          <>
            {/* SECTION A: KATEGORİLER (8-Item Grid) */}
            <section className="space-y-3">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Kategoriler
              </h2>
              <div className="grid grid-cols-4 gap-2.5">
                {EXPLORE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (cat.isSpecialRoute) {
                          navigate(cat.isSpecialRoute);
                        } else {
                          setQuery(cat.query);
                        }
                      }}
                      className="bg-white dark:bg-[#0D1424] border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                          cat.bg
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 text-center truncate w-full">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SECTION B: TREND ETİKETLER (Real Trending Hashtags from DB) */}
            {(activeTab === "all" || activeTab === "tags") && trendingTags.length > 0 && (
              <section className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Trend Etiketler
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Canlı</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {trendingTags.map((item, index) => {
                    const tagName = item.name || item.tag;
                    const count = item.postCount ?? item.count ?? 0;
                    const rank = index + 1;
                    return (
                      <button
                        key={tagName || index}
                        type="button"
                        onClick={() => {
                          setQuery(tagName);
                          setActiveTab("posts");
                        }}
                        className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-white/[0.03] rounded-xl px-1 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={cn(
                              "text-sm font-black w-4 text-center tabular-nums",
                              rank <= 2
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-400 dark:text-slate-500"
                            )}
                          >
                            {rank}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                              #{tagName}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                              {count} gönderi
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION C: ÖNE ÇIKAN PROJELER CAROUSEL (Real DB Projects) */}
            {activeTab === "all" && projects.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Öne Çıkan Projeler
                  </h2>
                  <Link
                    to="/projects"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tümü
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
                  {projects.map((proj: any, idx: number) => (
                    <Link
                      key={proj.id || idx}
                      to={`/projects/${proj.id}`}
                      className="min-w-[245px] max-w-[260px] bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between shrink-0 group"
                    >
                      <div className="h-28 w-full bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900 relative overflow-hidden">
                        {proj.imageUrl ? (
                          <img
                            src={proj.imageUrl}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sky-400/80">
                            <Rocket className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded-md text-[10px] font-bold",
                              idx % 2 === 0
                                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {proj.category || "Teknoloji"}
                          </span>
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {proj.title}
                          </h3>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate font-medium">
                            {proj.authorDisplayName || proj.authorUsername || "Genç Üretici"}
                          </span>
                          {(proj.likesCount !== undefined || proj.likeCount !== undefined) && (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 shrink-0">
                              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                              <span>{proj.likesCount ?? proj.likeCount ?? 0}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION D: ÖNERİLEN KULLANICILAR HORIZONTAL CARDS */}
            {(activeTab === "all" || activeTab === "users") && suggestedUsers.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Önerilen Kullanıcılar
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Tümü
                  </button>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
                  {suggestedUsers.map((u) => {
                    const isFollowing = followedIds.has(Number(u.id));
                    return (
                      <div
                        key={u.id}
                        className="min-w-[155px] max-w-[170px] bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-3.5 flex flex-col items-center text-center justify-between shadow-2xs shrink-0"
                      >
                        <Link
                          to={`/profile/${u.username}`}
                          className="flex flex-col items-center group"
                        >
                          <Avatar
                            url={u.avatarUrl}
                            name={u.displayName || u.username}
                            size="lg"
                            className="w-14 h-14 mb-2 ring-2 ring-slate-100 dark:ring-white/10 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex items-center justify-center gap-1 max-w-full">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                              {u.displayName || u.username}
                            </span>
                            {u.isVerified && (
                              <VerifiedBadge iconClassName="w-3.5 h-3.5 shrink-0" withModal={false} />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {u.bio || `@${u.username}`}
                          </p>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleFollowToggle(u)}
                          className={cn(
                            "w-full mt-3 py-1.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer",
                            isFollowing
                              ? "bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                          )}
                        >
                          {isFollowing ? "Takip Ediliyor" : "Takip Et"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION E: AKTİF TOPLULUKLAR (Real DB Communities) */}
            {activeTab === "all" && communities.length > 0 && (
              <section className="bg-white dark:bg-[#0D1424] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Aktif Topluluklar
                  </h2>
                  <Link
                    to="/communities"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tümü
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {communities.slice(0, 4).map((comm: any, idx: number) => {
                    const isMember = joinedCommIds.has(Number(comm.id)) || comm.isMember;
                    return (
                      <div
                        key={comm.id || idx}
                        className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-0"
                      >
                        <Link
                          to={comm.slug ? `/communities/${comm.slug}` : "/communities"}
                          className="flex items-center gap-3 min-w-0 flex-1 group"
                        >
                          <div
                            className={cn(
                              "w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0",
                              idx === 0
                                ? "bg-slate-900 text-blue-400"
                                : idx === 1
                                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600"
                            )}
                          >
                            {comm.avatarUrl ? (
                              <img
                                src={comm.avatarUrl}
                                alt={comm.name}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              <span>{(comm.name || "T").charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                              {comm.name}
                            </h3>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{comm.memberCount ?? 1} üye</span>
                            </p>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleJoinCommunity(comm)}
                          className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0",
                            isMember
                              ? "bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                              : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                          )}
                        >
                          {isMember ? "Üyesin" : "Katıl"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION F: POPÜLER GÖNDERİLER */}
            {(activeTab === "all" || activeTab === "posts") && popularPosts.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Popüler Gönderiler
                </h2>
                <div className="space-y-3">
                  {popularPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostDeleted={(id) =>
                        setPopularPosts((prev) => prev.filter((p) => p.id !== id))
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
