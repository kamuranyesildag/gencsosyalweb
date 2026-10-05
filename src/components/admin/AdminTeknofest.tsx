import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Calendar, 
  Camera, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  MapPin,
  Trophy,
  Rocket,
  Plane,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Upload,
  UploadCloud,
  FileVideo,
  ImageIcon,
  Loader2,
  CheckCircle2,
  SlidersHorizontal,
  FolderPlus,
  Play
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { toast } from "../ui/Toast";
import { fetchApi } from "../../lib/api";
import { useAuthStore } from "../../context/useAuth";

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
}

interface TeknofestCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface AdminMediaItem {
  id: number;
  eventId: number;
  eventTitle?: string;
  categoryId: number | null;
  categoryName?: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  caption: string | null;
  altText: string | null;
  credit: string;
  aspectRatio: string;
  duration?: number | null;
  viewsCount: number;
  likesCount: number;
  isFeatured: boolean;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface SubmissionItem {
  id: number;
  type: "MEDIA" | "MEMORY";
  eventId: number;
  eventTitle: string;
  userId: number | null;
  username: string | null;
  displayName: string | null;
  mediaType: string;
  mediaUrl: string | null;
  title: string | null;
  caption: string | null;
  credit: string | null;
  altText: string | null;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
}

interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  isVideo: boolean;
  phase: "idle" | "uploading" | "processing" | "completed" | "error" | "cancelled";
  progress: number;
  loadedBytes: number;
  totalBytes: number;
  statusMessage: string;
  error?: string;
  uploadedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  // Per-item metadata
  title: string;
  caption: string;
  categoryId: string;
  credit: string;
  altText: string;
  isFeatured: boolean;
  aspectRatio: string;
  xhr?: XMLHttpRequest;
}

const safeFormatDateForInput = (d: any, defaultTime = "09:00"): string => {
  if (!d) return "";
  try {
    if (typeof d === "string" && d.includes("T")) {
      const [datePart, timePart] = d.split("T");
      const cleanTime = timePart ? timePart.slice(0, 5) : defaultTime;
      return `${datePart}T${cleanTime}`;
    }
    const dateObj = new Date(d);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  } catch {
    // fallback
  }
  return "";
};

const formatDateRange = (start: any, end: any): string => {
  try {
    const s = start ? new Date(start).toLocaleDateString("tr-TR") : "";
    const e = end ? new Date(end).toLocaleDateString("tr-TR") : "";
    if (s && e) return `${s} – ${e}`;
    return s || e || "Tarih belirtilmedi";
  } catch {
    return "Tarih belirtilmedi";
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const extractErrorMessage = (jsonOrErr: any, defaultMsg = "İşlem başarısız"): string => {
  if (!jsonOrErr) return defaultMsg;
  if (typeof jsonOrErr === "string") return jsonOrErr;
  if (jsonOrErr.error) {
    if (typeof jsonOrErr.error === "string") return jsonOrErr.error;
    if (typeof jsonOrErr.error === "object" && jsonOrErr.error.message) return jsonOrErr.error.message;
  }
  if (jsonOrErr.message && typeof jsonOrErr.message === "string") return jsonOrErr.message;
  return defaultMsg;
};

export function AdminTeknofest() {
  const [activeTab, setActiveTab] = useState<"moderation" | "events" | "media" | "timeline">("media");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<TeknofestEvent[]>([]);
  const [categories, setCategories] = useState<TeknofestCategory[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Media Tab State
  const [mediaItems, setMediaItems] = useState<AdminMediaItem[]>([]);
  const [mediaFilterCategory, setMediaFilterCategory] = useState<string>("ALL");
  const [mediaFilterType, setMediaFilterType] = useState<string>("ALL");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [editingMedia, setEditingMedia] = useState<AdminMediaItem | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [previewMedia, setPreviewMedia] = useState<AdminMediaItem | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [rejectingItem, setRejectingItem] = useState<{ id: number; type: "MEDIA" | "MEMORY" } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TeknofestEvent | null>(null);
  const [eventCoverUploading, setEventCoverUploading] = useState(false);
  const [eventCoverProgress, setEventCoverProgress] = useState(0);
  const eventCoverInputRef = useRef<HTMLInputElement>(null);
  const [eventForm, setEventForm] = useState({
    slug: "",
    title: "",
    theme: "",
    description: "",
    location: "Şanlıurfa — GAP Havalimanı",
    startDate: "2026-09-30T09:00",
    endDate: "2026-10-04T19:00",
    status: "COMPLETED" as "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED",
    coverImageUrl: ""
  });

  // Real Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSourceTab, setUploadSourceTab] = useState<"file" | "url">("file");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPublishingBatch, setIsPublishingBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // External URL form state (fallback)
  const [urlForm, setUrlForm] = useState({
    mediaType: "IMAGE" as "IMAGE" | "VIDEO",
    mediaUrl: "",
    thumbnailUrl: "",
    title: "",
    caption: "",
    credit: "📷 Genç Sosyal",
    altText: "",
    categoryId: "",
    aspectRatio: "4:3",
    isFeatured: true
  });

  // Timeline item state
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineForm, setTimelineForm] = useState({
    dateLabel: "",
    title: "",
    description: "",
    icon: "Sparkles",
    sortOrder: 1
  });

  // 1. Load Events
  const loadEvents = async () => {
    try {
      const res = await fetchApi("/teknofest/events");
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data);
        if (json.data.length > 0 && !selectedEventId) {
          setSelectedEventId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading events:", e);
    }
  };

  // 2. Load Categories for selected Event
  const loadEventCategories = async (slug: string) => {
    try {
      const res = await fetchApi(`/teknofest/events/${slug}`);
      const json = await res.json();
      if (json.success && json.data?.categories) {
        setCategories(json.data.categories);
      }
    } catch (e) {
      console.error("Error loading categories:", e);
    }
  };

  // 3. Load Media for Admin Tab
  const loadAdminMedia = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      let url = `/teknofest/admin/media?eventId=${selectedEventId}`;
      if (mediaFilterCategory !== "ALL") {
        url += `&categoryId=${mediaFilterCategory}`;
      }
      if (mediaFilterType !== "ALL") {
        url += `&mediaType=${mediaFilterType}`;
      }
      if (mediaSearchQuery.trim()) {
        url += `&search=${encodeURIComponent(mediaSearchQuery.trim())}`;
      }

      const res = await fetchApi(url);
      const json = await res.json();
      if (json.success) {
        setMediaItems(json.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Medya listesi yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // 4. Load Submissions
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/teknofest/admin/submissions?status=${submissionFilter}`);
      const json = await res.json();
      if (json.success) {
        const combined = [...(json.data?.media || []), ...(json.data?.memories || [])];
        setSubmissions(combined);
      }
    } catch (e) {
      console.error(e);
      toast.error("Moderasyon listesi yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const ev = events.find(e => e.id === selectedEventId);
      if (ev) {
        loadEventCategories(ev.slug);
      }
      if (activeTab === "media") {
        loadAdminMedia();
      }
    }
  }, [selectedEventId, activeTab, mediaFilterCategory, mediaFilterType, events]);

  useEffect(() => {
    if (activeTab === "moderation") {
      loadSubmissions();
    }
  }, [activeTab, submissionFilter]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploadQueue.forEach(item => {
        if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [uploadQueue]);

  // --- REAL FILE SELECTION & UPLOAD PIPELINE ---
  const handleFilesSelected = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const newItems: UploadQueueItem[] = fileList.map(file => {
      const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|webm|mkv|3gp|avi)$/i) !== null;
      const previewUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

      return {
        id: Math.random().toString(36).substring(2, 11),
        file,
        previewUrl,
        isVideo,
        phase: "idle",
        progress: 0,
        loadedBytes: 0,
        totalBytes: file.size,
        statusMessage: "Yüklemeye hazır",
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        caption: "",
        categoryId: categories.length > 0 ? String(categories[0].id) : "",
        credit: "📷 Genç Sosyal",
        altText: `TEKNOFEST — ${cleanName}`,
        isFeatured: false,
        aspectRatio: "4:3"
      };
    });

    setUploadQueue(prev => [...prev, ...newItems]);

    // Automatically trigger upload for new idle items
    newItems.forEach(item => {
      startSingleFileUpload(item);
    });
  };

  const startSingleFileUpload = (item: UploadQueueItem) => {
    const isVideo = item.isVideo;
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    const maxImageSize = 15 * 1024 * 1024;  // 15MB

    if (isVideo && item.file.size > maxVideoSize) {
      updateQueueItem(item.id, {
        phase: "error",
        statusMessage: "Dosya çok büyük",
        error: "Videolar en fazla 100MB olabilir."
      });
      return;
    }

    if (!isVideo && item.file.size > maxImageSize) {
      updateQueueItem(item.id, {
        phase: "error",
        statusMessage: "Dosya çok büyük",
        error: "Görseller en fazla 15MB olabilir."
      });
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", item.file);

    const accessToken = useAuthStore.getState().accessToken;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
        const loadedStr = formatFileSize(e.loaded);
        const totalStr = formatFileSize(e.total);

        if (e.loaded >= e.total) {
          updateQueueItem(item.id, {
            phase: "processing",
            progress: 100,
            loadedBytes: e.loaded,
            totalBytes: e.total,
            statusMessage: isVideo ? "Video optimize ediliyor ve dönüştürülüyor..." : "Görsel işleniyor..."
          });
        } else {
          updateQueueItem(item.id, {
            phase: "uploading",
            progress: percent,
            loadedBytes: e.loaded,
            totalBytes: e.total,
            statusMessage: `%${percent} (${loadedStr} / ${totalStr})`
          });
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.success && json.data) {
            updateQueueItem(item.id, {
              phase: "completed",
              progress: 100,
              statusMessage: "Yüklendi ✓",
              uploadedUrl: json.data.url,
              thumbnailUrl: json.data.thumbnailUrl || null,
              duration: json.data.duration,
              width: json.data.width,
              height: json.data.height
            });
            return;
          } else {
            updateQueueItem(item.id, {
              phase: "error",
              statusMessage: "İşlem başarısız",
              error: json.error?.message || "Dosya sunucuda işlenemedi."
            });
          }
        } catch {
          updateQueueItem(item.id, {
            phase: "error",
            statusMessage: "Yanıt hatası",
            error: "Sunucudan geçersiz yanıt alındı."
          });
        }
      } else {
        let errorMsg = "Yükleme başarısız.";
        try {
          const errJson = JSON.parse(xhr.responseText);
          if (errJson.error?.message) errorMsg = errJson.error.message;
        } catch {}
        updateQueueItem(item.id, {
          phase: "error",
          statusMessage: "Hata",
          error: errorMsg
        });
      }
    };

    xhr.onerror = () => {
      updateQueueItem(item.id, {
        phase: "error",
        statusMessage: "Ağ Hatası",
        error: "Sunucuyla bağlantı kurulamadı."
      });
    };

    xhr.onabort = () => {
      updateQueueItem(item.id, {
        phase: "cancelled",
        statusMessage: "İptal edildi",
        error: "Yükleme iptal edildi."
      });
    };

    xhr.open("POST", "/api/v1/media/upload", true);
    if (accessToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }

    updateQueueItem(item.id, {
      xhr,
      phase: "uploading",
      progress: 0,
      statusMessage: "Yükleme başlatılıyor..."
    });

    xhr.send(formData);
  };

  const updateQueueItem = (id: string, patch: Partial<UploadQueueItem>) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const removeQueueItem = (id: string) => {
    const item = uploadQueue.find(i => i.id === id);
    if (item?.xhr) {
      try { item.xhr.abort(); } catch {}
    }
    if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setUploadQueue(prev => prev.filter(i => i.id !== id));
  };

  const handlePublishAllUploaded = async () => {
    if (!selectedEventId) {
      toast.error("Lütfen bir etkinlik seçin");
      return;
    }

    const completedItems = uploadQueue.filter(i => i.phase === "completed" && i.uploadedUrl);
    if (completedItems.length === 0) {
      toast.error("Yüklenmesi tamamlanmış dosya bulunmuyor.");
      return;
    }

    setIsPublishingBatch(true);
    try {
      const itemsToSave = completedItems.map(i => ({
        categoryId: i.categoryId ? parseInt(i.categoryId, 10) : null,
        mediaType: i.isVideo ? "VIDEO" : "IMAGE",
        mediaUrl: i.uploadedUrl!,
        thumbnailUrl: i.thumbnailUrl || null,
        title: i.title.trim() || "TEKNOFEST Medyası",
        caption: i.caption.trim() || null,
        altText: i.altText.trim() || i.title.trim() || "TEKNOFEST Etkinlik Fotoğrafı",
        credit: i.credit.trim() || "📷 Genç Sosyal",
        aspectRatio: i.aspectRatio || "4:3",
        duration: i.duration || null,
        isFeatured: i.isFeatured
      }));

      const res = await fetchApi("/teknofest/admin/media/batch", {
        method: "POST",
        data: {
          eventId: selectedEventId,
          items: itemsToSave
        }
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${completedItems.length} medya başarıyla TEKNOFEST Köşesi'ne eklendi!`);
        setShowUploadModal(false);
        setUploadQueue([]);
        loadAdminMedia();
      } else {
        toast.error(extractErrorMessage(json, "Kayıt işlemi başarısız"));
      }
    } catch (err) {
      toast.error("Sunucu hatası oluştu");
    } finally {
      setIsPublishingBatch(false);
    }
  };

  // External URL Submit Handler
  const handleSaveUrlMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !urlForm.mediaUrl.trim()) {
      toast.error("Lütfen etkinlik ve geçerli medya URL'si girin");
      return;
    }

    try {
      const res = await fetchApi("/teknofest/admin/media", {
        method: "POST",
        data: {
          eventId: selectedEventId,
          ...urlForm
        }
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Medya başarıyla eklendi");
        setShowUploadModal(false);
        setUrlForm({
          mediaType: "IMAGE",
          mediaUrl: "",
          thumbnailUrl: "",
          title: "",
          caption: "",
          credit: "📷 Genç Sosyal",
          altText: "",
          categoryId: "",
          aspectRatio: "4:3",
          isFeatured: true
        });
        loadAdminMedia();
      } else {
        toast.error(extractErrorMessage(json, "Medya eklenemedi"));
      }
    } catch (err) {
      toast.error("Sunucu hatası");
    }
  };

  // Edit existing media
  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    try {
      const res = await fetchApi(`/teknofest/admin/media/${editingMedia.id}`, {
        method: "PUT",
        data: {
          eventId: editingMedia.eventId,
          categoryId: editingMedia.categoryId,
          title: editingMedia.title,
          caption: editingMedia.caption,
          altText: editingMedia.altText,
          credit: editingMedia.credit,
          aspectRatio: editingMedia.aspectRatio,
          isFeatured: editingMedia.isFeatured,
          moderationStatus: editingMedia.moderationStatus
        }
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Medya bilgileri güncellendi");
        setEditingMedia(null);
        loadAdminMedia();
      } else {
        toast.error(extractErrorMessage(json, "Güncelleme başarısız"));
      }
    } catch (e) {
      toast.error("Sunucu bağlantı hatası");
    }
  };

  // Delete media
  const handleDeleteMedia = async (id: number) => {
    try {
      const res = await fetchApi(`/teknofest/admin/media/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Medya ve depolama dosyası silindi");
        setDeletingMediaId(null);
        loadAdminMedia();
      } else {
        toast.error(extractErrorMessage(json, "Silinemedi"));
      }
    } catch (e) {
      toast.error("Sunucu hatası");
    }
  };

  // Review Submissions
  const handleReviewSubmission = async (id: number, type: "MEDIA" | "MEMORY", action: "APPROVE" | "REJECT", reason?: string) => {
    setProcessingId(id);
    try {
      const res = await fetchApi(`/teknofest/admin/submissions/${id}/review`, {
        method: "POST",
        data: {
          type,
          action,
          rejectionReason: reason || undefined
        }
      });
      const json = await res.json();
      if (json.success) {
        if (action === "APPROVE") {
          toast.success("İçerik onaylandı ve yayınlandı");
        } else {
          toast.success("İçerik reddedildi");
        }
        setRejectingItem(null);
        setRejectionReason("");
        loadSubmissions();
      } else {
        toast.error(extractErrorMessage(json, "İşlem başarısız"));
      }
    } catch (e) {
      toast.error("Sunucu hatası");
    } finally {
      setProcessingId(null);
    }
  };

  // Event Cover Photo Direct Upload Handler
  const handleEventCoverUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen geçerli bir görsel dosyası seçin (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Görsel boyutu en fazla 15MB olabilir");
      return;
    }

    setEventCoverUploading(true);
    setEventCoverProgress(0);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    const accessToken = useAuthStore.getState().accessToken;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
        setEventCoverProgress(percent);
      }
    };

    xhr.onload = () => {
      setEventCoverUploading(false);
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && json.success && json.data?.url) {
          setEventForm(prev => ({ ...prev, coverImageUrl: json.data.url }));
          toast.success("Kapak görseli başarıyla yüklendi");
        } else {
          toast.error(extractErrorMessage(json, "Kapak görseli yüklenemedi"));
        }
      } catch (e) {
        toast.error("Sunucu yanıtı işlenemedi");
      }
    };

    xhr.onerror = () => {
      setEventCoverUploading(false);
      toast.error("Görsel yüklenirken bağlantı hatası oluştu");
    };

    xhr.open("POST", "/api/v1/media/upload");
    if (accessToken) {
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }
    xhr.send(formData);
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.slug || !eventForm.title || !eventForm.description) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    try {
      const endpoint = editingEvent 
        ? `/teknofest/admin/events/${editingEvent.id}` 
        : `/teknofest/admin/events`;
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetchApi(endpoint, {
        method,
        data: eventForm
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingEvent ? "Etkinlik güncellendi" : "Yeni etkinlik oluşturuldu");
        setShowEventModal(false);
        setEditingEvent(null);
        await loadEvents();
      } else {
        toast.error(extractErrorMessage(json, "İşlem başarısız"));
      }
    } catch (err) {
      toast.error("Sunucu bağlantı hatası oluştu");
    }
  };

  // Add Timeline Item
  const handleAddTimelineItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !timelineForm.dateLabel || !timelineForm.title) {
      toast.error("Zorunlu alanları doldurun");
      return;
    }

    try {
      const res = await fetchApi("/teknofest/admin/timeline", {
        method: "POST",
        data: {
          eventId: selectedEventId,
          ...timelineForm
        }
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Zaman tüneli ögesi eklendi");
        setShowTimelineModal(false);
        setTimelineForm({
          dateLabel: "",
          title: "",
          description: "",
          icon: "Sparkles",
          sortOrder: 1
        });
      } else {
        toast.error(extractErrorMessage(json, "Öge eklenemedi"));
      }
    } catch (err) {
      toast.error("Sunucu hatası");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              TEKNOFEST Köşesi Yönetimi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerçek dosya yükleme, fotoğraf/video galeri arşivi, etkinlikler ve moderasyon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === "moderation") loadSubmissions();
              if (activeTab === "media") loadAdminMedia();
              loadEvents();
            }}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Yenile
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setUploadQueue([]);
              setShowUploadModal(true);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white"
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Fotoğraf / Video Yükle
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "media"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Galeri & Medya Yönetimi ({mediaItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Moderasyon Kuyruğu</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "events"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Etkinlikler ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "timeline"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Zaman Tüneli</span>
        </button>
      </div>

      {/* 1. MEDIA MANAGEMENT TAB (PRIMARY) */}
      {activeTab === "media" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Etkinlik:</label>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => setSelectedEventId(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Kategori:</label>
                <select
                  value={mediaFilterCategory}
                  onChange={(e) => setMediaFilterCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <option value="ALL">Tüm Kategoriler</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tür:</label>
                <select
                  value={mediaFilterType}
                  onChange={(e) => setMediaFilterType(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  <option value="ALL">Tüm Medyalar</option>
                  <option value="IMAGE">Fotoğraflar</option>
                  <option value="VIDEO">Videolar</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Başlık veya kredi ara..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadAdminMedia()}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setUploadQueue([]);
                  setShowUploadModal(true);
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Yükle
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Medyalar yükleniyor...
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
              <Camera className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Bu etkinlik için henüz medya yüklenmemiş
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cihazınızdan tek tek veya toplu olarak TEKNOFEST fotoğrafları ve videoları yükleyebilirsiniz.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUploadModal(true)}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                İlk Fotoğrafı / Videoyu Yükle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Media Preview Box */}
                  <div 
                    onClick={() => setPreviewMedia(item)}
                    className="relative aspect-video sm:aspect-[4/3] bg-slate-900 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    {item.mediaType === "VIDEO" ? (
                      <>
                        <video src={item.mediaUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-white">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title || "Fotoğraf"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <Badge variant="neutral" className="bg-black/60 text-white backdrop-blur-xs text-[10px] py-0.5 px-1.5">
                        {item.mediaType === "VIDEO" ? "🎥 Video" : "📸 Fotoğraf"}
                      </Badge>
                      {item.isFeatured && (
                        <Badge variant="warning" className="text-[10px] py-0.5 px-1.5">
                          Öne Çıkan
                        </Badge>
                      )}
                    </div>

                    {item.categoryName && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-sky-300">
                          {item.categoryName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info & Actions */}
                  <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.title || "Başlıksız Medya"}
                      </h4>
                      {item.caption && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {item.caption}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 font-medium mt-1">
                        {item.credit}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span>❤️ {item.likesCount}</span>
                        <span>📅 {new Date(item.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingMedia(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMediaId(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MODERATION QUEUE TAB */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Filtre:</span>
            </div>
            <div className="flex gap-1.5">
              {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSubmissionFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    submissionFilter === filter
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {filter === "PENDING" && "Bekleyenler"}
                  {filter === "APPROVED" && "Onaylananlar"}
                  {filter === "REJECTED" && "Reddedilenler"}
                  {filter === "ALL" && "Tümü"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Moderasyon listesi yükleniyor...
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-2">
              <Check className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Kuyrukta bekleyen içerik bulunmuyor
              </h3>
              <p className="text-xs text-slate-500">
                Seçilen filtreye uygun içerik yok.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  {item.type === "MEDIA" && item.mediaUrl && (
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                      {item.mediaType === "VIDEO" ? (
                        <video src={item.mediaUrl} className="w-full h-full object-cover" controls />
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt={item.title || "İçerik"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <Badge
                        variant="neutral"
                        className="absolute top-2.5 left-2.5 bg-black/60 text-white backdrop-blur-xs text-[10px]"
                      >
                        {item.mediaType === "VIDEO" ? "🎥 Video" : "📸 Fotoğraf"}
                      </Badge>
                    </div>
                  )}

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                          {item.eventTitle || "TEKNOFEST"}
                        </span>
                        <Badge
                          variant={
                            item.moderationStatus === "APPROVED"
                              ? "success"
                              : item.moderationStatus === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {item.moderationStatus === "PENDING" && "Onay Bekliyor"}
                          {item.moderationStatus === "APPROVED" && "Onaylandı"}
                          {item.moderationStatus === "REJECTED" && "Reddedildi"}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">
                        {item.title || (item.type === "MEMORY" ? "Genç Anısı" : "Fotoğraf")}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                        {item.caption || "(Açıklama belirtilmedi)"}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Gönderen: <strong>@{item.username || "Anonim"}</strong></span>
                        <span>{new Date(item.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>

                    {item.moderationStatus === "PENDING" && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={processingId === item.id}
                          onClick={() => handleReviewSubmission(item.id, item.type, "APPROVE")}
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                        >
                          Onayla
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          disabled={processingId === item.id}
                          onClick={() => {
                            setRejectingItem({ id: item.id, type: item.type });
                            setRejectionReason("");
                          }}
                          leftIcon={<X className="w-3.5 h-3.5" />}
                        >
                          Reddet
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. EVENTS TAB */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingEvent(null);
                setEventForm({
                  slug: "2027",
                  title: "TEKNOFEST 2027",
                  theme: "Geleceğin Teknolojileri",
                  description: "Geleceğin teknolojileri ve havacılık festivali.",
                  location: "Şanlıurfa — GAP Havalimanı",
                  startDate: "2027-09-30T09:00",
                  endDate: "2027-10-04T19:00",
                  status: "UPCOMING",
                  coverImageUrl: ""
                });
                setShowEventModal(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Yeni Etkinlik Oluştur
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      Yıl / Slug: {ev.slug}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                      {ev.title}
                    </h3>
                  </div>
                  <Badge variant={ev.status === "ACTIVE" ? "success" : "neutral"} className="text-[10px]">
                    {ev.status === "ACTIVE" && "Canlı / Aktif"}
                    {ev.status === "COMPLETED" && "Tamamlandı"}
                    {ev.status === "UPCOMING" && "Yakında"}
                    {ev.status === "ARCHIVED" && "Arşiv"}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {ev.description}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateRange(ev.startDate, ev.endDate)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <a
                    href={`/teknofest/${ev.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline"
                  >
                    <span>Sayfayı Gör</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingEvent(ev);
                      setEventForm({
                        slug: ev.slug,
                        title: ev.title,
                        theme: ev.theme || "",
                        description: ev.description,
                        location: ev.location || "Şanlıurfa — GAP Havalimanı",
                        startDate: safeFormatDateForInput(ev.startDate, "09:00"),
                        endDate: safeFormatDateForInput(ev.endDate, "19:00"),
                        status: ev.status,
                        coverImageUrl: ev.coverImageUrl || ""
                      });
                      setShowEventModal(true);
                    }}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Düzenle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TIMELINE TAB */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Etkinlik Seç:</label>
              <select
                value={selectedEventId || ""}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowTimelineModal(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Zaman Tüneli Günü Ekle
            </Button>
          </div>
        </div>
      )}

      {/* --- MODAL 1: REAL PHOTO / VIDEO UPLOAD & MANAGEMENT MODAL --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-5 sm:p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl my-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  TEKNOFEST Galerisine Medya Yükle
                </h3>
                <p className="text-xs text-slate-500">
                  Etkinlik: <strong>{events.find(e => e.id === selectedEventId)?.title || "Seçili Etkinlik"}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadQueue([]);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Switcher: Device File vs URL */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-xs">
              <button
                type="button"
                onClick={() => setUploadSourceTab("file")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  uploadSourceTab === "file"
                    ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Cihazdan Yükle</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadSourceTab("url")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  uploadSourceTab === "url"
                    ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Harici Link</span>
              </button>
            </div>

            {/* TAB A: REAL FILE UPLOAD (DRAG & DROP + DEVICE PICKER) */}
            {uploadSourceTab === "file" && (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files) {
                      handleFilesSelected(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 scale-[0.99]"
                      : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFilesSelected(e.target.files);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Fotoğraf veya Video Seçin ya da Buraya Sürükleyin
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    JPG, PNG, WEBP, GIF (Maks. 15MB) veya MP4, MOV, WebM (Maks. 100MB). Birden fazla dosya seçebilirsiniz.
                  </p>
                </div>

                {/* Queue List */}
                {uploadQueue.length > 0 && (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Seçilen Dosyalar ({uploadQueue.length})</span>
                      <span className="text-[11px] text-slate-500">
                        {uploadQueue.filter(i => i.phase === "completed").length} / {uploadQueue.length} Yüklendi
                      </span>
                    </div>

                    {uploadQueue.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 space-y-2.5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.isVideo ? (
                              <video src={item.uploadedUrl || item.previewUrl} className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.uploadedUrl || item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {item.file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeQueueItem(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span>{formatFileSize(item.file.size)}</span>
                              <span>·</span>
                              <span className={item.phase === "error" ? "text-rose-600 font-bold" : item.phase === "completed" ? "text-emerald-600 font-bold" : "text-sky-600"}>
                                {item.statusMessage}
                              </span>
                            </div>

                            {/* Progress bar */}
                            {item.phase === "uploading" && (
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mt-1">
                                <div
                                  className="bg-sky-600 h-full rounded-full transition-all duration-150"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            )}

                            {item.error && (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="text-[10px] text-rose-600 font-medium truncate">
                                  {item.error}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => startSingleFileUpload(item)}
                                  className="text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-sm shrink-0"
                                >
                                  Tekrar Dene
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metadata Edit per file */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">Başlık</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateQueueItem(item.id, { title: e.target.value })}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs mt-0.5"
                              placeholder="Görsel başlığı"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">Kategori</label>
                            <select
                              value={item.categoryId}
                              onChange={(e) => updateQueueItem(item.id, { categoryId: e.target.value })}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs mt-0.5 font-semibold"
                            >
                              <option value="">Kategori Seçin</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500">Fotoğrafçı / Kredi</label>
                            <input
                              type="text"
                              value={item.credit}
                              onChange={(e) => updateQueueItem(item.id, { credit: e.target.value })}
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs mt-0.5"
                              placeholder="📷 Genç Sosyal"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    {uploadQueue.filter(i => i.phase === "completed").length} dosya yayınlanmaya hazır
                  </span>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                      Kapat
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={uploadQueue.filter(i => i.phase === "completed").length === 0 || isPublishingBatch}
                      onClick={handlePublishAllUploaded}
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                      leftIcon={isPublishingBatch ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    >
                      {isPublishingBatch ? "Yayınlanıyor..." : "Tümünü Galeriye Ekle"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B: EXTERNAL URL FORM */}
            {uploadSourceTab === "url" && (
              <form onSubmit={handleSaveUrlMedia} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Medya Türü</label>
                    <select
                      value={urlForm.mediaType}
                      onChange={(e) => setUrlForm({ ...urlForm, mediaType: e.target.value as any })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                    >
                      <option value="IMAGE">📸 Fotoğraf</option>
                      <option value="VIDEO">🎥 Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Kategori</label>
                    <select
                      value={urlForm.categoryId}
                      onChange={(e) => setUrlForm({ ...urlForm, categoryId: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                    >
                      <option value="">Seçiniz</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Görsel / Video URL*</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={urlForm.mediaUrl}
                    onChange={(e) => setUrlForm({ ...urlForm, mediaUrl: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Başlık</label>
                  <input
                    type="text"
                    placeholder="SoloTürk Uçuş Gösterisi"
                    value={urlForm.title}
                    onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Kredi</label>
                    <input
                      type="text"
                      placeholder="📷 @kullanici veya 📷 Genç Sosyal"
                      value={urlForm.credit}
                      onChange={(e) => setUrlForm({ ...urlForm, credit: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">En-Boy Oranı</label>
                    <select
                      value={urlForm.aspectRatio}
                      onChange={(e) => setUrlForm({ ...urlForm, aspectRatio: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                    >
                      <option value="4:3">4:3 (Standart)</option>
                      <option value="16:9">16:9 (Geniş Ekran)</option>
                      <option value="1:1">1:1 (Kare)</option>
                      <option value="3:4">3:4 (Dikey)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowUploadModal(false)}>
                    Vazgeç
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Kaydet ve Yayınla
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT MEDIA METADATA MODAL --- */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleUpdateMedia} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl my-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Medya Bilgilerini Düzenle
            </h3>

            <div className="w-full aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
              {editingMedia.mediaType === "VIDEO" ? (
                <video src={editingMedia.mediaUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img src={editingMedia.mediaUrl} alt="Preview" className="w-full h-full object-contain" />
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Başlık</label>
              <input
                type="text"
                value={editingMedia.title || ""}
                onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Kategori</label>
                <select
                  value={editingMedia.categoryId || ""}
                  onChange={(e) => setEditingMedia({ ...editingMedia, categoryId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                >
                  <option value="">Seçiniz</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Kredi (Fotoğrafçı)</label>
                <input
                  type="text"
                  value={editingMedia.credit}
                  onChange={(e) => setEditingMedia({ ...editingMedia, credit: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Açıklama</label>
              <textarea
                value={editingMedia.caption || ""}
                onChange={(e) => setEditingMedia({ ...editingMedia, caption: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editFeaturedCheck"
                checked={editingMedia.isFeatured}
                onChange={(e) => setEditingMedia({ ...editingMedia, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded-sm text-sky-600"
              />
              <label htmlFor="editFeaturedCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Öne Çıkan Kare / Video Olarak Göster
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditingMedia(null)}>
                Vazgeç
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Güncelle
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 3: DELETE CONFIRMATION --- */}
      {deletingMediaId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
              <Trash2 className="w-5 h-5" />
              <span>Medyayı Sil</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Bu medya TEKNOFEST Köşesi'nden ve sunucu depolamasından kalıcı olarak silinecektir. Emin misiniz?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeletingMediaId(null)}>
                Vazgeç
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => handleDeleteMedia(deletingMediaId)}
              >
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: LIGHTBOX PREVIEW --- */}
      {previewMedia && (
        <div 
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/50">
              {previewMedia.mediaType === "VIDEO" ? (
                <video src={previewMedia.mediaUrl} controls autoPlay className="max-w-full max-h-[75vh] object-contain rounded-xl" />
              ) : (
                <img src={previewMedia.mediaUrl} alt={previewMedia.title || "Görsel"} className="max-w-full max-h-[75vh] object-contain rounded-xl" />
              )}
            </div>

            <div className="w-full mt-3 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">{previewMedia.title}</h4>
                <p className="text-xs text-slate-300">{previewMedia.credit}</p>
              </div>
              <Badge variant="neutral" className="bg-white/20 text-white">
                {previewMedia.categoryName || "Genel"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: REJECTION REASON MODAL --- */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>İçeriği Reddet</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Kullanıcıya bildirilmek üzere red sebebi yazabilirsiniz (isteğe bağlı):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Örn: Görsel kalitesi düşük veya TEKNOFEST ile ilişkisiz içerik."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              rows={3}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectingItem(null)}>
                Vazgeç
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => handleReviewSubmission(rejectingItem.id, rejectingItem.type, "REJECT", rejectionReason)}
              >
                Reddi Onayla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: EVENT CREATE/EDIT MODAL --- */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveEvent} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl my-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingEvent ? "TEKNOFEST Etkinliğini Düzenle" : "Yeni TEKNOFEST Etkinliği Oluştur"}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Yıl / Slug (URL)*</label>
                <input
                  type="text"
                  required
                  placeholder="2026"
                  value={eventForm.slug}
                  onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Başlık*</label>
                <input
                  type="text"
                  required
                  placeholder="TEKNOFEST 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tema / Slogan</label>
              <input
                type="text"
                placeholder="Milli Teknoloji Hamlesi & Geleceğin Gençleri"
                value={eventForm.theme}
                onChange={(e) => setEventForm({ ...eventForm, theme: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Konum*</label>
              <input
                type="text"
                required
                placeholder="Şanlıurfa — GAP Havalimanı"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Başlangıç Tarihi*</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Bitiş Tarihi*</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Durum</label>
              <select
                value={eventForm.status}
                onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1 font-semibold"
              >
                <option value="COMPLETED">Tamamlandı (Arşiv Modu)</option>
                <option value="ACTIVE">Canlı / Aktif</option>
                <option value="UPCOMING">Yakında</option>
                <option value="ARCHIVED">Arşiv</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Açıklama*</label>
              <textarea
                required
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                rows={3}
              />
            </div>

            {/* Event Cover Image Upload */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Etkinlik Kapak Görseli (Hero Alanı)
              </label>

              {eventForm.coverImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-16/9 bg-slate-900 group">
                  <img
                    src={eventForm.coverImageUrl}
                    alt="Event Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => eventCoverInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold hover:bg-white transition-colors"
                    >
                      Değiştir
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventForm(prev => ({ ...prev, coverImageUrl: "" }))}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => eventCoverInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-1.5">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Cihazdan Kapak Görseli Seçin
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    JPG, PNG, WEBP (Maks. 15MB)
                  </p>
                </div>
              )}

              <input
                ref={eventCoverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleEventCoverUpload(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
                className="hidden"
              />

              {eventCoverUploading && (
                <div className="space-y-1 mt-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-150"
                      style={{ width: `${eventCoverProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-sky-600 font-semibold">
                    Kapak görseli yükleniyor (%{eventCoverProgress})...
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowEventModal(false)}>
                Vazgeç
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Kaydet
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 7: TIMELINE MODAL --- */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddTimelineItem} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Zaman Tüneli Ögesi Ekle
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tarih Etiketi*</label>
                <input
                  type="text"
                  required
                  placeholder="30 Eylül"
                  value={timelineForm.dateLabel}
                  onChange={(e) => setTimelineForm({ ...timelineForm, dateLabel: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Sıra No</label>
                <input
                  type="number"
                  value={timelineForm.sortOrder}
                  onChange={(e) => setTimelineForm({ ...timelineForm, sortOrder: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Başlık*</label>
              <input
                type="text"
                required
                placeholder="Büyük Açılış Günü"
                value={timelineForm.title}
                onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Açıklama</label>
              <textarea
                value={timelineForm.description}
                onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowTimelineModal(false)}>
                Vazgeç
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Ekle
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
