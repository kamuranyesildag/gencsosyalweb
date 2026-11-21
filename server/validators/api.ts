import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const suggestionQuerySchema = z.object({
  limit: z.coerce.number().min(1, "Limit en az 1 olmalıdır.").max(50, "Limit en fazla 50 olabilir.").default(10),
  offset: z.coerce.number().min(0, "Offset negatif olamaz.").default(0),
});

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir HEX renk kodu giriniz.");

const safeImageUrlSchema = z.string().max(500).refine(
  (val) => {
    if (val === "") return true;
    if (val.includes("..") || val.includes("\\")) return false;
    return (
      /^\/uploads\/[a-zA-Z0-9._/-]+$/.test(val) ||
      /^\/assets\/[a-zA-Z0-9._/-]+$/.test(val) ||
      /^https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*$/.test(val)
    );
  },
  "Geçersiz veya güvenli olmayan görsel bağlantısı."
);

const safeHttpUrlSchema = z.string().trim().max(255).refine(
  (val) => {
    if (!val) return false;
    try {
      const parsed = new URL(val);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  },
  "Lütfen geçerli bir https:// veya http:// bağlantısı girin."
);

const safeOptionalHttpUrlSchema = z.string().trim().max(255).refine(
  (val) => {
    if (val === "") return true;
    try {
      const parsed = new URL(val);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  },
  "Lütfen geçerli bir https:// veya http:// bağlantısı girin."
);

export const profileSocialLinkSchema = z.object({
  platform: z.enum(["github", "linkedin", "instagram", "x", "youtube", "behance", "website"]),
  url: safeHttpUrlSchema,
  label: z.string().trim().max(30).optional().default(""),
});

export const profileFeaturedHighlightSchema = z.object({
  title: z.string().trim().max(60).default(""),
  subtitle: z.string().trim().max(140).default(""),
  url: safeOptionalHttpUrlSchema.default(""),
});

export const profileCustomizationSchema = z.object({
  // 1. Background
  backgroundType: z.enum([
    "default_light",
    "dark",
    "solid",
    "gradient",
    "pattern_preset",
    "pattern_geometric",
    "pattern_dots",
    "pattern_lines",
    "custom_image"
  ]).default("default_light"),
  bgSolidColor: hexColorSchema.default("#F8FAFC"),
  bgGradientStart: hexColorSchema.default("#EFF6FF"),
  bgGradientEnd: hexColorSchema.default("#E0E7FF"),
  bgGradientDirection: z.enum(["to bottom", "to right", "to bottom right", "135deg", "45deg"]).default("135deg"),
  patternId: z.enum([
    "grid_soft",
    "diagonal_waves",
    "circuit_tech",
    "topography",
    "hex_geometric",
    "triangles_soft",
    "minimal_dots",
    "minimal_lines",
    "crosshatch"
  ]).default("minimal_dots"),
  patternOpacity: z.number().min(5).max(60).default(20),
  bgImageUrl: safeImageUrlSchema.default(""),
  bgImagePosition: z.enum(["center", "top", "bottom", "left", "right"]).default("center"),
  bgOverlayOpacity: z.number().min(0).max(90).default(45),
  bgOverlayColor: hexColorSchema.default("#0F172A"),
  preserveReadability: z.boolean().default(true),

  // 2. Color Theme
  themePreset: z.enum([
    "ocean_blue",
    "night_navy",
    "purple",
    "lavender",
    "emerald",
    "turquoise",
    "burgundy",
    "rose_pink",
    "orange",
    "red",
    "minimal_gray",
    "classic_bw",
    "custom"
  ]).default("ocean_blue"),
  primaryAccent: hexColorSchema.default("#185EDB"),
  secondaryAccent: hexColorSchema.default("#3B82F6"),
  linkColor: hexColorSchema.default("#185EDB"),
  buttonColor: hexColorSchema.default("#0F172A"),
  cardBgColor: hexColorSchema.default("#FFFFFF"),
  borderColor: hexColorSchema.default("#E2E8F0"),

  // 3. Typography & Text Styles
  fontFamily: z.enum([
    "modern",
    "classic",
    "rounded",
    "minimal",
    "tech",
    "serif",
    "monospace"
  ]).default("modern"),
  fontBold: z.boolean().default(false),
  fontItalic: z.boolean().default(false),
  letterSpacingWide: z.boolean().default(false),
  textCase: z.enum(["normal", "uppercase", "lowercase"]).default("normal"),
  textDecoration: z.enum(["none", "underline", "line-through"]).default("none"),
  textTransform: z.enum([
    "none",
    "upside_down",
    "reverse",
    "fullwidth",
    "unicode_bold_serif",
    "unicode_script",
    "small_caps",
    "monospace"
  ]).default("none"),
  applyTransformToDisplayName: z.boolean().default(false),

  // 4. Profile Cards & Layout
  headerLayout: z.enum(["classic", "centered", "editorial"]).default("classic"),
  buttonStyle: z.enum(["solid", "outline", "soft", "pill"]).default("solid"),
  cardStyle: z.enum([
    "classic",
    "minimal",
    "soft_shadow",
    "thin_border",
    "rounded_soft",
    "flat"
  ]).default("classic"),
  cardRadius: z.number().min(0).max(36).default(24),
  cardShadowIntensity: z.number().min(0).max(100).default(20),
  cardPadding: z.enum(["compact", "normal", "spacious"]).default("normal"),
  cardOpacity: z.number().min(75).max(100).default(100),

  // 5. Borders & Appearance (Cover & Avatar Frame)
  coverPosition: z.enum(["center", "top", "bottom"]).default("center"),
  coverHeight: z.enum(["compact", "normal", "tall"]).default("normal"),
  coverOverlayOpacity: z.number().min(0).max(70).default(0),
  avatarShape: z.enum(["circle", "rounded", "squircle", "square"]).default("rounded"),
  avatarFrame: z.enum([
    "none",
    "simple_ring",
    "double_ring",
    "gradient_ring",
    "neon_glow",
    "squircle_frame",
    "tech_hexagon"
  ]).default("none"),
  avatarFrameColor: hexColorSchema.default("#185EDB"),

  // 6. Identity & Showcase
  statusText: z.string().trim().max(60).default(""),
  showJoinDate: z.boolean().default(true),
  showStats: z.boolean().default(true),
  socialLinks: z.array(profileSocialLinkSchema).max(6).default([]),
  featuredHighlight: profileFeaturedHighlightSchema.default({ title: "", subtitle: "", url: "" }),

  // 7. Advanced Customization
  glassmorphism: z.boolean().default(false),
  highContrastText: z.boolean().default(true),
  compactHeader: z.boolean().default(false)
});

export const saveProfileStudioSchema = z.object({
  customization: profileCustomizationSchema,
  coverUrl: safeImageUrlSchema.optional(),
  avatarUrl: safeImageUrlSchema.optional(),
  displayName: z.string().trim().min(2, "Görünen ad en az 2 karakter olmalıdır.").max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  location: z.string().trim().max(100).optional(),
  website: safeOptionalHttpUrlSchema.optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional().or(z.literal("")),
  website: safeOptionalHttpUrlSchema.optional(),
  location: z.string().max(100).optional().or(z.literal("")),
  avatarUrl: safeImageUrlSchema.optional(),
  coverUrl: safeImageUrlSchema.optional(),
  isPrivate: z.boolean().optional(),
  allowSearchEngineIndexing: z.boolean().optional(),
  messagePreference: z.enum(["ANYONE", "FOLLOWERS", "NONE"]).optional(),
  mentionPreference: z.enum(["ANYONE", "FOLLOWERS", "NONE"]).optional(),
  defaultPostVisibility: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]).optional(),
  interests: z.array(z.string()).optional(),
  profileCustomization: profileCustomizationSchema.optional(),
});

export const createPostSchema = z.object({
  content: z.string().max(2000).optional(),
  communityId: z.number().int().positive().optional(),
  collaboratorId: z.number().int().positive().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]).default("PUBLIC"),
  postType: z.enum(["NORMAL", "POLL", "SENSITIVE"]).default("NORMAL"),
  quotedPostId: z.number().int().positive().optional(),
  contentWarning: z.string().max(100).optional(),
  pollOptions: z.array(z.string().min(1).max(100)).min(2).max(10).optional(),
  media: z.array(z.union([
    z.object({
      url: z.string(),
      type: z.enum(["image", "video"]),
      width: z.number().optional(),
      height: z.number().optional(),
      duration: z.number().optional(),
      thumbnailUrl: z.string().optional(),
    }),
    z.string().transform(url => ({
      url,
      type: (url.includes('.mp4') || url.includes('.webm') || url.includes('_compressed') ? 'video' : 'image') as 'image' | 'video',
      width: undefined,
      height: undefined,
      duration: undefined,
      thumbnailUrl: undefined,
    }))
  ])).optional()
}).refine(data => {
  if (data.postType === "POLL" && (!data.pollOptions || data.pollOptions.length < 2)) return false;
  if (data.postType === "SENSITIVE" && !data.contentWarning) return false;
  return data.content || (data.media && data.media.length > 0) || (data.postType === "POLL");
}, {
  message: "Gönderi metni veya medya içermelidir."
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.number().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur."),
  newPassword: z.string()
    .min(8, "Yeni şifre en az 8 karakter olmalıdır.")
    .regex(/[a-z]/, "Yeni şifre en az bir küçük harf içermelidir.")
    .regex(/[A-Z]/, "Yeni şifre en az bir büyük harf içermelidir.")
    .regex(/[0-9]/, "Yeni şifre en az bir rakam içermelidir.")
});

export const changeEmailSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre zorunludur.")
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Şifre zorunludur.")
});
