import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Users, Plus, X, Sparkles, ArrowRight, Search } from "lucide-react";
import { fetchApi } from "../lib/api";
import { toast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton, SkeletonCircle, SkeletonList } from "../components/ui/Skeleton";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { backdropVariants, modalVariants } from "../lib/motion";

export function Communities() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return openModal();
    if (!newName.trim() || !newSlug.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetchApi("/communities", {
        method: "POST",
        data: { name: newName.trim(), description: newDesc.trim(), slug: newSlug.trim() },
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Topluluk oluşturuldu!");
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
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto min-h-screen bg-transparent">
      {/* Sticky Header */}
      <header className="sticky top-16 z-20 bg-white dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
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
          className="rounded-full font-bold shadow-xs shadow-slate-500/20"
        >
          Topluluk Kur
        </Button>
      </header>

      {/* Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Topluluklarda ara..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
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
                className="p-5 border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-950 hover:border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="text-slate-400 w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-slate-900 dark:text-slate-100 transition-colors truncate">
                        {c.name}
                      </h3>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {c.memberCount || 0} Üye
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {c.description || 'Henüz bir açıklama eklenmedi.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 group-hover:text-slate-900 dark:text-slate-100">
                  <span>Topluluğu Görüntüle</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title={searchQuery ? 'Topluluk Bulunamadı' : 'Henüz Topluluk Yok'}
            description={
              searchQuery
                ? `"${searchQuery}" için sonuç bulunamadı.`
                : 'İlk topluluğu siz oluşturarak ilgilendiğiniz alanda insanları bir araya getirin.'
            }
            action={
              !searchQuery
                ? {
                    label: "Yeni Topluluk Kur",
                    onClick: () => {
                      if (!isAuthenticated) openModal();
                      else setShowCreate(true);
                    },
                    icon: <Plus className="w-4 h-4" />
                  }
                : undefined
            }
          />
        )}
      </div>

      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowCreate(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-comm-title"
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800/90 shadow-2xl p-6 sm:p-7 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <h3 id="create-comm-title" className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                  Yeni Topluluk Oluştur
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="comm-name" className="text-xs sm:text-sm font-semibold text-slate-700">
                    Topluluk Adı
                  </label>
                  <input
                    id="comm-name"
                    type="text"
                    required
                    autoFocus
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                      }
                    }}
                    placeholder="Örn: Yapay Zeka Kulübü"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:bg-slate-950 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="comm-slug" className="text-xs sm:text-sm font-semibold text-slate-700">
                    Bağlantı Adresi (Slug)
                  </label>
                  <input
                    id="comm-slug"
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="yapay-zeka-kulubu"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:bg-slate-950 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="comm-desc" className="text-xs sm:text-sm font-semibold text-slate-700">
                    Açıklama
                  </label>
                  <textarea
                    id="comm-desc"
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Topluluğun amacı ve kimlere hitap ettiği..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:bg-slate-950 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => setShowCreate(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isSubmitting}
                    loadingText="Oluşturuluyor..."
                  >
                    Oluştur
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
