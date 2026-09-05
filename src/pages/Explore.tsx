import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  X, 
  Hash, 
  Users, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { Avatar } from "../components/ui/Avatar";
import { PostCard } from "../components/PostCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle, SkeletonList } from "../components/ui/Skeleton";
import { SuggestedUsers } from "../components/SuggestedUsers";

export type ExploreTab = "users" | "posts" | "tags";

export function Explore() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreTab>("users");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi(`/search?q=${encodeURIComponent(query.trim())}&type=${activeTab}`);
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
    }, 400);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border-x border-slate-200/80 dark:border-white/[0.08] min-h-screen bg-white dark:bg-[#070A10] transition-colors">
      {/* STICKY SEARCH HEADER */}
      <div className="sticky top-0 md:top-[60px] z-20 bg-white/85 dark:bg-[#070A10]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        {/* Search Input Box */}
        <div className="px-4 pt-3.5 pb-2.5">
          <div className="relative group">
            <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Kişiler, gönderiler veya etiketler ara..."
              className="w-full bg-slate-100/70 hover:bg-slate-100 focus:bg-white dark:bg-white/[0.04] dark:hover:bg-white/[0.06] dark:focus:bg-[#0D121D] rounded-2xl pl-11 pr-10 py-2.5 outline-none border border-slate-200/80 dark:border-white/[0.08] focus:border-blue-500/50 dark:focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm sm:text-[15px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Keşfet Arama"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Aramayı temizle"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-white/[0.1] active:scale-95 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div 
          className="flex items-center px-4 border-t border-slate-200/60 dark:border-white/[0.06]"
          role="tablist"
          aria-label="Keşfet Kategorileri"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            className={`relative flex-1 py-3 text-xs sm:text-sm font-bold transition-colors text-center ${
              activeTab === "users"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Kişiler</span>
            </div>
            {activeTab === "users" && (
              <motion.div
                layoutId="exploreActiveTab"
                className="absolute bottom-0 inset-x-3 h-0.5 bg-slate-900 dark:bg-blue-500 rounded-full"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "posts"}
            onClick={() => setActiveTab("posts")}
            className={`relative flex-1 py-3 text-xs sm:text-sm font-bold transition-colors text-center ${
              activeTab === "posts"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Gönderiler</span>
            </div>
            {activeTab === "posts" && (
              <motion.div
                layoutId="exploreActiveTab"
                className="absolute bottom-0 inset-x-3 h-0.5 bg-slate-900 dark:bg-blue-500 rounded-full"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tags"}
            onClick={() => setActiveTab("tags")}
            className={`relative flex-1 py-3 text-xs sm:text-sm font-bold transition-colors text-center ${
              activeTab === "tags"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Hash className="w-4 h-4" />
              <span>Etiketler</span>
            </div>
            {activeTab === "tags" && (
              <motion.div
                layoutId="exploreActiveTab"
                className="absolute bottom-0 inset-x-3 h-0.5 bg-slate-900 dark:bg-blue-500 rounded-full"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* SEARCH RESULTS / SKELETON / EMPTY CONTENT */}
      <div className="flex flex-col flex-1 pb-24">
        {/* 1. Loading Skeleton */}
        {loading && (
          <div className="p-4 space-y-3">
            {activeTab === "users" && (
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08]"
                >
                  <SkeletonCircle size="md" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              ))
            )}

            {activeTab === "posts" && (
              <>
                <SkeletonList count={2} />
                <SkeletonList count={2} />
              </>
            )}

            {activeTab === "tags" && (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08]"
                >
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="px-6 py-12 max-w-md mx-auto text-center">
            <EmptyState
              icon={<AlertCircle className="w-8 h-8 text-rose-500" />}
              title="Arama Başarısız"
              description={error}
              action={{
                label: "Yeniden Dene",
                onClick: () => {
                  const q = query;
                  setQuery("");
                  setTimeout(() => setQuery(q), 50);
                },
              }}
            />
          </div>
        )}

        {/* 3. Results Found */}
        {!loading && !error && results.length > 0 && (
          <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
            {/* Users Tab Results */}
            {activeTab === "users" && (
              <div className="p-2 sm:p-3 space-y-1">
                {results.map((user) => (
                  <div key={user.id}>
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-slate-200/80 dark:hover:border-white/[0.08] transition-all group"
                    >
                      <Avatar
                        url={user.avatarUrl}
                        name={user.displayName || user.username}
                        size="md"
                        className="ring-1 ring-slate-200 dark:ring-white/[0.1] group-hover:ring-slate-300 transition-all shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate text-sm sm:text-base">
                            {user.displayName || user.username}
                          </span>
                          {user.isVerified && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-950 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                          @{user.username}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5 line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full shrink-0 font-bold group-hover:bg-slate-100 dark:group-hover:bg-white/[0.08] transition-colors"
                      >
                        Profili Gör
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Posts Tab Results */}
            {activeTab === "posts" && (
              <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
                {results.map((post) => (
                  <PostCard key={post.id} post={post} onPostDeleted={(id) => setResults(prev => prev.filter((p: any) => p.id !== id))} />
                ))}
              </div>
            )}

            {/* Tags Tab Results */}
            {activeTab === "tags" && (
              <div className="p-2 sm:p-3 space-y-1">
                {results.map((tag) => (
                  <div key={tag.id || tag.name}>
                    <Link
                      to={`/hashtags/${encodeURIComponent(tag.name)}`}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-slate-200/80 dark:hover:border-white/[0.08] transition-all group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          #{tag.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {tag.postCount || 0} gönderi
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-white/[0.06] transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. No Results Found for Query */}
        {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
          <div className="px-6 py-14 max-w-md mx-auto text-center">
            <EmptyState
              icon={<Search className="w-8 h-8 text-slate-400" />}
              title="Sonuç Bulunamadı"
              description={`"${query}" aramasıyla eşleşen herhangi bir ${
                activeTab === "users" ? "kullanıcı" : activeTab === "posts" ? "gönderi" : "etiket"
              } bulunamadı.`}
            />
          </div>
        )}

        {/* 5. Starter State (Prompt to Search or Suggested Users) */}
        {!loading && !error && query.trim().length < 2 && (
          activeTab === "users" ? (
            <div className="p-3 sm:p-5 max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Önerilen Kişiler
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sana özel öneriler</span>
              </div>
              <SuggestedUsers limit={12} />
            </div>
          ) : (
            <div className="px-6 py-14 max-w-md mx-auto text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                Topluluğu Keşfet
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mb-6">
                Yeni yetenekler, projeler, tartışmalar ve popüler etiketleri bulmak için arama yapın.
              </p>

              {/* Quick Tag Suggestions */}
              <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Popüler Etiketler</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {["yazilim", "yapayzeka", "tasarim", "gencsosyal", "proje", "frontend"].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setQuery(sug);
                        setActiveTab("tags");
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-200/60 dark:border-white/[0.06] active:scale-95"
                    >
                      #{sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
