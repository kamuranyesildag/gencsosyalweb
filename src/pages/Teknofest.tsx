import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import { useAuthStore, sanitizeToken, isJwtExpired } from "../context/useAuth";
import { useAuthModalStore } from "../context/useAuthModal";
import { useSEO } from "../hooks/useSEO";
import {
  Camera,
  Rocket,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Info,
  Play,
  CheckCircle2,
  UploadCloud,
  Quote,
  Search,
  Sparkles,
  Film,
  ArrowUpRight,
  Image as ImageIcon,
  PenLine,
  FolderOpen,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { showToast } from "../components/ui/Toast";
import { fetchApi, requestTokenRefresh } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import teknofestHeroImg from "../assets/images/teknofest_archive_hero_1795243079458.jpg";

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
  stats: Record<string, unknown> | null;
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

interface TeknofestProjectItem {
  id: number;
  title: string;
  description: string;
  category?: string | null;
  imageUrl?: string | null;
  authorUsername?: string | null;
}

interface TeknofestSubmissionItem {
  id: number;
  type: "MEDIA" | "MEMORY";
  mediaType: string;
  mediaUrl: string | null;
  title: string | null;
  caption: string | null;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  eventTitle: string;
  eventSlug: string;
}

type SectionTab = "memories" | "gallery" | "timeline" | "projects" | "my-submissions";

function formatEventDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return "";
  try {
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return startDate;
    const startStr = start.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    if (!endDate) return startStr;
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return startStr;

    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${start.getDate()}–${end.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}`;
    }
    if (sameYear) {
      return `${start.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} – ${end.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}`;
    }
    return `${startStr} – ${end.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}`;
  } catch {
    return startDate;
  }
}

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function Teknofest() {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSlug = routeSlug || "2026";
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  useSEO({
    title: `TEKNOFEST Köşesi — Anılar, Fotoğraf ve Festival Arşivi | Genç Sosyal`,
    description: `TEKNOFEST ${currentSlug} gençlerin unutulmaz anıları, fotoğraf ve video galerisi, festival projeleri ve zaman tüneli arşivi.`,
    canonicalPath: `/teknofest/${currentSlug}`,
  });

  // Event Metadata
  const [allEvents, setAllEvents] = useState<TeknofestEvent[]>([]);
  const [eventData, setEventData] = useState<TeknofestEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Active Section (Default: Memories)
  const initialMediaParam = searchParams.get("media");
  const [activeSection, setActiveSection] = useState<SectionTab>(initialMediaParam ? "gallery" : "memories");

  // Memories State
  const [memoriesList, setMemoriesList] = useState<TeknofestMemoryItem[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [memorySearch, setMemorySearch] = useState("");
  const [memoryFilter, setMemoryFilter] = useState<"all" | "featured">("all");

  // Gallery State
  const [mediaList, setMediaList] = useState<TeknofestMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");

  // Projects State
  const [projectsList, setProjectsList] = useState<TeknofestProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // My Submissions State
  const [mySubmissions, setMySubmissions] = useState<TeknofestSubmissionItem[]>([]);
  const [loadingMySubmissions, setLoadingMySubmissions] = useState(false);

  // Lightbox State
  const [selectedMedia, setSelectedMedia] = useState<TeknofestMediaItem | null>(null);
  const [likedMediaIds, setLikedMediaIds] = useState<Set<number>>(new Set());

  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitType, setSubmitType] = useState<"MEMORY" | "PHOTO" | "VIDEO">("MEMORY");
  const [submitSourceTab, setSubmitSourceTab] = useState<"file" | "url">("file");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitPreviewUrl, setSubmitPreviewUrl] = useState<string | null>(null);
  const [submitUploadProgress, setSubmitUploadProgress] = useState(0);
  const [submitUploadPhase, setSubmitUploadPhase] = useState<"idle" | "uploading" | "processing" | "completed" | "error">("idle");
  const [submitUploadMessage, setSubmitUploadMessage] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    mediaUrl: "",
    title: "",
    caption: "",
    categoryId: "",
    authorTitle: "",
    rightsAgreed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userFileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Event Metadata
  useEffect(() => {
    let active = true;
    const fetchEvent = async () => {
      setLoadingEvent(true);
      try {
        const [eventsRes, currentRes] = await Promise.all([
          fetch("/api/v1/teknofest/events"),
          fetch(`/api/v1/teknofest/events/${encodeURIComponent(currentSlug)}`),
        ]);

        const eventsJson = await eventsRes.json();
        const currentJson = await currentRes.json();

        if (!active) return;

        if (eventsJson.success) {
          setAllEvents(eventsJson.data || []);
        }

        if (currentJson.success && currentJson.data) {
          setEventData(currentJson.data);
        } else if (eventsJson.data?.length > 0) {
          setEventData(eventsJson.data[0]);
        } else {
          setEventData(null);
        }
      } catch (err) {
        console.error("Error loading TEKNOFEST event:", err);
      } finally {
        if (active) setLoadingEvent(false);
      }
    };

    fetchEvent();
    return () => {
      active = false;
    };
  }, [currentSlug]);

  // 2. Fetch Memories
  const loadMemories = useCallback(async () => {
    setLoadingMemories(true);
    try {
      const res = await fetch(`/api/v1/teknofest/events/${encodeURIComponent(currentSlug)}/memories`);
      const json = await res.json();
      if (json.success) {
        setMemoriesList(json.data || []);
      }
    } catch (err) {
      console.error("Error loading memories:", err);
    } finally {
      setLoadingMemories(false);
    }
  }, [currentSlug]);

  useEffect(() => {
    if (activeSection === "memories") {
      loadMemories();
    }
  }, [activeSection, loadMemories]);

  // 3. Fetch Media Gallery
  const loadMedia = useCallback(
    async (cat: string, type: string) => {
      setLoadingMedia(true);
      try {
        let url = `/api/v1/teknofest/events/${encodeURIComponent(currentSlug)}/media?page=1&limit=36`;
        if (cat && cat !== "all") url += `&category=${encodeURIComponent(cat)}`;
        if (type && type !== "ALL") url += `&mediaType=${encodeURIComponent(type)}`;

        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          const items: TeknofestMediaItem[] = json.data || [];
          setMediaList(items);

          // Open deep-linked media item if requested in URL
          const deepMediaId = searchParams.get("media");
          if (deepMediaId) {
            const found = items.find((m) => String(m.id) === deepMediaId);
            if (found) {
              setSelectedMedia(found);
            }
          }
        }
      } catch (err) {
        console.error("Error loading media:", err);
      } finally {
        setLoadingMedia(false);
      }
    },
    [currentSlug, searchParams]
  );

  useEffect(() => {
    if (activeSection === "gallery") {
      loadMedia(activeCategory, mediaTypeFilter);
    }
  }, [activeSection, activeCategory, mediaTypeFilter, loadMedia]);

  // 4. Fetch Projects
  useEffect(() => {
    if (activeSection !== "projects") return;
    let active = true;
    setLoadingProjects(true);
    fetch(`/api/v1/teknofest/events/${encodeURIComponent(currentSlug)}/projects`)
      .then((r) => r.json())
      .then((j) => {
        if (active && j.success) setProjectsList(j.data || []);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoadingProjects(false);
      });
    return () => {
      active = false;
    };
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
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoadingMySubmissions(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeSection === "my-submissions") {
      loadMySubmissions();
    }
  }, [activeSection, loadMySubmissions]);

  // Lightbox Keyboard Navigation
  const navigateLightbox = useCallback(
    (direction: number) => {
      if (!selectedMedia || mediaList.length === 0) return;
      const currentIndex = mediaList.findIndex((m) => m.id === selectedMedia.id);
      if (currentIndex === -1) return;
      const nextIndex = (currentIndex + direction + mediaList.length) % mediaList.length;
      setSelectedMedia(mediaList[nextIndex]);
    },
    [selectedMedia, mediaList]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMedia) return;
      if (e.key === "Escape") {
        setSelectedMedia(null);
        if (searchParams.has("media")) {
          searchParams.delete("media");
          setSearchParams(searchParams, { replace: true });
        }
      }
      if (e.key === "ArrowRight") navigateLightbox(1);
      if (e.key === "ArrowLeft") navigateLightbox(-1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia, navigateLightbox, searchParams, setSearchParams]);

  // Cleanup preview blob on unmount
  useEffect(() => {
    return () => {
      if (submitPreviewUrl && submitPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(submitPreviewUrl);
      }
    };
  }, [submitPreviewUrl]);

  const closeLightbox = () => {
    setSelectedMedia(null);
    if (searchParams.has("media")) {
      searchParams.delete("media");
      setSearchParams(searchParams, { replace: true });
    }
  };

  // Like Handler
  const handleLikeMedia = async (mediaId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (likedMediaIds.has(mediaId)) return;

    setLikedMediaIds((prev) => new Set(prev).add(mediaId));
    setMediaList((prev) => prev.map((m) => (m.id === mediaId ? { ...m, likesCount: m.likesCount + 1 } : m)));
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia({ ...selectedMedia, likesCount: selectedMedia.likesCount + 1 });
    }

    try {
      await fetchApi(`/teknofest/media/${mediaId}/like`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  // Share Handler
  const handleShareMedia = (item: TeknofestMediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/teknofest/${currentSlug}?media=${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast({ title: "Bağlantı panoya kopyalandı", type: "success" });
    }
  };

  // Open Submit Modal
  const openSubmitModal = (type: "MEMORY" | "PHOTO" | "VIDEO") => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    setSubmitType(type);
    setShowSubmitModal(true);
  };

  // File Selection
  const handleUserFileSelected = (file: File) => {
    if (submitPreviewUrl && submitPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(submitPreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setSubmitFile(file);
    setSubmitPreviewUrl(preview);
    setSubmitUploadPhase("idle");
    setSubmitUploadProgress(0);
    setSubmitUploadMessage("Dosya yüklenecek");

    if (!submitForm.title) {
      const clean = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setSubmitForm((prev) => ({ ...prev, title: clean.charAt(0).toUpperCase() + clean.slice(1) }));
    }
  };

  const handleClearSubmitFile = () => {
    if (submitPreviewUrl && submitPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(submitPreviewUrl);
    }
    setSubmitFile(null);
    setSubmitPreviewUrl(null);
    setSubmitUploadPhase("idle");
    setSubmitUploadProgress(0);
    setSubmitUploadMessage("");
  };

  // Submit Content Handler
  const handleSubmitContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openModal();
      return;
    }

    if (!submitForm.rightsAgreed) {
      showToast({ title: "Lütfen telif ve paylaşım onayını işaretleyin.", type: "error" });
      return;
    }

    if (submitType === "MEMORY" && submitForm.caption.trim().length < 10) {
      showToast({ title: "Anı metni en az 10 karakter olmalıdır.", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalMediaUrl = submitForm.mediaUrl;

      if (submitType !== "MEMORY" && submitSourceTab === "file") {
        if (!submitFile) {
          showToast({ title: "Lütfen bir dosya seçin.", type: "error" });
          setIsSubmitting(false);
          return;
        }

        setSubmitUploadPhase("uploading");
        setSubmitUploadMessage("Dosya yükleniyor...");

        const uploadFormData = new FormData();
        uploadFormData.append("file", submitFile);

        let accessToken =
          sanitizeToken(useAuthStore.getState().accessToken) ||
          sanitizeToken(localStorage.getItem("gencsosyal_token"));
        const refreshToken =
          sanitizeToken(useAuthStore.getState().refreshToken) ||
          sanitizeToken(localStorage.getItem("gencsosyal_refresh_token"));

        if (!accessToken || isJwtExpired(accessToken)) {
          const refreshed = await requestTokenRefresh();
          if (refreshed.success) {
            accessToken = refreshed.accessToken;
          }
        }

        const uploadResult: { url: string } = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const pct = Math.min(99, Math.round((ev.loaded / ev.total) * 100));
              setSubmitUploadProgress(pct);
              if (ev.loaded >= ev.total) {
                setSubmitUploadPhase("processing");
                setSubmitUploadMessage("Sunucuda işleniyor...");
              } else {
                setSubmitUploadMessage(`Yükleniyor: %${pct}`);
              }
            }
          };

          xhr.onload = () => {
            const refreshedHeader = xhr.getResponseHeader("x-refreshed-access-token");
            if (refreshedHeader) {
              useAuthStore.getState().setAccessToken(refreshedHeader);
            }
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                if (json.success && json.data?.url) {
                  resolve(json.data);
                } else {
                  reject(new Error(json.error?.message || "Dosya işleme hatası"));
                }
              } catch {
                reject(new Error("Sunucu yanıtı okunamadı"));
              }
            } else {
              let errMsg = "Yükleme başarısız";
              try {
                const errJson = JSON.parse(xhr.responseText);
                if (errJson.error?.message) errMsg = errJson.error.message;
              } catch {
                // ignore parse error
              }
              reject(new Error(errMsg));
            }
          };

          xhr.onerror = () => reject(new Error("Ağ bağlantı hatası"));

          xhr.open("POST", "/api/v1/media/upload", true);
          xhr.withCredentials = true;
          if (accessToken) xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
          if (refreshToken) xhr.setRequestHeader("x-refresh-token", refreshToken);
          xhr.send(uploadFormData);
        });

        finalMediaUrl = uploadResult.url;
        setSubmitUploadPhase("completed");
        setSubmitUploadProgress(100);
      }

      if (submitType !== "MEMORY" && (!finalMediaUrl || !finalMediaUrl.trim())) {
        showToast({ title: "Lütfen bir dosya yükleyin veya geçerli bir bağlantı girin.", type: "error" });
        setIsSubmitting(false);
        return;
      }

      const res = await fetchApi(`/teknofest/events/${encodeURIComponent(currentSlug)}/submit`, {
        method: "POST",
        data: {
          type: submitType,
          mediaUrl: finalMediaUrl,
          title: submitForm.title,
          caption: submitForm.caption,
          categoryId: submitForm.categoryId || undefined,
          authorTitle: submitForm.authorTitle,
          rightsAgreed: submitForm.rightsAgreed,
        },
      });
      const json = await res.json();

      if (json.success) {
        showToast({ title: "İçeriğiniz moderasyon incelemesine gönderildi", type: "success" });
        setShowSubmitModal(false);
        handleClearSubmitFile();
        setSubmitForm({
          mediaUrl: "",
          title: "",
          caption: "",
          categoryId: "",
          authorTitle: "",
          rightsAgreed: false,
        });
        if (activeSection === "my-submissions") {
          loadMySubmissions();
        }
      } else {
        const errMsg = typeof json.error === "string" ? json.error : json.error?.message || "Gönderim başarısız";
        showToast({ title: errMsg, type: "error" });
      }
    } catch (err: any) {
      showToast({ title: err?.message || "Sunucu hatası oluştu", type: "error" });
      setSubmitUploadPhase("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered memories
  const hasFeaturedMemories = useMemo(() => memoriesList.some((m) => m.isFeatured), [memoriesList]);
  const filteredMemories = useMemo(() => {
    const q = memorySearch.trim().toLowerCase();
    return memoriesList.filter((m) => {
      if (memoryFilter === "featured" && !m.isFeatured) return false;
      if (!q) return true;
      return (
        m.content.toLowerCase().includes(q) ||
        m.displayAuthor.toLowerCase().includes(q) ||
        (m.authorTitle && m.authorTitle.toLowerCase().includes(q))
      );
    });
  }, [memoriesList, memorySearch, memoryFilter]);

  if (loadingEvent) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="h-[320px] sm:h-[360px] rounded-3xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
        <div className="h-12 w-full max-w-md rounded-xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const ev: TeknofestEvent = eventData || {
    id: 0,
    slug: currentSlug,
    title: `TEKNOFEST ${currentSlug}`,
    theme: "Gençlerin festival anıları, fotoğraf ve proje arşivi",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    coverImageUrl: null,
    status: "ACTIVE",
    isFeatured: true,
    stats: null,
    categories: [],
    timeline: [],
    counts: { media: 0, memories: 0 },
  };

  const heroCover = ev.coverImageUrl || teknofestHeroImg;
  const dateRangeLabel = formatEventDateRange(ev.startDate, ev.endDate);
  const realMemoriesCount = ev.counts?.memories ?? memoriesList.length;
  const realMediaCount = ev.counts?.media ?? mediaList.length;

  const navTabs: Array<{ id: SectionTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "memories", label: "Anılar", icon: Quote },
    { id: "gallery", label: "Fotoğraf & Video", icon: Camera },
    { id: "timeline", label: "Zaman Tüneli", icon: Clock },
    { id: "projects", label: "Projeler", icon: Rocket },
    ...(isAuthenticated ? [{ id: "my-submissions" as SectionTab, label: "Gönderilerim", icon: FolderOpen }] : []),
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-7 pb-24">
      {/* 1. EDITORIAL HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-[#081020] min-h-[300px] sm:min-h-[360px] flex flex-col justify-between shadow-lg">
        {/* Background Photography */}
        <img
          src={heroCover}
          alt={ev.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
        />
        {/* Clean Editorial Scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#070E1C]/95 via-[#091326]/75 to-[#091326]/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#070E1C]/90 via-transparent to-[#070E1C]/40"
        />

        {/* Top Bar inside Hero */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 sm:px-9 pt-6 sm:pt-8">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-sky-300/95">
            TEKNOFEST Köşesi · Anılar & Arşiv
          </span>

          {allEvents.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
              {allEvents.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => navigate(`/teknofest/${item.slug}`)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    item.slug === ev.slug
                      ? "bg-white text-slate-950"
                      : "text-slate-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.slug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hero Copy & Primary Actions */}
        <div className="relative z-10 px-6 sm:px-9 pb-7 sm:pb-9 pt-10 max-w-3xl space-y-5">
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.08]">
              {ev.title}
            </h1>
            {(ev.theme || ev.description) && (
              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
                {ev.description || ev.theme}
              </p>
            )}
          </div>

          {/* Unboxed Metadata Row (Only real DB values) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-[13px] font-medium text-slate-300">
            {ev.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                {ev.location}
              </span>
            )}
            {ev.location && dateRangeLabel && <span aria-hidden="true" className="text-slate-500">·</span>}
            {dateRangeLabel && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                {dateRangeLabel}
              </span>
            )}
            {(realMemoriesCount > 0 || realMediaCount > 0) && (
              <>
                {(ev.location || dateRangeLabel) && <span aria-hidden="true" className="text-slate-500">·</span>}
                <span className="text-slate-200">
                  {realMemoriesCount} Anı · {realMediaCount} Kare
                </span>
              </>
            )}
          </div>

          {/* Focused Actions: Memories & Media */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => openSubmitModal("MEMORY")}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              Anı Paylaş
            </button>
            <button
              type="button"
              onClick={() => openSubmitModal("PHOTO")}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-sm font-semibold transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Fotoğraf / Video Yükle
            </button>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION TABS */}
      <nav
        aria-label="TEKNOFEST Köşesi Bölümleri"
        className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800/90 overflow-x-auto no-scrollbar"
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`relative min-h-[44px] px-4 py-3 text-sm font-semibold whitespace-nowrap inline-flex items-center gap-2 transition-colors cursor-pointer ${
                isActive
                  ? "text-blue-600 dark:text-sky-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.span
                  layoutId="teknofest-active-tab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-sky-400 rounded-full"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. SECTION: GENÇLERİN ANILARI (DEFAULT) */}
      {activeSection === "memories" && (
        <section className="space-y-6">
          {/* Section Header + Search / Filter */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gençlerin Anıları
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Yarışmacıların, gönüllülerin ve ziyaretçilerin TEKNOFEST hikâyeleri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {memoriesList.length > 0 && (
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={memorySearch}
                    onChange={(e) => setMemorySearch(e.target.value)}
                    placeholder="Anılarda ara..."
                    aria-label="Anılarda ara"
                    className="w-full sm:w-56 min-h-[40px] pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111B2E] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              )}

              {hasFeaturedMemories && (
                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setMemoryFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      memoryFilter === "all"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemoryFilter("featured")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      memoryFilter === "featured"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Öne Çıkanlar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Subtle Editorial Composer Prompt */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3.5">
              {isAuthenticated && user ? (
                <Avatar url={user.avatarUrl} name={user.displayName || user.username} size="md" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Quote className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Senin unutamadığın TEKNOFEST anı hangisi?
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Festival alanından bir anını, sahne heyecanını veya çektiğin bir kareyi arşive bırak.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openSubmitModal("MEMORY")}
              leftIcon={<PenLine className="w-4 h-4" />}
              className="shrink-0 min-h-[42px]"
            >
              Anını Yaz
            </Button>
          </div>

          {/* Memories List */}
          {loadingMemories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Quote className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {memorySearch.trim() ? "Aramanızla eşleşen anı bulunamadı" : "Henüz paylaşılmış bir anı yok"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {memorySearch.trim()
                    ? "Farklı bir anahtar kelimeyle yeniden arayabilir veya filtreyi temizleyebilirsiniz."
                    : "Bu etkinliğin ilk anısını paylaşarak arşivi başlatabilirsiniz."}
                </p>
              </div>
              {!memorySearch.trim() && (
                <Button variant="primary" size="sm" onClick={() => openSubmitModal("MEMORY")} leftIcon={<Plus className="w-4 h-4" />}>
                  İlk Anıyı Paylaş
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMemories.map((mem) => (
                <article
                  key={mem.id}
                  className="group bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 p-6 flex flex-col justify-between gap-5 transition-colors"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <Quote className="w-5 h-5 text-blue-600/35 dark:text-sky-400/40 shrink-0" />
                      {mem.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase text-blue-600 dark:text-sky-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          Seçkin Anı
                        </span>
                      )}
                    </div>

                    <p className="text-[15px] text-slate-800 dark:text-slate-100 leading-[1.7] whitespace-pre-line">
                      “{mem.content}”
                    </p>
                  </div>

                  <footer className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar url={mem.avatarUrl} name={mem.displayAuthor} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {mem.displayAuthor}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {[mem.authorTitle, formatShortDate(mem.createdAt)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>

                    {mem.username && (
                      <Link
                        to={`/profile/${mem.username}`}
                        aria-label={`${mem.displayAuthor} profiline git`}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. SECTION: FOTOĞRAF & VİDEO GALERİSİ */}
      {activeSection === "gallery" && (
        <section className="space-y-6">
          {/* Header + Media Type Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Fotoğraf & Video Galerisi
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gösteri uçuşları, yarışma alanları ve festivalden seçkin kareler.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
                {(
                  [
                    { id: "ALL", label: "Tümü" },
                    { id: "IMAGE", label: "Fotoğraf" },
                    { id: "VIDEO", label: "Video" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMediaTypeFilter(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      mediaTypeFilter === item.id
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => openSubmitModal("PHOTO")}
                leftIcon={<Plus className="w-4 h-4" />}
                className="min-h-[38px]"
              >
                Kare Gönder
              </Button>
            </div>
          </div>

          {/* Category Filters (from real DB categories) */}
          {ev.categories && ev.categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                    : "bg-white dark:bg-[#111B2E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                Tüm Kategoriler
              </button>
              {ev.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                    activeCategory === cat.slug
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                      : "bg-white dark:bg-[#111B2E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Masonry Gallery Grid */}
          {loadingMedia ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {[220, 300, 240, 280, 210, 260].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="break-inside-avoid rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Bu filtrede henüz medya bulunmuyor
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Festivalden çektiğiniz fotoğraf veya videoları galeriye gönderebilirsiniz.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => openSubmitModal("PHOTO")} leftIcon={<Camera className="w-4 h-4" />}>
                Fotoğraf / Video Yükle
              </Button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {mediaList.map((item) => (
                <figure
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 cursor-pointer"
                >
                  {item.mediaType === "VIDEO" ? (
                    <div className="relative aspect-video bg-slate-950">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.altText || item.title || "TEKNOFEST videosu"}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <video
                          src={item.mediaUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                        <span className="w-12 h-12 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                          <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.altText || item.title || "TEKNOFEST karesi"}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover block group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  )}

                  {/* Subtle Editorial Overlay on Hover */}
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between gap-3">
                    <div className="min-w-0 text-white">
                      {item.title && (
                        <p className="text-sm font-semibold leading-snug line-clamp-1">{item.title}</p>
                      )}
                      <p className="text-[11px] text-slate-200/90 truncate mt-0.5">
                        {[item.credit, item.categoryName].filter(Boolean).join(" · ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleLikeMedia(item.id, e)}
                        aria-label="Beğen"
                        className="h-8 px-2.5 rounded-lg bg-black/50 hover:bg-black/75 text-white text-xs font-semibold inline-flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            likedMediaIds.has(item.id) ? "fill-rose-500 text-rose-500" : "text-white"
                          }`}
                        />
                        <span>{item.likesCount}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShareMedia(item, e)}
                        aria-label="Paylaş"
                        className="w-8 h-8 rounded-lg bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. SECTION: ZAMAN TÜNELİ */}
      {activeSection === "timeline" && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Festival Zaman Tüneli
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {ev.title} süresince öne çıkan günler ve dönüm noktaları.
            </p>
          </div>

          {!ev.timeline || ev.timeline.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Bu etkinlik için zaman tüneli kaydı henüz eklenmedi
              </p>
            </div>
          ) : (
            <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-3 sm:ml-4 space-y-8 py-2">
              {ev.timeline.map((item) => (
                <li key={item.id} className="relative pl-7 sm:pl-9">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-sky-400 ring-4 ring-slate-50 dark:ring-[#0B1120]"
                  />
                  <div className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 max-w-2xl space-y-1.5">
                    <time className="block text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-sky-400">
                      {item.dateLabel}
                    </time>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* 6. SECTION: FESTİVAL PROJELERİ */}
      {activeSection === "projects" && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Festival Projeleri
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Topluluk üyelerinin TEKNOFEST kapsamında paylaştığı gerçek projeler.
              </p>
            </div>

            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-sky-400 hover:underline"
            >
              <span>Tüm Projeleri İncele</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : projectsList.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <Rocket className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Henüz TEKNOFEST etiketiyle paylaşılmış proje yok
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Projeler bölümünden TEKNOFEST etiketli yeni bir proje yayınlayabilirsiniz.
                </p>
              </div>
              <Link to="/projects" className="inline-block pt-1">
                <Button variant="primary" size="sm">
                  Projeler Sayfasına Git
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projectsList.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="group bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-colors"
                >
                  {proj.imageUrl && (
                    <div className="aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      {proj.category && (
                        <span className="block text-[11px] font-semibold tracking-wider uppercase text-blue-600 dark:text-sky-400">
                          {proj.category}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                        {proj.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {proj.authorUsername ? `@${proj.authorUsername}` : "Genç Sosyal"}
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-sky-400 inline-flex items-center gap-1">
                        İncele <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 7. SECTION: GÖNDERİLERİM */}
      {activeSection === "my-submissions" && isAuthenticated && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gönderilerim
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                TEKNOFEST Köşesi için gönderdiğiniz anı, fotoğraf ve videoların inceleme durumu.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openSubmitModal("MEMORY")}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Yeni İçerik Gönder
            </Button>
          </div>

          {loadingMySubmissions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : mySubmissions.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-[#111B2E] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Henüz gönderilmiş bir içeriğiniz bulunmuyor
              </p>
              <Button variant="primary" size="sm" onClick={() => openSubmitModal("MEMORY")}>
                İlk Anını veya Fotoğrafını Gönder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mySubmissions.map((sub) => {
                const statusMeta =
                  sub.moderationStatus === "APPROVED"
                    ? { label: "Yayında", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" }
                    : sub.moderationStatus === "REJECTED"
                    ? { label: "Reddedildi", dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" }
                    : { label: "İnceleniyor", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" };

                return (
                  <article
                    key={`${sub.type}-${sub.id}`}
                    className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-3.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${statusMeta.text}`}>
                        <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                      <span className="text-slate-400">
                        {sub.type === "MEMORY" ? "Anı" : sub.mediaType === "VIDEO" ? "Video" : "Fotoğraf"} ·{" "}
                        {formatShortDate(sub.createdAt)}
                      </span>
                    </div>

                    {sub.mediaUrl && (
                      <div className="aspect-video bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden">
                        {sub.mediaType === "VIDEO" ? (
                          <video src={sub.mediaUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <img
                            src={sub.mediaUrl}
                            alt={sub.title || "Gönderilen medya"}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {sub.title || sub.eventTitle}
                      </h3>
                      {sub.caption && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {sub.caption}
                        </p>
                      )}
                      {sub.rejectionReason && (
                        <p className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">
                          <span className="font-semibold">Not:</span> {sub.rejectionReason}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 8. LIGHTBOX VIEWER MODAL */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Kapat"
              className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(-1);
                  }}
                  aria-label="Önceki"
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(1);
                  }}
                  aria-label="Sonraki"
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[90vh] bg-[#0B1222] border border-white/10 rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl"
            >
              {/* Media Stage */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[280px] max-h-[60vh] lg:max-h-[85vh]">
                {selectedMedia.mediaType === "VIDEO" ? (
                  <video
                    src={selectedMedia.mediaUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedMedia.mediaUrl}
                    alt={selectedMedia.altText || selectedMedia.title || "TEKNOFEST karesi"}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Metadata Sidebar */}
              <div className="w-full lg:w-80 xl:w-96 p-5 sm:p-6 flex flex-col justify-between gap-5 border-t lg:border-t-0 lg:border-l border-white/10 text-white overflow-y-auto max-h-[35vh] lg:max-h-[85vh]">
                <div className="space-y-4">
                  {selectedMedia.uploader && (
                    <Link
                      to={`/profile/${selectedMedia.uploader.username}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar
                        url={selectedMedia.uploader.avatarUrl}
                        name={selectedMedia.uploader.displayName || selectedMedia.uploader.username}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-sky-300 truncate">
                          {selectedMedia.uploader.displayName || selectedMedia.uploader.username}
                        </p>
                        <p className="text-xs text-slate-400 truncate">@{selectedMedia.uploader.username}</p>
                      </div>
                    </Link>
                  )}

                  <div className="space-y-1.5">
                    {selectedMedia.categoryName && (
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                        {selectedMedia.categoryName}
                      </span>
                    )}
                    {selectedMedia.title && (
                      <h3 className="text-lg font-bold text-white leading-snug">{selectedMedia.title}</h3>
                    )}
                    {selectedMedia.caption && (
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedMedia.caption}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-1 text-xs">
                    <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Kaynak
                    </span>
                    <span className="text-slate-200 font-medium">{selectedMedia.credit}</span>
                  </div>

                  {selectedMedia.linkedProject && (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-sky-400">
                        Bağlantılı Proje
                      </span>
                      <Link
                        to={`/projects/${selectedMedia.linkedProject.id}`}
                        className="text-sm font-semibold text-white hover:text-sky-300 flex items-center justify-between gap-2"
                      >
                        <span className="line-clamp-1">{selectedMedia.linkedProject.title}</span>
                        <ExternalLink className="w-4 h-4 shrink-0" />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleLikeMedia(selectedMedia.id)}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedMediaIds.has(selectedMedia.id) ? "fill-rose-500 text-rose-500" : "text-slate-200"
                      }`}
                    />
                    <span>{selectedMedia.likesCount} Beğeni</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareMedia(selectedMedia)}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-sky-400" />
                    <span>Paylaş</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. CONTENT SUBMISSION MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowSubmitModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#111B2E] rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    TEKNOFEST Arşivine Ekle
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Anınızı, fotoğrafınızı veya videonuzu toplulukla paylaşın.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  aria-label="Kapat"
                  className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSubmitType("MEMORY")}
                  className={`min-h-[38px] rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    submitType === "MEMORY"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Quote className="w-3.5 h-3.5" /> Anı
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitType("PHOTO")}
                  className={`min-h-[38px] rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    submitType === "PHOTO"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" /> Fotoğraf
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitType("VIDEO")}
                  className={`min-h-[38px] rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    submitType === "VIDEO"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Film className="w-3.5 h-3.5" /> Video
                </button>
              </div>

              <form onSubmit={handleSubmitContent} className="space-y-4">
                {submitType !== "MEMORY" && (
                  <div className="space-y-3">
                    {/* Source Switcher */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSubmitSourceTab("file")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                          submitSourceTab === "file"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Cihazdan Yükle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmitSourceTab("url")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                          submitSourceTab === "url"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>URL ile Ekle</span>
                      </button>
                    </div>

                    {submitSourceTab === "file" ? (
                      submitFile && submitPreviewUrl ? (
                        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-3 flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 flex items-center justify-center">
                            {submitType === "VIDEO" ? (
                              <video src={submitPreviewUrl} className="w-full h-full object-cover" />
                            ) : (
                              <img src={submitPreviewUrl} alt="Önizleme" className="w-full h-full object-cover" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1 text-white">
                            <div className="text-xs font-semibold truncate">{submitFile.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {(submitFile.size / (1024 * 1024)).toFixed(1)} MB
                            </div>
                            {submitUploadPhase === "uploading" && (
                              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-sky-500 h-full rounded-full transition-all duration-150"
                                  style={{ width: `${submitUploadProgress}%` }}
                                />
                              </div>
                            )}
                            {submitUploadMessage && (
                              <p className="text-[11px] text-sky-300 font-medium">{submitUploadMessage}</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleClearSubmitFile}
                            aria-label="Dosyayı kaldır"
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => userFileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingFile(true);
                          }}
                          onDragLeave={() => setIsDraggingFile(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingFile(false);
                            if (e.dataTransfer.files?.[0]) {
                              handleUserFileSelected(e.dataTransfer.files[0]);
                            }
                          }}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                            isDraggingFile
                              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                              : "border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40"
                          }`}
                        >
                          <input
                            ref={userFileInputRef}
                            type="file"
                            accept={
                              submitType === "VIDEO"
                                ? "video/mp4,video/quicktime,video/webm"
                                : "image/jpeg,image/png,image/webp,image/gif"
                            }
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUserFileSelected(e.target.files[0]);
                                e.target.value = "";
                              }
                            }}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {submitType === "VIDEO" ? "Video seçin veya sürükleyip bırakın" : "Fotoğraf seçin veya sürükleyip bırakın"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {submitType === "VIDEO" ? "MP4, MOV, WebM (Maks. 100 MB)" : "JPG, PNG, WEBP (Maks. 15 MB)"}
                          </p>
                        </div>
                      )
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Medya Bağlantısı *
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://"
                          value={submitForm.mediaUrl}
                          onChange={(e) => setSubmitForm({ ...submitForm, mediaUrl: e.target.value })}
                          className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        />
                      </div>
                    )}

                    {/* Optional Category Select */}
                    {ev.categories && ev.categories.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Kategori (İsteğe Bağlı)
                        </label>
                        <select
                          value={submitForm.categoryId}
                          onChange={(e) => setSubmitForm({ ...submitForm, categoryId: e.target.value })}
                          className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        >
                          <option value="">Kategori seçin</option>
                          {ev.categories.map((cat) => (
                            <option key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {submitType === "MEMORY" ? "Katılım Rolü / Unvan (İsteğe Bağlı)" : "Başlık (İsteğe Bağlı)"}
                  </label>
                  <input
                    type="text"
                    placeholder={submitType === "MEMORY" ? "Festivaldeki katılım rolünüz" : "Kısa bir başlık girin"}
                    value={submitType === "MEMORY" ? submitForm.authorTitle : submitForm.title}
                    onChange={(e) => {
                      if (submitType === "MEMORY") {
                        setSubmitForm({ ...submitForm, authorTitle: e.target.value });
                      } else {
                        setSubmitForm({ ...submitForm, title: e.target.value });
                      }
                    }}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {submitType === "MEMORY" ? "Anınız (En az 10 karakter) *" : "Açıklama (İsteğe Bağlı)"}
                  </label>
                  <textarea
                    required={submitType === "MEMORY"}
                    rows={submitType === "MEMORY" ? 4 : 2}
                    placeholder={
                      submitType === "MEMORY"
                        ? "TEKNOFEST deneyiminizi, yaşadığınız anları ve duygularınızı yazın..."
                        : "Kare hakkında kısa bilgi ekleyin..."
                    }
                    value={submitForm.caption}
                    onChange={(e) => setSubmitForm({ ...submitForm, caption: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y"
                  />
                </div>

                {/* Moderation Note */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    Gönderilen içerikler moderasyon incelemesinden sonra TEKNOFEST Köşesi’nde yayınlanır.
                  </span>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={submitForm.rightsAgreed}
                    onChange={(e) => setSubmitForm({ ...submitForm, rightsAgreed: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded-sm text-blue-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Bu içeriğin paylaşım ve telif haklarına sahip olduğumu onaylıyorum.
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
