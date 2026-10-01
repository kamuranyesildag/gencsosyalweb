import { useSEO } from "../hooks/useSEO";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Loader2, 
  Users, 
  Plus, 
  X, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Lock, 
  Globe, 
  Crown,
  Shield
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { toast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonList } from "../components/ui/Skeleton";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { backdropVariants, modalVariants } from "../lib/motion";

const CATEGORIES = [
  "Tümü",
  "Genel",
  "Yazılım",
  "Tasarım",
  "Girişimcilik",
  "Yapay Zeka",
  "Oyun",
  "Sanat",
  "Bilim",
  "Kariyer"
];

export function Communities() {
  useSEO({ 
    title: "Topluluklar — Teknoloji ve Üretim Grupları | Genç Sosyal", 
    description: "Yazılım, yapay zeka, tasarım, robotik ve girişimcilik alanındaki genç topluluklara katılın; etkinlikler düzenleyin ve birlikte üretin.",
    canonicalPath: "/communities"
  });

  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Genel");
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newRules, setNewRules] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const { isAuthenticated, user } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();

  const loadCommunities = async () => {
    try {
      const res = await fetchApi("/communities");
      const json = await res.json();
      if (json.success) setCommunities(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewName(val);
    if (!newSlug || newSlug === generateSlug(newName)) {
      setNewSlug(generateSlug(val));
    }
  };

  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return openModal();
    if (!newName.trim() || !newSlug.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetchApi("/communities", {
        method: "POST",
        data: { 
          name: newName.trim(), 
          description: newDesc.trim(), 
          slug: newSlug.trim(),
          category: newCategory,
          isPrivate: newIsPrivate,
          rules: newRules.trim() || null,
        },
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Topluluk başarıyla oluşturuldu!");
        setShowCreate(false);
        setCommunities([json.data, ...communities]);
        navigate(`/communities/${json.data.slug}`);
      } else {
        toast.error(json.error?.message || "Topluluk oluşturulamadı.");
      }
    } catch (err) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch = !searchQuery.trim() || 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "Tümü" || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto min-h-screen bg-transparent">
      {/* Sticky Header */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white/90 dark:bg-[#070A10]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Topluluklar
            </h1>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            if (!isAuthenticated) openModal();
            else setShowCreate(true);
          }}
          className="rounded-xl font-semibold shadow-xs"
        >
          Topluluk Kur
        </Button>
      </header>

      {/* Search Bar & Categories */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#0D121D]/50 space-y-3">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Topluluklarda ara (ad, açıklama veya c/slug)..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.1]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 sm:p-6 pb-24">
        {loading ? (
          <SkeletonList count={3} />
        ) : filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCommunities.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/communities/${c.slug}`)}
                className="p-5 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl bg-white dark:bg-[#0D121D] hover:border-blue-400 dark:hover:border-blue-500/40 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
                          {c.category || "Genel"}
                        </span>
                        {c.isPrivate ? (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Özel
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" /> Açık
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {c.name}
                      </h3>
                      <div className="text-xs text-slate-400">
                        c/{c.slug}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {c.description || 'Henüz bir açıklama eklenmedi.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.05] text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {c.memberCount || 0} Üye
                  </span>

                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {c.isMember ? "Topluluğu Gör" : "İncele"} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <EmptyState
              icon={<Users className="w-8 h-8 text-slate-400" />}
              title="Topluluk Bulunamadı"
              description="Arama kriterlerinize uygun topluluk bulunamadı. Kendi topluluğunuzu kurabilirsiniz!"
              action={{
                label: "Topluluk Kur",
                onClick: () => {
                  if (!isAuthenticated) openModal();
                  else setShowCreate(true);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setShowCreate(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full max-w-lg bg-white dark:bg-[#0D121D] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.05] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      Yeni Topluluk Kur
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      İlgi alanınızı ve topluluğunuzu paylaşın.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topluluk Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={handleNameChange}
                    placeholder="Örn: Genç Yapay Zeka Geliştiricileri"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topluluk Adresi (Slug) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 dark:bg-white/[0.06] border border-r-0 border-slate-200 dark:border-white/[0.08] rounded-l-xl text-xs font-bold text-slate-500">
                      c/
                    </span>
                    <input
                      type="text"
                      required
                      value={newSlug}
                      onChange={(e) => setNewSlug(generateSlug(e.target.value))}
                      placeholder="genc-yapay-zeka"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-r-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      {CATEGORIES.filter(c => c !== "Tümü").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gizlilik
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="newPrivacy"
                          checked={!newIsPrivate}
                          onChange={() => setNewIsPrivate(false)}
                          className="text-blue-600"
                        />
                        <span>Açık</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="newPrivacy"
                          checked={newIsPrivate}
                          onChange={() => setNewIsPrivate(true)}
                          className="text-blue-600"
                        />
                        <span>Özel (İstekli)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Topluluk amacı, kimlere hitap ettiği..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topluluk Kuralları (İsteğe bağlı)
                  </label>
                  <textarea
                    rows={2}
                    value={newRules}
                    onChange={(e) => setNewRules(e.target.value)}
                    placeholder="1. Saygılı ve yapıcı olun..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreate(false)}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmitting}
                    disabled={!newName.trim() || !newSlug.trim()}
                    className="rounded-xl font-bold"
                  >
                    Topluluk Kur
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
