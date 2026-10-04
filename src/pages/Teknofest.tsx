import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAuthStore } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useSEO } from "../hooks/useSEO";
import { 
  Sparkles, 
  Camera, 
  Rocket, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  Plane, 
  Cpu, 
  ExternalLink, 
  Plus, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  MessageSquare, 
  Flag, 
  Filter, 
  AlertCircle, 
  Info, 
  Play, 
  CheckCircle2, 
  Upload, 
  Layers, 
  Bookmark, 
  Eye, 
  ShieldCheck,
  Quote
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { showToast } from "../components/ui/Toast";
import { fetchApi } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";

interface TeknofestEvent {
  id: number;
  slug: string;
  title: string;
  theme: string | null;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  coverImageUrl: string | null;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  isFeatured: boolean;
  stats: any;
  categories?: Array<{ id: number; name: string; slug: string; icon: string }>;
  timeline?: Array<{ id: number; dateLabel: string; title: string; description: string; icon: string }>;
  counts?: { media: number; memories: number };
}

interface TeknofestMediaItem {
  id: number;
  eventId: number;
  userId: number | null;
  categoryId: number | null;
  categoryName?: string;
  categorySlug?: string;
  postId: number | null;
  projectId: number | null;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  caption: string | null;
  altText: string | null;
  credit: string;
  aspectRatio: string | null;
  duration?: number;
  viewsCount: number;
  likesCount: number;
  isFeatured: boolean;
  createdAt: string;
  uploader?: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  linkedProject?: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrl: string | null;
  } | null;
}

interface TeknofestMemoryItem {
  id: number;
  eventId: number;
  content: string;
  authorName: string | null;
  authorTitle: string | null;
  isFeatured: boolean;
  createdAt: string;
  displayAuthor: string;
  avatarUrl: string | null;
  username: string | null;
}

export function Teknofest() {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const currentSlug = routeSlug || "2026";
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  useSEO({
    title: `TEKNOFEST Köşesi — Etkinlik, Fotoğraf ve Anı Arşivi | Genç Sosyal`,
    description: `TEKNOFEST ${currentSlug} etkinlik fotoğrafları, gençlerin projeleri, unutulmayan anıları ve gün gün festival zaman tüneli arşivi.`,
    canonicalPath: `/teknofest/${currentSlug}`,
  });

  // Main State
  const [allEvents, setAllEvents] = useState<TeknofestEvent[]>([]);
  const [eventData, setEventData] = useState<TeknofestEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Tab State
  const [activeSection, setActiveSection] = useState<"gallery" | "projects" | "memories" | "timeline" | "my-submissions">("gallery");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");

  // Media Gallery State
  const [mediaList, setMediaList] = useState<TeknofestMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [mediaPage, setMediaPage] = useState(1);
  const [hasMoreMedia, setHasMoreMedia] = useState(false);

  // Projects State
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Memories State
  const [memoriesList, setMemoriesList] = useState<TeknofestMemoryItem[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);

  // Lightbox State
  const [selectedMedia, setSelectedMedia] = useState<TeknofestMediaItem | null>(null);
  const [likedMediaIds, setLikedMediaIds] = useState<Set<number>>(new Set());

  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitType, setSubmitType] = useState<"PHOTO" | "VIDEO" | "MEMORY">("PHOTO");
  const [submitForm, setSubmitForm] = useState({
    mediaUrl: "",
    title: "",
    caption: "",
    categoryId: "",
    authorTitle: "TEKNOFEST Ziyaretçisi / Yarışmacı",
    rightsAgreed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // My Submissions
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [loadingMySubmissions, setLoadingMySubmissions] = useState(false);

  // 1. Fetch Event Metadata
  useEffect(() => {
    const fetchEvent = async () => {
      setLoadingEvent(true);
      try {
        const [eventsRes, currentRes] = await Promise.all([
          fetch("/api/v1/teknofest/events"),
          fetch(`/api/v1/teknofest/events/${currentSlug}`)
        ]);

        const eventsJson = await eventsRes.json();
        const currentJson = await currentRes.json();

        if (eventsJson.success) {
          setAllEvents(eventsJson.data || []);
        }

        if (currentJson.success && currentJson.data) {
          setEventData(currentJson.data);
        } else if (eventsJson.data?.length > 0) {
          // Fallback to first event if slug not found
          setEventData(eventsJson.data[0]);
        }
      } catch (err) {
        console.error("Error loading event:", err);
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [currentSlug]);

  // 2. Fetch Media Gallery
  const loadMedia = useCallback(async (cat: string, type: string) => {
    setLoadingMedia(true);
    try {
      let url = `/api/v1/teknofest/events/${currentSlug}/media?page=1&limit=30`;
      if (cat && cat !== "all") url += `&category=${encodeURIComponent(cat)}`;
      if (type && type !== "ALL") url += `&mediaType=${type}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setMediaList(json.data || []);
        setHasMoreMedia(json.pagination?.page < json.pagination?.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMedia(false);
    }
  }, [currentSlug]);

  useEffect(() => {
    if (activeSection === "gallery") {
      loadMedia(activeCategory, mediaTypeFilter);
    }
  }, [activeSection, activeCategory, mediaTypeFilter, loadMedia]);

  // 3. Fetch Projects
  useEffect(() => {
    if (activeSection === "projects") {
      setLoadingProjects(true);
      fetch(`/api/v1/teknofest/events/${currentSlug}/projects`)
        .then(r => r.json())
        .then(j => {
          if (j.success) setProjectsList(j.data || []);
        })
        .catch(console.error)
        .finally(() => setLoadingProjects(false));
    }
  }, [activeSection, currentSlug]);

  // 4. Fetch Memories
  useEffect(() => {
    if (activeSection === "memories") {
      setLoadingMemories(true);
      fetch(`/api/v1/teknofest/events/${currentSlug}/memories`)
        .then(r => r.json())
        .then(j => {
          if (j.success) setMemoriesList(j.data || []);
        })
        .catch(console.error)
        .finally(() => setLoadingMemories(false));
    }
  }, [activeSection, currentSlug]);

  // 5. Fetch My Submissions
  const loadMySubmissions = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingMySubmissions(true);
    try {
      const res = await fetchApi("/teknofest/my-submissions");
      const json = await res.json();
      if (json.success) {
        setMySubmissions(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMySubmissions(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeSection === "my-submissions") {
      loadMySubmissions();
    }
  }, [activeSection, loadMySubmissions]);

  // Handle Lightbox Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMedia) return;
      if (e.key === "Escape") setSelectedMedia(null);
      if (e.key === "ArrowRight") navigateLightbox(1);
      if (e.key === "ArrowLeft") navigateLightbox(-1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia, mediaList]);

  const navigateLightbox = (direction: number) => {
    if (!selectedMedia || mediaList.length === 0) return;
    const currentIndex = mediaList.findIndex(m => m.id === selectedMedia.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + direction + mediaList.length) % mediaList.length;
    setSelectedMedia(mediaList[nextIndex]);
  };

  // Like handler
  const handleLikeMedia = async (mediaId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (likedMediaIds.has(mediaId)) return;

    setLikedMediaIds(prev => new Set(prev).add(mediaId));
    setMediaList(prev => prev.map(m => m.id === mediaId ? { ...m, likesCount: m.likesCount + 1 } : m));
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia({ ...selectedMedia, likesCount: selectedMedia.likesCount + 1 });
    }

    try {
      await fetchApi(`/teknofest/media/${mediaId}/like`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  // Share handler
  const handleShareMedia = (item: TeknofestMediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/teknofest/${currentSlug}?media=${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast({ title: "Bağlantı panoya kopyalandı!", type: "success" });
    }
  };

  // Submit Content
  const handleSubmitContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openModal();
      return;
    }

    if (!submitForm.rightsAgreed) {
      showToast({ title: "Lütfen telif ve paylaşım haklarını onaylayın.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchApi(`/teknofest/events/${currentSlug}/submit`, {
        method: "POST",
        data: {
          type: submitType,
          ...submitForm
        }
      });
      const json = await res.json();
      if (json.success) {
        showToast({ title: "İçeriğiniz moderasyon incelemesine gönderildi!", type: "success" });
        setShowSubmitModal(false);
        setSubmitForm({
          mediaUrl: "",
          title: "",
          caption: "",
          categoryId: "",
          authorTitle: "TEKNOFEST Ziyaretçisi / Yarışmacı",
          rightsAgreed: false
        });
        if (activeSection === "my-submissions") {
          loadMySubmissions();
        }
      } else {
        const errMsg = typeof json.error === "string" ? json.error : (json.error?.message || "Gönderim başarısız");
        showToast({ title: errMsg, type: "error" });
      }
    } catch (err) {
      showToast({ title: "Sunucu hatası oluştu", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          TEKNOFEST Köşesi hazırlanıyor...
        </p>
      </div>
    );
  }

  const ev = eventData || {
    id: 1,
    slug: "2026",
    title: "TEKNOFEST 2026",
    theme: "Milli Teknoloji Hamlesi & Geleceğin Gençleri",
    description: "Bir festival sona erdi, anıların hikâyesi devam ediyor. TEKNOFEST'te geride kalan fotoğrafları, yarışma projelerini ve gençlerin unutulmaz anılarını keşfet.",
    location: "Şanlıurfa — GAP Havalimanı",
    startDate: "2026-09-30",
    endDate: "2026-10-04",
    coverImageUrl: null,
    status: "COMPLETED" as const,
    isFeatured: true,
    stats: { visitorCount: "1.5M+", projectCount: "2,100+", competitionsCount: "46", teamCount: "32,000+" },
    categories: [],
    timeline: []
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-8 overflow-x-hidden">
      
      {/* 1. HERO & EVENT STATUS HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-10 border border-sky-900/50 shadow-xl">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 space-y-6">
          {/* Top Bar: Event Switcher & Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                TEKNOFEST KÖŞESİ
              </span>

              {allEvents.length > 1 && (
                <div className="relative inline-block">
                  <select
                    value={currentSlug}
                    onChange={(e) => navigate(`/teknofest/${e.target.value}`)}
                    className="appearance-none bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold py-1 px-3 pr-7 rounded-full border border-slate-700 focus:outline-hidden cursor-pointer"
                  >
                    {allEvents.map(event => (
                      <option key={event.slug} value={event.slug}>{event.title}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">▼</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {ev.location}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                30 Eylül – 4 Ekim {ev.slug}
              </span>
              <Badge variant="outline" className="bg-sky-500/10 text-sky-300 border-sky-500/30">
                Etkinlik Tamamlandı
              </Badge>
            </div>
          </div>

          {/* Hero Typography */}
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              {ev.title}
              {ev.theme && (
                <span className="block text-base sm:text-xl font-medium text-sky-300 mt-1">
                  {ev.theme}
                </span>
              )}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Bir festival sona erdi, anıların hikâyesi devam ediyor. TEKNOFEST'te geride kalan fotoğrafları, yarışma projelerini ve gençlerin unutulmaz deneyimlerini keşfet.
            </p>
          </div>

          {/* Hero Actions & Interactive Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveSection("gallery")}
              className="bg-sky-500 hover:bg-sky-600 text-white shadow-md border-0"
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Fotoğraflara Göz At
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveSection("memories")}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700"
              leftIcon={<Heart className="w-4 h-4 text-rose-400" />}
            >
              Anıları Keşfet
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (!isAuthenticated) openModal();
                else setShowSubmitModal(true);
              }}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700"
              leftIcon={<Plus className="w-4 h-4 text-emerald-400" />}
            >
              İçerik Gönder
            </Button>
          </div>

          {/* Festival Summary Stats */}
          {ev.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
                <span className="block text-lg sm:text-2xl font-black text-sky-400">{ev.stats.visitorCount || "1.5M+"}</span>
                <span className="text-[11px] text-slate-400 font-medium">Toplam Ziyaretçi</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
                <span className="block text-lg sm:text-2xl font-black text-emerald-400">{ev.stats.projectCount || "2,100+"}</span>
                <span className="text-[11px] text-slate-400 font-medium">Yarışan Proje</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
                <span className="block text-lg sm:text-2xl font-black text-amber-400">{ev.stats.competitionsCount || "46"}</span>
                <span className="text-[11px] text-slate-400 font-medium">Teknoloji Yarışması</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800">
                <span className="block text-lg sm:text-2xl font-black text-purple-400">{ev.stats.teamCount || "32,000+"}</span>
                <span className="text-[11px] text-slate-400 font-medium">Geliştirici Takımı</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN SECTION NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 gap-2">
        <div className="flex gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => setActiveSection("gallery")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
              activeSection === "gallery"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Camera className="w-4 h-4" />
            Fotoğraf Galerisi
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("projects")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
              activeSection === "projects"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Rocket className="w-4 h-4" />
            Projeler
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("memories")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
              activeSection === "memories"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Heart className="w-4 h-4" />
            Gençlerin Anıları
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("timeline")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
              activeSection === "timeline"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            Zaman Tüneli
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setActiveSection("my-submissions")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
                activeSection === "my-submissions"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Gönderilerim
            </button>
          )}
        </div>

        <div className="hidden sm:block">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!isAuthenticated) openModal();
              else setShowSubmitModal(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5 text-sky-500" />}
          >
            Fotoğraf / Anı Ekle
          </Button>
        </div>
      </div>

      {/* 3. SECTION 1: PHOTO GALLERY */}
      {activeSection === "gallery" && (
        <div className="space-y-6">
          {/* Category Filter Pills & Media Type Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-2 px-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === "all"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                Tümü
              </button>

              {(ev.categories || [
                { id: 1, name: "📸 Etkinlik", slug: "etkinlik", icon: "Camera" },
                { id: 2, name: "🚀 Projeler", slug: "projeler", icon: "Rocket" },
                { id: 3, name: "🤖 Teknoloji", slug: "teknoloji", icon: "Cpu" },
                { id: 4, name: "🧑‍🤝‍🧑 Gençler", slug: "gencler", icon: "Users" },
                { id: 5, name: "🏆 Yarışmalar", slug: "yarismalar", icon: "Trophy" },
                { id: 6, name: "🎤 Sahne & Uçuş", slug: "sahne", icon: "Plane" },
                { id: 7, name: "🌆 Festival Alanı", slug: "alan", icon: "MapPin" },
                { id: 8, name: "💡 İlham", slug: "ilham", icon: "Sparkles" }
              ]).map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setMediaTypeFilter("ALL")}
                className={`px-2.5 py-1 rounded-md font-semibold ${mediaTypeFilter === 'ALL' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
              >
                Tüm Medya
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter("IMAGE")}
                className={`px-2.5 py-1 rounded-md font-semibold ${mediaTypeFilter === 'IMAGE' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
              >
                📸 Fotoğraflar
              </button>
              <button
                type="button"
                onClick={() => setMediaTypeFilter("VIDEO")}
                className={`px-2.5 py-1 rounded-md font-semibold ${mediaTypeFilter === 'VIDEO' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
              >
                🎥 Videolar
              </button>
            </div>
          </div>

          {/* Gallery Grid / Masonry Cards */}
          {loadingMedia ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-4/3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center mx-auto">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Bu kategoride henüz fotoğraf yok
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  TEKNOFEST'te çektiğin güzel bir anı veya fotoğraf varsa toplulukla paylaşabilirsin!
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else setShowSubmitModal(true);
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                İlk Fotoğrafı Gönder
              </Button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3.5 space-y-3.5">
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer break-inside-avoid border border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-lg"
                >
                  <img
                    src={item.mediaUrl}
                    alt={item.altText || item.title || "TEKNOFEST Fotoğrafı"}
                    loading="lazy"
                    className="w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-102"
                  />

                  {/* Gradient Overlay & Hover Bar */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          ⭐ Öne Çıkan
                        </span>
                      )}
                      {item.mediaType === "VIDEO" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                          <Play className="w-3 h-3 fill-current" /> Video
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-white">
                      {item.title && (
                        <h4 className="text-xs font-bold line-clamp-1">{item.title}</h4>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-200">
                        <span className="truncate">{item.credit}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleLikeMedia(item.id, e)}
                            className="flex items-center gap-1 hover:text-rose-400"
                          >
                            <Heart className={`w-3.5 h-3.5 ${likedMediaIds.has(item.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                            <span>{item.likesCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile credit indicator */}
                  <div className="sm:hidden p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="truncate font-medium">{item.credit}</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> {item.likesCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SECTION 2: PROJELER */}
      {activeSection === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                🚀 TEKNOFEST Projeleri
              </h2>
              <p className="text-xs text-slate-500">
                Festivalde sergilenen genç teknoloji ve inovasyon projeleri
              </p>
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Tüm Projeleri Gör
              </Button>
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : projectsList.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
              <Rocket className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Henüz TEKNOFEST etiketiyle eklenmiş proje bulunamadı
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsList.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {proj.imageUrl && (
                    <div className="aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-1.5">
                        {proj.category || "Teknoloji"}
                      </Badge>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>@{proj.authorUsername}</span>
                      <span className="text-sky-600 font-bold group-hover:underline flex items-center gap-1">
                        İncele <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. SECTION 3: GENÇLERİN ANILARI */}
      {activeSection === "memories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                💙 Gençlerin Anıları ve Deneyimleri
              </h2>
              <p className="text-xs text-slate-500">
                Yarışmacıların, takım liderlerinin ve ziyaretçilerin unutulmaz TEKNOFEST hikâyeleri
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!isAuthenticated) openModal();
                else {
                  setSubmitType("MEMORY");
                  setShowSubmitModal(true);
                }
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Kendi Anını Paylaş
            </Button>
          </div>

          {loadingMemories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : memoriesList.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
              <Quote className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Henüz paylaşılmış anı bulunmuyor
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memoriesList.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <Quote className="w-6 h-6 text-sky-500/40" />
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal italic">
                      "{mem.content}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                        {mem.displayAuthor}
                      </span>
                      {mem.authorTitle && (
                        <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                          {mem.authorTitle}
                        </span>
                      )}
                    </div>
                    {mem.username && (
                      <Link
                        to={`/profile/${mem.username}`}
                        className="text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. SECTION 4: ZAMAN TÜNELİ */}
      {activeSection === "timeline" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ⏳ TEKNOFEST {ev.slug} Zaman Tüneli
            </h2>
            <p className="text-xs text-slate-500">
              Açılıştan büyük finallere festivalin gün gün akışı ve önemli dönüm noktaları
            </p>
          </div>

          <div className="relative border-l-2 border-sky-500/30 ml-4 sm:ml-6 space-y-8 py-2">
            {(ev.timeline || [
              { id: 1, dateLabel: "30 Eylül", title: "Büyük Açılış Günü", description: "Protokol açılışı, SoloTürk ve Türk Yıldızları nefes kesen açılış uçuşları ve stantların ilk ziyaretçilerle buluşması.", icon: "Plane" },
              { id: 2, dateLabel: "01 Ekim", title: "Proje ve Girişim Alanları", description: "Genç geliştiricilerin ve girişimcilerin çadırlarında jüri sunumları, AR/VR ve robotik teknoloji sergileri.", icon: "Rocket" },
              { id: 3, dateLabel: "02 Ekim", title: "Teknoloji ve İHA Sergileri", description: "Otonom sistemler, insansız hava araçları ve yapay zeka yarışmalarının eleme turları ve halka açık atölyeler.", icon: "Cpu" },
              { id: 4, dateLabel: "03 Ekim", title: "Büyük Yarışma Finalleri", description: "Roket, Model Uydu, Tarım Teknolojileri ve Hackathon yarışmalarının final etabı ve ödül heyecanı.", icon: "Trophy" },
              { id: 5, dateLabel: "04 Ekim", title: "Görkemli Kapanış & Ödül Töreni", description: "Dereceye giren takımların ödüllerini alması, kapanış hava gösterileri ve festival anılarının taçlanması.", icon: "Sparkles" }
            ]).map((item, idx) => (
              <div key={item.id} className="relative pl-6 sm:pl-8 group">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-sky-500 border-4 border-white dark:border-slate-950 shadow-xs group-hover:scale-125 transition-transform" />

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-1.5 shadow-xs max-w-2xl">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    {item.dateLabel}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SECTION 5: GÖNDERİLERİM (USER SUBMISSIONS) */}
      {activeSection === "my-submissions" && isAuthenticated && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                📝 TEKNOFEST'e Gönderdiğim İçerikler
              </h2>
              <p className="text-xs text-slate-500">
                Fotoğraf, video ve anı gönderilerinizin moderasyon durumunu takip edin
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSubmitModal(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Yeni İçerik Gönder
            </Button>
          </div>

          {loadingMySubmissions ? (
            <div className="py-12 text-center text-slate-400">Yükleniyor...</div>
          ) : mySubmissions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Henüz TEKNOFEST Köşesi için içerik göndermediniz
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySubmissions.map((sub) => (
                <div
                  key={`${sub.type}-${sub.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        sub.moderationStatus === "APPROVED"
                          ? "success"
                          : sub.moderationStatus === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {sub.moderationStatus === "APPROVED" && "🟢 Yayında"}
                      {sub.moderationStatus === "REJECTED" && "🔴 Reddedildi"}
                      {sub.moderationStatus === "PENDING" && "🟡 İnceleniyor"}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>

                  {sub.mediaUrl && (
                    <div className="aspect-video bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden">
                      <img src={sub.mediaUrl} alt={sub.title || "Fotoğraf"} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {sub.title || sub.eventTitle}
                    </h4>
                    {sub.caption && (
                      <p className="text-xs text-slate-500 line-clamp-2">{sub.caption}</p>
                    )}
                    {sub.rejectionReason && (
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[11px]">
                        <strong>Red Sebebi:</strong> {sub.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. MODERN PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
            onClick={() => setSelectedMedia(null)}
          >
            {/* Top Close & Navigation Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                aria-label="Kapat"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Left / Right Arrow Navigation */}
            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                  aria-label="Önceki Fotoğraf"
                  className="hidden sm:flex absolute left-4 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                  aria-label="Sonraki Fotoğraf"
                  className="hidden sm:flex absolute right-4 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Content Container */}
            <div
              className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden flex flex-col md:flex-row border border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Display */}
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[60vh] md:max-h-[85vh]">
                {selectedMedia.mediaType === "VIDEO" ? (
                  <video
                    src={selectedMedia.mediaUrl}
                    controls
                    autoPlay
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedMedia.mediaUrl}
                    alt={selectedMedia.altText || selectedMedia.title || "TEKNOFEST"}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>

              {/* Sidebar Metadata & Interactions */}
              <div className="w-full md:w-80 p-5 bg-slate-900 text-white flex flex-col justify-between space-y-4 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="bg-sky-500/20 text-sky-300 border-sky-400/30 text-[10px]">
                      {selectedMedia.categoryName || "TEKNOFEST"}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {new Date(selectedMedia.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>

                  {selectedMedia.title && (
                    <h3 className="text-base font-bold text-white leading-snug">
                      {selectedMedia.title}
                    </h3>
                  )}

                  {selectedMedia.caption && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedMedia.caption}
                    </p>
                  )}

                  {/* Credit Box */}
                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Fotoğraf Kaynağı
                    </span>
                    <span className="text-xs font-semibold text-sky-300">
                      {selectedMedia.credit}
                    </span>
                  </div>

                  {/* Linked Project (if present) */}
                  {selectedMedia.linkedProject && (
                    <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/50 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-sky-400 block">
                        Bağlantılı Proje
                      </span>
                      <Link
                        to={`/projects/${selectedMedia.linkedProject.id}`}
                        className="text-xs font-bold text-white hover:text-sky-300 flex items-center justify-between"
                      >
                        <span className="line-clamp-1">{selectedMedia.linkedProject.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleLikeMedia(selectedMedia.id)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${likedMediaIds.has(selectedMedia.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                      <span>{selectedMedia.likesCount} Beğeni</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareMedia(selectedMedia)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300"
                    >
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <span>Paylaş</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. SUBMIT CONTENT MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      TEKNOFEST'e İçerik Ekle
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fotoğraf, video veya festival anını arşivimize kat
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSubmitType("PHOTO")}
                  className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    submitType === "PHOTO" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" /> Fotoğraf
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitType("VIDEO")}
                  className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    submitType === "VIDEO" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Play className="w-3.5 h-3.5" /> Video
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitType("MEMORY")}
                  className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    submitType === "MEMORY" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-xs" : "text-slate-500"
                  }`}
                >
                  <Quote className="w-3.5 h-3.5" /> Anı / Yazı
                </button>
              </div>

              <form onSubmit={handleSubmitContent} className="space-y-4">
                {submitType !== "MEMORY" && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Görsel / Video URL (Doğrudan bağlantı)*
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={submitForm.mediaUrl}
                      onChange={(e) => setSubmitForm({ ...submitForm, mediaUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 mt-1"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {submitType === "MEMORY" ? "Rolün / Katılım Unvanın" : "Başlık (İsteğe Bağlı)"}
                  </label>
                  <input
                    type="text"
                    placeholder={submitType === "MEMORY" ? "Örn: İHA Takım Kaptanı, Yazılımcı, Ziyaretçi" : "Örn: SoloTürk Gösterisi"}
                    value={submitType === "MEMORY" ? submitForm.authorTitle : submitForm.title}
                    onChange={(e) => {
                      if (submitType === "MEMORY") {
                        setSubmitForm({ ...submitForm, authorTitle: e.target.value });
                      } else {
                        setSubmitForm({ ...submitForm, title: e.target.value });
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {submitType === "MEMORY" ? "Unutulmaz Anın & Deneyimin (En az 10 karakter)*" : "Fotoğraf Açıklaması"}
                  </label>
                  <textarea
                    required={submitType === "MEMORY"}
                    rows={submitType === "MEMORY" ? 4 : 2}
                    placeholder={submitType === "MEMORY" ? "TEKNOFEST'te yaşadığınız heyecanı, yarışma sürecini ve hislerinizi anlatın..." : "Kare hakkında kısa bilgi..."}
                    value={submitForm.caption}
                    onChange={(e) => setSubmitForm({ ...submitForm, caption: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 mt-1"
                  />
                </div>

                {/* Moderation & Copyright notice */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span>
                    Gönderilen içerikler moderasyon ekibimiz tarafından incelendikten sonra TEKNOFEST Köşesi'nde yayınlanır.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="agreeCheck"
                    required
                    checked={submitForm.rightsAgreed}
                    onChange={(e) => setSubmitForm({ ...submitForm, rightsAgreed: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-sky-600 cursor-pointer"
                  />
                  <label htmlFor="agreeCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Bu içeriğin telif ve paylaşım haklarına sahip olduğumu onaylıyorum.
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowSubmitModal(false)}>
                    Vazgeç
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Gönderiliyor..." : "İncelemeye Gönder"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Teknofest;
