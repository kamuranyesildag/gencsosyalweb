import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getAllProjects, Project } from "../lib/projects";
import {
  Rocket,
  Search,
  Calendar,
  Github,
  Link as LinkIcon,
  X,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";

const getStatusText = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("fikir") || s === "idea") return "Fikir Aşamasında";
  if (s.includes("geliştiriliyor") || s === "in_progress") return "Geliştiriliyor";
  if (s.includes("tamamlandı") || s === "completed") return "Tamamlandı";
  if (s.includes("yayında") || s === "published") return "Yayında";
  if (s.includes("durduruldu") || s === "paused") return "Durduruldu";
  if (s.includes("prototip") || s === "prototype") return "Prototip";
  if (s.includes("arşivlendi") || s === "archived") return "Arşivlendi";
  return status;
};

export function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [search, setSearch] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (sort !== "newest") params.set("sort", sort);

    setSearchParams(params, { replace: true });

    setPage(1);
    loadProjects(debouncedSearch, category, status, sort, 1, true);
  }, [debouncedSearch, category, status, sort, setSearchParams]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "";
    const stat = searchParams.get("status") || "";
    const srt = searchParams.get("sort") || "newest";

    setSearch(q);
    setCategory(cat);
    setStatus(stat);
    setSort(srt);
  }, [searchParams]);

  const loadProjects = async (
    q: string,
    cat: string,
    stat: string,
    srt: string,
    pageNum = 1,
    isInitial = false
  ) => {
    const currentReqId = ++requestIdRef.current;
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");

    try {
      const data = await getAllProjects({
        q,
        category: cat,
        status: stat,
        sort: srt,
        page: pageNum,
        limit: 20,
      });

      if (currentReqId !== requestIdRef.current) return;

      if (isInitial) {
        setProjects(data.projects || []);
      } else {
        setProjects((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = (data.projects || []).filter((p) => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
      }
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (e: any) {
      if (currentReqId === requestIdRef.current) {
        setError(e.message || "Projeler yüklenirken bir hata oluştu.");
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    loadProjects(debouncedSearch, category, status, sort, page + 1, false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (status) count++;
    if (sort !== "newest") count++;
    return count;
  }, [category, status, sort]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setSort("newest");
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-100 text-slate-900 flex items-center justify-center">
              <Rocket className="w-4 h-4" />
            </div>
            Projeler & Üretimler
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Genç üreticilerin, geliştiricilerin ve tasarımcıların paylaştığı ilham verici projeler.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            if (!isAuthenticated) openModal();
            else navigate("/settings?tab=projects");
          }}
          className="rounded-full shadow-xs shadow-slate-500/20 self-start sm:self-auto"
        >
          Proje Paylaş
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Proje adı, açıklama veya etiket ara..."
              aria-label="Projelerde ara"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Aramayı temizle"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Filter Button */}
          <Button
            variant={showFilters || activeFilterCount > 0 ? "primary" : "secondary"}
            size="md"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-2xl"
          >
            <span>Filtreler</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Expandable Filter Area */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div>
                <label
                  htmlFor="filter-category"
                  className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  Kategori
                </label>
                <select
                  id="filter-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-slate-900 outline-none"
                >
                  <option value="">Tüm Kategoriler</option>
                  <option value="Yazılım">Yazılım</option>
                  <option value="Mobil Uygulama">Mobil Uygulama</option>
                  <option value="Web">Web</option>
                  <option value="Yapay Zekâ">Yapay Zekâ</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Robotik">Robotik</option>
                  <option value="Eğitim">Eğitim</option>
                  <option value="Tasarım">Tasarım</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-status"
                  className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  Durum
                </label>
                <select
                  id="filter-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-slate-900 outline-none"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="Fikir aşamasında">Fikir Aşamasında</option>
                  <option value="Geliştiriliyor">Geliştiriliyor</option>
                  <option value="Yayında">Yayında</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="Durduruldu">Durduruldu</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-sort"
                  className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  Sıralama
                </label>
                <select
                  id="filter-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:border-slate-900 outline-none"
                >
                  <option value="newest">En Yeniler</option>
                  <option value="oldest">En Eskiler</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Badges */}
        {(category || status || sort !== "newest" || search) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {category && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Kategori: {category}
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  aria-label="Kategori filtresini kaldır"
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Durum: {getStatusText(status)}
                <button
                  type="button"
                  onClick={() => setStatus("")}
                  aria-label="Durum filtresini kaldır"
                  className="hover:text-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 ml-auto p-1"
            >
              <X className="w-3 h-3" /> Temizle
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-3xl flex flex-col items-center gap-3">
          <p className="text-rose-700 text-sm font-semibold">{error}</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => loadProjects(debouncedSearch, category, status, sort, 1, true)}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Yeniden Dene
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Rocket className="w-7 h-7" />}
          title={activeFilterCount > 0 || debouncedSearch ? "Sonuç Bulunamadı" : "Henüz Proje Yok"}
          description={
            activeFilterCount > 0 || debouncedSearch
              ? "Arama kriterlerinize uygun proje bulunamadı. Filtreleri temizleyerek tekrar deneyebilirsiniz."
              : "İlk projeyi siz paylaşarak toplulukla paylaşın ve geri bildirim toplayın."
          }
          action={
            activeFilterCount > 0 || debouncedSearch
              ? {
                  label: "Filtreleri Temizle",
                  onClick: handleClearFilters
                }
              : {
                  label: "Proje Paylaş",
                  icon: <Plus className="w-4 h-4" />,
                  onClick: () => {
                    if (!isAuthenticated) openModal();
                    else navigate("/settings?tab=projects");
                  }
                }
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white border border-slate-200/80 rounded-2xl hover:border-slate-200 hover:shadow-md transition-all flex flex-col group overflow-hidden cursor-pointer"
            >
              {/* Image Header */}
              {project.imageUrl ? (
                <div className="w-full aspect-[16/9] bg-slate-100 overflow-hidden relative border-b border-slate-100">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-slate-50/60 to-slate-50 flex items-center justify-center border-b border-slate-100">
                  <Rocket className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {project.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {getStatusText(project.status)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-slate-900 transition-colors line-clamp-2 mb-1.5">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium truncate">@{project.username}</span>
                  <div className="flex items-center gap-2.5">
                    {project.githubUrl && <Github className="w-3.5 h-3.5 text-slate-500" />}
                    {project.projectUrl && <LinkIcon className="w-3.5 h-3.5 text-slate-900" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && !error && projects.length > 0 && hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="secondary"
            size="md"
            onClick={handleLoadMore}
            isLoading={loadingMore}
          >
            Daha Fazla Yükle
          </Button>
        </div>
      )}
    </div>
  );
}
