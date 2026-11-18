import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  X,
  Hash,
  Users,
  Globe,
  Lock,
  ChevronRight,
  Plus,
  BookmarkCheck,
  Sparkles,
  FolderGit2,
} from "lucide-react";
import { CreatePost } from "../components/CreatePost";
import { useAuthStore } from "../context/useAuth";
import { useSEO } from "../hooks/useSEO";
import { fetchApi } from "../lib/api";
import { toast } from "../components/ui/Toast";
import { cn } from "../lib/utils";

export function CreatePostPage() {
  useSEO({
    allowIndexing: false,
    title: "Yeni Gönderi | Genç Sosyal",
    canonicalPath: "/create",
  });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const communityIdParam = searchParams.get("communityId");
  const quoteId = searchParams.get("quoteId");

  const [selectedCommunityId, setSelectedCommunityId] = useState<number | undefined>(
    communityIdParam ? parseInt(communityIdParam) : undefined
  );
  const [communities, setCommunities] = useState<any[]>([]);
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [tags, setTags] = useState<string[]>(["robotik", "teknoloji", "proje"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchApi("/communities?limit=20")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setCommunities(j.data);
        }
      })
      .catch(() => {});
  }, []);

  const selectedCommunity = communities.find((c) => c.id === selectedCommunityId);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTagInput.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ_]/g, "").toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setNewTagInput("");
    setShowTagInput(false);
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      "gencsosyal_post_draft_meta",
      JSON.stringify({ tags, selectedCommunityId, savedAt: new Date().toISOString() })
    );
    toast.success("Gönderi taslağınız kaydedildi!");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] bg-[#F8FAFC] dark:bg-[#080E1A] pb-20 transition-colors">
      {/* 1. STICKY HEADER (Matching Mockup 2: X | Yeni Gönderi | Taslak) */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white/95 dark:bg-[#0D121D]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
        <div className="flex items-center justify-between h-14 w-full max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Kapat"
              className="flex items-center justify-center w-9 h-9 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Yeni Gönderi
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Taslak</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN COMPOSER SURFACE (Matching Mockup 2) */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-3 sm:p-5 space-y-4">
        <div className="bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xs p-4 sm:p-6 space-y-4 transition-colors">
          <CreatePost
            quoteId={quoteId ? parseInt(quoteId) : undefined}
            onQuoteRemoved={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete("quoteId");
              setSearchParams(nextParams, { replace: true });
            }}
            standalone={true}
            autoFocus={true}
            communityId={selectedCommunityId}
            onPostCreated={() => {
              window.dispatchEvent(new Event("refreshOnboarding"));
              navigate("/home");
            }}
          />

          {/* Interactive Hashtag Chips Row (Mockup 2) */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800/40"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    aria-label={`${t} etiketini kaldır`}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {showTagInput ? (
                <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="etiket..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onBlur={() => setShowTagInput(false)}
                    className="px-2.5 py-1 rounded-xl border border-blue-400 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none w-28"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-dashed border-slate-300 dark:border-white/15 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Hash className="w-3 h-3" />
                  <span>Etiket ekle</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. İLİŞKİLENDİR (COMMUNITY / PROJECT ASSOCIATION - Mockup 2) */}
        <div className="bg-white dark:bg-[#0D121D] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-2xs space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            İLİŞKİLENDİR
          </div>

          <button
            type="button"
            onClick={() => setShowCommunitySelector(!showCommunitySelector)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[11px] font-medium text-slate-400">Topluluk</div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {selectedCommunity ? selectedCommunity.name : "Genel Akış (Topluluk Seç)"}
                </div>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform",
                showCommunitySelector && "rotate-90"
              )}
            />
          </button>

          {showCommunitySelector && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedCommunityId(undefined);
                  setShowCommunitySelector(false);
                }}
                className={cn(
                  "p-2.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer",
                  !selectedCommunityId
                    ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600"
                    : "border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-300"
                )}
              >
                🌐 Genel Akış (Herkese Açık)
              </button>
              {communities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCommunityId(c.id);
                    setShowCommunitySelector(false);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl text-left text-xs font-bold border transition-all truncate cursor-pointer",
                    selectedCommunityId === c.id
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600"
                      : "border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-300"
                  )}
                >
                  👥 {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
