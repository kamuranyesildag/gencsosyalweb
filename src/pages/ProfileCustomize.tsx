import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Undo2,
  Redo2,
  Eye,
  SlidersHorizontal,
  Sparkles,
  User,
  Image as ImageIcon,
  Palette,
  Type,
  Layout,
  Link2,
  Upload,
  Trash2,
  Plus,
  Check,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "../context/useAuth";
import { useSEO } from "../hooks/useSEO";
import { api } from "../lib/api";
import { showToast } from "../components/ui/Toast";
import { useConfirmStore } from "../components/ui/ConfirmDialog";
import {
  ProfileCustomizationConfig,
  DEFAULT_PROFILE_CUSTOMIZATION,
  COLOR_THEME_PRESETS,
  FONT_FAMILY_OPTIONS,
  CARD_STYLE_PRESETS,
  AVATAR_FRAME_OPTIONS,
  BACKGROUND_PATTERNS,
  TEXT_TRANSFORM_OPTIONS,
  STUDIO_THEME_TEMPLATES,
  SOCIAL_PLATFORM_OPTIONS,
  normalizeProfileCustomization,
  applySpecialTextTransform,
  getProfileCustomizationStyles,
  isColorDark,
  isSafeHttpUrl,
  BackgroundType,
  ThemePresetId,
  HeaderLayoutId,
  ButtonStyleId,
  CoverHeightId,
  AvatarShapeId,
  SocialPlatformId,
  ProfileSocialLink,
} from "../lib/profileCustomization";
import {
  ProfileLivePreview,
  StudioProfileSnapshot,
  SocialPlatformIcon,
} from "../components/profile/ProfileLivePreview";

type StudioSection =
  | "templates"
  | "identity"
  | "background"
  | "colors"
  | "typography"
  | "layout"
  | "links";

const STUDIO_TABS: Array<{
  id: StudioSection;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: "templates", label: "Temalar", icon: Sparkles },
  { id: "identity", label: "Kimlik & Medya", icon: User },
  { id: "background", label: "Arka Plan", icon: ImageIcon },
  { id: "colors", label: "Renkler", icon: Palette },
  { id: "typography", label: "Tipografi", icon: Type },
  { id: "layout", label: "Düzen & Kartlar", icon: Layout },
  { id: "links", label: "Bağlantılar", icon: Link2 },
];

const QUICK_GRADIENTS: Array<{ name: string; start: string; end: string }> = [
  { name: "Buz Mavisi", start: "#EFF6FF", end: "#DBEAFE" },
  { name: "Gece Yarısı", start: "#0B1120", end: "#1E293B" },
  { name: "Yumuşak Lavanta", start: "#F5F3FF", end: "#EDE9FE" },
  { name: "Zümrüt Ferah", start: "#ECFDF5", end: "#D1FAE5" },
  { name: "Gün Batımı", start: "#FFF7ED", end: "#FFE4E6" },
  { name: "Derin Okyanus", start: "#0F172A", end: "#1E3A8A" },
];

interface StudioDraftState {
  config: ProfileCustomizationConfig;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl: string;
  coverUrl: string;
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
          checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export function ProfileCustomize() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { showConfirm } = useConfirmStore();

  useSEO({
    title: "Profil Stüdyosu — Profilini Özelleştir | Genç Sosyal",
    description:
      "Profilinin temasını, arka planını, renklerini, yazı tipini, kapak ve avatar çerçevesini mobil uyumlu canlı önizleme ile özelleştir.",
    canonicalPath: "/profile/customize",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Active tab & mobile mode
  const [activeTab, setActiveTab] = useState<StudioSection>("templates");
  const [mobileMode, setMobileMode] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  // Profile static stats
  const [profileMeta, setProfileMeta] = useState<{
    username: string;
    isVerified: boolean;
    createdAt: string | null;
    postsCount: number;
    projectsCount: number;
    followersCount: number;
    followingCount: number;
  }>({
    username: user?.username || "",
    isVerified: Boolean(user?.isVerified),
    createdAt: user?.createdAt || null,
    postsCount: 0,
    projectsCount: 0,
    followersCount: 0,
    followingCount: 0,
  });

  // Draft & Saved Snapshot for dirty check + Undo/Redo
  const [draft, setDraft] = useState<StudioDraftState>({
    config: normalizeProfileCustomization(null),
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
  });
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");
  const [history, setHistory] = useState<StudioDraftState[]>([]);
  const [future, setFuture] = useState<StudioDraftState[]>([]);

  // Uploads & Interactive states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [textTestInput, setTextTestInput] = useState("");
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatformId>("github");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [newSocialLabel, setNewSocialLabel] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial profile customization snapshot
  useEffect(() => {
    let active = true;
    const loadStudio = async () => {
      setLoading(true);
      try {
        const res = await api.get<{
          username: string;
          displayName: string;
          bio: string;
          location: string;
          website: string;
          isVerified: boolean;
          createdAt: string | null;
          followersCount: number;
          followingCount: number;
          postsCount: number;
          projectsCount: number;
          profileCustomization: Partial<ProfileCustomizationConfig>;
          coverUrl: string | null;
          avatarUrl: string | null;
        }>("/users/me/customization");

        if (!active) return;

        const data = res?.data?.data;
        if (data) {
          const initialDraft: StudioDraftState = {
            config: normalizeProfileCustomization(data.profileCustomization),
            displayName: data.displayName || "",
            bio: data.bio || "",
            location: data.location || "",
            website: data.website || "",
            avatarUrl: data.avatarUrl || "",
            coverUrl: data.coverUrl || "",
          };
          setDraft(initialDraft);
          setSavedSnapshot(JSON.stringify(initialDraft));
          setProfileMeta({
            username: data.username || user?.username || "",
            isVerified: Boolean(data.isVerified),
            createdAt: data.createdAt || null,
            postsCount: data.postsCount || 0,
            projectsCount: data.projectsCount || 0,
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
          });
          setTextTestInput(data.bio || data.displayName || data.username || "");
        }
      } catch (err: any) {
        showToast({
          title: err?.response?.data?.error?.message || err?.message || "Profil ayarları yüklenemedi",
          type: "error",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStudio();
    return () => {
      active = false;
    };
  }, [user?.username]);

  const isDirty = useMemo(() => {
    if (!savedSnapshot) return false;
    return JSON.stringify(draft) !== savedSnapshot;
  }, [draft, savedSnapshot]);

  // Warn browser close when unsaved
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Immutable state updater with Undo/Redo history (max 30 steps)
  const commitDraft = useCallback(
    (updater: (prev: StudioDraftState) => StudioDraftState) => {
      setDraft((prev) => {
        const next = updater(prev);
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
        setHistory((h) => [...h.slice(-29), prev]);
        setFuture([]);
        return next;
      });
    },
    []
  );

  const updateConfig = useCallback(
    <K extends keyof ProfileCustomizationConfig>(key: K, value: ProfileCustomizationConfig[K]) => {
      commitDraft((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [key]: value,
        },
      }));
    },
    [commitDraft]
  );

  const patchConfig = useCallback(
    (patch: Partial<ProfileCustomizationConfig>) => {
      commitDraft((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          ...patch,
        },
      }));
    },
    [commitDraft]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [draft, ...f.slice(0, 29)]);
    setDraft(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h.slice(-29), draft]);
    setDraft(next);
  };

  const applyThemePreset = (presetId: ThemePresetId) => {
    const preset = COLOR_THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    patchConfig({
      themePreset: preset.id,
      primaryAccent: preset.primaryAccent,
      secondaryAccent: preset.secondaryAccent,
      linkColor: preset.linkColor,
      buttonColor: preset.buttonColor,
      cardBgColor: preset.cardBgColor,
      borderColor: preset.borderColor,
      avatarFrameColor: preset.primaryAccent,
      bgGradientStart: preset.bgGradientStart,
      bgGradientEnd: preset.bgGradientEnd,
    });
  };

  const handleFixContrast = () => {
    const darkCard = isColorDark(draft.config.cardBgColor);
    patchConfig({
      highContrastText: true,
      linkColor: darkCard ? "#38BDF8" : "#1D4ED8",
      primaryAccent: darkCard ? "#38BDF8" : "#185EDB",
      buttonColor: darkCard ? "#38BDF8" : "#0F172A",
    });
    showToast({ title: "Metin ve bağlantı kontrastı optimize edildi", type: "success" });
  };

  const validateAndUploadImage = async (
    file: File,
    onSuccess: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast({
        title: "Yalnızca JPG, PNG veya WEBP görselleri yüklenebilir.",
        type: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({
        title: "Görsel boyutu en fazla 5 MB olabilir.",
        type: "error",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<{ url?: string }>("/media/upload", formData);
      const uploadedUrl = (res as any)?.data?.data?.url || (res as any)?.data?.url || (res as any)?.url;
      if (!uploadedUrl) {
        throw new Error("Görsel adresi alınamadı.");
      }
      onSuccess(uploadedUrl);
      showToast({ title: "Görsel yüklendi ve önizlemeye uygulandı", type: "success" });
    } catch (err: any) {
      showToast({
        title: err?.response?.data?.error?.message || err?.message || "Görsel yüklenirken bir hata oluştu",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = draft.displayName.trim();
    if (trimmedName.length > 0 && trimmedName.length < 2) {
      showToast({ title: "Görünen ad en az 2 karakter olmalıdır.", type: "error" });
      setActiveTab("identity");
      return;
    }

    if (draft.website.trim() && !isSafeHttpUrl(draft.website.trim())) {
      showToast({ title: "Web sitesi geçerli bir https:// bağlantısı olmalıdır.", type: "error" });
      setActiveTab("identity");
      return;
    }

    if (
      draft.config.featuredHighlight.url.trim() &&
      !isSafeHttpUrl(draft.config.featuredHighlight.url.trim())
    ) {
      showToast({ title: "Vitrin bağlantısı geçerli bir https:// adresi olmalıdır.", type: "error" });
      setActiveTab("links");
      return;
    }

    setSaving(true);
    try {
      const cleanConfig: ProfileCustomizationConfig = {
        ...draft.config,
        compactHeader: draft.config.coverHeight === "compact",
      };

      await api.put("/users/me/customization", {
        customization: cleanConfig,
        coverUrl: draft.coverUrl,
        avatarUrl: draft.avatarUrl,
        displayName: trimmedName || undefined,
        bio: draft.bio.trim(),
        location: draft.location.trim(),
        website: draft.website.trim(),
      });

      const nextSaved: StudioDraftState = {
        ...draft,
        config: cleanConfig,
        displayName: trimmedName,
        bio: draft.bio.trim(),
        location: draft.location.trim(),
        website: draft.website.trim(),
      };
      setDraft(nextSaved);
      setSavedSnapshot(JSON.stringify(nextSaved));

      if (user) {
        setUser({
          ...user,
          displayName: trimmedName || user.displayName,
          bio: nextSaved.bio,
          location: nextSaved.location,
          website: nextSaved.website,
          avatarUrl: nextSaved.avatarUrl || null,
          coverUrl: nextSaved.coverUrl || null,
        });
      }

      showToast({ title: "Profil özelleştirmeleriniz kaydedildi", type: "success" });
    } catch (err: any) {
      showToast({
        title: err?.response?.data?.error?.message || err?.message || "Değişiklikler kaydedilemedi",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    showConfirm(
      {
        title: "Varsayılan Tasarıma Sıfırla",
        message:
          "Profilinizin tüm görsel tema, renk, yazı tipi ve kart ayarları varsayılan Genç Sosyal görünümüne döndürülecek. Devam etmek istiyor musunuz?",
        confirmLabel: "Sıfırla",
        cancelLabel: "Vazgeç",
        variant: "warning",
      },
      "",
      async () => {
        setResetting(true);
        try {
          await api.delete("/users/me/customization");
          const freshConfig = normalizeProfileCustomization(DEFAULT_PROFILE_CUSTOMIZATION);
          const nextState: StudioDraftState = {
            ...draft,
            config: freshConfig,
          };
          setDraft(nextState);
          setSavedSnapshot(JSON.stringify(nextState));
          setHistory([]);
          setFuture([]);
          showToast({ title: "Profil varsayılan görünüme döndürüldü", type: "success" });
        } catch (err: any) {
          showToast({ title: err?.message || "Sıfırlama başarısız", type: "error" });
        } finally {
          setResetting(false);
        }
      }
    );
  };

  const handleNavigateBack = () => {
    const target = profileMeta.username ? `/profile/${profileMeta.username}` : "/home";
    if (!isDirty) {
      navigate(target);
      return;
    }
    showConfirm(
      {
        title: "Kaydedilmemiş Değişiklikler",
        message: "Yaptığınız profil özelleştirmeleri henüz kaydedilmedi. Çıkmak istediğinize emin misiniz?",
        confirmLabel: "Kaydetmeden Çık",
        cancelLabel: "Düzenlemeye Dön",
        variant: "warning",
      },
      "",
      () => navigate(target)
    );
  };

  // Social Links Handlers
  const handleAddSocialLink = () => {
    const trimmedUrl = newSocialUrl.trim();
    if (!isSafeHttpUrl(trimmedUrl)) {
      showToast({ title: "Lütfen https:// ile başlayan geçerli bir bağlantı girin.", type: "error" });
      return;
    }
    if (draft.config.socialLinks.length >= 6) {
      showToast({ title: "En fazla 6 sosyal bağlantı ekleyebilirsiniz.", type: "error" });
      return;
    }
    const nextItem: ProfileSocialLink = {
      platform: newSocialPlatform,
      url: trimmedUrl,
      label: newSocialLabel.trim(),
    };
    updateConfig("socialLinks", [...draft.config.socialLinks, nextItem]);
    setNewSocialUrl("");
    setNewSocialLabel("");
  };

  const handleRemoveSocialLink = (index: number) => {
    updateConfig(
      "socialLinks",
      draft.config.socialLinks.filter((_, idx) => idx !== index)
    );
  };

  const handleMoveSocialLink = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.config.socialLinks.length) return;
    const copy = [...draft.config.socialLinks];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    updateConfig("socialLinks", copy);
  };

  const previewProfile: StudioProfileSnapshot = {
    username: profileMeta.username,
    displayName: draft.displayName,
    bio: draft.bio,
    location: draft.location,
    website: draft.website,
    avatarUrl: draft.avatarUrl,
    coverUrl: draft.coverUrl,
    isVerified: profileMeta.isVerified,
    createdAt: profileMeta.createdAt,
    postsCount: profileMeta.postsCount,
    projectsCount: profileMeta.projectsCount,
    followersCount: profileMeta.followersCount,
    followingCount: profileMeta.followingCount,
  };

  const computedPreviewStyles = getProfileCustomizationStyles(draft.config);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080E1A] flex flex-col">
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1526] px-4 flex items-center justify-between">
          <div className="h-6 w-36 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-12 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
            <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
            <div className="h-48 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
          </div>
          <div className="hidden lg:block lg:col-span-5">
            <div className="h-[520px] rounded-3xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080E1A] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* 1. COMPACT STICKY TOP BAR (56px) */}
      <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-[#0B1222]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleNavigateBack}
            aria-label="Profile dön"
            className="min-w-[44px] min-h-[44px] -ml-1.5 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Profil Stüdyosu
              </h1>
              {isDirty && (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap hidden sm:inline">
                  · Kaydedilmedi
                </span>
              )}
            </div>
            {profileMeta.username && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                @{profileMeta.username}
              </p>
            )}
          </div>
        </div>

        {/* Center/Right: Undo/Redo + Desktop Save */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            disabled={history.length === 0}
            onClick={handleUndo}
            aria-label="Geri Al"
            title="Geri Al"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={future.length === 0}
            onClick={handleRedo}
            aria-label="İleri Al"
            title="İleri Al"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {profileMeta.username && (
            <button
              type="button"
              onClick={() => navigate(`/profile/${profileMeta.username}`)}
              className="hidden md:inline-flex min-h-[40px] items-center gap-1.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Profili Gör</span>
            </button>
          )}

          <button
            type="button"
            disabled={saving || !isDirty}
            onClick={handleSave}
            className="hidden lg:inline-flex min-h-[40px] items-center gap-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Kaydediliyor..." : isDirty ? "Değişiklikleri Kaydet" : "Kaydedildi"}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-24 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: EDITOR CONTROLS */}
          <div
            className={`lg:col-span-7 space-y-5 ${
              mobileMode === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Horizontal Category Tabs (Not fixed -> keeps sticky < 15% on mobile) */}
            <nav
              aria-label="Özelleştirme kategorileri"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar"
            >
              {STUDIO_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[44px] px-3.5 rounded-xl text-xs sm:text-[13px] font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-2 border transition-colors cursor-pointer ${
                      active
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs"
                        : "bg-white dark:bg-[#111B2E] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* SECTION 1: TEMPLATES */}
            {activeTab === "templates" && (
              <div className="space-y-5">
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Hazır Stüdyo Temaları
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Tek dokunuşla uyumlu arka plan, renk paleti, yazı tipi ve kart stilini uygulayın; ardından dilediğiniz detayı değiştirin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STUDIO_THEME_TEMPLATES.map((tpl) => {
                      const isMatch =
                        draft.config.primaryAccent === tpl.patch.primaryAccent &&
                        draft.config.cardBgColor === tpl.patch.cardBgColor &&
                        draft.config.fontFamily === tpl.patch.fontFamily &&
                        draft.config.headerLayout === tpl.patch.headerLayout;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            patchConfig(tpl.patch);
                            showToast({ title: `${tpl.name} teması uygulandı`, type: "success" });
                          }}
                          className={`group rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                            isMatch
                              ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                          }`}
                        >
                          {/* Mini visual swatch */}
                          <div
                            className="h-16 rounded-xl p-2.5 flex items-end justify-between mb-3 border border-black/10"
                            style={{ background: tpl.previewBg }}
                          >
                            <div
                              className="w-2/3 h-8 rounded-lg px-2 flex items-center gap-2 shadow-xs border border-black/5"
                              style={{ backgroundColor: tpl.previewCard }}
                            >
                              <span
                                className="w-4 h-4 rounded-full shrink-0"
                                style={{ backgroundColor: tpl.previewAccent }}
                              />
                              <span
                                className="h-2 w-14 rounded-full opacity-35"
                                style={{
                                  backgroundColor: isColorDark(tpl.previewCard) ? "#FFFFFF" : "#0F172A",
                                }}
                              />
                            </div>
                            {isMatch && (
                              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {tpl.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {tpl.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Reset Section */}
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Varsayılan Tasarıma Dön
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tüm özel renk, arka plan ve kart ayarlarını sıfırlayarak standart Genç Sosyal görünümüne geçin.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={resetting || saving}
                    onClick={handleResetToDefault}
                    className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {resetting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    <span>Varsayılana Sıfırla</span>
                  </button>
                </section>
              </div>
            )}

            {/* SECTION 2: IDENTITY & MEDIA */}
            {activeTab === "identity" && (
              <div className="space-y-5">
                {/* Avatar & Cover Media */}
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Profil & Kapak Görselleri
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Profil fotoğrafınızı, kapak görselinizi ve çerçeve stilinizi tek yerden yönetin.
                    </p>
                  </div>

                  {/* Avatar Upload Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0"
                        style={computedPreviewStyles.avatarFrameStyle}
                      >
                        {draft.avatarUrl ? (
                          <img
                            src={draft.avatarUrl}
                            alt="Profil fotoğrafı"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-[inherit]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-300">
                            {(profileMeta.username || "U")[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Profil Fotoğrafı
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          JPG, PNG veya WEBP · Maksimum 5 MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            validateAndUploadImage(
                              file,
                              (url) => commitDraft((prev) => ({ ...prev, avatarUrl: url })),
                              setUploadingAvatar
                            );
                          }
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                        className="min-h-[42px] px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Değiştir</span>
                      </button>
                      {draft.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => commitDraft((prev) => ({ ...prev, avatarUrl: "" }))}
                          aria-label="Profil fotoğrafını kaldır"
                          className="min-h-[42px] min-w-[42px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Avatar Shape */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Profil Fotoğrafı Şekli
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { id: "circle", label: "Daire" },
                          { id: "rounded", label: "Yumuşak Kare" },
                          { id: "squircle", label: "Kavisli" },
                          { id: "square", label: "Köşeli" },
                        ] as Array<{ id: AvatarShapeId; label: string }>
                      ).map((shape) => (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => updateConfig("avatarShape", shape.id)}
                          className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            draft.config.avatarShape === shape.id
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                              : "bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {shape.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Frame */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Avatar Çerçeve Stili
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {AVATAR_FRAME_OPTIONS.map((frame) => (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() => updateConfig("avatarFrame", frame.id)}
                          className={`min-h-[56px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            draft.config.avatarFrame === frame.id
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/15"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {frame.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {frame.description}
                          </div>
                        </button>
                      ))}
                    </div>

                    {draft.config.avatarFrame !== "none" && (
                      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 mt-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            Çerçeve Rengi
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">{draft.config.avatarFrameColor}</p>
                        </div>
                        <input
                          type="color"
                          value={draft.config.avatarFrameColor}
                          onChange={(e) => updateConfig("avatarFrameColor", e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Cover Image Controls */}
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Kapak Görseli
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Kapak fotoğrafı yükleyin, konumunu ve yüksekliğini ayarlayın.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              validateAndUploadImage(
                                file,
                                (url) => commitDraft((prev) => ({ ...prev, coverUrl: url })),
                                setUploadingCover
                              );
                            }
                            e.target.value = "";
                          }}
                        />
                        <button
                          type="button"
                          disabled={uploadingCover}
                          onClick={() => coverInputRef.current?.click()}
                          className="min-h-[42px] px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                          {uploadingCover ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>Kapak Yükle</span>
                        </button>
                        {draft.coverUrl && (
                          <button
                            type="button"
                            onClick={() => commitDraft((prev) => ({ ...prev, coverUrl: "" }))}
                            aria-label="Kapak görselini kaldır"
                            className="min-h-[42px] min-w-[42px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Kapak Hizalaması
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { id: "top", label: "Üst" },
                              { id: "center", label: "Orta" },
                              { id: "bottom", label: "Alt" },
                            ] as const
                          ).map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => updateConfig("coverPosition", pos.id)}
                              className={`min-h-[42px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                                draft.config.coverPosition === pos.id
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                                  : "bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Kapak Yüksekliği
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { id: "compact", label: "Kompakt" },
                              { id: "normal", label: "Standart" },
                              { id: "tall", label: "Geniş" },
                            ] as Array<{ id: CoverHeightId; label: string }>
                          ).map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() =>
                                patchConfig({
                                  coverHeight: h.id,
                                  compactHeader: h.id === "compact",
                                })
                              }
                              className={`min-h-[42px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                                draft.config.coverHeight === h.id
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                                  : "bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                              }`}
                            >
                              {h.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        <span>Kapak Karartma Katmanı</span>
                        <span>%{draft.config.coverOverlayOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={70}
                        value={draft.config.coverOverlayOpacity}
                        onChange={(e) => updateConfig("coverOverlayOpacity", Number(e.target.value))}
                        className="w-full h-2 accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </section>

                {/* Identity Info Form */}
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Profil Bilgileri
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Profil kartınızda görünen temel metinleri doğrudan buradan güncelleyebilirsiniz.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Görünen Ad
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={draft.displayName}
                        onChange={(e) => commitDraft((prev) => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Adınız ve soyadınız"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <label>Kısa Durum / Motto</label>
                        <span className="text-slate-400 font-normal tabular-nums">
                          {draft.config.statusText.length}/60
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={60}
                        value={draft.config.statusText}
                        onChange={(e) => updateConfig("statusText", e.target.value)}
                        placeholder="Kısa bir durum cümlesi"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <label>Biyografi</label>
                      <span className="text-slate-400 font-normal tabular-nums">{draft.bio.length}/500</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={draft.bio}
                      onChange={(e) => commitDraft((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Kendinizden ve ilgi alanlarınızdan bahsedin..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Konum
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={draft.location}
                        onChange={(e) => commitDraft((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="Şehir veya okul"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Web Sitesi
                      </label>
                      <input
                        type="url"
                        maxLength={255}
                        value={draft.website}
                        onChange={(e) => commitDraft((prev) => ({ ...prev, website: e.target.value }))}
                        placeholder="https://"
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* SECTION 3: BACKGROUND */}
            {activeTab === "background" && (
              <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Profil Sayfası Arka Planı
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Arka plan yalnızca sizin profil sayfanızda uygulanır; akış ve diğer sayfalar etkilenmez.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: "default_light", label: "Varsayılan Açık" },
                      { id: "dark", label: "Koyu Zemin" },
                      { id: "solid", label: "Tek Renk" },
                      { id: "gradient", label: "Gradyan" },
                      { id: "pattern_preset", label: "Hazır Desen" },
                      { id: "pattern_geometric", label: "Geometrik" },
                      { id: "pattern_dots", label: "Minimal Nokta" },
                      { id: "pattern_lines", label: "Minimal Çizgi" },
                      { id: "custom_image", label: "Özel Görsel" },
                    ] as Array<{ id: BackgroundType; label: string }>
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const patch: Partial<ProfileCustomizationConfig> = { backgroundType: opt.id };
                        if (opt.id === "pattern_geometric") patch.patternId = "hex_geometric";
                        if (opt.id === "pattern_dots") patch.patternId = "minimal_dots";
                        if (opt.id === "pattern_lines") patch.patternId = "minimal_lines";
                        if (opt.id === "pattern_preset") patch.patternId = "grid_soft";
                        patchConfig(patch);
                      }}
                      className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition-colors cursor-pointer ${
                        draft.config.backgroundType === opt.id
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-sky-300 ring-2 ring-blue-500/15"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Solid or Pattern Base Color */}
                {(draft.config.backgroundType === "solid" ||
                  draft.config.backgroundType.startsWith("pattern_")) && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Zemin Rengi
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={draft.config.bgSolidColor}
                        onChange={(e) => updateConfig("bgSolidColor", e.target.value)}
                        className="w-11 h-11 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={draft.config.bgSolidColor}
                        onChange={(e) => {
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                            updateConfig("bgSolidColor", e.target.value);
                          }
                        }}
                        className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-semibold w-32"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Controls */}
                {draft.config.backgroundType === "gradient" && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Hızlı Gradyan Paletleri
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {QUICK_GRADIENTS.map((g) => (
                          <button
                            key={g.name}
                            type="button"
                            onClick={() =>
                              patchConfig({ bgGradientStart: g.start, bgGradientEnd: g.end })
                            }
                            className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 cursor-pointer"
                          >
                            <span
                              className="w-5 h-5 rounded-full shrink-0 border border-black/10"
                              style={{ background: `linear-gradient(135deg, ${g.start}, ${g.end})` }}
                            />
                            <span className="truncate">{g.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Başlangıç Rengi
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={draft.config.bgGradientStart}
                            onChange={(e) => updateConfig("bgGradientStart", e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-slate-500">
                            {draft.config.bgGradientStart}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Bitiş Rengi
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={draft.config.bgGradientEnd}
                            onChange={(e) => updateConfig("bgGradientEnd", e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <span className="text-xs font-mono text-slate-500">
                            {draft.config.bgGradientEnd}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Geçiş Yönü
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            { id: "135deg", label: "Çapraz 135°" },
                            { id: "to bottom", label: "Dikey" },
                            { id: "to right", label: "Yatay" },
                            { id: "45deg", label: "Ters Çapraz 45°" },
                          ] as const
                        ).map((dir) => (
                          <button
                            key={dir.id}
                            type="button"
                            onClick={() => updateConfig("bgGradientDirection", dir.id)}
                            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                              draft.config.bgGradientDirection === dir.id
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {dir.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pattern Picker */}
                {draft.config.backgroundType.startsWith("pattern_") && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Desen Stili
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BACKGROUND_PATTERNS.map((pat) => (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => updateConfig("patternId", pat.id)}
                            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-colors cursor-pointer ${
                              draft.config.patternId === pat.id
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {pat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        <span>Desen Yoğunluğu</span>
                        <span>%{draft.config.patternOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={60}
                        value={draft.config.patternOpacity}
                        onChange={(e) => updateConfig("patternOpacity", Number(e.target.value))}
                        className="w-full h-2 accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Custom Background Image */}
                {draft.config.backgroundType === "custom_image" && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          Özel Arka Plan Görseli
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          JPG, PNG veya WEBP · Maksimum 5 MB
                        </p>
                      </div>
                      <input
                        ref={bgInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            validateAndUploadImage(
                              file,
                              (url) => updateConfig("bgImageUrl", url),
                              setUploadingBg
                            );
                          }
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingBg}
                        onClick={() => bgInputRef.current?.click()}
                        className="min-h-[42px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {uploadingBg ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Görsel Yükle</span>
                      </button>
                    </div>

                    {draft.config.bgImageUrl && (
                      <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img
                          src={draft.config.bgImageUrl}
                          alt="Arka plan önizleme"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: draft.config.bgImagePosition }}
                        />
                        <button
                          type="button"
                          onClick={() => updateConfig("bgImageUrl", "")}
                          className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                        >
                          Kaldır
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Görsel Konumu
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            { id: "center", label: "Orta" },
                            { id: "top", label: "Üst" },
                            { id: "bottom", label: "Alt" },
                            { id: "left", label: "Sol" },
                            { id: "right", label: "Sağ" },
                          ] as const
                        ).map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => updateConfig("bgImagePosition", pos.id)}
                            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                              draft.config.bgImagePosition === pos.id
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        <span>Karartma Katmanı Yoğunluğu</span>
                        <span>%{draft.config.bgOverlayOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        value={draft.config.bgOverlayOpacity}
                        onChange={(e) => updateConfig("bgOverlayOpacity", Number(e.target.value))}
                        className="w-full h-2 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <ToggleRow
                      title="Okunabilirlik Bulanıklığı"
                      description="Arka plan görseline hafif yumuşatma ekleyerek kart metinlerini öne çıkarır."
                      checked={draft.config.preserveReadability}
                      onChange={(val) => updateConfig("preserveReadability", val)}
                    />
                  </div>
                )}
              </section>
            )}

            {/* SECTION 4: COLORS */}
            {activeTab === "colors" && (
              <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Renk Paleti
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Hazır bir palet seçin veya vurgu, buton, bağlantı ve kart yüzey renklerini ayrı ayrı belirleyin.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COLOR_THEME_PRESETS.map((preset) => {
                    const isSelected = draft.config.themePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyThemePreset(preset.id)}
                        className={`min-h-[50px] p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/15"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-6 h-6 rounded-full shrink-0 border border-black/10"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${preset.primaryAccent}, ${preset.secondaryAccent})`,
                            }}
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    İnce Renk Ayarları
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        { key: "primaryAccent", label: "Ana Vurgu" },
                        { key: "secondaryAccent", label: "İkincil Vurgu" },
                        { key: "linkColor", label: "Bağlantı Rengi" },
                        { key: "buttonColor", label: "Buton Rengi" },
                        { key: "cardBgColor", label: "Kart Zemini" },
                        { key: "borderColor", label: "Kenarlık Rengi" },
                      ] as const
                    ).map((field) => {
                      const val = draft.config[field.key];
                      return (
                        <div
                          key={field.key}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {field.label}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 mt-0.5">{val}</p>
                          </div>
                          <input
                            type="color"
                            value={val}
                            onChange={(e) =>
                              patchConfig({
                                themePreset: "custom",
                                [field.key]: e.target.value,
                              })
                            }
                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 5: TYPOGRAPHY */}
            {activeTab === "typography" && (
              <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Yazı Tipi & Metin Stili
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Profil başlığı ve biyografiniz için yazı tipi ailesini ve biçimlendirmesini belirleyin.
                  </p>
                </div>

                {/* Font Families */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FONT_FAMILY_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => updateConfig("fontFamily", font.id)}
                      style={{ fontFamily: font.cssValue }}
                      className={`min-h-[60px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        draft.config.fontFamily === font.id
                          ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/15"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {font.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {font.description}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Text Formatting Toggles */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Biyografi Biçimlendirmesi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateConfig("fontBold", !draft.config.fontBold)}
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        draft.config.fontBold
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                          : "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      Kalın
                    </button>
                    <button
                      type="button"
                      onClick={() => updateConfig("fontItalic", !draft.config.fontItalic)}
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs italic font-semibold border transition-colors cursor-pointer ${
                        draft.config.fontItalic
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                          : "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      İtalik
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig("letterSpacingWide", !draft.config.letterSpacingWide)
                      }
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs tracking-widest font-semibold border transition-colors cursor-pointer ${
                        draft.config.letterSpacingWide
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                          : "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      Geniş Aralık
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          "textCase",
                          draft.config.textCase === "uppercase" ? "normal" : "uppercase"
                        )
                      }
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs uppercase font-semibold border transition-colors cursor-pointer ${
                        draft.config.textCase === "uppercase"
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                          : "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      BÜYÜK HARF
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          "textCase",
                          draft.config.textCase === "lowercase" ? "normal" : "lowercase"
                        )
                      }
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs lowercase font-semibold border transition-colors cursor-pointer ${
                        draft.config.textCase === "lowercase"
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                          : "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      küçük harf
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          "textDecoration",
                          draft.config.textDecoration === "underline" ? "none" : "underline"
                        )
                      }
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs underline font-semibold border transition-colors cursor-pointer ${
                        draft.config.textDecoration === "underline"
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                          : "bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      Altı Çizili
                    </button>
                  </div>
                </div>

                {/* Special Text Transforms */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Özel Karakter Stilleri
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Orijinal biyografi metniniz korunur; istediğiniz an normal stile dönebilirsiniz.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TEXT_TRANSFORM_OPTIONS.map((opt) => {
                      const isSelected = draft.config.textTransform === opt.id;
                      const previewSample = applySpecialTextTransform(
                        textTestInput.trim() || opt.exampleInput,
                        opt.id
                      );
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateConfig("textTransform", opt.id)}
                          className={`min-h-[68px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/15"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {opt.name}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />}
                          </div>
                          <div className="text-xs font-semibold text-blue-600 dark:text-sky-400 mt-1 truncate">
                            {previewSample}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {draft.config.textTransform !== "none" && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <span>
                        Ekran okuyucu erişilebilirliği için orijinal metniniz otomatik olarak korunur ve ziyaretçiler tek tıkla normal metni görebilir.
                      </span>
                    </div>
                  )}

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    <ToggleRow
                      title="Görünen Ada da Uygula"
                      description="Kullanıcı adınız (@handle) ve doğrulama rozetiniz her zaman standart kalır."
                      checked={draft.config.applyTransformToDisplayName}
                      onChange={(val) => updateConfig("applyTransformToDisplayName", val)}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 6: LAYOUT & CARDS */}
            {activeTab === "layout" && (
              <div className="space-y-5">
                {/* Header Layout & Button Style */}
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Profil Düzeni & Butonlar
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Profil başlığının hizalamasını ve buton görünümünü seçin.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Başlık Düzeni
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(
                        [
                          { id: "classic", label: "Klasik", desc: "Sol hizalı, kapak üzerine oturan avatar" },
                          { id: "centered", label: "Ortalanmış", desc: "Merkezi vitrin ve dengeli simetri" },
                          { id: "editorial", label: "Editoryal", desc: "Kapak altında düzenli yatay başlık" },
                        ] as Array<{ id: HeaderLayoutId; label: string; desc: string }>
                      ).map((lay) => (
                        <button
                          key={lay.id}
                          type="button"
                          onClick={() => updateConfig("headerLayout", lay.id)}
                          className={`min-h-[64px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            draft.config.headerLayout === lay.id
                              ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/15"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {lay.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {lay.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Buton Stili
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { id: "solid", label: "Dolu" },
                          { id: "outline", label: "Çerçeveli" },
                          { id: "soft", label: "Yumuşak" },
                          { id: "pill", label: "Yuvarlatılmış" },
                        ] as Array<{ id: ButtonStyleId; label: string }>
                      ).map((bs) => (
                        <button
                          key={bs.id}
                          type="button"
                          onClick={() => updateConfig("buttonStyle", bs.id)}
                          className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            draft.config.buttonStyle === bs.id
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                              : "bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {bs.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Card Styling & Visibility */}
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Kart Yüzeyi & Görünürlük
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CARD_STYLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          patchConfig({
                            cardStyle: preset.id,
                            cardRadius: preset.radius,
                            cardShadowIntensity: preset.shadowIntensity,
                          })
                        }
                        className={`min-h-[60px] p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          draft.config.cardStyle === preset.id
                            ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/15"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        <span>Köşe Yuvarlaklığı</span>
                        <span>{draft.config.cardRadius} px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={36}
                        value={draft.config.cardRadius}
                        onChange={(e) => updateConfig("cardRadius", Number(e.target.value))}
                        className="w-full h-2 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        <span>Gölge Yoğunluğu</span>
                        <span>%{draft.config.cardShadowIntensity}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={draft.config.cardShadowIntensity}
                        onChange={(e) => updateConfig("cardShadowIntensity", Number(e.target.value))}
                        className="w-full h-2 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        <span>Kart Opaklığı</span>
                        <span>%{draft.config.cardOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min={75}
                        max={100}
                        value={draft.config.cardOpacity}
                        onChange={(e) => updateConfig("cardOpacity", Number(e.target.value))}
                        className="w-full h-2 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        İç Boşluk (Yoğunluk)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { id: "compact", label: "Kompakt" },
                            { id: "normal", label: "Standart" },
                            { id: "spacious", label: "Ferah" },
                          ] as const
                        ).map((pad) => (
                          <button
                            key={pad.id}
                            type="button"
                            onClick={() => updateConfig("cardPadding", pad.id)}
                            className={`min-h-[42px] rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                              draft.config.cardPadding === pad.id
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white"
                                : "bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {pad.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <ToggleRow
                      title="Buzlu Cam Efekti (Glassmorphism)"
                      description="Arka plan desenleri ve görselleri üzerinde yarı saydam bulanık kart yüzeyi oluşturur."
                      checked={draft.config.glassmorphism}
                      onChange={(val) => updateConfig("glassmorphism", val)}
                    />
                    <ToggleRow
                      title="Katılım Tarihini Göster"
                      description="Genç Sosyal'e katıldığınız ay ve yıl bilgisini profil başlığında gösterir."
                      checked={draft.config.showJoinDate}
                      onChange={(val) => updateConfig("showJoinDate", val)}
                    />
                    <ToggleRow
                      title="İstatistik Satırını Göster"
                      description="Gönderi, proje, takipçi ve takip sayılarını profil kartında sergiler."
                      checked={draft.config.showStats}
                      onChange={(val) => updateConfig("showStats", val)}
                    />
                    <ToggleRow
                      title="Otomatik Kontrast Koruması"
                      description="Koyu kart yüzeylerinde metinleri otomatik olarak yüksek okunabilirlikte tutar."
                      checked={draft.config.highContrastText}
                      onChange={(val) => updateConfig("highContrastText", val)}
                    />
                  </div>
                </section>
              </div>
            )}

            {/* SECTION 7: SOCIAL LINKS & SPOTLIGHT */}
            {activeTab === "links" && (
              <div className="space-y-5">
                {/* Social Links */}
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Sosyal Bağlantılar
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Profilinizde doğrudan erişilebilecek en fazla 6 güvenli bağlantı ekleyin.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tabular-nums shrink-0">
                      {draft.config.socialLinks.length}/6
                    </span>
                  </div>

                  {/* Existing Links List */}
                  {draft.config.socialLinks.length > 0 && (
                    <div className="space-y-2">
                      {draft.config.socialLinks.map((item, idx) => (
                        <div
                          key={`${item.platform}-${idx}`}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                              <SocialPlatformIcon platform={item.platform} className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {item.label?.trim() ||
                                  SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === item.platform)?.name ||
                                  item.platform}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {item.url}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSocialLink(idx, -1)}
                              aria-label="Yukarı taşı"
                              className="w-9 h-9 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === draft.config.socialLinks.length - 1}
                              onClick={() => handleMoveSocialLink(idx, 1)}
                              aria-label="Aşağı taşı"
                              className="w-9 h-9 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSocialLink(idx)}
                              aria-label="Bağlantıyı kaldır"
                              className="w-9 h-9 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Social Link */}
                  {draft.config.socialLinks.length < 6 && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Platform
                          </label>
                          <select
                            value={newSocialPlatform}
                            onChange={(e) => setNewSocialPlatform(e.target.value as SocialPlatformId)}
                            className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                          >
                            {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Etiket (İsteğe Bağlı)
                          </label>
                          <input
                            type="text"
                            maxLength={30}
                            value={newSocialLabel}
                            onChange={(e) => setNewSocialLabel(e.target.value)}
                            placeholder="Görünen kısa ad"
                            className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="url"
                          value={newSocialUrl}
                          onChange={(e) => setNewSocialUrl(e.target.value)}
                          placeholder={
                            SOCIAL_PLATFORM_OPTIONS.find((p) => p.id === newSocialPlatform)?.baseHint ||
                            "https://"
                          }
                          className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={handleAddSocialLink}
                          className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 hover:opacity-90 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ekle</span>
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* Featured Spotlight Card */}
                <section className="bg-white dark:bg-[#111B2E] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Öne Çıkan Vitrin Kartı
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Profilinizin üst kısmında sergilemek istediğiniz proje, duyuru veya portfolyo bağlantısını ekleyin. Boş bırakırsanız görünmez.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <label>Kart Başlığı</label>
                      <span className="text-slate-400 font-normal tabular-nums">
                        {draft.config.featuredHighlight.title.length}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={draft.config.featuredHighlight.title}
                      onChange={(e) =>
                        updateConfig("featuredHighlight", {
                          ...draft.config.featuredHighlight,
                          title: e.target.value,
                        })
                      }
                      placeholder="Öne çıkarmak istediğiniz başlık"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <label>Kısa Açıklama</label>
                      <span className="text-slate-400 font-normal tabular-nums">
                        {draft.config.featuredHighlight.subtitle.length}/140
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={140}
                      value={draft.config.featuredHighlight.subtitle}
                      onChange={(e) =>
                        updateConfig("featuredHighlight", {
                          ...draft.config.featuredHighlight,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Ziyaretçiler için kısa açıklama"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Bağlantı Adresi (İsteğe Bağlı)
                    </label>
                    <input
                      type="url"
                      maxLength={255}
                      value={draft.config.featuredHighlight.url}
                      onChange={(e) =>
                        updateConfig("featuredHighlight", {
                          ...draft.config.featuredHighlight,
                          url: e.target.value,
                        })
                      }
                      placeholder="https://"
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </section>

                {/* Security Isolation Notice */}
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/25 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Eklediğiniz tüm bağlantılar ve görseller güvenlik doğrulamasından geçer. Tasarımınız yalnızca kendi profil sayfanızda uygulanır.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY LIVE PREVIEW (Desktop always visible; Mobile full view when preview mode active) */}
          <aside
            className={`lg:col-span-5 lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)] ${
              mobileMode === "preview" ? "block min-h-[70vh]" : "hidden lg:block"
            }`}
          >
            <ProfileLivePreview
              config={draft.config}
              profile={previewProfile}
              device={previewDevice}
              onDeviceChange={setPreviewDevice}
              showDeviceSwitch={true}
              onFixContrast={handleFixContrast}
            />
          </aside>
        </div>
      </main>

      {/* 3. MOBILE THUMB-ZONE BOTTOM BAR (< 60px, total sticky <= 14% viewport) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0B1222]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setMobileMode((m) => (m === "edit" ? "preview" : "edit"))}
            className="min-h-[44px] flex-1 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {mobileMode === "edit" ? (
              <>
                <Eye className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Canlı Önizleme</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Düzenlemeye Dön</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={saving || !isDirty}
            onClick={handleSave}
            className="min-h-[44px] flex-1 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Kaydediliyor..." : isDirty ? "Kaydet" : "Kaydedildi"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCustomize;
