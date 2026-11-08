import { useSEO } from "../hooks/useSEO";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Plus,
  X,
  ArrowUpRight,
  Search,
  Lock,
  Globe,
  Crown,
  Shield,
  SlidersHorizontal,
  UserPlus,
  Check,
  Clock,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import { toast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
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
  "Kariyer",
];

type ViewMode = "all" | "joined" | "managed";
type SortMode = "popular" | "active" | "newest";

export function Communities() {
  useSEO({
    title: "Topluluklar — Teknoloji ve Üretim Grupları | Genç Sosyal",
    description:
      "Yazılım, yapay zeka, tasarım, robotik ve girişimcilik alanındaki genç topluluklara katılın; etkinlikler düzenleyin ve birlikte üretin.",
    canonicalPath: "/communities",
  });

  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<number, boolean>>({});

  // Create Form State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Genel");
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newRules, setNewRules] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Sort State
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("popular");
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewName(val);
    if (!newSlug || newSlug === generateSlug(newName)) {
      setNewSlug(generateSlug(val));
    }
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
          avatarUrl: newAvatarUrl.trim() || null,
          coverUrl: newCoverUrl.trim() || null,
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

  const handleQuickJoin = async (e: React.MouseEvent, community: any) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (community.isMember || pendingIds[community.id]) {
      navigate(`/communities/${community.slug}`);
      return;
    }

    setJoiningId(community.id);
    try {
      const res = await fetchApi(`/communities/${community.id}/join`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        if (json.data?.status === "PENDING") {
          setPendingIds((prev) => ({ ...prev, [community.id]: true }));
          toast.success("Katılım isteğiniz topluluk yöneticilerine iletildi.");
        } else {
          setCommunities((prev) =>
            prev.map((item) =>
              item.id === community.id
                ? {
                    ...item,
                    isMember: true,
                    role: "MEMBER",
                    memberCount: (item.memberCount || 0) + 1,
                  }
                : item
            )
          );
          toast.success(`${community.name} topluluğuna katıldınız!`);
        }
      } else {
        toast.error(json.error?.message || "İşlem gerçekleştirilemedi.");
      }
    } catch (err) {
      toast.error("Bağlantı hatası oluştu.");
    } finally {
      setJoiningId(null);
    }
  };

  const counts = useMemo(() => {
    const joined = communities.filter((c) => Boolean(c.isMember)).length;
    const managed = communities.filter(
      (c) =>
        Boolean(c.isOwner) ||
        Boolean(c.isModerator) ||
        c.ownerId === user?.id ||
        ["OWNER", "MODERATOR", "admin"].includes(c.role)
    ).length;
    return {
      all: communities.length,
      joined,
      managed,
    };
  }, [communities, user?.id]);

  const filteredCommunities = useMemo(() => {
    const list = communities.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "Tümü" || (c.category || "Genel") === selectedCategory;

      const isManaged =
        Boolean(c.isOwner) ||
        Boolean(c.isModerator) ||
        c.ownerId === user?.id ||
        ["OWNER", "MODERATOR", "admin"].includes(c.role);

      const matchesView =
        viewMode === "all" ||
        (viewMode === "joined" && Boolean(c.isMember)) ||
        (viewMode === "managed" && isManaged);

      return matchesSearch && matchesCategory && matchesView;
    });

    return [...list].sort((a, b) => {
      if (sortMode === "popular") {
        return (b.memberCount || 0) - (a.memberCount || 0);
      }
      if (sortMode === "active") {
        return (b.postCount || 0) - (a.postCount || 0);
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [communities, searchQuery, selectedCategory, viewMode, sortMode, user?.id]);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto min-h-screen bg-slate-50/40 dark:bg-[#080E1A] transition-colors">
      {/* Sticky Top Header */}
      <header className="sticky top-0 md:top-[60px] z-20 bg-white dark:bg-[#080E1A] border-b border-slate-200/90 dark:border-white/[0.08] px-4 sm:px-6 py-4 flex items-center justify-between gap-4 transition-colors">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Topluluklar
            </h1>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">
              · {communities.length} grup
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            İlgi alanınıza göre çalışma gruplarına katılın, tartışmalara dahil olun ve birlikte üretin.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            if (!isAuthenticated) openModal();
            else setShowCreate(true);
          }}
          className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          Topluluk Kur
        </Button>
      </header>

      {/* Discovery & Filter Toolbar */}
      <div className="bg-white dark:bg-[#0B1220] border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 py-3.5 space-y-3.5">
        {/* View Tabs + Sort Control Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#111A2E] border border-slate-200/70 dark:border-white/[0.06] self-start">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === "all"
                  ? "bg-white dark:bg-[#1B2742] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Tüm Topluluklar{" "}
              <span className="ml-1 text-[11px] opacity-70 tabular-nums">
                ({counts.all})
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) return openModal();
                setViewMode("joined");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === "joined"
                  ? "bg-white dark:bg-[#1B2742] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Katıldıklarım{" "}
              <span className="ml-1 text-[11px] opacity-70 tabular-nums">
                ({counts.joined})
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) return openModal();
                setViewMode("managed");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === "managed"
                  ? "bg-white dark:bg-[#1B2742] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Yönettiklerim{" "}
              <span className="ml-1 text-[11px] opacity-70 tabular-nums">
                ({counts.managed})
              </span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Topluluk, konu veya c/adres ara..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Aramayı Temizle"
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative shrink-0 flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                aria-label="Sıralama ölçütü"
                className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="popular">En Çok Üye</option>
                <option value="active">En Aktif</option>
                <option value="newest">En Yeni</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100/80 dark:bg-[#111A2E] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#18243F]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Content Area */}
      <div className="flex-1 p-4 sm:p-6 pb-24">
        {loading ? (
          <SkeletonList count={4} />
        ) : filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunities.map((c) => {
              const isOwner = c.ownerId === user?.id || c.role === "OWNER" || Boolean(c.isOwner);
              const isMod =
                isOwner ||
                Boolean(c.isModerator) ||
                ["OWNER", "MODERATOR", "admin"].includes(c.role);
              const isMember = Boolean(c.isMember);
              const isPending = Boolean(pendingIds[c.id]);

              return (
                <article
                  key={c.id}
                  onClick={() => navigate(`/communities/${c.slug}`)}
                  className="border border-slate-200/90 dark:border-white/[0.08] rounded-2xl bg-white dark:bg-[#0D1424] hover:border-blue-500/50 dark:hover:border-blue-400/40 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Optional Cover Strip */}
                    {c.coverUrl ? (
                      <div className="h-20 w-full bg-slate-100 dark:bg-[#131D33] overflow-hidden border-b border-slate-100 dark:border-white/[0.06]">
                        <img
                          src={c.coverUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    ) : null}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3.5 mb-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 overflow-hidden text-blue-600 dark:text-blue-400 font-extrabold text-base">
                            {c.avatarUrl ? (
                              <img
                                src={c.avatarUrl}
                                alt={c.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {(c.name || "T").trim().charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {c.name}
                              </h2>
                            </div>

                            {/* Unboxed Metadata Line with middle dot separators */}
                            <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">
                                c/{c.slug}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{c.category || "Genel"}</span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                {c.isPrivate ? (
                                  <>
                                    <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                      Özel
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>Açık</span>
                                  </>
                                )}
                              </span>

                              {isMember && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                    {isOwner ? (
                                      <>
                                        <Crown className="w-3 h-3 text-amber-500" />
                                        <span>Kurucu</span>
                                      </>
                                    ) : isMod ? (
                                      <>
                                        <Shield className="w-3 h-3" />
                                        <span>Yönetici</span>
                                      </>
                                    ) : (
                                      <span>Üye</span>
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description || "Bu topluluk için henüz bir açıklama girilmemiş."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Tabular Stats & Direct Action */}
                  <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#0A101D] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {c.memberCount || 0} üye
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {c.postCount || 0} gönderi
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMember ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                          <span>Görüntüle</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Onay Bekliyor</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={joiningId === c.id}
                          onClick={(e) => handleQuickJoin(e, c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{c.isPrivate ? "İstek Gönder" : "Katıl"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-12">
            <EmptyState
              icon={<Users className="w-8 h-8 text-slate-400" />}
              title={
                viewMode === "joined"
                  ? "Henüz Bir Topluluğa Katılmadınız"
                  : viewMode === "managed"
                  ? "Yönettiğiniz Bir Topluluk Yok"
                  : "Topluluk Bulunamadı"
              }
              description={
                viewMode === "joined"
                  ? "İlgi alanınıza uygun çalışma gruplarına katılarak tartışmalara dahil olabilirsiniz."
                  : viewMode === "managed"
                  ? "Kendi topluluğunuzu kurarak genç üreticileri bir araya getirebilirsiniz."
                  : "Arama veya kategori filtrelerinize uygun topluluk bulunamadı."
              }
              action={{
                label: viewMode === "joined" ? "Tüm Toplulukları Gör" : "Yeni Topluluk Kur",
                onClick: () => {
                  if (viewMode === "joined") {
                    setViewMode("all");
                  } else if (!isAuthenticated) {
                    openModal();
                  } else {
                    setShowCreate(true);
                  }
                },
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
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full max-w-xl bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-white/[0.1] rounded-2xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08] mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Yeni Topluluk Kur
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Genç Sosyal'de ortak üretim ve tartışma alanı oluşturun.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  aria-label="Kapat"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Topluluk Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={handleNameChange}
                      placeholder="Örn: Açık Kaynak Türkiye"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Topluluk Adresi (Slug) *
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-100 dark:bg-[#17223B] border border-r-0 border-slate-200 dark:border-white/[0.08] rounded-l-xl text-xs font-bold text-slate-500">
                        c/
                      </span>
                      <input
                        type="text"
                        required
                        value={newSlug}
                        onChange={(e) => setNewSlug(generateSlug(e.target.value))}
                        placeholder="acik-kaynak-turkiye"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-white/[0.08] rounded-r-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.filter((c) => c !== "Tümü").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive 2-card Privacy Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Erişim ve Gizlilik Yapısı
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewIsPrivate(false)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        !newIsPrivate
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                          : "border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#111A2E]"
                      }`}
                    >
                      <Globe
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          !newIsPrivate ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                          <span>Herkese Açık</span>
                          {!newIsPrivate && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Herkes gönderileri görebilir ve doğrudan katılabilir.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewIsPrivate(true)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        newIsPrivate
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                          : "border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#111A2E]"
                      }`}
                    >
                      <Lock
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          newIsPrivate ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                          <span>Özel Topluluk</span>
                          {newIsPrivate && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Katılım yönetici onayına tabidir, içerikler üyelere özeldir.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Topluluk Açıklaması
                  </label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Topluluk amacını, odaklandığı konuları ve kimlere hitap ettiğini yazın..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Profil Görseli URL (İsteğe Bağlı)
                    </label>
                    <div className="relative flex items-center">
                      <ImageIcon className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="url"
                        value={newAvatarUrl}
                        onChange={(e) => setNewAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kapak Görseli URL (İsteğe Bağlı)
                    </label>
                    <div className="relative flex items-center">
                      <ImageIcon className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="url"
                        value={newCoverUrl}
                        onChange={(e) => setNewCoverUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Topluluk Kuralları (İsteğe Bağlı)
                  </label>
                  <textarea
                    rows={2}
                    value={newRules}
                    onChange={(e) => setNewRules(e.target.value)}
                    placeholder="1. Yapıcı ve saygılı iletişim kurun..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
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
                    className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
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
