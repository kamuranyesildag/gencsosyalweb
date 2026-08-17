import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional().or(z.literal("")),
  website: z.string().url().max(255).optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  coverUrl: z.string().optional().or(z.literal("")),
  isPrivate: z.boolean().optional(),
  allowSearchEngineIndexing: z.boolean().optional(),
  messagePreference: z.enum(["ANYONE", "FOLLOWERS", "NONE"]).optional(),
  mentionPreference: z.enum(["ANYONE", "FOLLOWERS", "NONE"]).optional(),
  defaultPostVisibility: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]).optional(),
});

export const createPostSchema = z.object({
  content: z.string().max(2000).optional(),
  communityId: z.number().int().positive().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]).default("PUBLIC"),
  postType: z.enum(["NORMAL", "POLL", "SENSITIVE"]).default("NORMAL"),
  contentWarning: z.string().max(100).optional(),
  pollOptions: z.array(z.string().min(1).max(100)).min(2).max(10).optional(),
  media: z.array(z.object({
    url: z.string(),
    type: z.enum(["image", "video"]),
    width: z.number().optional(),
    height: z.number().optional()
  })).optional()
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
