import React from "react";
import {
  Smartphone,
  Monitor,
  MapPin,
  Link as LinkIcon,
  Calendar,
  BadgeCheck,
  ArrowUpRight,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  AtSign,
  Palette,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  ProfileCustomizationConfig,
  SocialPlatformId,
  applySpecialTextTransform,
  getProfileCustomizationStyles,
  getContrastRatio,
  isColorDark,
  isSafeHttpUrl,
} from "../../lib/profileCustomization";

export function SocialPlatformIcon({
  platform,
  className = "w-4 h-4",
}: {
  platform: SocialPlatformId;
  className?: string;
}) {
  switch (platform) {
    case "github":
      return <Github className={className} />;
    case "linkedin":
      return <Linkedin className={className} />;
    case "instagram":
      return <Instagram className={className} />;
    case "x":
      return <AtSign className={className} />;
    case "youtube":
      return <Youtube className={className} />;
    case "behance":
      return <Palette className={className} />;
    case "website":
    default:
      return <Globe className={className} />;
  }
}

export interface StudioProfileSnapshot {
  username: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl: string;
  coverUrl: string;
  isVerified: boolean;
  createdAt?: string | null;
  postsCount: number;
  projectsCount?: number;
  followersCount: number;
  followingCount: number;
}

interface ProfileLivePreviewProps {
  config: ProfileCustomizationConfig;
  profile: StudioProfileSnapshot;
  device: "mobile" | "desktop";
  onDeviceChange: (device: "mobile" | "desktop") => void;
  showDeviceSwitch?: boolean;
  onFixContrast?: () => void;
}

export const ProfileLivePreview: React.FC<ProfileLivePreviewProps> = ({
  config,
  profile,
  device,
  onDeviceChange,
  showDeviceSwitch = true,
  onFixContrast,
}) => {
  const computed = getProfileCustomizationStyles(config);
  const cardTextHex = computed.isDarkCard ? "#F8FAFC" : "#0F172A";
  const cardContrast = getContrastRatio(config.cardBgColor, cardTextHex);
  const linkContrast = getContrastRatio(config.cardBgColor, config.linkColor);
  const hasLowContrast = cardContrast < 4.5 || linkContrast < 3.0;

  const displayNameRaw = profile.displayName.trim() || profile.username || "Kullanıcı";
  const transformedDisplayName = config.applyTransformToDisplayName
    ? applySpecialTextTransform(displayNameRaw, config.textTransform)
    : displayNameRaw;

  const transformedBio = profile.bio
    ? applySpecialTextTransform(profile.bio, config.textTransform)
    : "";

  const effectiveCoverHeight =
    config.coverHeight === "compact" || config.compactHeader
      ? "h-20"
      : config.coverHeight === "tall"
      ? "h-36"
      : "h-28";

  const cardPaddingClass =
    config.cardPadding === "compact"
      ? "px-3.5 pb-4"
      : config.cardPadding === "spacious"
      ? "px-6 pb-6"
      : "px-4 pb-5";

  const isCentered = config.headerLayout === "centered";
  const isEditorial = config.headerLayout === "editorial";

  const joinDateText = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
      })
    : "";

  const validSocialLinks = (config.socialLinks || []).filter((link) => isSafeHttpUrl(link.url));
  const hasHighlight = Boolean(config.featuredHighlight?.title?.trim());

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
            Canlı Profil Önizlemesi
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span
            className={`text-xs font-semibold inline-flex items-center gap-1 tabular-nums ${
              hasLowContrast
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {hasLowContrast ? (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            )}
            {cardContrast}:1
          </span>
        </div>

        {showDeviceSwitch && (
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/70 shrink-0">
            <button
              type="button"
              onClick={() => onDeviceChange("mobile")}
              className={`min-h-[32px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                device === "mobile"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>
            <button
              type="button"
              onClick={() => onDeviceChange("desktop")}
              className={`min-h-[32px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                device === "desktop"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Masaüstü</span>
            </button>
          </div>
        )}
      </div>

      {/* Contrast Warning Banner if low */}
      {hasLowContrast && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
          <span className="leading-snug">
            Bağlantı veya metin kontrastı düşük olabilir.
          </span>
          {onFixContrast && (
            <button
              type="button"
              onClick={onFixContrast}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Otomatik Düzelt
            </button>
          )}
        </div>
      )}

      {/* Preview Canvas */}
      <div className="flex-1 flex items-start justify-center bg-slate-200/60 dark:bg-slate-950/70 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 overflow-y-auto">
        <div
          className={`relative overflow-hidden transition-all duration-300 shadow-xl border border-slate-300/70 dark:border-slate-700/70 ${
            device === "mobile"
              ? "w-full max-w-[360px] rounded-[28px]"
              : "w-full max-w-[640px] rounded-2xl"
          }`}
          style={{
            ...computed.pageContainerStyle,
            backgroundAttachment: "scroll",
          }}
        >
          {computed.patternOverlayStyle && (
            <div className="absolute inset-0 pointer-events-none z-0" style={computed.patternOverlayStyle} />
          )}
          {computed.imageOverlayStyle && (
            <div className="absolute inset-0 pointer-events-none z-0" style={computed.imageOverlayStyle} />
          )}

          <div className="relative z-10 p-3 sm:p-4 space-y-3">
            {/* Main Profile Card */}
            <div className="overflow-hidden transition-all" style={computed.cardStyle}>
              {/* Cover */}
              <div
                className={`${effectiveCoverHeight} relative overflow-hidden`}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${config.primaryAccent}, ${config.secondaryAccent})`,
                }}
              >
                {profile.coverUrl && (
                  <img
                    src={profile.coverUrl}
                    alt="Kapak önizleme"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: config.coverPosition }}
                  />
                )}
                {config.coverOverlayOpacity > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: `rgba(15, 23, 42, ${config.coverOverlayOpacity / 100})` }}
                  />
                )}
              </div>

              {/* Card Body */}
              <div className={cardPaddingClass}>
                {/* Avatar & Top Action Row */}
                <div
                  className={
                    isCentered
                      ? "flex flex-col items-center -mt-9 mb-3 relative z-10 text-center"
                      : isEditorial
                      ? "flex items-center justify-between gap-3 pt-4 mb-3 relative z-10"
                      : "flex items-end justify-between -mt-8 mb-3 relative z-10"
                  }
                >
                  <div
                    className={`${
                      isEditorial ? "w-14 h-14" : "w-16 h-16"
                    } bg-slate-100 overflow-hidden shrink-0 transition-all`}
                    style={computed.avatarFrameStyle}
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={displayNameRaw}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-[inherit]"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-bold text-xl text-white"
                        style={{ backgroundColor: config.primaryAccent }}
                      >
                        {(profile.username || "U")[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {!isCentered && (
                    <button
                      type="button"
                      className="px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs shrink-0"
                      style={computed.primaryButtonStyle}
                    >
                      Takip Et
                    </button>
                  )}
                </div>

                {/* Identity */}
                <div className={isCentered ? "text-center space-y-1" : "space-y-1"}>
                  <div
                    className={`flex items-center gap-1.5 ${
                      isCentered ? "justify-center" : "justify-start"
                    }`}
                  >
                    <h4
                      className="text-base font-bold tracking-tight truncate"
                      style={{ fontFamily: computed.typographyStyle.fontFamily }}
                    >
                      {transformedDisplayName}
                    </h4>
                    {profile.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-[#185EDB] fill-[#185EDB]/15 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs opacity-70 font-medium">
                    @{profile.username || "kullanici"}
                  </p>

                  {config.statusText.trim() && (
                    <p
                      className="text-xs font-medium pt-0.5"
                      style={{ color: config.primaryAccent }}
                    >
                      {config.statusText.trim()}
                    </p>
                  )}
                </div>

                {/* Bio */}
                {transformedBio && (
                  <p
                    className={`text-xs leading-relaxed mt-2.5 break-words ${
                      isCentered ? "text-center" : ""
                    }`}
                    style={computed.typographyStyle}
                  >
                    {transformedBio}
                  </p>
                )}

                {/* Meta Row */}
                {(profile.location || profile.website || (config.showJoinDate && joinDateText)) && (
                  <div
                    className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium mt-3 opacity-80 ${
                      isCentered ? "justify-center" : ""
                    }`}
                  >
                    {profile.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {profile.location}
                      </span>
                    )}
                    {profile.website && (
                      <span className="inline-flex items-center gap-1 font-semibold" style={computed.linkStyle}>
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        {profile.website.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                    {config.showJoinDate && joinDateText && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {joinDateText}
                      </span>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {validSocialLinks.length > 0 && (
                  <div
                    className={`flex flex-wrap items-center gap-2 mt-3 ${
                      isCentered ? "justify-center" : ""
                    }`}
                  >
                    {validSocialLinks.map((link, idx) => (
                      <span
                        key={`${link.platform}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors"
                        style={{
                          borderColor: config.borderColor,
                          color: isColorDark(config.cardBgColor) ? "#E2E8F0" : "#334155",
                        }}
                      >
                        <SocialPlatformIcon platform={link.platform} className="w-3.5 h-3.5" />
                        <span>{link.label?.trim() || link.platform}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Centered Primary Action */}
                {isCentered && (
                  <div className="mt-3.5 flex justify-center">
                    <button
                      type="button"
                      className="px-6 py-2 text-xs font-semibold transition-all shadow-2xs"
                      style={computed.primaryButtonStyle}
                    >
                      Takip Et
                    </button>
                  </div>
                )}

                {/* Stats Row */}
                {config.showStats && (
                  <div
                    className={`flex items-center gap-4 mt-3.5 pt-3 border-t text-xs tabular-nums ${
                      isCentered ? "justify-center" : ""
                    }`}
                    style={{ borderColor: config.borderColor }}
                  >
                    <span>
                      <strong className="font-bold">{profile.postsCount}</strong>{" "}
                      <span className="opacity-70">Gönderi</span>
                    </span>
                    <span>
                      <strong className="font-bold">{profile.followersCount}</strong>{" "}
                      <span className="opacity-70">Takipçi</span>
                    </span>
                    <span>
                      <strong className="font-bold">{profile.followingCount}</strong>{" "}
                      <span className="opacity-70">Takip</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Highlight Card (Only if filled) */}
            {hasHighlight && (
              <div
                className={
                  config.cardPadding === "compact"
                    ? "p-3"
                    : config.cardPadding === "spacious"
                    ? "p-5"
                    : "p-4"
                }
                style={computed.cardStyle}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p
                      className="text-[11px] font-semibold tracking-wide uppercase"
                      style={{ color: config.primaryAccent }}
                    >
                      Öne Çıkan
                    </p>
                    <h5 className="text-sm font-bold leading-snug truncate">
                      {config.featuredHighlight.title}
                    </h5>
                    {config.featuredHighlight.subtitle && (
                      <p className="text-xs opacity-75 leading-relaxed line-clamp-2">
                        {config.featuredHighlight.subtitle}
                      </p>
                    )}
                  </div>
                  {isSafeHttpUrl(config.featuredHighlight.url) && (
                    <ArrowUpRight className="w-4 h-4 shrink-0 mt-1" style={computed.linkStyle} />
                  )}
                </div>
              </div>
            )}

            {/* Compact Style Summary Card */}
            <div
              className={
                config.cardPadding === "compact"
                  ? "p-3"
                  : config.cardPadding === "spacious"
                  ? "p-5"
                  : "p-4"
              }
              style={computed.cardStyle}
            >
              <div className="flex items-center justify-between text-[11px] opacity-70 mb-1.5">
                <span className="font-semibold" style={{ color: config.primaryAccent }}>
                  Gönderi Kartı Görünümü
                </span>
                <span className="tabular-nums">
                  {config.cardRadius}px · %{config.cardShadowIntensity}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Seçtiğiniz kart stili, kenar yuvarlaklığı ve renk uyumu profilinizdeki tüm içerik kartlarına uygulanır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
