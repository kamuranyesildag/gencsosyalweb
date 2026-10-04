import React, { useState, useEffect } from "react";
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
  Search
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { toast } from "../ui/Toast";

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

export function AdminTeknofest() {
  const [activeTab, setActiveTab] = useState<"moderation" | "events" | "media" | "timeline">("moderation");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<TeknofestEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [rejectingItem, setRejectingItem] = useState<{ id: number; type: "MEDIA" | "MEMORY" } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TeknofestEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    slug: "",
    title: "",
    theme: "",
    description: "",
    location: "İstanbul — Atatürk Havalimanı",
    startDate: "2026-09-30T09:00",
    endDate: "2026-10-04T19:00",
    status: "COMPLETED" as "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED",
    coverImageUrl: ""
  });

  // Direct Media Add state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    mediaType: "IMAGE" as "IMAGE" | "VIDEO",
    mediaUrl: "",
    title: "",
    caption: "",
    credit: "📷 Genç Sosyal",
    altText: "",
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

  const loadEvents = async () => {
    try {
      const res = await fetch("/api/v1/teknofest/events");
      const json = await res.json();
      if (json.success) {
        setEvents(json.data || []);
        if (json.data?.length > 0 && !selectedEventId) {
          setSelectedEventId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/teknofest/admin/submissions?status=${submissionFilter}`);
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
    if (activeTab === "moderation") {
      loadSubmissions();
    }
  }, [activeTab, submissionFilter]);

  const handleReviewSubmission = async (id: number, type: "MEDIA" | "MEMORY", action: "APPROVE" | "REJECT", reason?: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/v1/teknofest/admin/submissions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          action,
          rejectionReason: reason || undefined
        })
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
        toast.error(json.error || "İşlem başarısız");
      }
    } catch (e) {
      toast.error("Sunucu hatası");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.slug || !eventForm.title || !eventForm.description) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    try {
      const url = editingEvent 
        ? `/api/v1/teknofest/admin/events/${editingEvent.id}` 
        : `/api/v1/teknofest/admin/events`;
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingEvent ? "Etkinlik güncellendi" : "Yeni etkinlik oluşturuldu");
        setShowEventModal(false);
        setEditingEvent(null);
        loadEvents();
      } else {
        toast.error(json.error || "İşlem başarısız");
      }
    } catch (err) {
      toast.error("Sunucu hatası");
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !mediaForm.mediaUrl) {
      toast.error("Lütfen etkinlik ve görsel URL girin");
      return;
    }

    try {
      const res = await fetch("/api/v1/teknofest/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          ...mediaForm
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Medya başarıyla eklendi");
        setShowMediaModal(false);
        setMediaForm({
          mediaType: "IMAGE",
          mediaUrl: "",
          title: "",
          caption: "",
          credit: "📷 Genç Sosyal",
          altText: "",
          aspectRatio: "4:3",
          isFeatured: true
        });
      } else {
        toast.error(json.error || "Medya eklenemedi");
      }
    } catch (err) {
      toast.error("Sunucu hatası");
    }
  };

  const handleAddTimelineItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !timelineForm.dateLabel || !timelineForm.title) {
      toast.error("Zorunlu alanları doldurun");
      return;
    }

    try {
      const res = await fetch("/api/v1/teknofest/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          ...timelineForm
        })
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
        toast.error(json.error || "Öge eklenemedi");
      }
    } catch (err) {
      toast.error("Sunucu hatası");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              TEKNOFEST Köşesi Yönetimi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Etkinlik arşivi, fotoğraf moderasyonu, zaman tüneli ve kullanıcı anıları
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === "moderation") loadSubmissions();
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
              setEditingEvent(null);
              setEventForm({
                slug: "2027",
                title: "TEKNOFEST 2027",
                theme: "Geleceğin Teknolojileri",
                description: "Geleceğin teknolojileri ve havacılık festivali.",
                location: "İstanbul",
                startDate: "2027-09-30T09:00",
                endDate: "2027-10-04T19:00",
                status: "UPCOMING",
                coverImageUrl: ""
              });
              setShowEventModal(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Yeni Etkinlik Ekle
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "moderation"
              ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Moderasyon Kuyruğu
          {submissions.filter(s => s.moderationStatus === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {submissions.filter(s => s.moderationStatus === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "events"
              ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Etkinlikler ({events.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "media"
              ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Camera className="w-4 h-4" />
          Medya & Fotoğraflar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "timeline"
              ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          Zaman Tüneli
        </button>
      </div>

      {/* 1. MODERATION TAB */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSubmissionFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    submissionFilter === filter
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {filter === "PENDING" && "🟡 Bekleyenler"}
                  {filter === "APPROVED" && "🟢 Onaylananlar"}
                  {filter === "REJECTED" && "🔴 Reddedilenler"}
                  {filter === "ALL" && "Tümü"}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Toplam {submissions.length} içerik listeleniyor
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Yükleniyor...</div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Bu filtrede incelenecek içerik bulunmuyor
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-xs"
                >
                  {item.mediaUrl && (
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <img
                        src={item.mediaUrl}
                        alt={item.title || "TEKNOFEST İçeriği"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-black/60 text-white border-0 text-[10px]">
                          {item.mediaType === "VIDEO" ? "🎥 Video" : "📸 Fotoğraf"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                          {item.eventTitle}
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
                          {item.moderationStatus === "APPROVED" && "Yayında"}
                          {item.moderationStatus === "REJECTED" && "Reddedildi"}
                          {item.moderationStatus === "PENDING" && "İnceleme Bekliyor"}
                        </Badge>
                      </div>

                      {item.title && (
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {item.title}
                        </h4>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3 leading-relaxed">
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

      {/* 2. EVENTS TAB */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      Yıl: {ev.slug}
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
                    <span>
                      {new Date(ev.startDate).toLocaleDateString("tr-TR")} – {new Date(ev.endDate).toLocaleDateString("tr-TR")}
                    </span>
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
                        location: ev.location,
                        startDate: ev.startDate.split("T")[0] + "T09:00",
                        endDate: ev.endDate.split("T")[0] + "T19:00",
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

      {/* 3. DIRECT MEDIA MANAGEMENT TAB */}
      {activeTab === "media" && (
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
              onClick={() => setShowMediaModal(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Fotoğraf / Video Ekle
            </Button>
          </div>

          <p className="text-xs text-slate-500 italic">
            Eklediğiniz medya içerikleri doğrudan onaylı statüde yayına alınacaktır.
          </p>
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

      {/* REJECTION REASON MODAL */}
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

      {/* EVENT CREATE/EDIT MODAL */}
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
                  placeholder="2027"
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
                  placeholder="TEKNOFEST 2027"
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
                placeholder="Geleceğin Teknolojileri ve Havacılık"
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
                placeholder="İstanbul — Atatürk Havalimanı"
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

      {/* DIRECT MEDIA MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddMedia} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Galeriye Medya Ekle
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Medya Türü</label>
              <select
                value={mediaForm.mediaType}
                onChange={(e) => setMediaForm({ ...mediaForm, mediaType: e.target.value as any })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              >
                <option value="IMAGE">📸 Fotoğraf</option>
                <option value="VIDEO">🎥 Video</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Görsel / Medya URL*</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={mediaForm.mediaUrl}
                onChange={(e) => setMediaForm({ ...mediaForm, mediaUrl: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Başlık</label>
              <input
                type="text"
                placeholder="SoloTürk Gösterisi"
                value={mediaForm.title}
                onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Fotoğraf Kredisi</label>
              <input
                type="text"
                placeholder="📷 @ahmet veya 📷 Genç Sosyal"
                value={mediaForm.credit}
                onChange={(e) => setMediaForm({ ...mediaForm, credit: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Açıklama</label>
              <textarea
                value={mediaForm.caption}
                onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mt-1"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeaturedCheck"
                checked={mediaForm.isFeatured}
                onChange={(e) => setMediaForm({ ...mediaForm, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded-sm text-sky-600"
              />
              <label htmlFor="isFeaturedCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Öne Çıkan Kare Olarak İşaretle
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowMediaModal(false)}>
                Vazgeç
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Ekle ve Yayınla
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TIMELINE MODAL */}
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
