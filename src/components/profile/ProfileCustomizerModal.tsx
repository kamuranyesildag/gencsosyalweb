import React, { useState, useRef } from "react";
import {
  X,
  Palette,
  Image as ImageIcon,
  Type,
  Layout,
  Sparkles,
  Sliders,
  Eye,
  RotateCcw,
  Save,
  Smartphone,
  Monitor,
  Upload,
  Check,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  MapPin,
  Link as LinkIcon,
  BadgeCheck
} from "lucide-react";
import { api } from "../../lib/api";
import {
  ProfileCustomizationConfig,
  DEFAULT_PROFILE_CUSTOMIZATION,
  COLOR_THEME_PRESETS,
  FONT_FAMILY_OPTIONS,
  CARD_STYLE_PRESETS,
  AVATAR_FRAME_OPTIONS,
  BACKGROUND_PATTERNS,
  TEXT_TRANSFORM_OPTIONS,
  applySpecialTextTransform,
  getProfileCustomizationStyles,
  BackgroundType,
  ThemePresetId
} from "../../lib/profileCustomization";

interface ProfileCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: ProfileCustomizationConfig;
  profileData: {
    username: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    location?: string;
    website?: string;
    isVerified?: boolean;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
  };
  onPreviewOnPage: (draftConfig: ProfileCustomizationConfig, draftCoverUrl?: string) => void;
  onSaved: (savedConfig: ProfileCustomizationConfig, savedCoverUrl?: string) => void;
}

type CustomizerTab =
  | "background"
  | "colors"
  | "typography"
  | "cards"
  | "borders"
  | "advanced"
  | "preview";

const TABS: { id: CustomizerTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "background", label: "Arka Plan", icon: ImageIcon },
  { id: "colors", label: "Renk Teması", icon: Palette },
  { id: "typography", label: "Yazı Tipi ve Yazı Stili", icon: Type },
  { id: "cards", label: "Profil Kartları", icon: Layout },
  { id: "borders", label: "Kenarlık ve Görünüm", icon: Sparkles },
  { id: "advanced", label: "Gelişmiş Özelleştirme", icon: Sliders },
  { id: "preview", label: "Önizleme", icon: Eye }
];

export const ProfileCustomizerModal: React.FC<ProfileCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  profileData,
  onPreviewOnPage,
  onSaved
}) => {
  const [activeTab, setActiveTab] = useState<CustomizerTab>("background");
  const [config, setConfig] = useState<ProfileCustomizationConfig>(initialConfig);
  const [draftCoverUrl, setDraftCoverUrl] = useState<string>(profileData.coverUrl || "");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [samplePreviewText, setSamplePreviewText] = useState<string>(
    profileData.bio || "Merhaba Genç Sosyal! Geleceğin teknolojilerini birlikte üretiyoruz."
  );

  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const updateConfig = <K extends keyof ProfileCustomizationConfig>(
    key: K,
    value: ProfileCustomizationConfig[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const applyThemePreset = (presetId: ThemePresetId) => {
    const preset = COLOR_THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setConfig((prev) => ({
      ...prev,
      themePreset: preset.id,
      primaryAccent: preset.primaryAccent,
      secondaryAccent: preset.secondaryAccent,
      linkColor: preset.linkColor,
      buttonColor: preset.buttonColor,
      cardBgColor: preset.cardBgColor,
      borderColor: preset.borderColor,
      avatarFrameColor: preset.primaryAccent,
      bgGradientStart: preset.bgGradientStart,
      bgGradientEnd: preset.bgGradientEnd
    }));
  };

  const validateAndUploadImage = async (
    file: File,
    onSuccess: (url: string) => void,
    setLoading: (loading: boolean) => void
  ) => {
    setFeedback(null);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setFeedback({
        type: "error",
        text: "Yalnızca JPG, PNG veya WEBP formatında görsel yükleyebilirsiniz."
      });
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setFeedback({
        type: "error",
        text: "Görsel boyutu en fazla 5 MB olabilir. Lütfen daha küçük bir dosya seçin."
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<{ url?: string }>("/media/upload", formData);
      const uploadedUrl = res?.data?.data?.url || res?.url;
      if (uploadedUrl) {
        onSuccess(uploadedUrl);
        setFeedback({ type: "success", text: "Görsel başarıyla yüklendi ve önizlemeye uygulandı." });
      } else {
        throw new Error("Görsel adresi alınamadı.");
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Görsel yüklenirken bir hata oluştu."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await api.put("/users/me/customization", {
        customization: config,
        coverUrl: draftCoverUrl
      });
      setFeedback({
        type: "success",
        text: "Profil özelleştirmeleriniz kaydedildi! Ziyaretçileriniz artık yeni görünümü görecek."
      });
      onSaved(config, draftCoverUrl);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Değişiklikler kaydedilirken bir hata oluştu."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    setResetting(true);
    setFeedback(null);
    try {
      await api.delete("/users/me/customization");
      const fresh = { ...DEFAULT_PROFILE_CUSTOMIZATION };
      setConfig(fresh);
      setFeedback({
        type: "success",
        text: "Profil görünümü Genç Sosyal varsayılan tasarımına döndürüldü."
      });
      onSaved(fresh, draftCoverUrl);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Varsayılana döndürülürken hata oluştu."
      });
    } finally {
      setResetting(false);
    }
  };

  const computed = getProfileCustomizationStyles(config);
  const transformedBio = applySpecialTextTransform(
    profileData.bio || samplePreviewText,
    config.textTransform
  );
  const transformedDisplayName = config.applyTransformToDisplayName
    ? applySpecialTextTransform(profileData.displayName || profileData.username, config.textTransform)
    : profileData.displayName || profileData.username;

  const renderLivePreviewCard = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Canlı Profil Önizlemesi
          </span>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setPreviewDevice("mobile")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              previewDevice === "mobile"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobil
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice("desktop")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              previewDevice === "desktop"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Masaüstü
          </button>
        </div>
      </div>

      {/* Scoped Preview Viewport */}
      <div className="flex-1 flex items-start justify-center bg-slate-900/5 rounded-2xl p-3 sm:p-4 border border-slate-200/80 overflow-y-auto">
        <div
          className={`relative overflow-hidden transition-all duration-300 shadow-xl border border-slate-300/80 ${
            previewDevice === "mobile"
              ? "w-full max-w-[360px] rounded-[28px]"
              : "w-full max-w-[680px] rounded-2xl"
          }`}
          style={computed.pageContainerStyle}
        >
          {/* Pattern or Image Overlay inside Preview */}
          {computed.patternOverlayStyle && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={computed.patternOverlayStyle}
            />
          )}
          {computed.imageOverlayStyle && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={computed.imageOverlayStyle}
            />
          )}

          <div className="relative z-10 p-3 sm:p-4 space-y-3">
            {/* Main Profile Card */}
            <div className="overflow-hidden transition-all" style={computed.cardStyle}>
              {/* Cover Area */}
              <div
                className={`${
                  config.compactHeader ? "h-20" : "h-28"
                } relative overflow-hidden`}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${config.primaryAccent}, ${config.secondaryAccent})`
                }}
              >
                {draftCoverUrl && (
                  <img
                    src={draftCoverUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ objectPosition: config.coverPosition }}
                  />
                )}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-900">
                  @{profileData.username}
                </div>
              </div>

              {/* Body */}
              <div
                className={
                  config.cardPadding === "compact"
                    ? "px-3.5 pb-3.5"
                    : config.cardPadding === "spacious"
                    ? "px-6 pb-6"
                    : "px-4 pb-4"
                }
              >
                <div className="flex items-end justify-between -mt-8 mb-3 relative z-10">
                  <div
                    className="w-16 h-16 bg-slate-100 overflow-hidden shrink-0"
                    style={computed.avatarFrameStyle}
                  >
                    {profileData.avatarUrl ? (
                      <img
                        src={profileData.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover rounded-[inherit]"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-extrabold text-xl text-white"
                        style={{ backgroundColor: config.primaryAccent }}
                      >
                        {profileData.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-9 text-center">
                    <div>
                      <div className="text-sm font-extrabold">
                        {profileData.postsCount ?? 0}
                      </div>
                      <div className="text-[10px] opacity-70 font-semibold">Gönderi</div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">
                        {profileData.followersCount ?? 0}
                      </div>
                      <div className="text-[10px] opacity-70 font-semibold">Takipçi</div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">
                        {profileData.followingCount ?? 0}
                      </div>
                      <div className="text-[10px] opacity-70 font-semibold">Takip</div>
                    </div>
                  </div>
                </div>

                {/* Display Name + Official Blue Tick (Always protected) */}
                <div className="flex items-center gap-1.5">
                  <h4
                    className="text-base font-extrabold tracking-tight"
                    style={{ fontFamily: computed.typographyStyle.fontFamily }}
                  >
                    {transformedDisplayName}
                  </h4>
                  {profileData.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-[#185EDB] fill-[#185EDB]/15 shrink-0" />
                  )}
                </div>
                <p className="text-xs opacity-70 font-medium mb-2">
                  @{profileData.username}
                </p>

                {/* Transformed Bio */}
                <p
                  className="text-xs leading-relaxed mb-3 break-words"
                  style={computed.typographyStyle}
                >
                  {transformedBio}
                </p>

                {/* Meta Links */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold mb-3 opacity-85">
                  {profileData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {profileData.location}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1 font-bold"
                    style={computed.linkStyle}
                  >
                    <LinkIcon className="w-3 h-3" />{" "}
                    {profileData.website
                      ? profileData.website.replace(/^https?:\/\//, "")
                      : "gencsosyal.tr/" + profileData.username}
                  </span>
                </div>

                {/* Action Button Preview */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs"
                    style={computed.primaryButtonStyle}
                  >
                    Takip Et
                  </button>
                  <span
                    className="px-2.5 py-2 rounded-xl text-[11px] font-bold border"
                    style={computed.accentBadgeStyle}
                  >
                    #GençSosyal
                  </span>
                </div>
              </div>
            </div>

            {/* Sample Post Card inside Preview */}
            <div
              className={
                config.cardPadding === "compact"
                  ? "p-3"
                  : config.cardPadding === "spacious"
                  ? "p-5"
                  : "p-3.5"
              }
              style={computed.cardStyle}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-md border"
                  style={computed.accentBadgeStyle}
                >
                  Örnek Gönderi Kartı
                </span>
                <span className="text-[10px] opacity-60 font-semibold">Şimdi</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Kart köşe yuvarlaklığı ({config.cardRadius}px), gölge yoğunluğu (%{config.cardShadowIntensity}) ve tema vurgu renkleri tüm profil kartlarınıza tutarlı şekilde uygulanır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#185EDB] text-white flex items-center justify-center shadow-sm shadow-blue-600/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Profil Özelleştirme Merkezi
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Yalnızca kendi profil sayfanızın görünümünü kişiselleştirin; ziyaretçileriniz bu tasarımı görür.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-5 mt-3 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-current opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Grid: Left Controls + Right Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Panel: Controls */}
          <div
            className={`${
              activeTab === "preview" ? "hidden" : "lg:col-span-7"
            } p-5 overflow-y-auto space-y-6`}
          >
            {/* TAB 1: ARKA PLAN */}
            {activeTab === "background" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                    Profil Sayfası Arka Plan Türü
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Seçtiğiniz arka plan yalnızca sizin profil sayfanızda uygulanır. Ana sayfa ve diğer kullanıcıların profilleri etkilenmez.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "default_light", label: "Varsayılan Açık" },
                      { id: "dark", label: "Koyu Arka Plan" },
                      { id: "solid", label: "Tek Renk" },
                      { id: "gradient", label: "İki Renkli Gradient" },
                      { id: "pattern_preset", label: "Hazır Desenler" },
                      { id: "pattern_geometric", label: "Hafif Geometrik" },
                      { id: "pattern_dots", label: "Minimal Noktalar" },
                      { id: "pattern_lines", label: "Minimal Çizgiler" },
                      { id: "custom_image", label: "Kendi Görselin" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          const bgType = opt.id as BackgroundType;
                          updateConfig("backgroundType", bgType);
                          if (bgType === "pattern_geometric") updateConfig("patternId", "hex_geometric");
                          if (bgType === "pattern_dots") updateConfig("patternId", "minimal_dots");
                          if (bgType === "pattern_lines") updateConfig("patternId", "minimal_lines");
                          if (bgType === "pattern_preset") updateConfig("patternId", "grid_soft");
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          config.backgroundType === opt.id
                            ? "border-[#185EDB] bg-blue-50/50 text-[#185EDB] ring-2 ring-blue-500/15"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-extrabold">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Solid Color Controls */}
                {(config.backgroundType === "solid" ||
                  config.backgroundType.startsWith("pattern_")) && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Arka Plan Zemin Rengi
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.bgSolidColor}
                        onChange={(e) => updateConfig("bgSolidColor", e.target.value)}
                        className="w-11 h-11 rounded-xl border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.bgSolidColor}
                        onChange={(e) => {
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                            updateConfig("bgSolidColor", e.target.value);
                          }
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold w-32 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Controls */}
                {config.backgroundType === "gradient" && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                          Başlangıç Rengi
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.bgGradientStart}
                            onChange={(e) => updateConfig("bgGradientStart", e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {config.bgGradientStart}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                          Bitiş Rengi
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.bgGradientEnd}
                            onChange={(e) => updateConfig("bgGradientEnd", e.target.value)}
                            className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {config.bgGradientEnd}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                        Geçiş Yönü
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "135deg", label: "Çapraz (135°)" },
                          { id: "to bottom", label: "Yukarıdan Aşağı" },
                          { id: "to right", label: "Soldan Sağa" },
                          { id: "45deg", label: "Ters Çapraz (45°)" }
                        ].map((dir) => (
                          <button
                            key={dir.id}
                            type="button"
                            onClick={() =>
                              updateConfig("bgGradientDirection", dir.id as any)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              config.bgGradientDirection === dir.id
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            {dir.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pattern Controls */}
                {config.backgroundType.startsWith("pattern_") && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-2">
                        Desen Stili Seçin
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BACKGROUND_PATTERNS.map((pat) => (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => updateConfig("patternId", pat.id)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                              config.patternId === pat.id
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {pat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Desen Yoğunluğu</span>
                        <span>%{config.patternOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={60}
                        value={config.patternOpacity}
                        onChange={(e) =>
                          updateConfig("patternOpacity", Number(e.target.value))
                        }
                        className="w-full accent-[#185EDB]"
                      />
                    </div>
                  </div>
                )}

                {/* Custom Image Upload Controls */}
                {config.backgroundType === "custom_image" && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">
                          Özel Arka Plan Görseli
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          JPG, PNG veya WEBP · Maksimum 5 MB
                        </p>
                      </div>
                      <input
                        ref={bgFileInputRef}
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
                        }}
                      />
                      <button
                        type="button"
                        disabled={uploadingBg}
                        onClick={() => bgFileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#185EDB] text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {uploadingBg ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        Görsel Yükle
                      </button>
                    </div>

                    {config.bgImageUrl && (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={config.bgImageUrl}
                          alt="Arka plan önizleme"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: config.bgImagePosition }}
                        />
                        <button
                          type="button"
                          onClick={() => updateConfig("bgImageUrl", "")}
                          className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-bold"
                        >
                          Kaldır
                        </button>
                      </div>
                    )}

                    {/* Image Position */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                        Görsel Konumu
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "center", label: "Orta" },
                          { id: "top", label: "Üst" },
                          { id: "bottom", label: "Alt" },
                          { id: "left", label: "Sol" },
                          { id: "right", label: "Sağ" }
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() =>
                              updateConfig("bgImagePosition", pos.id as any)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              config.bgImagePosition === pos.id
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Overlay Opacity & Readability */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Kaplama Yoğunluğu (Okunabilirlik Katmanı)</span>
                        <span>%{config.bgOverlayOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        value={config.bgOverlayOpacity}
                        onChange={(e) =>
                          updateConfig("bgOverlayOpacity", Number(e.target.value))
                        }
                        className="w-full accent-[#185EDB]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">
                        Metin Okunabilirliğini Koru (Yumuşak Kontrast Filtresi)
                      </span>
                      <input
                        type="checkbox"
                        checked={config.preserveReadability}
                        onChange={(e) =>
                          updateConfig("preserveReadability", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#185EDB]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: RENK TEMALARI */}
            {activeTab === "colors" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                    Hazır Renk Temaları (12 Seçenek)
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Tek dokunuşla uyumlu bir renk paleti seçin veya aşağıdan her alanı ayrı ayrı özelleştirin.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {COLOR_THEME_PRESETS.map((preset) => {
                      const isSelected = config.themePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyThemePreset(preset.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/10"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-6 h-6 rounded-full shrink-0 border border-black/10 shadow-2xs"
                              style={{
                                backgroundImage: `linear-gradient(135deg, ${preset.primaryAccent}, ${preset.secondaryAccent})`
                              }}
                            />
                            <span className="text-xs font-extrabold text-slate-800 truncate">
                              {preset.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Pickers for 6 distinct areas */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Özel Renk Seçici
                    </h4>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Alanları ayrı ayrı özelleştirin
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { key: "primaryAccent", label: "Ana Vurgu Rengi" },
                      { key: "secondaryAccent", label: "İkincil Vurgu Rengi" },
                      { key: "linkColor", label: "Bağlantı Rengi" },
                      { key: "buttonColor", label: "Buton Rengi" },
                      { key: "cardBgColor", label: "Kart Arka Plan Rengi" },
                      { key: "borderColor", label: "Kenarlık Rengi" }
                    ].map((field) => {
                      const val = config[field.key as keyof ProfileCustomizationConfig] as string;
                      return (
                        <div
                          key={field.key}
                          className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {field.label}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {val}
                            </div>
                          </div>
                          <input
                            type="color"
                            value={val}
                            onChange={(e) => {
                              updateConfig("themePreset", "custom");
                              updateConfig(
                                field.key as keyof ProfileCustomizationConfig,
                                e.target.value as any
                              );
                            }}
                            className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: YAZI TİPİ VE YAZI STİLLERİ */}
            {activeTab === "typography" && (
              <div className="space-y-6">
                {/* 7 Font Families */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                    Hazır Yazı Tipi Seçenekleri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                    {FONT_FAMILY_OPTIONS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => updateConfig("fontFamily", font.id)}
                        style={{ fontFamily: font.cssValue }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          config.fontFamily === font.id
                            ? "border-[#185EDB] bg-blue-50/40 ring-2 ring-blue-500/15"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-900">
                          {font.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {font.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7 Text Styles */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-2">
                    Yazı Stilleri
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateConfig("fontBold", !config.fontBold)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                        config.fontBold
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Kalın Yazı
                    </button>
                    <button
                      type="button"
                      onClick={() => updateConfig("fontItalic", !config.fontItalic)}
                      className={`px-3.5 py-2 rounded-xl text-xs italic font-bold border transition-all ${
                        config.fontItalic
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      İtalik Yazı
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig("letterSpacingWide", !config.letterSpacingWide)
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs tracking-widest font-bold border transition-all ${
                        config.letterSpacingWide
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Harf Aralığı Artırılmış
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          "textCase",
                          config.textCase === "uppercase" ? "normal" : "uppercase"
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs uppercase font-bold border transition-all ${
                        config.textCase === "uppercase"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      BÜYÜK HARF GÖRÜNÜMÜ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          "textCase",
                          config.textCase === "lowercase" ? "normal" : "lowercase"
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs lowercase font-bold border transition-all ${
                        config.textCase === "lowercase"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      küçük harf görünümü
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          "textDecoration",
                          config.textDecoration === "underline" ? "none" : "underline"
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs underline font-bold border transition-all ${
                        config.textDecoration === "underline"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Altı Çizili Metin
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig(
                          "textDecoration",
                          config.textDecoration === "line-through"
                            ? "none"
                            : "line-through"
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs line-through font-bold border transition-all ${
                        config.textDecoration === "line-through"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      Üstü Çizili Metin
                    </button>
                  </div>
                </div>

                {/* Special Text Transformations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Özel Metin Dönüşümleri
                      </h3>
                      <p className="text-xs text-slate-500">
                        Orijinal biyografi metniniz veritabanında korunur; istediğiniz an normal görünüme dönebilirsiniz.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TEXT_TRANSFORM_OPTIONS.map((opt) => {
                      const previewSample = applySpecialTextTransform(
                        opt.exampleInput,
                        opt.id
                      );
                      const isSelected = config.textTransform === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateConfig("textTransform", opt.id)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "border-[#185EDB] bg-blue-50/50 ring-2 ring-blue-500/15"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">
                              {opt.name}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#185EDB]" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#185EDB] mt-1 truncate">
                            {previewSample}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {opt.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Screen Reader Warning when decorative/reversed transform is active */}
                  {config.textTransform !== "none" && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <strong>Erişilebilirlik Notu:</strong> Özel Unicode ve ters metin dönüşümleri görsel olarak etkileyicidir; ekran okuyucu kullanan ziyaretçiler için orijinal metniniz erişilebilirlik etiketinde (<code className="font-mono">aria-label</code>) otomatik olarak korunmaktadır.
                      </div>
                    </div>
                  )}

                  {/* Interactive Real Text Preview Sandbox */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-700">
                        Canlı Metin Dönüşümü Test Alanı
                      </label>
                      {config.textTransform !== "none" && (
                        <button
                          type="button"
                          onClick={() => updateConfig("textTransform", "none")}
                          className="text-[11px] font-bold text-[#185EDB] hover:underline"
                        >
                          Normal Görünüme Döndür
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={samplePreviewText}
                      onChange={(e) => setSamplePreviewText(e.target.value)}
                      placeholder="Test etmek için Türkçe karakterli bir metin yazın (Örn: Merhaba ğüşıöç)..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                    />
                    <div
                      className="p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 break-words"
                      style={computed.typographyStyle}
                    >
                      {applySpecialTextTransform(samplePreviewText, config.textTransform)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROFİL KARTLARI */}
            {activeTab === "cards" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                    Hazır Kart Stilleri
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Profil bilgileriniz, istatistikleriniz, projeleriniz ve gönderi kartlarınızın görünümünü belirleyin.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CARD_STYLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          updateConfig("cardStyle", preset.id);
                          updateConfig("cardRadius", preset.radius);
                          updateConfig("cardShadowIntensity", preset.shadowIntensity);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          config.cardStyle === preset.id
                            ? "border-[#185EDB] bg-blue-50/40 ring-2 ring-blue-500/15"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-extrabold text-slate-900">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Kart Köşe Yuvarlaklığı</span>
                      <span>{config.cardRadius} px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={36}
                      value={config.cardRadius}
                      onChange={(e) =>
                        updateConfig("cardRadius", Number(e.target.value))
                      }
                      className="w-full accent-[#185EDB]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Gölge Yoğunluğu</span>
                      <span>%{config.cardShadowIntensity}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={config.cardShadowIntensity}
                      onChange={(e) =>
                        updateConfig("cardShadowIntensity", Number(e.target.value))
                      }
                      className="w-full accent-[#185EDB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Kart İç Boşlukları (Padding)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "compact", label: "Kompakt" },
                        { id: "normal", label: "Standart" },
                        { id: "spacious", label: "Ferah" }
                      ].map((pad) => (
                        <button
                          key={pad.id}
                          type="button"
                          onClick={() => updateConfig("cardPadding", pad.id as any)}
                          className={`py-2 rounded-xl text-xs font-bold border ${
                            config.cardPadding === pad.id
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          {pad.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: KENARLIK VE GÖRÜNÜM (KAPAK & AVATAR ÇERÇEVESİ) */}
            {activeTab === "borders" && (
              <div className="space-y-6">
                {/* Cover Image Upload & Position */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Profil Başlığı (Kapak Görseli)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Kapak fotoğrafınızı değiştirin ve dikey hizalamasını ayarlayın.
                      </p>
                    </div>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          validateAndUploadImage(
                            file,
                            (url) => setDraftCoverUrl(url),
                            setUploadingCover
                          );
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      {uploadingCover ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Kapak Yükle
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Kapak Görseli Konumu
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "top", label: "Üst Hizalı" },
                        { id: "center", label: "Merkez" },
                        { id: "bottom", label: "Alt Hizalı" }
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => updateConfig("coverPosition", pos.id as any)}
                          className={`py-2 rounded-xl text-xs font-bold border ${
                            config.coverPosition === pos.id
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Avatar Frame Style */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                    Profil Fotoğrafı Çerçevesi
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Doğrulama (Mavi Tik) rozetiyle karışmayan, sade ve modern profil fotoğrafı çerçeveleri.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVATAR_FRAME_OPTIONS.map((frame) => (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => updateConfig("avatarFrame", frame.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          config.avatarFrame === frame.id
                            ? "border-[#185EDB] bg-blue-50/40 ring-2 ring-blue-500/15"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-extrabold text-slate-900">
                          {frame.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {frame.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {config.avatarFrame !== "none" && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">
                        Çerçeve Vurgu Rengi
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Profil fotoğrafı halkasının rengini özelleştirin
                      </div>
                    </div>
                    <input
                      type="color"
                      value={config.avatarFrameColor}
                      onChange={(e) => updateConfig("avatarFrameColor", e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: GELİŞMİŞ ÖZELLEŞTİRME */}
            {activeTab === "advanced" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Buzlu Cam Efekti (Glassmorphism)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Arka plan desenleri ve görselleri üzerinde yarı saydam bulanık kart yüzeyi sağlar.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.glassmorphism}
                      onChange={(e) => updateConfig("glassmorphism", e.target.checked)}
                      className="w-4 h-4 accent-[#185EDB]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Kart Yüzey Opaklığı</span>
                      <span>%{config.cardOpacity}</span>
                    </div>
                    <input
                      type="range"
                      min={75}
                      max={100}
                      value={config.cardOpacity}
                      onChange={(e) =>
                        updateConfig("cardOpacity", Number(e.target.value))
                      }
                      className="w-full accent-[#185EDB]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Otomatik Kontrast ve Okunabilirlik Koruması
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Koyu kart arka planı seçildiğinde metinleri otomatik olarak açık renge dönüştürür.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.highContrastText}
                      onChange={(e) =>
                        updateConfig("highContrastText", e.target.checked)
                      }
                      className="w-4 h-4 accent-[#185EDB]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Kompakt Profil Başlığı
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Kapak görseli alanını daha zarif ve ince bir yüksekliğe ayarlar.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.compactHeader}
                      onChange={(e) => updateConfig("compactHeader", e.target.checked)}
                      className="w-4 h-4 accent-[#185EDB]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Özel Metin Dönüşümünü Görünen Ada da Uygula
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Kullanıcı adınız (@{profileData.username}) ve Mavi Tik rozetiniz her zaman standart kalır.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.applyTransformToDisplayName}
                      onChange={(e) =>
                        updateConfig("applyTransformToDisplayName", e.target.checked)
                      }
                      className="w-4 h-4 accent-[#185EDB]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#185EDB] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-0.5">
                      Güvenli ve İzole Kişiselleştirme
                    </strong>
                    Yaptığınız tüm görsel özelleştirmeler güvenli tasarım parametreleriyle doğrulanır. Yalnızca sizin profil sayfanızı (<code className="font-mono">/profile/{profileData.username}</code>) etkiler ve profilinizi ziyaret eden tüm kullanıcılara gösterilir.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Live Preview (or Full Width when on "preview" tab) */}
          <div
            className={`${
              activeTab === "preview" ? "lg:col-span-12" : "lg:col-span-5"
            } p-5 bg-slate-50/80 flex flex-col`}
          >
            {renderLivePreviewCard()}
          </div>
        </div>

        {/* Footer Actions: "Önizlemeyi Gör", "Varsayılana Döndür", "Değişiklikleri Kaydet" */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={resetting || saving}
            onClick={handleResetToDefault}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Varsayılana Döndür
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onPreviewOnPage(config, draftCoverUrl);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#185EDB]/30 bg-blue-50/70 text-[#185EDB] text-xs font-extrabold hover:bg-blue-100/80 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Önizlemeyi Gör
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#185EDB] text-white text-xs font-extrabold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
