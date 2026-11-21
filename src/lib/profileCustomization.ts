import React from "react";

export type BackgroundType =
  | "default_light"
  | "dark"
  | "solid"
  | "gradient"
  | "pattern_preset"
  | "pattern_geometric"
  | "pattern_dots"
  | "pattern_lines"
  | "custom_image";

export type PatternId =
  | "grid_soft"
  | "diagonal_waves"
  | "circuit_tech"
  | "topography"
  | "hex_geometric"
  | "triangles_soft"
  | "minimal_dots"
  | "minimal_lines"
  | "crosshatch";

export type ThemePresetId =
  | "ocean_blue"
  | "night_navy"
  | "purple"
  | "lavender"
  | "emerald"
  | "turquoise"
  | "burgundy"
  | "rose_pink"
  | "orange"
  | "red"
  | "minimal_gray"
  | "classic_bw"
  | "custom";

export type FontFamilyId =
  | "modern"
  | "classic"
  | "rounded"
  | "minimal"
  | "tech"
  | "serif"
  | "monospace";

export type TextTransformId =
  | "none"
  | "upside_down"
  | "reverse"
  | "fullwidth"
  | "unicode_bold_serif"
  | "unicode_script"
  | "small_caps"
  | "monospace";

export type CardStyleId =
  | "classic"
  | "minimal"
  | "soft_shadow"
  | "thin_border"
  | "rounded_soft"
  | "flat";

export type AvatarFrameId =
  | "none"
  | "simple_ring"
  | "double_ring"
  | "gradient_ring"
  | "neon_glow"
  | "squircle_frame"
  | "tech_hexagon";

export type HeaderLayoutId = "classic" | "centered" | "editorial";

export type ButtonStyleId = "solid" | "outline" | "soft" | "pill";

export type CoverHeightId = "compact" | "normal" | "tall";

export type AvatarShapeId = "circle" | "rounded" | "squircle" | "square";

export type SocialPlatformId =
  | "github"
  | "linkedin"
  | "instagram"
  | "x"
  | "youtube"
  | "behance"
  | "website";

export interface ProfileSocialLink {
  platform: SocialPlatformId;
  url: string;
  label?: string;
}

export interface ProfileFeaturedHighlight {
  title: string;
  subtitle: string;
  url: string;
}

export interface ProfileCustomizationConfig {
  // 1. Background
  backgroundType: BackgroundType;
  bgSolidColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  bgGradientDirection: "to bottom" | "to right" | "to bottom right" | "135deg" | "45deg";
  patternId: PatternId;
  patternOpacity: number;
  bgImageUrl: string;
  bgImagePosition: "center" | "top" | "bottom" | "left" | "right";
  bgOverlayOpacity: number;
  bgOverlayColor: string;
  preserveReadability: boolean;

  // 2. Color Theme
  themePreset: ThemePresetId;
  primaryAccent: string;
  secondaryAccent: string;
  linkColor: string;
  buttonColor: string;
  cardBgColor: string;
  borderColor: string;

  // 3. Typography & Text Styles
  fontFamily: FontFamilyId;
  fontBold: boolean;
  fontItalic: boolean;
  letterSpacingWide: boolean;
  textCase: "normal" | "uppercase" | "lowercase";
  textDecoration: "none" | "underline" | "line-through";
  textTransform: TextTransformId;
  applyTransformToDisplayName: boolean;

  // 4. Profile Cards & Layout
  headerLayout: HeaderLayoutId;
  buttonStyle: ButtonStyleId;
  cardStyle: CardStyleId;
  cardRadius: number;
  cardShadowIntensity: number;
  cardPadding: "compact" | "normal" | "spacious";
  cardOpacity: number;

  // 5. Borders & Appearance
  coverPosition: "center" | "top" | "bottom";
  coverHeight: CoverHeightId;
  coverOverlayOpacity: number;
  avatarShape: AvatarShapeId;
  avatarFrame: AvatarFrameId;
  avatarFrameColor: string;

  // 6. Identity & Showcase
  statusText: string;
  showJoinDate: boolean;
  showStats: boolean;
  socialLinks: ProfileSocialLink[];
  featuredHighlight: ProfileFeaturedHighlight;

  // 7. Advanced Customization
  glassmorphism: boolean;
  highContrastText: boolean;
  compactHeader: boolean;
}

export const DEFAULT_PROFILE_CUSTOMIZATION: ProfileCustomizationConfig = {
  backgroundType: "default_light",
  bgSolidColor: "#F8FAFC",
  bgGradientStart: "#EFF6FF",
  bgGradientEnd: "#E0E7FF",
  bgGradientDirection: "135deg",
  patternId: "minimal_dots",
  patternOpacity: 20,
  bgImageUrl: "",
  bgImagePosition: "center",
  bgOverlayOpacity: 45,
  bgOverlayColor: "#0F172A",
  preserveReadability: true,

  themePreset: "ocean_blue",
  primaryAccent: "#185EDB",
  secondaryAccent: "#3B82F6",
  linkColor: "#185EDB",
  buttonColor: "#0F172A",
  cardBgColor: "#FFFFFF",
  borderColor: "#E2E8F0",

  fontFamily: "modern",
  fontBold: false,
  fontItalic: false,
  letterSpacingWide: false,
  textCase: "normal",
  textDecoration: "none",
  textTransform: "none",
  applyTransformToDisplayName: false,

  headerLayout: "classic",
  buttonStyle: "solid",
  cardStyle: "classic",
  cardRadius: 24,
  cardShadowIntensity: 20,
  cardPadding: "normal",
  cardOpacity: 100,

  coverPosition: "center",
  coverHeight: "normal",
  coverOverlayOpacity: 0,
  avatarShape: "rounded",
  avatarFrame: "none",
  avatarFrameColor: "#185EDB",

  statusText: "",
  showJoinDate: true,
  showStats: true,
  socialLinks: [],
  featuredHighlight: { title: "", subtitle: "", url: "" },

  glassmorphism: false,
  highContrastText: true,
  compactHeader: false
};

export function normalizeProfileCustomization(
  raw?: Partial<ProfileCustomizationConfig> | null
): ProfileCustomizationConfig {
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      socialLinks: [],
      featuredHighlight: { title: "", subtitle: "", url: "" },
    };
  }
  const mergedCoverHeight: CoverHeightId =
    raw.coverHeight || (raw.compactHeader ? "compact" : "normal");

  return {
    ...DEFAULT_PROFILE_CUSTOMIZATION,
    ...raw,
    coverHeight: mergedCoverHeight,
    socialLinks: Array.isArray(raw.socialLinks) ? raw.socialLinks : [],
    featuredHighlight: {
      title: raw.featuredHighlight?.title || "",
      subtitle: raw.featuredHighlight?.subtitle || "",
      url: raw.featuredHighlight?.url || "",
    },
  };
}

export function hasActiveCustomization(
  raw?: Partial<ProfileCustomizationConfig> | null
): boolean {
  if (!raw || typeof raw !== "object" || Object.keys(raw).length === 0) return false;
  const norm = normalizeProfileCustomization(raw);
  return JSON.stringify(norm) !== JSON.stringify(DEFAULT_PROFILE_CUSTOMIZATION);
}

export function isSafeHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export const SOCIAL_PLATFORM_OPTIONS: Array<{
  id: SocialPlatformId;
  name: string;
  baseHint: string;
}> = [
  { id: "github", name: "GitHub", baseHint: "https://github.com/..." },
  { id: "linkedin", name: "LinkedIn", baseHint: "https://linkedin.com/in/..." },
  { id: "instagram", name: "Instagram", baseHint: "https://instagram.com/..." },
  { id: "x", name: "X (Twitter)", baseHint: "https://x.com/..." },
  { id: "youtube", name: "YouTube", baseHint: "https://youtube.com/..." },
  { id: "behance", name: "Behance", baseHint: "https://behance.net/..." },
  { id: "website", name: "Web Sitesi", baseHint: "https://..." },
];

export interface StudioThemeTemplate {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewCard: string;
  previewAccent: string;
  patch: Partial<ProfileCustomizationConfig>;
}

export const STUDIO_THEME_TEMPLATES: StudioThemeTemplate[] = [
  {
    id: "editorial_light",
    name: "Sade Editoryal",
    description: "Temiz beyaz kartlar, dengeli mavi vurgu",
    previewBg: "#F4F6FA",
    previewCard: "#FFFFFF",
    previewAccent: "#185EDB",
    patch: {
      backgroundType: "default_light",
      themePreset: "ocean_blue",
      primaryAccent: "#185EDB",
      secondaryAccent: "#3B82F6",
      linkColor: "#185EDB",
      buttonColor: "#0F172A",
      cardBgColor: "#FFFFFF",
      borderColor: "#E2E8F0",
      fontFamily: "modern",
      headerLayout: "classic",
      buttonStyle: "solid",
      cardStyle: "classic",
      cardRadius: 24,
      cardShadowIntensity: 18,
      cardOpacity: 100,
      glassmorphism: false,
      avatarShape: "circle",
      avatarFrame: "none",
    },
  },
  {
    id: "night_studio",
    name: "Gece Stüdyo",
    description: "Derin lacivert zemin ve buzlu cam kartlar",
    previewBg: "linear-gradient(135deg, #090F1E, #16213E)",
    previewCard: "#0F172A",
    previewAccent: "#38BDF8",
    patch: {
      backgroundType: "gradient",
      bgGradientStart: "#090F1E",
      bgGradientEnd: "#16213E",
      bgGradientDirection: "135deg",
      themePreset: "night_navy",
      primaryAccent: "#38BDF8",
      secondaryAccent: "#818CF8",
      linkColor: "#38BDF8",
      buttonColor: "#38BDF8",
      cardBgColor: "#0F172A",
      borderColor: "#1E293B",
      fontFamily: "minimal",
      headerLayout: "classic",
      buttonStyle: "solid",
      cardStyle: "thin_border",
      cardRadius: 22,
      cardShadowIntensity: 35,
      cardOpacity: 92,
      glassmorphism: true,
      avatarShape: "rounded",
      avatarFrame: "gradient_ring",
      avatarFrameColor: "#38BDF8",
    },
  },
  {
    id: "engineer_grid",
    name: "Mühendis Izgarası",
    description: "Teknik ızgara deseni ve net çerçeveler",
    previewBg: "#F8FAFC",
    previewCard: "#FFFFFF",
    previewAccent: "#0891B2",
    patch: {
      backgroundType: "pattern_preset",
      bgSolidColor: "#F8FAFC",
      patternId: "grid_soft",
      patternOpacity: 24,
      themePreset: "turquoise",
      primaryAccent: "#0891B2",
      secondaryAccent: "#06B6D4",
      linkColor: "#0E7490",
      buttonColor: "#0F172A",
      cardBgColor: "#FFFFFF",
      borderColor: "#CBD5E1",
      fontFamily: "tech",
      headerLayout: "editorial",
      buttonStyle: "outline",
      cardStyle: "thin_border",
      cardRadius: 14,
      cardShadowIntensity: 0,
      cardOpacity: 100,
      glassmorphism: false,
      avatarShape: "square",
      avatarFrame: "tech_hexagon",
      avatarFrameColor: "#0891B2",
    },
  },
  {
    id: "centered_atelier",
    name: "Ortalanmış Vitrin",
    description: "Merkezi başlık, sıcak serif tipografi",
    previewBg: "linear-gradient(135deg, #FAF8F5, #F1ECE4)",
    previewCard: "#FFFFFF",
    previewAccent: "#9F1239",
    patch: {
      backgroundType: "gradient",
      bgGradientStart: "#FAF8F5",
      bgGradientEnd: "#F1ECE4",
      bgGradientDirection: "to bottom",
      themePreset: "burgundy",
      primaryAccent: "#9F1239",
      secondaryAccent: "#E11D48",
      linkColor: "#9F1239",
      buttonColor: "#881337",
      cardBgColor: "#FFFFFF",
      borderColor: "#E7DFD5",
      fontFamily: "serif",
      headerLayout: "centered",
      buttonStyle: "pill",
      cardStyle: "soft_shadow",
      cardRadius: 28,
      cardShadowIntensity: 28,
      cardOpacity: 100,
      glassmorphism: false,
      avatarShape: "circle",
      avatarFrame: "double_ring",
      avatarFrameColor: "#9F1239",
    },
  },
  {
    id: "emerald_minimal",
    name: "Zümrüt Minimal",
    description: "Ferah nokta deseni ve doğadan gelen tonlar",
    previewBg: "#ECFDF5",
    previewCard: "#FFFFFF",
    previewAccent: "#059669",
    patch: {
      backgroundType: "pattern_dots",
      bgSolidColor: "#F2FBF7",
      patternId: "minimal_dots",
      patternOpacity: 22,
      themePreset: "emerald",
      primaryAccent: "#059669",
      secondaryAccent: "#10B981",
      linkColor: "#047857",
      buttonColor: "#065F46",
      cardBgColor: "#FFFFFF",
      borderColor: "#D1FAE5",
      fontFamily: "minimal",
      headerLayout: "classic",
      buttonStyle: "soft",
      cardStyle: "minimal",
      cardRadius: 20,
      cardShadowIntensity: 10,
      cardOpacity: 100,
      glassmorphism: false,
      avatarShape: "squircle",
      avatarFrame: "simple_ring",
      avatarFrameColor: "#059669",
    },
  },
  {
    id: "lavender_soft",
    name: "Lavanta Stüdyo",
    description: "Yumuşak geçişli arka plan ve kavisli kartlar",
    previewBg: "linear-gradient(135deg, #F5F3FF, #EDE9FE)",
    previewCard: "#FFFFFF",
    previewAccent: "#7C3AED",
    patch: {
      backgroundType: "gradient",
      bgGradientStart: "#F5F3FF",
      bgGradientEnd: "#EDE9FE",
      bgGradientDirection: "135deg",
      themePreset: "lavender",
      primaryAccent: "#7C3AED",
      secondaryAccent: "#A855F7",
      linkColor: "#6D28D9",
      buttonColor: "#5B21B6",
      cardBgColor: "#FFFFFF",
      borderColor: "#DDD6FE",
      fontFamily: "rounded",
      headerLayout: "centered",
      buttonStyle: "pill",
      cardStyle: "rounded_soft",
      cardRadius: 30,
      cardShadowIntensity: 24,
      cardOpacity: 96,
      glassmorphism: true,
      avatarShape: "circle",
      avatarFrame: "gradient_ring",
      avatarFrameColor: "#7C3AED",
    },
  },
  {
    id: "monochrome_press",
    name: "Monokrom Baskı",
    description: "Siyah-beyaz keskin editoryal sadelik",
    previewBg: "#F8FAFC",
    previewCard: "#FFFFFF",
    previewAccent: "#0F172A",
    patch: {
      backgroundType: "solid",
      bgSolidColor: "#F5F5F5",
      themePreset: "classic_bw",
      primaryAccent: "#0F172A",
      secondaryAccent: "#475569",
      linkColor: "#0F172A",
      buttonColor: "#000000",
      cardBgColor: "#FFFFFF",
      borderColor: "#CBD5E1",
      fontFamily: "classic",
      headerLayout: "editorial",
      buttonStyle: "solid",
      cardStyle: "flat",
      cardRadius: 8,
      cardShadowIntensity: 0,
      cardOpacity: 100,
      glassmorphism: false,
      avatarShape: "square",
      avatarFrame: "simple_ring",
      avatarFrameColor: "#0F172A",
    },
  },
  {
    id: "midnight_obsidian",
    name: "Obsidyen Geliştirici",
    description: "Koyu teknik matris ve monospace tipografi",
    previewBg: "#0B1120",
    previewCard: "#111827",
    previewAccent: "#10B981",
    patch: {
      backgroundType: "pattern_preset",
      bgSolidColor: "#0B1120",
      patternId: "circuit_tech",
      patternOpacity: 18,
      themePreset: "custom",
      primaryAccent: "#10B981",
      secondaryAccent: "#06B6D4",
      linkColor: "#34D399",
      buttonColor: "#10B981",
      cardBgColor: "#111827",
      borderColor: "#1F2937",
      fontFamily: "monospace",
      headerLayout: "classic",
      buttonStyle: "outline",
      cardStyle: "thin_border",
      cardRadius: 16,
      cardShadowIntensity: 20,
      cardOpacity: 95,
      glassmorphism: true,
      avatarShape: "rounded",
      avatarFrame: "neon_glow",
      avatarFrameColor: "#10B981",
    },
  },
];

export interface ThemePresetDefinition {
  id: ThemePresetId;
  name: string;
  primaryAccent: string;
  secondaryAccent: string;
  linkColor: string;
  buttonColor: string;
  cardBgColor: string;
  borderColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
}

export const COLOR_THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: "ocean_blue",
    name: "Okyanus Mavisi",
    primaryAccent: "#185EDB",
    secondaryAccent: "#3B82F6",
    linkColor: "#185EDB",
    buttonColor: "#0F172A",
    cardBgColor: "#FFFFFF",
    borderColor: "#DBEAFE",
    bgGradientStart: "#EFF6FF",
    bgGradientEnd: "#DBEAFE"
  },
  {
    id: "night_navy",
    name: "Gece Laciverti",
    primaryAccent: "#38BDF8",
    secondaryAccent: "#818CF8",
    linkColor: "#38BDF8",
    buttonColor: "#1E293B",
    cardBgColor: "#0F172A",
    borderColor: "#1E293B",
    bgGradientStart: "#0B1120",
    bgGradientEnd: "#1E1B4B"
  },
  {
    id: "purple",
    name: "Mor",
    primaryAccent: "#7C3AED",
    secondaryAccent: "#A855F7",
    linkColor: "#7C3AED",
    buttonColor: "#4C1D95",
    cardBgColor: "#FFFFFF",
    borderColor: "#EDE9FE",
    bgGradientStart: "#F5F3FF",
    bgGradientEnd: "#EDE9FE"
  },
  {
    id: "lavender",
    name: "Lavanta",
    primaryAccent: "#8B5CF6",
    secondaryAccent: "#C084FC",
    linkColor: "#7C3AED",
    buttonColor: "#5B21B6",
    cardBgColor: "#FAF5FF",
    borderColor: "#E9D5FF",
    bgGradientStart: "#FAF5FF",
    bgGradientEnd: "#F3E8FF"
  },
  {
    id: "emerald",
    name: "Zümrüt Yeşili",
    primaryAccent: "#059669",
    secondaryAccent: "#10B981",
    linkColor: "#059669",
    buttonColor: "#064E3B",
    cardBgColor: "#FFFFFF",
    borderColor: "#D1FAE5",
    bgGradientStart: "#ECFDF5",
    bgGradientEnd: "#D1FAE5"
  },
  {
    id: "turquoise",
    name: "Turkuaz",
    primaryAccent: "#0891B2",
    secondaryAccent: "#06B6D4",
    linkColor: "#0E7490",
    buttonColor: "#164E63",
    cardBgColor: "#FFFFFF",
    borderColor: "#CFFAFE",
    bgGradientStart: "#ECFEFF",
    bgGradientEnd: "#CFFAFE"
  },
  {
    id: "burgundy",
    name: "Bordo",
    primaryAccent: "#9F1239",
    secondaryAccent: "#E11D48",
    linkColor: "#9F1239",
    buttonColor: "#881337",
    cardBgColor: "#FFFFFF",
    borderColor: "#FFE4E6",
    bgGradientStart: "#FFF1F2",
    bgGradientEnd: "#FFE4E6"
  },
  {
    id: "rose_pink",
    name: "Gül Pembesi",
    primaryAccent: "#DB2777",
    secondaryAccent: "#F472B6",
    linkColor: "#DB2777",
    buttonColor: "#831843",
    cardBgColor: "#FFFBFD",
    borderColor: "#FCE7F3",
    bgGradientStart: "#FDF2F8",
    bgGradientEnd: "#FCE7F3"
  },
  {
    id: "orange",
    name: "Turuncu",
    primaryAccent: "#EA580C",
    secondaryAccent: "#F97316",
    linkColor: "#C2410C",
    buttonColor: "#7C2D12",
    cardBgColor: "#FFFFFF",
    borderColor: "#FFEDD5",
    bgGradientStart: "#FFF7ED",
    bgGradientEnd: "#FFEDD5"
  },
  {
    id: "red",
    name: "Kırmızı",
    primaryAccent: "#DC2626",
    secondaryAccent: "#EF4444",
    linkColor: "#B91C1C",
    buttonColor: "#7F1D1D",
    cardBgColor: "#FFFFFF",
    borderColor: "#FEE2E2",
    bgGradientStart: "#FEF2F2",
    bgGradientEnd: "#FEE2E2"
  },
  {
    id: "minimal_gray",
    name: "Minimal Gri",
    primaryAccent: "#475569",
    secondaryAccent: "#64748B",
    linkColor: "#334155",
    buttonColor: "#1E293B",
    cardBgColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    bgGradientStart: "#F8FAFC",
    bgGradientEnd: "#F1F5F9"
  },
  {
    id: "classic_bw",
    name: "Klasik Siyah-Beyaz",
    primaryAccent: "#0F172A",
    secondaryAccent: "#334155",
    linkColor: "#0F172A",
    buttonColor: "#000000",
    cardBgColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    bgGradientStart: "#FFFFFF",
    bgGradientEnd: "#F1F5F9"
  }
];

export const FONT_FAMILY_OPTIONS: {
  id: FontFamilyId;
  name: string;
  description: string;
  cssValue: string;
}[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Temiz ve dengeli dijital görünüm",
    cssValue: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  {
    id: "classic",
    name: "Klasik",
    description: "Kurumsal ve zamansız oranlar",
    cssValue: "'Helvetica Neue', Arial, sans-serif"
  },
  {
    id: "rounded",
    name: "Yuvarlak",
    description: "Samimi ve yumuşak hatlı karakterler",
    cssValue: "'Nunito', 'Quicksand', 'Varela Round', system-ui, sans-serif"
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Yalın ve ferah tipografi",
    cssValue: "'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif"
  },
  {
    id: "tech",
    name: "Teknolojik",
    description: "Mühendislik ve gelecek odaklı",
    cssValue: "'Space Grotesk', 'JetBrains Mono', 'Trebuchet MS', sans-serif"
  },
  {
    id: "serif",
    name: "Serif",
    description: "Edebi ve akademik tırnaklı yazı",
    cssValue: "Georgia, 'Playfair Display', 'Times New Roman', serif"
  },
  {
    id: "monospace",
    name: "Monospace",
    description: "Geliştirici ve kod estetiği",
    cssValue: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
  }
];

export const CARD_STYLE_PRESETS: {
  id: CardStyleId;
  name: string;
  description: string;
  radius: number;
  shadowIntensity: number;
}[] = [
  {
    id: "classic",
    name: "Klasik Kart",
    description: "Genç Sosyal standart dengeli kart görünümü",
    radius: 24,
    shadowIntensity: 20
  },
  {
    id: "minimal",
    name: "Minimal Kart",
    description: "Gölgesiz, hafif ve sade yüzey",
    radius: 16,
    shadowIntensity: 5
  },
  {
    id: "soft_shadow",
    name: "Hafif Gölgeli Kart",
    description: "Derinlik hissi veren yumuşak yüzen kartlar",
    radius: 24,
    shadowIntensity: 55
  },
  {
    id: "thin_border",
    name: "İnce Kenarlıklı Kart",
    description: "Net çerçeveli, teknik doküman stili",
    radius: 14,
    shadowIntensity: 0
  },
  {
    id: "rounded_soft",
    name: "Yumuşak Köşeli Kart",
    description: "Geniş kavisli modern organik köşeler",
    radius: 32,
    shadowIntensity: 25
  },
  {
    id: "flat",
    name: "Düz ve Sade Kart",
    description: "Köşeli, keskin ve tamamen düz bloklar",
    radius: 6,
    shadowIntensity: 0
  }
];

export const AVATAR_FRAME_OPTIONS: {
  id: AvatarFrameId;
  name: string;
  description: string;
}[] = [
  { id: "none", name: "Varsayılan (Çerçevesiz)", description: "Standart temiz profil çerçevesi" },
  { id: "simple_ring", name: "Sade Vurgu Halkası", description: "Seçili renkte modern tek halka" },
  { id: "double_ring", name: "Çift Katmanlı Halka", description: "İç boşluklu zarif çift çerçeve" },
  { id: "gradient_ring", name: "Yumuşak Geçişli Çerçeve", description: "Ana ve ikincil vurgu rengi geçişi" },
  { id: "neon_glow", name: "Hafif Işıltılı Çerçeve", description: "Yumuşak dış parlama efekti" },
  { id: "squircle_frame", name: "Modern Yumuşak Kare", description: "Özel kavisli tasarım çerçevesi" },
  { id: "tech_hexagon", name: "Teknoloji Köşe Vurgusu", description: "Mühendislik stili keskin çerçeve" }
];

export const BACKGROUND_PATTERNS: {
  id: PatternId;
  category: "pattern_preset" | "pattern_geometric" | "pattern_dots" | "pattern_lines";
  name: string;
}[] = [
  { id: "grid_soft", category: "pattern_preset", name: "Mühendislik Izgarası" },
  { id: "diagonal_waves", category: "pattern_preset", name: "Yumuşak Dalgalar" },
  { id: "circuit_tech", category: "pattern_preset", name: "Teknoloji Matrisi" },
  { id: "topography", category: "pattern_preset", name: "Topoğrafik Halkalar" },
  { id: "hex_geometric", category: "pattern_geometric", name: "Altıgen Geometri" },
  { id: "triangles_soft", category: "pattern_geometric", name: "Geometrik Prizma" },
  { id: "minimal_dots", category: "pattern_dots", name: "Minimal Noktalar" },
  { id: "minimal_lines", category: "pattern_lines", name: "Minimal Diyagonal Çizgiler" },
  { id: "crosshatch", category: "pattern_lines", name: "İnce Çapraz Çizgiler" }
];

// Unicode Text Transformations with full Turkish character preservation
const UPSIDE_DOWN_MAP: Record<string, string> = {
  a: "ɐ", b: "q", c: "ɔ", ç: "ɔ̇", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", ğ: "ƃ̆",
  h: "ɥ", ı: "ı", i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o",
  ö: "o̤", p: "d", q: "b", r: "ɹ", s: "s", ş: "ṡ", t: "ʇ", u: "n", ü: "n̤",
  v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  A: "∀", B: "ᙠ", C: "Ɔ", Ç: "Ɔ̇", D: "ᗡ", E: "Ǝ", F: "Ⅎ", G: "פ", Ğ: "פ̆",
  H: "H", I: "I", İ: "İ", J: "ſ", K: "ʞ", L: "˥", M: "W", N: "N", O: "O",
  Ö: "O̤", P: "Ԁ", Q: "Ό", R: "ᴚ", S: "S", Ş: "Ṡ", T: "⊥", U: "∩", Ü: "∩̤",
  V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6", "0": "0",
  ".": "˙", ",": "'", "?": "¿", "!": "¡", "(": ")", ")": "("
};

const SMALL_CAPS_MAP: Record<string, string> = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", ç: "Ç", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", ğ: "Ğ",
  h: "ʜ", ı: "ɪ", i: "İ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ",
  ö: "Ö", p: "ᴘ", q: "ǫ", r: "ʀ", s: "ꜱ", ş: "Ş", t: "ᴛ", u: "ᴜ", ü: "Ü",
  v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ"
};

const UNICODE_BOLD_SERIF_MAP: Record<string, string> = {
  a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦",
  n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
  A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌",
  N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙"
};

const UNICODE_SCRIPT_MAP: Record<string, string> = {
  a: "𝒶", b: "𝒷", c: "𝒸", d: "𝒹", e: "ℯ", f: "𝒻", g: "ℊ", h: "𝒽", i: "𝒾", j: "𝒿", k: "𝓀", l: "𝓁", m: "𝓂",
  n: "𝓃", o: "ℴ", p: "𝓅", q: "𝓆", r: "𝓇", s: "𝓈", t: "𝓉", u: "𝓊", v: "𝓋", w: "𝓌", x: "𝓍", y: "𝓎", z: "𝓏",
  A: "𝒜", B: "ℬ", C: "𝒞", D: "𝒟", E: "ℰ", F: "ℱ", G: "𝒢", H: "ℋ", I: "ℐ", J: "𝒥", K: "𝒦", L: "ℒ", M: "ℳ",
  N: "𝒩", O: "𝒪", P: "𝒫", Q: "𝒬", R: "ℛ", S: "𝒮", T: "𝒯", U: "𝒰", V: "𝒱", W: "𝒲", X: "𝒳", Y: "𝒴", Z: "𝒵"
};

const MONOSPACE_UNICODE_MAP: Record<string, string> = {
  a: "𝚊", b: "𝚋", c: "𝚌", d: "𝚍", e: "𝚎", f: "𝚏", g: "𝚐", h: "𝚑", i: "𝚒", j: "𝚓", k: "𝚔", l: "𝚕", m: "𝚖",
  n: "𝚗", o: "𝚘", p: "𝚙", q: "𝚚", r: "𝚛", s: "𝚜", t: "𝚝", u: "𝚞", v: "𝚟", w: "𝚠", x: "𝚡", y: "𝚢", z: "𝚣",
  A: "𝙰", B: "𝙱", C: "𝙲", D: "𝙳", E: "𝙴", F: "𝙵", G: "𝙶", H: "𝙷", I: "𝙸", J: "𝙹", K: "𝙺", L: "𝙻", M: "𝙼",
  N: "𝙽", O: "𝙾", P: "𝙿", Q: "𝚀", R: "𝚁", S: "𝚂", T: "𝚃", U: "𝚄", V: "𝚅", W: "𝚆", X: "𝚇", Y: "𝚈", Z: "𝚉"
};

/**
 * Pure presentation transformation function.
 * Never mutates the original stored string in the database.
 */
export function applySpecialTextTransform(text: string, mode: TextTransformId): string {
  if (!text || mode === "none") return text;

  const chars = Array.from(text);

  switch (mode) {
    case "upside_down":
      return chars
        .reverse()
        .map((ch) => UPSIDE_DOWN_MAP[ch] ?? ch)
        .join("");

    case "reverse":
      return chars.reverse().join("");

    case "fullwidth":
      return chars
        .map((ch) => {
          const code = ch.charCodeAt(0);
          if (code >= 33 && code <= 126) {
            return String.fromCharCode(code + 0xfee0);
          }
          if (ch === " ") return "　";
          return ch;
        })
        .join("");

    case "small_caps":
      return chars.map((ch) => SMALL_CAPS_MAP[ch] ?? ch).join("");

    case "unicode_bold_serif":
      return chars.map((ch) => UNICODE_BOLD_SERIF_MAP[ch] ?? ch).join("");

    case "unicode_script":
      return chars.map((ch) => UNICODE_SCRIPT_MAP[ch] ?? ch).join("");

    case "monospace":
      return chars.map((ch) => MONOSPACE_UNICODE_MAP[ch] ?? ch).join("");

    default:
      return text;
  }
}

export const TEXT_TRANSFORM_OPTIONS: {
  id: TextTransformId;
  name: string;
  exampleInput: string;
  description: string;
  screenReaderWarning?: boolean;
}[] = [
  {
    id: "none",
    name: "Normal (Varsayılan)",
    exampleInput: "Merhaba Genç Sosyal",
    description: "Orijinal metin görünümü"
  },
  {
    id: "upside_down",
    name: "Ters Çevrilmiş Metin",
    exampleInput: "Merhaba",
    description: '"Merhaba" → "ɐqɐɥɹǝW"',
    screenReaderWarning: true
  },
  {
    id: "reverse",
    name: "Harfleri Ters Sıralama",
    exampleInput: "Merhaba",
    description: '"Merhaba" → "abahreM"',
    screenReaderWarning: true
  },
  {
    id: "fullwidth",
    name: "Tam Genişlikli Stil",
    exampleInput: "Merhaba",
    description: "Estetik geniş aralıklı karakterler",
    screenReaderWarning: true
  },
  {
    id: "small_caps",
    name: "Küçük Büyük Harf (Small Caps)",
    exampleInput: "Merhaba Genç Sosyal",
    description: "Kompakt büyük harf estetiği"
  },
  {
    id: "unicode_bold_serif",
    name: "Dekoratif Kalın Serif",
    exampleInput: "Merhaba",
    description: "Klasik vurgulu Unicode karakterler",
    screenReaderWarning: true
  },
  {
    id: "unicode_script",
    name: "Dekoratif El Yazısı",
    exampleInput: "Merhaba",
    description: "Zarif kaligrafik Unicode görünümü",
    screenReaderWarning: true
  },
  {
    id: "monospace",
    name: "Monospace Karakter Stili",
    exampleInput: "Merhaba",
    description: "Sabit genişlikli daktilo/kod karakterleri"
  }
];

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(255, 255, 255, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isColorDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.45;
}

function getRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 1;
  const channels = [0, 2, 4].map((offset) => {
    const v = parseInt(clean.slice(offset, offset + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const l1 = getRelativeLuminance(hexA);
  const l2 = getRelativeLuminance(hexB);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return Number(((bright + 0.05) / (dark + 0.05)).toFixed(2));
}

export function getPatternCssBackground(
  patternId: PatternId,
  accentHex: string,
  opacityPercent: number
): { backgroundImage: string; backgroundSize: string } {
  const alpha = Math.max(0.05, Math.min(0.6, opacityPercent / 100));
  const color = hexToRgba(accentHex, alpha);

  switch (patternId) {
    case "minimal_dots":
      return {
        backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`,
        backgroundSize: "18px 18px"
      };
    case "minimal_lines":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 14px)`,
        backgroundSize: "20px 20px"
      };
    case "crosshatch":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%), repeating-linear-gradient(-45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
        backgroundSize: "16px 16px"
      };
    case "grid_soft":
      return {
        backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
        backgroundSize: "24px 24px"
      };
    case "hex_geometric":
      return {
        backgroundImage: `radial-gradient(circle farthest-side at 0% 50%, transparent 23.5%, ${color} 24%, ${color} 26%, transparent 26.5%), radial-gradient(circle farthest-side at 100% 50%, transparent 23.5%, ${color} 24%, ${color} 26%, transparent 26.5%)`,
        backgroundSize: "28px 48px"
      };
    case "triangles_soft":
      return {
        backgroundImage: `linear-gradient(30deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%, ${color}), linear-gradient(150deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%, ${color})`,
        backgroundSize: "32px 56px"
      };
    case "circuit_tech":
      return {
        backgroundImage: `radial-gradient(${color} 2px, transparent 2px), linear-gradient(to right, ${color} 1px, transparent 1px)`,
        backgroundSize: "24px 24px"
      };
    case "topography":
      return {
        backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, transparent 18px, ${color} 19px, transparent 20px)`,
        backgroundSize: "40px 40px"
      };
    case "diagonal_waves":
    default:
      return {
        backgroundImage: `repeating-linear-gradient(135deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 16px)`,
        backgroundSize: "24px 24px"
      };
  }
}

export function getProfileCustomizationStyles(raw?: Partial<ProfileCustomizationConfig> | null): {
  config: ProfileCustomizationConfig;
  pageContainerStyle: React.CSSProperties;
  patternOverlayStyle: React.CSSProperties | null;
  imageOverlayStyle: React.CSSProperties | null;
  cardStyle: React.CSSProperties;
  typographyStyle: React.CSSProperties;
  primaryButtonStyle: React.CSSProperties;
  accentBadgeStyle: React.CSSProperties;
  linkStyle: React.CSSProperties;
  avatarFrameStyle: React.CSSProperties;
  isDarkSurface: boolean;
  isDarkCard: boolean;
} {
  const config = normalizeProfileCustomization(raw);

  // Font family lookup
  const fontObj = FONT_FAMILY_OPTIONS.find((f) => f.id === config.fontFamily) || FONT_FAMILY_OPTIONS[0];

  // Page background calculation
  let pageContainerStyle: React.CSSProperties = {
    fontFamily: fontObj.cssValue,
    transition: "background 0.25s ease, color 0.25s ease"
  };

  let patternOverlayStyle: React.CSSProperties | null = null;
  let imageOverlayStyle: React.CSSProperties | null = null;
  let isDarkSurface = false;

  switch (config.backgroundType) {
    case "dark":
      pageContainerStyle.backgroundColor = "#0B1120";
      isDarkSurface = true;
      break;
    case "solid":
      pageContainerStyle.backgroundColor = config.bgSolidColor;
      isDarkSurface = isColorDark(config.bgSolidColor);
      break;
    case "gradient":
      pageContainerStyle.backgroundImage = `linear-gradient(${config.bgGradientDirection}, ${config.bgGradientStart}, ${config.bgGradientEnd})`;
      isDarkSurface = isColorDark(config.bgGradientStart) && isColorDark(config.bgGradientEnd);
      break;
    case "pattern_preset":
    case "pattern_geometric":
    case "pattern_dots":
    case "pattern_lines": {
      pageContainerStyle.backgroundColor = config.bgSolidColor || "#F8FAFC";
      isDarkSurface = isColorDark(config.bgSolidColor || "#F8FAFC");
      const pat = getPatternCssBackground(config.patternId, config.primaryAccent, config.patternOpacity);
      patternOverlayStyle = {
        backgroundImage: pat.backgroundImage,
        backgroundSize: pat.backgroundSize
      };
      break;
    }
    case "custom_image":
      pageContainerStyle.backgroundColor = "#0F172A";
      if (config.bgImageUrl) {
        pageContainerStyle.backgroundImage = `url("${config.bgImageUrl}")`;
        pageContainerStyle.backgroundSize = "cover";
        pageContainerStyle.backgroundPosition = config.bgImagePosition;
        pageContainerStyle.backgroundAttachment = "fixed";
      }
      imageOverlayStyle = {
        backgroundColor: hexToRgba(config.bgOverlayColor, config.bgOverlayOpacity / 100),
        backdropFilter: config.preserveReadability ? "blur(2px)" : undefined
      };
      isDarkSurface = config.bgOverlayOpacity >= 40 && isColorDark(config.bgOverlayColor);
      break;
    case "default_light":
    default:
      pageContainerStyle.backgroundColor = "#F4F6FA";
      isDarkSurface = false;
      break;
  }

  // Card surface calculation
  const isDarkCard = isColorDark(config.cardBgColor);
  const cardAlpha = config.glassmorphism
    ? Math.min(0.86, config.cardOpacity / 100)
    : config.cardOpacity / 100;

  const shadowAlpha = (config.cardShadowIntensity / 100) * 0.18;
  const cardStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(config.cardBgColor, cardAlpha),
    borderColor: config.borderColor,
    borderWidth: config.cardStyle === "thin_border" ? "1.5px" : "1px",
    borderStyle: "solid",
    borderRadius: `${config.cardRadius}px`,
    boxShadow:
      config.cardShadowIntensity > 0
        ? `0 10px 30px -5px rgba(15, 23, 42, ${shadowAlpha.toFixed(3)})`
        : "none",
    backdropFilter: config.glassmorphism ? "blur(14px)" : undefined,
    color: isDarkCard ? "#F8FAFC" : "#0F172A"
  };

  // Typography style for bio & customizable profile text
  const typographyStyle: React.CSSProperties = {
    fontFamily: fontObj.cssValue,
    fontWeight: config.fontBold ? 700 : 400,
    fontStyle: config.fontItalic ? "italic" : "normal",
    letterSpacing: config.letterSpacingWide ? "0.06em" : "normal",
    textTransform:
      config.textCase === "uppercase"
        ? "uppercase"
        : config.textCase === "lowercase"
        ? "lowercase"
        : "none",
    textDecoration: config.textDecoration
  };

  const buttonRadius = config.buttonStyle === "pill" ? "9999px" : "12px";
  let primaryButtonStyle: React.CSSProperties;
  if (config.buttonStyle === "outline") {
    primaryButtonStyle = {
      backgroundColor: "transparent",
      color: config.buttonColor,
      borderColor: config.buttonColor,
      borderWidth: "1.5px",
      borderStyle: "solid",
      borderRadius: buttonRadius,
    };
  } else if (config.buttonStyle === "soft") {
    primaryButtonStyle = {
      backgroundColor: hexToRgba(config.buttonColor, isDarkCard ? 0.22 : 0.12),
      color: isDarkCard ? "#F8FAFC" : config.buttonColor,
      borderColor: hexToRgba(config.buttonColor, 0.28),
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: buttonRadius,
    };
  } else {
    primaryButtonStyle = {
      backgroundColor: config.buttonColor,
      color: isColorDark(config.buttonColor) ? "#FFFFFF" : "#0F172A",
      borderColor: config.buttonColor,
      borderRadius: buttonRadius,
    };
  }

  const accentBadgeStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(config.primaryAccent, 0.12),
    color: config.primaryAccent,
    borderColor: hexToRgba(config.primaryAccent, 0.25)
  };

  const linkStyle: React.CSSProperties = {
    color: config.linkColor
  };

  const shapeRadiusMap: Record<AvatarShapeId, string> = {
    circle: "9999px",
    rounded: "18px",
    squircle: "28px",
    square: "8px",
  };
  const baseAvatarRadius = shapeRadiusMap[config.avatarShape] || "18px";

  // Avatar frame calculation (designed never to conflict with blue verification badge)
  let avatarFrameStyle: React.CSSProperties = {
    borderRadius: baseAvatarRadius
  };

  switch (config.avatarFrame) {
    case "simple_ring":
      avatarFrameStyle = {
        borderRadius: baseAvatarRadius,
        boxShadow: `0 0 0 3.5px ${config.avatarFrameColor}`
      };
      break;
    case "double_ring":
      avatarFrameStyle = {
        borderRadius: baseAvatarRadius,
        boxShadow: `0 0 0 2px ${config.cardBgColor}, 0 0 0 5px ${config.avatarFrameColor}`
      };
      break;
    case "gradient_ring":
      avatarFrameStyle = {
        borderRadius: baseAvatarRadius,
        padding: "3px",
        backgroundImage: `linear-gradient(135deg, ${config.primaryAccent}, ${config.secondaryAccent})`
      };
      break;
    case "neon_glow":
      avatarFrameStyle = {
        borderRadius: baseAvatarRadius,
        boxShadow: `0 0 0 2.5px ${config.avatarFrameColor}, 0 0 18px ${hexToRgba(config.avatarFrameColor, 0.55)}`
      };
      break;
    case "squircle_frame":
      avatarFrameStyle = {
        borderRadius: "28px",
        boxShadow: `0 0 0 3px ${config.avatarFrameColor}`
      };
      break;
    case "tech_hexagon":
      avatarFrameStyle = {
        borderRadius: "8px",
        boxShadow: `0 0 0 3px ${config.avatarFrameColor}`,
      };
      break;
    case "none":
    default:
      avatarFrameStyle = {
        borderRadius: baseAvatarRadius
      };
      break;
  }

  return {
    config,
    pageContainerStyle,
    patternOverlayStyle,
    imageOverlayStyle,
    cardStyle,
    typographyStyle,
    primaryButtonStyle,
    accentBadgeStyle,
    linkStyle,
    avatarFrameStyle,
    isDarkSurface,
    isDarkCard
  };
}
