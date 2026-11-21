import { Router, Request, Response } from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { db } from "../../src/db/index.js";
import {
  teams,
  teamMembers,
  teamJoinRequests,
  teamInvitations,
  teamBans,
  teamAuditLogs,
  users,
  profiles,
  blocks,
} from "../../src/db/schema.js";
import { eq, and, or, desc, asc, isNull, ilike, sql, inArray } from "drizzle-orm";
import {
  requireAuth,
  optionalAuth,
  requireAuthContext,
  optionalAuthContext,
} from "../middleware/auth.js";
import { standardLimiter } from "../middleware/rateLimiter.js";
import { notify } from "../utils/notifications.js";

export const teamsRouter = Router();

// --- SECURITY RATE LIMITERS ---

const teamCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Saatte en fazla 5 takım oluşturabilirsiniz. Lütfen daha sonra tekrar deneyin.",
    },
  },
});

const teamInviteCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Çok fazla davet kodu denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.",
    },
  },
});

const teamMutationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Çok hızlı işlem yapıyorsunuz. Lütfen kısa bir süre bekleyin.",
    },
  },
});

// --- CONSTANTS & ALLOWLISTS ---

const MAX_OWNED_TEAMS_PER_USER = 5;

const TEAM_CATEGORIES = [
  "YAZILIM",
  "TEKNOFEST",
  "ROBOTIK",
  "YAPAY_ZEKA",
  "TASARIM",
  "OYUN",
  "GENC_QUIZ",
  "GIRISIMCILIK",
  "GENEL",
] as const;

const TEAM_VISIBILITIES = ["PUBLIC", "PRIVATE", "INVITE_ONLY"] as const;
const TEAM_JOIN_POLICIES = ["OPEN", "APPROVAL", "INVITE_ONLY"] as const;
const ALLOWED_BANNER_COLORS = [
  "#2563EB",
  "#0F2557",
  "#4F46E5",
  "#0EA5E9",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0F172A",
] as const;

const ROLE_WEIGHT: Record<string, number> = {
  CAPTAIN: 3,
  CO_CAPTAIN: 2,
  MEMBER: 1,
};

// --- SECURITY HELPERS ---

const stripControlChars = (str: string): string =>
  str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\uFEFF]/g, "").trim();

const isSafeAvatarUrl = (url: string | null | undefined): boolean => {
  if (!url) return true;
  const trimmed = url.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length > 500) return false;
  if (trimmed.startsWith("/uploads/")) {
    return !trimmed.includes("..") && !trimmed.includes("\\");
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const generateSecureInviteCode = (): string => {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 unambiguous chars -> 50 bits entropy for 10 chars
  const bytes = crypto.randomBytes(10);
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += charset[bytes[i] % charset.length];
  }
  return code;
};

const safeTimingEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Compare against dummy buffer to keep execution time consistent
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

const slugifyTurkish = (input: string): string => {
  const trMap: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };
  const replaced = input.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => trMap[ch] || ch);
  const base = replaced
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base || "takim"}-${suffix}`;
};

const logTeamAudit = async (
  execDb: any,
  teamId: number,
  actorId: number | null,
  action: string,
  details?: string,
  targetUserId?: number | null
) => {
  try {
    await execDb.insert(teamAuditLogs).values({
      teamId,
      actorId,
      targetUserId: targetUserId ?? null,
      action,
      details: details ? stripControlChars(details).slice(0, 500) : null,
    });
  } catch (err) {
    console.warn("[Teams Audit] Log yazma hatası:", err);
  }
};

// Check if either user has blocked the other
const isBlockedBetween = async (execDb: any, userA: number, userB: number): Promise<boolean> => {
  if (userA === userB) return false;
  const rows = await execDb
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, userA), eq(blocks.blockedId, userB)),
        and(eq(blocks.blockerId, userB), eq(blocks.blockedId, userA))
      )
    )
    .limit(1);
  return rows.length > 0;
};

// Verify account eligibility to join a team (active, not underage-rejected, optional email verified)
const checkUserJoinEligibility = async (
  execDb: any,
  userId: number,
  team: { id: number; ownerId: number; requireVerifiedEmailToJoin: boolean; isLocked: boolean }
): Promise<{ ok: boolean; code?: string; message?: string }> => {
  if (team.isLocked) {
    return {
      ok: false,
      code: "TEAM_LOCKED",
      message: "Bu takım güvenlik nedeniyle şu anda yeni üye alımına kilitlidir.",
    };
  }

  // Ban check (cannot bypass via invite code or open join)
  const banRow = await execDb
    .select({ id: teamBans.id })
    .from(teamBans)
    .where(and(eq(teamBans.teamId, team.id), eq(teamBans.userId, userId)))
    .limit(1);

  if (banRow.length > 0) {
    return {
      ok: false,
      code: "BANNED_FROM_TEAM",
      message: "Bu takıma katılımınız takım yönetimi tarafından engellenmiştir.",
    };
  }

  // Block check against team owner
  if (await isBlockedBetween(execDb, userId, team.ownerId)) {
    return {
      ok: false,
      code: "BLOCKED",
      message: "Bu takıma katılamazsınız.",
    };
  }

  // User account status & verification checks
  const [userRow] = await execDb
    .select({
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      ageVerificationStatus: users.ageVerificationStatus,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow || !userRow.isActive) {
    return {
      ok: false,
      code: "ACCOUNT_INACTIVE",
      message: "Hesabınız aktif olmadığı için takıma katılamazsınız.",
    };
  }

  if (userRow.ageVerificationStatus === "REJECTED_UNDERAGE") {
    return {
      ok: false,
      code: "AGE_RESTRICTED",
      message: "Yaş doğrulama politikası gereği bu işlem gerçekleştirilemiyor.",
    };
  }

  if (team.requireVerifiedEmailToJoin && !userRow.emailVerified) {
    return {
      ok: false,
      code: "EMAIL_VERIFICATION_REQUIRED",
      message: "Bu takıma katılmak için e-posta adresinizin doğrulanmış olması gerekiyor.",
    };
  }

  return { ok: true };
};

// --- ZOD SCHEMAS ---

const createTeamSchema = z.object({
  name: z
    .string()
    .transform(stripControlChars)
    .pipe(z.string().min(3, "Takım adı en az 3 karakter olmalıdır.").max(80, "Takım adı en fazla 80 karakter olabilir.")),
  tag: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? stripControlChars(v).toUpperCase().replace(/[^A-Z0-9]/g, "") : null))
    .refine((v) => !v || (v.length >= 2 && v.length <= 10), {
      message: "Takım etiketi 2 ile 10 karakter arasında harf/rakam olmalıdır.",
    }),
  description: z
    .string()
    .transform(stripControlChars)
    .pipe(
      z
        .string()
        .min(10, "Takım açıklaması en az 10 karakter olmalıdır.")
        .max(1200, "Takım açıklaması en fazla 1200 karakter olabilir.")
    ),
  category: z.enum(TEAM_CATEGORIES).default("GENEL"),
  visibility: z.enum(TEAM_VISIBILITIES).default("PUBLIC"),
  joinPolicy: z.enum(TEAM_JOIN_POLICIES).default("APPROVAL"),
  maxMembers: z.coerce.number().int().min(2, "En az 2 kişi olmalıdır.").max(50, "En fazla 50 kişi olabilir.").default(15),
  bannerColor: z.enum(ALLOWED_BANNER_COLORS).default("#2563EB"),
  avatarUrl: z
    .string()
    .optional()
    .nullable()
    .refine(isSafeAvatarUrl, "Geçersiz görsel URL formatı."),
  rules: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? stripControlChars(v) : null))
    .refine((v) => !v || v.length <= 2000, "Takım kuralları en fazla 2000 karakter olabilir."),
  skillsNeeded: z
    .array(z.string().transform(stripControlChars).pipe(z.string().min(2).max(30)))
    .max(8, "En fazla 8 yetkinlik etiketi ekleyebilirsiniz.")
    .default([])
    .transform((arr) => Array.from(new Set(arr))),
  allowMemberInvites: z.boolean().default(false),
  requireVerifiedEmailToJoin: z.boolean().default(false),
  isRecruiting: z.boolean().default(true),
});

const updateTeamSchema = z.object({
  name: z
    .string()
    .transform(stripControlChars)
    .pipe(z.string().min(3).max(80))
    .optional(),
  tag: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? stripControlChars(v).toUpperCase().replace(/[^A-Z0-9]/g, "") : null))
    .refine((v) => v === undefined || v === null || (v.length >= 2 && v.length <= 10), {
      message: "Takım etiketi 2 ile 10 karakter arasında harf/rakam olmalıdır.",
    }),
  description: z
    .string()
    .transform(stripControlChars)
    .pipe(z.string().min(10).max(1200))
    .optional(),
  category: z.enum(TEAM_CATEGORIES).optional(),
  visibility: z.enum(TEAM_VISIBILITIES).optional(),
  joinPolicy: z.enum(TEAM_JOIN_POLICIES).optional(),
  maxMembers: z.coerce.number().int().min(2).max(50).optional(),
  bannerColor: z.enum(ALLOWED_BANNER_COLORS).optional(),
  avatarUrl: z
    .string()
    .nullable()
    .optional()
    .refine(isSafeAvatarUrl, "Geçersiz görsel URL formatı."),
  rules: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? stripControlChars(v) : null))
    .refine((v) => v === undefined || v === null || v.length <= 2000, "Takım kuralları en fazla 2000 karakter olabilir."),
  skillsNeeded: z
    .array(z.string().transform(stripControlChars).pipe(z.string().min(2).max(30)))
    .max(8)
    .transform((arr) => Array.from(new Set(arr)))
    .optional(),
  allowMemberInvites: z.boolean().optional(),
  requireVerifiedEmailToJoin: z.boolean().optional(),
  isRecruiting: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  inviteCodeEnabled: z.boolean().optional(),
});

const joinRequestSchema = z.object({
  note: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? stripControlChars(v).slice(0, 400) : null)),
});

const inviteUserSchema = z.object({
  username: z
    .string()
    .transform((v) => stripControlChars(v).replace(/^@/, "").toLowerCase())
    .pipe(z.string().min(2, "Geçerli bir kullanıcı adı girin.").max(50)),
  message: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? stripControlChars(v).slice(0, 300) : null)),
});

const joinByCodeSchema = z.object({
  code: z
    .string()
    .transform((v) => stripControlChars(v).toUpperCase().replace(/[^A-Z0-9]/g, ""))
    .pipe(z.string().min(6, "Geçersiz davet kodu.").max(24)),
});

const updateMemberSchema = z.object({
  role: z.enum(["CO_CAPTAIN", "MEMBER"]).optional(),
  position: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? stripControlChars(v).slice(0, 60) : null)),
});

const banMemberSchema = z.object({
  reason: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? stripControlChars(v).slice(0, 300) : null)),
});

const transferCaptaincySchema = z.object({
  targetUserId: z.coerce.number().int().positive(),
});

const respondInvitationSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
});

const reviewRequestSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

// Helper to resolve active (non-deleted) team by slug
const findActiveTeamBySlug = async (rawSlug: string | string[] | undefined) => {
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  if (!slug) return null;
  const cleanSlug = stripControlChars(slug).toLowerCase();
  if (!cleanSlug || cleanSlug.length > 100) return null;
  const rows = await db
    .select()
    .from(teams)
    .where(and(eq(teams.slug, cleanSlug), isNull(teams.deletedAt)))
    .limit(1);
  return rows[0] || null;
};

// Helper to serialize team safely (never leak inviteCode unless explicitly authorized)
const serializeTeamPublic = (team: typeof teams.$inferSelect, options?: {
  includeInviteCode?: boolean;
  myRole?: string | null;
  hasPendingRequest?: boolean;
  isBanned?: boolean;
  owner?: { id: number; username: string; displayName: string | null; avatarUrl: string | null } | null;
}) => ({
  id: team.id,
  name: team.name,
  slug: team.slug,
  tag: team.tag,
  description: team.description,
  category: team.category,
  visibility: team.visibility,
  joinPolicy: team.joinPolicy,
  maxMembers: team.maxMembers,
  memberCount: team.memberCount,
  avatarUrl: team.avatarUrl,
  bannerColor: team.bannerColor,
  rules: team.rules,
  skillsNeeded: Array.isArray(team.skillsNeeded) ? team.skillsNeeded : [],
  allowMemberInvites: team.allowMemberInvites,
  requireVerifiedEmailToJoin: team.requireVerifiedEmailToJoin,
  isRecruiting: team.isRecruiting,
  isLocked: team.isLocked,
  inviteCodeEnabled: team.inviteCodeEnabled,
  inviteCode: options?.includeInviteCode ? team.inviteCode : undefined,
  inviteCodeExpiresAt: options?.includeInviteCode ? team.inviteCodeExpiresAt : undefined,
  ownerId: team.ownerId,
  owner: options?.owner ?? undefined,
  myRole: options?.myRole ?? null,
  isMember: Boolean(options?.myRole),
  hasPendingRequest: Boolean(options?.hasPendingRequest),
  isBanned: Boolean(options?.isBanned),
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

// ============================================================================
// 1. LIST PUBLIC TEAMS (DISCOVERY)
// ============================================================================
teamsRouter.get("/", standardLimiter, optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = optionalAuthContext(req);
    const search = typeof req.query.q === "string" ? stripControlChars(req.query.q).slice(0, 60) : "";
    const category = typeof req.query.category === "string" ? req.query.category.toUpperCase() : "";
    const recruitingOnly = req.query.recruiting === "true";

    const conditions: any[] = [isNull(teams.deletedAt), eq(teams.visibility, "PUBLIC")];

    if (category && (TEAM_CATEGORIES as readonly string[]).includes(category)) {
      conditions.push(eq(teams.category, category));
    }

    if (recruitingOnly) {
      conditions.push(eq(teams.isRecruiting, true), eq(teams.isLocked, false));
    }

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(ilike(teams.name, pattern), ilike(teams.description, pattern), ilike(teams.tag, pattern))
      );
    }

    const rows = await db
      .select({
        team: teams,
        ownerUsername: users.username,
        ownerDisplayName: profiles.displayName,
        ownerAvatarUrl: profiles.avatarUrl,
      })
      .from(teams)
      .innerJoin(users, eq(teams.ownerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(...conditions))
      .orderBy(desc(teams.isRecruiting), desc(teams.memberCount), desc(teams.createdAt))
      .limit(40);

    const teamIds: number[] = rows.map((r: any) => r.team.id);
    const myRolesMap = new Map<number, string>();
    const pendingReqSet = new Set<number>();

    if (userId && teamIds.length > 0) {
      const [memberships, pendingReqs] = await Promise.all([
        db
          .select({ teamId: teamMembers.teamId, role: teamMembers.role })
          .from(teamMembers)
          .where(and(eq(teamMembers.userId, userId), inArray(teamMembers.teamId, teamIds))),
        db
          .select({ teamId: teamJoinRequests.teamId })
          .from(teamJoinRequests)
          .where(
            and(
              eq(teamJoinRequests.userId, userId),
              eq(teamJoinRequests.status, "PENDING"),
              inArray(teamJoinRequests.teamId, teamIds)
            )
          ),
      ]);

      for (const m of memberships) myRolesMap.set(m.teamId, m.role);
      for (const r of pendingReqs) pendingReqSet.add(r.teamId);
    }

    const result = rows.map((r: any) =>
      serializeTeamPublic(r.team, {
        includeInviteCode: false,
        myRole: myRolesMap.get(r.team.id) || null,
        hasPendingRequest: pendingReqSet.has(r.team.id),
        owner: {
          id: r.team.ownerId,
          username: r.ownerUsername,
          displayName: r.ownerDisplayName,
          avatarUrl: r.ownerAvatarUrl,
        },
      })
    );

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[Teams] List error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Takımlar yüklenemedi." } });
  }
});

// ============================================================================
// 2. MY TEAMS (AUTHENTICATED USER'S MEMBERSHIPS)
// ============================================================================
teamsRouter.get("/my", standardLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const rows = await db
      .select({
        team: teams,
        myRole: teamMembers.role,
        myPosition: teamMembers.position,
        joinedAt: teamMembers.joinedAt,
        ownerUsername: users.username,
        ownerDisplayName: profiles.displayName,
        ownerAvatarUrl: profiles.avatarUrl,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .innerJoin(users, eq(teams.ownerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(teamMembers.userId, userId), isNull(teams.deletedAt)))
      .orderBy(desc(teamMembers.joinedAt));

    const data = rows.map((r: any) => ({
      ...serializeTeamPublic(r.team, {
        includeInviteCode:
          r.myRole === "CAPTAIN" ||
          r.myRole === "CO_CAPTAIN" ||
          (r.myRole === "MEMBER" && r.team.allowMemberInvites),
        myRole: r.myRole,
        owner: {
          id: r.team.ownerId,
          username: r.ownerUsername,
          displayName: r.ownerDisplayName,
          avatarUrl: r.ownerAvatarUrl,
        },
      }),
      myPosition: r.myPosition,
      joinedAt: r.joinedAt,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("[Teams] My teams error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Takımlarınız yüklenemedi." } });
  }
});

// ============================================================================
// 3. MY INCOMING INVITATIONS
// ============================================================================
teamsRouter.get("/invitations/me", standardLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const now = new Date();
    const rows = await db
      .select({
        id: teamInvitations.id,
        status: teamInvitations.status,
        message: teamInvitations.message,
        expiresAt: teamInvitations.expiresAt,
        createdAt: teamInvitations.createdAt,
        teamId: teams.id,
        teamName: teams.name,
        teamSlug: teams.slug,
        teamTag: teams.tag,
        teamCategory: teams.category,
        teamBannerColor: teams.bannerColor,
        teamMemberCount: teams.memberCount,
        teamMaxMembers: teams.maxMembers,
        inviterUsername: users.username,
        inviterDisplayName: profiles.displayName,
        inviterAvatarUrl: profiles.avatarUrl,
      })
      .from(teamInvitations)
      .innerJoin(teams, eq(teamInvitations.teamId, teams.id))
      .innerJoin(users, eq(teamInvitations.inviterId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(teamInvitations.inviteeId, userId),
          eq(teamInvitations.status, "PENDING"),
          isNull(teams.deletedAt)
        )
      )
      .orderBy(desc(teamInvitations.createdAt));

    const activeInvites = rows.filter((r: any) => new Date(r.expiresAt) > now);
    res.json({ success: true, data: activeInvites });
  } catch (err) {
    console.error("[Teams] Incoming invitations error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Davetler yüklenemedi." } });
  }
});

// ============================================================================
// 4. RESPOND TO AN INVITATION (STRICT INVITEE OWNERSHIP CHECK)
// ============================================================================
teamsRouter.post(
  "/invitations/:id/respond",
  teamMutationLimiter,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = requireAuthContext(req);
      const inviteId = Number(req.params.id);
      if (!Number.isInteger(inviteId) || inviteId <= 0) {
        res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Geçersiz davet kimliği." } });
        return;
      }

      const parsed = respondInvitationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz işlem türü." } });
        return;
      }

      const outcome = await db.transaction(async (tx: any) => {
        const [inv] = await tx
          .select()
          .from(teamInvitations)
          .where(and(eq(teamInvitations.id, inviteId), eq(teamInvitations.inviteeId, userId)))
          .limit(1);

        if (!inv) {
          return { status: 404, error: "Davet bulunamadı." };
        }
        if (inv.status !== "PENDING") {
          return { status: 400, error: "Bu davet artık geçerli değil." };
        }
        if (new Date(inv.expiresAt) <= new Date()) {
          await tx
            .update(teamInvitations)
            .set({ status: "REVOKED", updatedAt: new Date() })
            .where(eq(teamInvitations.id, inv.id));
          return { status: 400, error: "Bu davetin süresi dolmuştur." };
        }

        const [team] = await tx
          .select()
          .from(teams)
          .where(and(eq(teams.id, inv.teamId), isNull(teams.deletedAt)))
          .limit(1);

        if (!team) {
          return { status: 404, error: "Takım artık mevcut değil." };
        }

        if (parsed.data.action === "DECLINE") {
          await tx
            .update(teamInvitations)
            .set({ status: "DECLINED", updatedAt: new Date() })
            .where(eq(teamInvitations.id, inv.id));
          return { status: 200, message: "Takım daveti reddedildi.", slug: team.slug };
        }

        // ACCEPT: Run full security & capacity checks inside transaction
        const eligibility = await checkUserJoinEligibility(tx, userId, team);
        if (!eligibility.ok) {
          return { status: 403, error: eligibility.message };
        }

        const existingMember = await tx
          .select({ id: teamMembers.id })
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
          .limit(1);

        if (existingMember.length > 0) {
          await tx
            .update(teamInvitations)
            .set({ status: "ACCEPTED", updatedAt: new Date() })
            .where(eq(teamInvitations.id, inv.id));
          return { status: 200, message: "Zaten bu takımın üyesisiniz.", slug: team.slug };
        }

        const [{ count }] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(teamMembers)
          .where(eq(teamMembers.teamId, team.id));

        if (Number(count) >= team.maxMembers) {
          return { status: 409, error: "Takım maksimum üye kapasitesine ulaşmıştır." };
        }

        await tx.insert(teamMembers).values({
          teamId: team.id,
          userId,
          role: "MEMBER",
        });

        await tx
          .update(teamInvitations)
          .set({ status: "ACCEPTED", updatedAt: new Date() })
          .where(eq(teamInvitations.id, inv.id));

        await tx
          .update(teams)
          .set({ memberCount: Number(count) + 1, updatedAt: new Date() })
          .where(eq(teams.id, team.id));

        await logTeamAudit(tx, team.id, userId, "MEMBER_JOINED", "Davet kabul edilerek takıma katıldı.", userId);

        return { status: 200, message: `${team.name} takımına katıldınız!`, slug: team.slug };
      });

      if (outcome.status !== 200) {
        res.status(outcome.status).json({ success: false, error: { code: "INVITE_ACTION_FAILED", message: outcome.error } });
        return;
      }

      res.json({ success: true, data: { message: outcome.message, slug: outcome.slug } });
    } catch (err) {
      console.error("[Teams] Respond invitation error:", err);
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "İşlem tamamlanamadı." } });
    }
  }
);

// ============================================================================
// 5. JOIN BY CRYPTOGRAPHIC INVITE CODE (RATE-LIMITED + TIMING-SAFE)
// ============================================================================
teamsRouter.post("/join-by-code", teamInviteCodeLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const parsed = joinByCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_CODE", message: "Geçerli bir davet kodu girin." },
      });
      return;
    }

    const submittedCode = parsed.data.code;

    const outcome = await db.transaction(async (tx: any) => {
      const [candidate] = await tx
        .select()
        .from(teams)
        .where(
          and(
            eq(teams.inviteCode, submittedCode),
            eq(teams.inviteCodeEnabled, true),
            isNull(teams.deletedAt)
          )
        )
        .limit(1);

      // Constant-time verification + uniform error message to prevent enumeration
      if (!candidate || !candidate.inviteCode || !safeTimingEqual(candidate.inviteCode, submittedCode)) {
        return { status: 404, error: "Davet kodu geçersiz veya devre dışı bırakılmış." };
      }

      if (candidate.inviteCodeExpiresAt && new Date(candidate.inviteCodeExpiresAt) <= new Date()) {
        return { status: 404, error: "Davet kodu geçersiz veya süresi dolmuş." };
      }

      const eligibility = await checkUserJoinEligibility(tx, userId, candidate);
      if (!eligibility.ok) {
        return { status: 403, error: eligibility.message };
      }

      const existing = await tx
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, candidate.id), eq(teamMembers.userId, userId)))
        .limit(1);

      if (existing.length > 0) {
        return { status: 200, slug: candidate.slug, name: candidate.name, message: "Zaten bu takımın üyesisiniz." };
      }

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, candidate.id));

      if (Number(count) >= candidate.maxMembers) {
        return { status: 409, error: "Takım maksimum üye kapasitesine ulaşmıştır." };
      }

      await tx.insert(teamMembers).values({
        teamId: candidate.id,
        userId,
        role: "MEMBER",
      });

      await tx
        .update(teams)
        .set({ memberCount: Number(count) + 1, updatedAt: new Date() })
        .where(eq(teams.id, candidate.id));

      await logTeamAudit(tx, candidate.id, userId, "MEMBER_JOINED", "Güvenli davet kodu ile takıma katıldı.", userId);

      return { status: 200, slug: candidate.slug, name: candidate.name, message: `${candidate.name} takımına katıldınız!` };
    });

    if (outcome.status !== 200) {
      res.status(outcome.status).json({ success: false, error: { code: "JOIN_BY_CODE_FAILED", message: outcome.error } });
      return;
    }

    res.json({ success: true, data: { slug: outcome.slug, name: outcome.name, message: outcome.message } });
  } catch (err) {
    console.error("[Teams] Join by code error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Davet kodu doğrulanamadı." } });
  }
});

// ============================================================================
// 6. CREATE TEAM (QUOTA + RATE LIMIT + TRANSACTION + AUDIT LOG)
// ============================================================================
teamsRouter.post("/", teamCreateLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const parsed = createTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Lütfen tüm alanları doğru şekilde doldurun.",
        },
      });
      return;
    }

    const input = parsed.data;

    // Enforce per-user active team ownership quota (anti-spam/DoS)
    const [{ ownedCount }] = await db
      .select({ ownedCount: sql<number>`count(*)::int` })
      .from(teams)
      .where(and(eq(teams.ownerId, userId), isNull(teams.deletedAt)));

    if (Number(ownedCount) >= MAX_OWNED_TEAMS_PER_USER) {
      res.status(403).json({
        success: false,
        error: {
          code: "TEAM_QUOTA_EXCEEDED",
          message: `En fazla ${MAX_OWNED_TEAMS_PER_USER} aktif takım kurabilirsiniz.`,
        },
      });
      return;
    }

    // Check child safety status
    const [creator] = await db
      .select({ ageVerificationStatus: users.ageVerificationStatus, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!creator || !creator.isActive || creator.ageVerificationStatus === "REJECTED_UNDERAGE") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Hesabınız şu anda takım oluşturma yetkisine sahip değil." },
      });
      return;
    }

    const slug = slugifyTurkish(input.name);
    const inviteCode = generateSecureInviteCode();

    const createdTeam = await db.transaction(async (tx: any) => {
      const [team] = await tx
        .insert(teams)
        .values({
          name: input.name,
          slug,
          tag: input.tag || null,
          description: input.description,
          category: input.category,
          visibility: input.visibility,
          joinPolicy: input.visibility === "INVITE_ONLY" ? "INVITE_ONLY" : input.joinPolicy,
          maxMembers: input.maxMembers,
          bannerColor: input.bannerColor,
          avatarUrl: input.avatarUrl || null,
          rules: input.rules || null,
          skillsNeeded: input.skillsNeeded,
          allowMemberInvites: input.allowMemberInvites,
          requireVerifiedEmailToJoin: input.requireVerifiedEmailToJoin,
          isRecruiting: input.isRecruiting,
          isLocked: false,
          inviteCode,
          inviteCodeEnabled: true,
          ownerId: userId,
          memberCount: 1,
        })
        .returning();

      await tx.insert(teamMembers).values({
        teamId: team.id,
        userId,
        role: "CAPTAIN",
        position: null,
      });

      await logTeamAudit(
        tx,
        team.id,
        userId,
        "TEAM_CREATED",
        `Takım oluşturuldu (${team.visibility} / ${team.joinPolicy}, maks ${team.maxMembers} üye).`
      );

      return team;
    });

    res.status(201).json({
      success: true,
      data: serializeTeamPublic(createdTeam, {
        includeInviteCode: true,
        myRole: "CAPTAIN",
      }),
    });
  } catch (err) {
    console.error("[Teams] Create error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Takım oluşturulamadı." } });
  }
});

// ============================================================================
// 7. GET TEAM DETAIL (STRICT PRIVATE TEAM ISOLATION & IDOR PROTECTION)
// ============================================================================
teamsRouter.get("/:slug", standardLimiter, optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = optionalAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    let myRole: string | null = null;
    let hasPendingRequest = false;
    let isBanned = false;

    if (userId) {
      const [memberRow, reqRow, banRow] = await Promise.all([
        db
          .select({ role: teamMembers.role })
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
          .limit(1),
        db
          .select({ id: teamJoinRequests.id })
          .from(teamJoinRequests)
          .where(
            and(
              eq(teamJoinRequests.teamId, team.id),
              eq(teamJoinRequests.userId, userId),
              eq(teamJoinRequests.status, "PENDING")
            )
          )
          .limit(1),
        db
          .select({ id: teamBans.id })
          .from(teamBans)
          .where(and(eq(teamBans.teamId, team.id), eq(teamBans.userId, userId)))
          .limit(1),
      ]);

      myRole = memberRow[0]?.role || null;
      hasPendingRequest = reqRow.length > 0;
      isBanned = banRow.length > 0;
    }

    const isMember = Boolean(myRole);
    const isLeadership = myRole === "CAPTAIN" || myRole === "CO_CAPTAIN";
    const isRestrictedView = !isMember && team.visibility !== "PUBLIC";

    // Owner info
    const [ownerRow] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, team.ownerId))
      .limit(1);

    // If team is PRIVATE/INVITE_ONLY and viewer is NOT a member, isolate internal details completely
    if (isRestrictedView) {
      res.json({
        success: true,
        data: {
          ...serializeTeamPublic(team, {
            includeInviteCode: false,
            myRole: null,
            hasPendingRequest,
            isBanned,
            owner: ownerRow || null,
          }),
          rules: null, // Don't leak internal team rules to outsiders
          restricted: true,
          members: [],
          pendingRequestsCount: 0,
        },
      });
      return;
    }

    const membersRows = await db
      .select({
        userId: teamMembers.userId,
        role: teamMembers.role,
        position: teamMembers.position,
        joinedAt: teamMembers.joinedAt,
        username: users.username,
        isVerified: users.isVerified,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(teamMembers.teamId, team.id))
      .orderBy(
        sql`CASE ${teamMembers.role} WHEN 'CAPTAIN' THEN 1 WHEN 'CO_CAPTAIN' THEN 2 ELSE 3 END`,
        asc(teamMembers.joinedAt)
      );

    let pendingRequestsCount = 0;
    if (isLeadership) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(teamJoinRequests)
        .where(and(eq(teamJoinRequests.teamId, team.id), eq(teamJoinRequests.status, "PENDING")));
      pendingRequestsCount = Number(count);
    }

    const canSeeInviteCode = isLeadership || (isMember && team.allowMemberInvites);

    res.json({
      success: true,
      data: {
        ...serializeTeamPublic(team, {
          includeInviteCode: canSeeInviteCode,
          myRole,
          hasPendingRequest,
          isBanned,
          owner: ownerRow || null,
        }),
        restricted: false,
        members: membersRows,
        pendingRequestsCount,
      },
    });
  } catch (err) {
    console.error("[Teams] Detail error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Takım detayları yüklenemedi." } });
  }
});

// ============================================================================
// 8. UPDATE TEAM SETTINGS (CAPTAIN ONLY)
// ============================================================================
teamsRouter.patch("/:slug", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [membership] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!membership || membership.role !== "CAPTAIN") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Takım ayarlarını yalnızca Takım Kaptanı değiştirebilir." },
      });
      return;
    }

    const parsed = updateTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Geçersiz ayar değerleri.",
        },
      });
      return;
    }

    const updates = parsed.data;

    // Prevent shrinking maxMembers below current memberCount
    if (updates.maxMembers !== undefined && updates.maxMembers < team.memberCount) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_MAX_MEMBERS",
          message: `Maksimum üye sayısı mevcut üye sayısından (${team.memberCount}) küçük olamaz.`,
        },
      });
      return;
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    const changedLabels: string[] = [];

    if (updates.name !== undefined && updates.name !== team.name) {
      updatePayload.name = updates.name;
      changedLabels.push("isim");
    }
    if (updates.tag !== undefined && updates.tag !== team.tag) {
      updatePayload.tag = updates.tag;
      changedLabels.push("etiket");
    }
    if (updates.description !== undefined && updates.description !== team.description) {
      updatePayload.description = updates.description;
      changedLabels.push("açıklama");
    }
    if (updates.category !== undefined && updates.category !== team.category) {
      updatePayload.category = updates.category;
      changedLabels.push("kategori");
    }
    if (updates.visibility !== undefined && updates.visibility !== team.visibility) {
      updatePayload.visibility = updates.visibility;
      if (updates.visibility === "INVITE_ONLY") {
        updatePayload.joinPolicy = "INVITE_ONLY";
      }
      changedLabels.push(`görünürlük (${updates.visibility})`);
    }
    if (updates.joinPolicy !== undefined && updates.joinPolicy !== team.joinPolicy) {
      updatePayload.joinPolicy =
        (updates.visibility ?? team.visibility) === "INVITE_ONLY" ? "INVITE_ONLY" : updates.joinPolicy;
      changedLabels.push(`katılım politikası (${updatePayload.joinPolicy})`);
    }
    if (updates.maxMembers !== undefined && updates.maxMembers !== team.maxMembers) {
      updatePayload.maxMembers = updates.maxMembers;
      changedLabels.push(`kapasite (${updates.maxMembers})`);
    }
    if (updates.bannerColor !== undefined) updatePayload.bannerColor = updates.bannerColor;
    if (updates.avatarUrl !== undefined) updatePayload.avatarUrl = updates.avatarUrl;
    if (updates.rules !== undefined) {
      updatePayload.rules = updates.rules;
      changedLabels.push("kurallar");
    }
    if (updates.skillsNeeded !== undefined) {
      updatePayload.skillsNeeded = updates.skillsNeeded;
      changedLabels.push("aranan yetkinlikler");
    }
    if (updates.allowMemberInvites !== undefined && updates.allowMemberInvites !== team.allowMemberInvites) {
      updatePayload.allowMemberInvites = updates.allowMemberInvites;
      changedLabels.push(updates.allowMemberInvites ? "üye davetleri açıldı" : "üye davetleri kapatıldı");
    }
    if (
      updates.requireVerifiedEmailToJoin !== undefined &&
      updates.requireVerifiedEmailToJoin !== team.requireVerifiedEmailToJoin
    ) {
      updatePayload.requireVerifiedEmailToJoin = updates.requireVerifiedEmailToJoin;
      changedLabels.push(
        updates.requireVerifiedEmailToJoin ? "e-posta doğrulama zorunluluğu açıldı" : "e-posta doğrulama zorunluluğu kapatıldı"
      );
    }
    if (updates.isRecruiting !== undefined && updates.isRecruiting !== team.isRecruiting) {
      updatePayload.isRecruiting = updates.isRecruiting;
      changedLabels.push(updates.isRecruiting ? "üye alımı açıldı" : "üye alımı kapatıldı");
    }
    if (updates.isLocked !== undefined && updates.isLocked !== team.isLocked) {
      updatePayload.isLocked = updates.isLocked;
      changedLabels.push(updates.isLocked ? "takım kilitlendi" : "takım kilidi açıldı");
    }
    if (updates.inviteCodeEnabled !== undefined && updates.inviteCodeEnabled !== team.inviteCodeEnabled) {
      updatePayload.inviteCodeEnabled = updates.inviteCodeEnabled;
      changedLabels.push(updates.inviteCodeEnabled ? "davet kodu etkinleştirildi" : "davet kodu devre dışı bırakıldı");
    }

    const [updated] = await db
      .update(teams)
      .set(updatePayload)
      .where(eq(teams.id, team.id))
      .returning();

    if (changedLabels.length > 0) {
      const actionType =
        updates.isLocked !== undefined && updates.isLocked !== team.isLocked
          ? updates.isLocked
            ? "TEAM_LOCKED"
            : "TEAM_UNLOCKED"
          : "SETTINGS_UPDATED";
      await logTeamAudit(db, team.id, userId, actionType, `Güncellenen ayarlar: ${changedLabels.join(", ")}`);
    }

    res.json({
      success: true,
      data: serializeTeamPublic(updated, {
        includeInviteCode: true,
        myRole: "CAPTAIN",
      }),
    });
  } catch (err) {
    console.error("[Teams] Update settings error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Ayarlar güncellenemedi." } });
  }
});

// ============================================================================
// 9. ROTATE CRYPTOGRAPHIC INVITE CODE (CAPTAIN / CO_CAPTAIN)
// ============================================================================
teamsRouter.post("/:slug/invite-code/rotate", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [membership] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!membership || (membership.role !== "CAPTAIN" && membership.role !== "CO_CAPTAIN")) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Davet kodunu yalnızca takım yönetimi yenileyebilir." },
      });
      return;
    }

    const newCode = generateSecureInviteCode();
    const [updated] = await db
      .update(teams)
      .set({ inviteCode: newCode, inviteCodeEnabled: true, updatedAt: new Date() })
      .where(eq(teams.id, team.id))
      .returning();

    await logTeamAudit(db, team.id, userId, "INVITE_CODE_ROTATED", "Güvenli davet kodu yenilendi. Eski kod iptal edildi.");

    res.json({
      success: true,
      data: { inviteCode: updated.inviteCode, inviteCodeEnabled: updated.inviteCodeEnabled },
    });
  } catch (err) {
    console.error("[Teams] Rotate invite code error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Davet kodu yenilenemedi." } });
  }
});

// ============================================================================
// 10. JOIN OR REQUEST TO JOIN TEAM (TRANSACTION + POLICY + BAN + CAPACITY)
// ============================================================================
teamsRouter.post("/:slug/join", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const parsed = joinRequestSchema.safeParse(req.body || {});
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz başvuru verisi." } });
      return;
    }

    const outcome = await db.transaction(async (tx: any) => {
      const eligibility = await checkUserJoinEligibility(tx, userId, team);
      if (!eligibility.ok) {
        return { status: 403, error: eligibility.message };
      }

      const existingMember = await tx
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
        .limit(1);

      if (existingMember.length > 0) {
        return { status: 400, error: "Zaten bu takımın üyesisiniz." };
      }

      if (team.visibility === "INVITE_ONLY" || team.joinPolicy === "INVITE_ONLY") {
        return {
          status: 403,
          error: "Bu takım yalnızca davet ile üye kabul etmektedir. Davet kodu veya kaptan daveti gereklidir.",
        };
      }

      if (!team.isRecruiting) {
        return { status: 403, error: "Bu takım şu anda yeni üye alımına kapalıdır." };
      }

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));

      if (Number(count) >= team.maxMembers) {
        return { status: 409, error: "Takım maksimum üye kapasitesine ulaşmıştır." };
      }

      if (team.joinPolicy === "OPEN" && team.visibility === "PUBLIC") {
        await tx.insert(teamMembers).values({
          teamId: team.id,
          userId,
          role: "MEMBER",
        });

        await tx
          .update(teams)
          .set({ memberCount: Number(count) + 1, updatedAt: new Date() })
          .where(eq(teams.id, team.id));

        await logTeamAudit(tx, team.id, userId, "MEMBER_JOINED", "Doğrudan katılım ile takıma dahil oldu.", userId);

        return { status: 200, joined: true, pending: false, message: `${team.name} takımına katıldınız!` };
      }

      // APPROVAL policy (or PRIVATE team request)
      const [existingReq] = await tx
        .select()
        .from(teamJoinRequests)
        .where(and(eq(teamJoinRequests.teamId, team.id), eq(teamJoinRequests.userId, userId)))
        .limit(1);

      if (existingReq && existingReq.status === "PENDING") {
        return { status: 400, error: "Zaten bekleyen bir katılım başvurunuz var." };
      }

      if (existingReq) {
        await tx
          .update(teamJoinRequests)
          .set({
            status: "PENDING",
            note: parsed.data.note,
            reviewedBy: null,
            reviewedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(teamJoinRequests.id, existingReq.id));
      } else {
        await tx.insert(teamJoinRequests).values({
          teamId: team.id,
          userId,
          status: "PENDING",
          note: parsed.data.note,
        });
      }

      return {
        status: 200,
        joined: false,
        pending: true,
        message: "Katılım başvurunuz takım yönetimine iletildi.",
      };
    });

    if (outcome.status !== 200) {
      res.status(outcome.status).json({ success: false, error: { code: "JOIN_FAILED", message: outcome.error } });
      return;
    }

    // Notify captain asynchronously
    notify(userId, team.ownerId, outcome.joined ? "team_member_joined" : "team_join_request").catch(() => {});

    res.json({
      success: true,
      data: { joined: outcome.joined, pending: outcome.pending, message: outcome.message },
    });
  } catch (err) {
    console.error("[Teams] Join error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Katılım işlemi başarısız oldu." } });
  }
});

// ============================================================================
// 11. LEAVE TEAM (CAPTAIN CANNOT ABANDON NON-EMPTY TEAM)
// ============================================================================
teamsRouter.post("/:slug/leave", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const outcome = await db.transaction(async (tx: any) => {
      const [membership] = await tx
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
        .limit(1);

      if (!membership) {
        return { status: 400, error: "Bu takımın üyesi değilsiniz." };
      }

      if (membership.role === "CAPTAIN") {
        return {
          status: 400,
          error:
            "Takım Kaptanı doğrudan ayrılamaz. Önce kaptanlığı başka bir üyeye devredin veya Takım Ayarları bölümünden takımı kapatın.",
        };
      }

      await tx.delete(teamMembers).where(eq(teamMembers.id, membership.id));

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));

      await tx
        .update(teams)
        .set({ memberCount: Number(count), updatedAt: new Date() })
        .where(eq(teams.id, team.id));

      await logTeamAudit(tx, team.id, userId, "MEMBER_LEFT", "Takımdan kendi isteğiyle ayrıldı.", userId);

      return { status: 200, message: "Takımdan ayrıldınız." };
    });

    if (outcome.status !== 200) {
      res.status(outcome.status).json({ success: false, error: { code: "LEAVE_FAILED", message: outcome.error } });
      return;
    }

    res.json({ success: true, data: { message: outcome.message } });
  } catch (err) {
    console.error("[Teams] Leave error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Ayrılma işlemi başarısız oldu." } });
  }
});

// ============================================================================
// 12. LIST JOIN REQUESTS (CAPTAIN / CO_CAPTAIN ONLY)
// ============================================================================
teamsRouter.get("/:slug/requests", standardLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [membership] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!membership || (membership.role !== "CAPTAIN" && membership.role !== "CO_CAPTAIN")) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Başvuruları görme yetkiniz yok." } });
      return;
    }

    const rows = await db
      .select({
        id: teamJoinRequests.id,
        userId: teamJoinRequests.userId,
        note: teamJoinRequests.note,
        status: teamJoinRequests.status,
        createdAt: teamJoinRequests.createdAt,
        username: users.username,
        emailVerified: users.emailVerified,
        isVerified: users.isVerified,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(teamJoinRequests)
      .innerJoin(users, eq(teamJoinRequests.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(teamJoinRequests.teamId, team.id), eq(teamJoinRequests.status, "PENDING")))
      .orderBy(asc(teamJoinRequests.createdAt));

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[Teams] List requests error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Başvurular yüklenemedi." } });
  }
});

// ============================================================================
// 13. REVIEW JOIN REQUEST (APPROVE / REJECT — ATOMIC TRANSACTION)
// ============================================================================
teamsRouter.post("/:slug/requests/:requestId", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const requestId = Number(req.params.requestId);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Geçersiz başvuru kimliği." } });
      return;
    }

    const parsed = reviewRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz işlem." } });
      return;
    }

    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const outcome = await db.transaction(async (tx: any) => {
      const [membership] = await tx
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
        .limit(1);

      if (!membership || (membership.role !== "CAPTAIN" && membership.role !== "CO_CAPTAIN")) {
        return { status: 403, error: "Başvuru değerlendirme yetkiniz yok." };
      }

      const [joinReq] = await tx
        .select()
        .from(teamJoinRequests)
        .where(and(eq(teamJoinRequests.id, requestId), eq(teamJoinRequests.teamId, team.id)))
        .limit(1);

      if (!joinReq || joinReq.status !== "PENDING") {
        return { status: 404, error: "Bekleyen başvuru bulunamadı." };
      }

      if (parsed.data.action === "REJECT") {
        await tx
          .update(teamJoinRequests)
          .set({ status: "REJECTED", reviewedBy: userId, reviewedAt: new Date(), updatedAt: new Date() })
          .where(eq(teamJoinRequests.id, joinReq.id));

        await logTeamAudit(tx, team.id, userId, "REQUEST_REJECTED", "Katılım başvurusu reddedildi.", joinReq.userId);
        return { status: 200, targetUserId: joinReq.userId, approved: false, message: "Başvuru reddedildi." };
      }

      // APPROVE: Re-check bans, blocks, verification, and maxMembers atomically
      const eligibility = await checkUserJoinEligibility(tx, joinReq.userId, team);
      if (!eligibility.ok) {
        return { status: 403, error: eligibility.message };
      }

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));

      if (Number(count) >= team.maxMembers) {
        return { status: 409, error: "Takım maksimum üye kapasitesine ulaşmıştır." };
      }

      const existingMember = await tx
        .select({ id: teamMembers.id })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, joinReq.userId)))
        .limit(1);

      if (existingMember.length === 0) {
        await tx.insert(teamMembers).values({
          teamId: team.id,
          userId: joinReq.userId,
          role: "MEMBER",
        });

        await tx
          .update(teams)
          .set({ memberCount: Number(count) + 1, updatedAt: new Date() })
          .where(eq(teams.id, team.id));
      }

      await tx
        .update(teamJoinRequests)
        .set({ status: "APPROVED", reviewedBy: userId, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(teamJoinRequests.id, joinReq.id));

      await tx
        .update(teamInvitations)
        .set({ status: "ACCEPTED", updatedAt: new Date() })
        .where(
          and(
            eq(teamInvitations.teamId, team.id),
            eq(teamInvitations.inviteeId, joinReq.userId),
            eq(teamInvitations.status, "PENDING")
          )
        );

      await logTeamAudit(tx, team.id, userId, "REQUEST_APPROVED", "Katılım başvurusu onaylandı.", joinReq.userId);

      return { status: 200, targetUserId: joinReq.userId, approved: true, message: "Başvuru onaylandı ve üye takıma eklendi." };
    });

    if (outcome.status !== 200) {
      res.status(outcome.status).json({ success: false, error: { code: "REVIEW_FAILED", message: outcome.error } });
      return;
    }

    if (outcome.approved && outcome.targetUserId) {
      notify(userId, outcome.targetUserId, "team_request_approved").catch(() => {});
    }

    res.json({ success: true, data: { message: outcome.message } });
  } catch (err) {
    console.error("[Teams] Review request error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Başvuru değerlendirilemedi." } });
  }
});

// ============================================================================
// 14. SEND INVITATION BY USERNAME (RBAC + BLOCK + BAN CHECK)
// ============================================================================
teamsRouter.post("/:slug/invitations", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [membership] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    const canInvite =
      membership &&
      (membership.role === "CAPTAIN" ||
        membership.role === "CO_CAPTAIN" ||
        (membership.role === "MEMBER" && team.allowMemberInvites));

    if (!canInvite) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Bu takıma yeni üye davet etme yetkiniz yok." },
      });
      return;
    }

    if (team.isLocked) {
      res.status(403).json({
        success: false,
        error: { code: "TEAM_LOCKED", message: "Kilitli takımlara davet gönderilemez." },
      });
      return;
    }

    const parsed = inviteUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Geçersiz kullanıcı adı." },
      });
      return;
    }

    const [target] = await db
      .select({
        id: users.id,
        username: users.username,
        isActive: users.isActive,
        ageVerificationStatus: users.ageVerificationStatus,
      })
      .from(users)
      .where(ilike(users.username, parsed.data.username))
      .limit(1);

    if (!target || !target.isActive || target.ageVerificationStatus === "REJECTED_UNDERAGE") {
      res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "Davet edilecek aktif kullanıcı bulunamadı." },
      });
      return;
    }

    if (target.id === userId) {
      res.status(400).json({
        success: false,
        error: { code: "SELF_INVITE", message: "Kendinizi takıma davet edemezsiniz." },
      });
      return;
    }

    // Check mutual blocks between inviter & target AND team owner & target
    if ((await isBlockedBetween(db, userId, target.id)) || (await isBlockedBetween(db, team.ownerId, target.id))) {
      res.status(403).json({
        success: false,
        error: { code: "BLOCKED", message: "Bu kullanıcıya davet gönderilemiyor." },
      });
      return;
    }

    // Check team ban
    const banRow = await db
      .select({ id: teamBans.id })
      .from(teamBans)
      .where(and(eq(teamBans.teamId, team.id), eq(teamBans.userId, target.id)))
      .limit(1);

    if (banRow.length > 0) {
      res.status(403).json({
        success: false,
        error: {
          code: "USER_BANNED",
          message: "Bu kullanıcı takımdan engellenmiş. Davet göndermek için önce engelini kaldırın.",
        },
      });
      return;
    }

    // Check already member
    const existingMember = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, target.id)))
      .limit(1);

    if (existingMember.length > 0) {
      res.status(400).json({
        success: false,
        error: { code: "ALREADY_MEMBER", message: "Bu kullanıcı zaten takımın üyesi." },
      });
      return;
    }

    // Prevent duplicate pending invites
    const existingInvite = await db
      .select({ id: teamInvitations.id })
      .from(teamInvitations)
      .where(
        and(
          eq(teamInvitations.teamId, team.id),
          eq(teamInvitations.inviteeId, target.id),
          eq(teamInvitations.status, "PENDING")
        )
      )
      .limit(1);

    if (existingInvite.length > 0) {
      res.status(400).json({
        success: false,
        error: { code: "ALREADY_INVITED", message: "Bu kullanıcıya zaten bekleyen bir davet gönderilmiş." },
      });
      return;
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const [createdInvite] = await db
      .insert(teamInvitations)
      .values({
        teamId: team.id,
        inviterId: userId,
        inviteeId: target.id,
        status: "PENDING",
        message: parsed.data.message,
        expiresAt,
      })
      .returning();

    await logTeamAudit(
      db,
      team.id,
      userId,
      "INVITATION_SENT",
      `@${target.username} kullanıcısına takım daveti gönderildi.`,
      target.id
    );

    notify(userId, target.id, "team_invitation").catch(() => {});

    res.status(201).json({
      success: true,
      data: { id: createdInvite.id, username: target.username, message: `@${target.username} takıma davet edildi.` },
    });
  } catch (err) {
    console.error("[Teams] Invite user error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Davet gönderilemedi." } });
  }
});

// ============================================================================
// 15. LIST & REVOKE PENDING INVITATIONS (CAPTAIN / CO_CAPTAIN)
// ============================================================================
teamsRouter.get("/:slug/invitations", standardLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [membership] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!membership || (membership.role !== "CAPTAIN" && membership.role !== "CO_CAPTAIN")) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkiniz yok." } });
      return;
    }

    const rows = await db
      .select({
        id: teamInvitations.id,
        inviteeId: teamInvitations.inviteeId,
        message: teamInvitations.message,
        expiresAt: teamInvitations.expiresAt,
        createdAt: teamInvitations.createdAt,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(teamInvitations)
      .innerJoin(users, eq(teamInvitations.inviteeId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(teamInvitations.teamId, team.id), eq(teamInvitations.status, "PENDING")))
      .orderBy(desc(teamInvitations.createdAt));

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[Teams] List team invitations error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Davetler yüklenemedi." } });
  }
});

teamsRouter.delete("/:slug/invitations/:inviteId", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const inviteId = Number(req.params.inviteId);
    if (!Number.isInteger(inviteId) || inviteId <= 0) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Geçersiz davet kimliği." } });
      return;
    }

    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [membership] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!membership || (membership.role !== "CAPTAIN" && membership.role !== "CO_CAPTAIN")) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Davet iptal yetkiniz yok." } });
      return;
    }

    const [revoked] = await db
      .update(teamInvitations)
      .set({ status: "REVOKED", updatedAt: new Date() })
      .where(
        and(
          eq(teamInvitations.id, inviteId),
          eq(teamInvitations.teamId, team.id),
          eq(teamInvitations.status, "PENDING")
        )
      )
      .returning();

    if (!revoked) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Bekleyen davet bulunamadı." } });
      return;
    }

    await logTeamAudit(db, team.id, userId, "INVITATION_REVOKED", "Gönderilen davet geri çekildi.", revoked.inviteeId);

    res.json({ success: true, data: { message: "Davet iptal edildi." } });
  } catch (err) {
    console.error("[Teams] Revoke invite error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Davet iptal edilemedi." } });
  }
});

// ============================================================================
// 16. UPDATE MEMBER ROLE / POSITION (STRICT RBAC HIERARCHY)
// ============================================================================
teamsRouter.patch("/:slug/members/:targetUserId", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const targetUserId = Number(req.params.targetUserId);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Geçersiz üye kimliği." } });
      return;
    }

    const parsed = updateMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz üye bilgisi." } });
      return;
    }

    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [actor, target] = await Promise.all([
      db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
        .limit(1)
        .then((r: any) => r[0]),
      db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)))
        .limit(1)
        .then((r: any) => r[0]),
    ]);

    if (!actor || !target) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Üyelik kaydı bulunamadı." } });
      return;
    }

    const updateFields: Record<string, any> = { updatedAt: new Date() };

    // Role change: STRICTLY CAPTAIN ONLY and cannot modify Captain's own role
    if (parsed.data.role !== undefined && parsed.data.role !== target.role) {
      if (actor.role !== "CAPTAIN") {
        res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Üye rollerini yalnızca Takım Kaptanı değiştirebilir." },
        });
        return;
      }
      if (target.userId === userId || target.role === "CAPTAIN") {
        res.status(400).json({
          success: false,
          error: { code: "INVALID_ACTION", message: "Kendi kaptanlık rolünüzü buradan değiştiremezsiniz." },
        });
        return;
      }
      updateFields.role = parsed.data.role;
    }

    // Position/title change: CAPTAIN/CO_CAPTAIN (with strict hierarchy) OR user updating their own position
    if (parsed.data.position !== undefined) {
      const isSelf = actor.userId === target.userId;
      const outranks = (ROLE_WEIGHT[actor.role] || 0) > (ROLE_WEIGHT[target.role] || 0);
      if (!isSelf && !outranks) {
        res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Bu üyenin görev unvanını düzenleme yetkiniz yok." },
        });
        return;
      }
      updateFields.position = parsed.data.position;
    }

    const [updated] = await db
      .update(teamMembers)
      .set(updateFields)
      .where(eq(teamMembers.id, target.id))
      .returning();

    if (updateFields.role) {
      await logTeamAudit(
        db,
        team.id,
        userId,
        "MEMBER_ROLE_CHANGED",
        `Üye rolü ${target.role} -> ${updateFields.role} olarak güncellendi.`,
        targetUserId
      );
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("[Teams] Update member error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Üye güncellenemedi." } });
  }
});

// ============================================================================
// 17. KICK MEMBER (STRICT HIERARCHY — NO PRIVILEGE ESCALATION)
// ============================================================================
teamsRouter.delete("/:slug/members/:targetUserId", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const targetUserId = Number(req.params.targetUserId);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Geçersiz üye kimliği." } });
      return;
    }

    if (targetUserId === userId) {
      res.status(400).json({ success: false, error: { code: "SELF_ACTION", message: "Kendinizi çıkaramazsınız." } });
      return;
    }

    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const outcome = await db.transaction(async (tx: any) => {
      const [actor, target] = await Promise.all([
        tx
          .select()
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
          .limit(1)
          .then((r: any) => r[0]),
        tx
          .select()
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)))
          .limit(1)
          .then((r: any) => r[0]),
      ]);

      if (!actor || !target) {
        return { status: 404, error: "Üye bulunamadı." };
      }

      if ((ROLE_WEIGHT[actor.role] || 0) <= (ROLE_WEIGHT[target.role] || 0)) {
        return { status: 403, error: "Bu üyeyi takımdan çıkarma yetkiniz bulunmuyor." };
      }

      await tx.delete(teamMembers).where(eq(teamMembers.id, target.id));

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));

      await tx
        .update(teams)
        .set({ memberCount: Number(count), updatedAt: new Date() })
        .where(eq(teams.id, team.id));

      await logTeamAudit(tx, team.id, userId, "MEMBER_KICKED", "Üye takımdan çıkarıldı.", targetUserId);
      return { status: 200, message: "Üye takımdan çıkarıldı." };
    });

    if (outcome.status !== 200) {
      res.status(outcome.status).json({ success: false, error: { code: "KICK_FAILED", message: outcome.error } });
      return;
    }

    res.json({ success: true, data: { message: outcome.message } });
  } catch (err) {
    console.error("[Teams] Kick member error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Üye çıkarılamadı." } });
  }
});

// ============================================================================
// 18. BAN / UNBAN MEMBERS & LIST BANS (STRICT HIERARCHY + REJOIN BLOCK)
// ============================================================================
teamsRouter.get("/:slug/bans", standardLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [actor] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!actor || (actor.role !== "CAPTAIN" && actor.role !== "CO_CAPTAIN")) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Yetkiniz yok." } });
      return;
    }

    const rows = await db
      .select({
        id: teamBans.id,
        userId: teamBans.userId,
        reason: teamBans.reason,
        createdAt: teamBans.createdAt,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(teamBans)
      .innerJoin(users, eq(teamBans.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(teamBans.teamId, team.id))
      .orderBy(desc(teamBans.createdAt));

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[Teams] List bans error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Engellenenler listelenemedi." } });
  }
});

teamsRouter.post("/:slug/bans/:targetUserId", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const targetUserId = Number(req.params.targetUserId);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0 || targetUserId === userId) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Geçersiz kullanıcı kimliği." } });
      return;
    }

    const parsed = banMemberSchema.safeParse(req.body || {});
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz sebep metni." } });
      return;
    }

    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const outcome = await db.transaction(async (tx: any) => {
      const [actor] = await tx
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
        .limit(1);

      if (!actor || (actor.role !== "CAPTAIN" && actor.role !== "CO_CAPTAIN")) {
        return { status: 403, error: "Üye engelleme yetkiniz yok." };
      }

      if (targetUserId === team.ownerId) {
        return { status: 403, error: "Takım Kaptanı engellenemez." };
      }

      const [targetUserExists] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      if (!targetUserExists) {
        return { status: 404, error: "Engellenecek kullanıcı bulunamadı." };
      }

      const [target] = await tx
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)))
        .limit(1);

      if (target && (ROLE_WEIGHT[actor.role] || 0) <= (ROLE_WEIGHT[target.role] || 0)) {
        return { status: 403, error: "Sizinle aynı veya üst yetkideki bir üyeyi engelleyemezsiniz." };
      }

      if (target) {
        await tx.delete(teamMembers).where(eq(teamMembers.id, target.id));
      }

      // Clean up any pending requests or invitations for this user
      await tx
        .update(teamJoinRequests)
        .set({ status: "REJECTED", reviewedBy: userId, reviewedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(teamJoinRequests.teamId, team.id),
            eq(teamJoinRequests.userId, targetUserId),
            eq(teamJoinRequests.status, "PENDING")
          )
        );

      await tx
        .update(teamInvitations)
        .set({ status: "REVOKED", updatedAt: new Date() })
        .where(
          and(
            eq(teamInvitations.teamId, team.id),
            eq(teamInvitations.inviteeId, targetUserId),
            eq(teamInvitations.status, "PENDING")
          )
        );

      await tx
        .insert(teamBans)
        .values({
          teamId: team.id,
          userId: targetUserId,
          bannedBy: userId,
          reason: parsed.data.reason || "Takım kurallarına aykırı davranış",
        })
        .onConflictDoUpdate({
          target: [teamBans.teamId, teamBans.userId],
          set: {
            bannedBy: userId,
            reason: parsed.data.reason || "Takım kurallarına aykırı davranış",
            createdAt: new Date(),
          },
        });

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));

      await tx
        .update(teams)
        .set({ memberCount: Number(count), updatedAt: new Date() })
        .where(eq(teams.id, team.id));

      await logTeamAudit(
        tx,
        team.id,
        userId,
        "MEMBER_BANNED",
        parsed.data.reason ? `Engelleme sebebi: ${parsed.data.reason}` : "Kullanıcı takımdan engellendi.",
        targetUserId
      );

      return { status: 200, message: "Kullanıcı takımdan engellendi." };
    });

    if (outcome.status !== 200) {
      res.status(outcome.status).json({ success: false, error: { code: "BAN_FAILED", message: outcome.error } });
      return;
    }

    res.json({ success: true, data: { message: outcome.message } });
  } catch (err) {
    console.error("[Teams] Ban member error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Engelleme işlemi başarısız oldu." } });
  }
});

teamsRouter.delete("/:slug/bans/:targetUserId", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const targetUserId = Number(req.params.targetUserId);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      res.status(400).json({ success: false, error: { code: "INVALID_ID", message: "Geçersiz kullanıcı kimliği." } });
      return;
    }

    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [actor] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!actor || actor.role !== "CAPTAIN") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Üye engelini yalnızca Takım Kaptanı kaldırabilir." },
      });
      return;
    }

    await db.delete(teamBans).where(and(eq(teamBans.teamId, team.id), eq(teamBans.userId, targetUserId)));
    await logTeamAudit(db, team.id, userId, "MEMBER_UNBANNED", "Kullanıcının takım engeli kaldırıldı.", targetUserId);

    res.json({ success: true, data: { message: "Engel kaldırıldı." } });
  } catch (err) {
    console.error("[Teams] Unban member error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Engel kaldırılamadı." } });
  }
});

// ============================================================================
// 19. TRANSFER CAPTAINCY (ATOMIC SWAP — CAPTAIN ONLY)
// ============================================================================
teamsRouter.post("/:slug/transfer-captaincy", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const parsed = transferCaptaincySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçerli bir üye seçin." } });
      return;
    }

    const targetUserId = parsed.data.targetUserId;
    if (targetUserId === userId) {
      res.status(400).json({ success: false, error: { code: "SELF_TRANSFER", message: "Zaten takım kaptanısınız." } });
      return;
    }

    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const outcome = await db.transaction(async (tx: any) => {
      const [actor, target] = await Promise.all([
        tx
          .select()
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
          .limit(1)
          .then((r: any) => r[0]),
        tx
          .select()
          .from(teamMembers)
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, targetUserId)))
          .limit(1)
          .then((r: any) => r[0]),
      ]);

      if (!actor || actor.role !== "CAPTAIN") {
        return { status: 403, error: "Kaptanlığı yalnızca mevcut Takım Kaptanı devredebilir." };
      }

      if (!target) {
        return { status: 404, error: "Seçilen kullanıcı bu takımın üyesi değil." };
      }

      // Check new captain's active team quota
      const [{ targetOwnedCount }] = await tx
        .select({ targetOwnedCount: sql<number>`count(*)::int` })
        .from(teams)
        .where(and(eq(teams.ownerId, targetUserId), isNull(teams.deletedAt)));

      if (Number(targetOwnedCount) >= MAX_OWNED_TEAMS_PER_USER) {
        return {
          status: 400,
          error: `Hedef kullanıcı maksimum takım sahipliği sınırına (${MAX_OWNED_TEAMS_PER_USER}) ulaşmış.`,
        };
      }

      await tx
        .update(teamMembers)
        .set({ role: "CO_CAPTAIN", updatedAt: new Date() })
        .where(eq(teamMembers.id, actor.id));

      await tx
        .update(teamMembers)
        .set({ role: "CAPTAIN", updatedAt: new Date() })
        .where(eq(teamMembers.id, target.id));

      await tx
        .update(teams)
        .set({ ownerId: targetUserId, updatedAt: new Date() })
        .where(eq(teams.id, team.id));

      await logTeamAudit(
        tx,
        team.id,
        userId,
        "CAPTAINCY_TRANSFERRED",
        "Takım kaptanlığı yeni üyeye devredildi. Eski kaptan Yardımcı Kaptan oldu.",
        targetUserId
      );

      return { status: 200, message: "Takım kaptanlığı başarıyla devredildi." };
    });

    if (outcome.status !== 200) {
      res.status(outcome.status).json({ success: false, error: { code: "TRANSFER_FAILED", message: outcome.error } });
      return;
    }

    res.json({ success: true, data: { message: outcome.message } });
  } catch (err) {
    console.error("[Teams] Transfer captaincy error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Kaptanlık devredilemedi." } });
  }
});

// ============================================================================
// 20. SECURITY AUDIT LOGS (CAPTAIN & CO_CAPTAIN ONLY)
// ============================================================================
teamsRouter.get("/:slug/audit-logs", standardLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [actor] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!actor || (actor.role !== "CAPTAIN" && actor.role !== "CO_CAPTAIN")) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Güvenlik günlüğünü yalnızca takım yönetimi görüntüleyebilir." },
      });
      return;
    }

    const logs = await db
      .select({
        id: teamAuditLogs.id,
        action: teamAuditLogs.action,
        details: teamAuditLogs.details,
        createdAt: teamAuditLogs.createdAt,
        actorId: teamAuditLogs.actorId,
        targetUserId: teamAuditLogs.targetUserId,
      })
      .from(teamAuditLogs)
      .where(eq(teamAuditLogs.teamId, team.id))
      .orderBy(desc(teamAuditLogs.createdAt))
      .limit(50);

    // Resolve usernames safely without N+1 queries
    const userIds: number[] = Array.from(
      new Set(
        logs
          .flatMap((l: any) => [l.actorId, l.targetUserId])
          .filter((id: unknown): id is number => typeof id === "number")
      )
    );

    const userMap = new Map<number, { username: string; displayName: string | null }>();
    if (userIds.length > 0) {
      const userRows = await db
        .select({ id: users.id, username: users.username, displayName: profiles.displayName })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(inArray(users.id, userIds));

      for (const u of userRows) {
        userMap.set(u.id, { username: u.username, displayName: u.displayName });
      }
    }

    const enriched = logs.map((l: any) => ({
      id: l.id,
      action: l.action,
      details: l.details,
      createdAt: l.createdAt,
      actor: l.actorId ? userMap.get(l.actorId) || null : null,
      target: l.targetUserId ? userMap.get(l.targetUserId) || null : null,
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error("[Teams] Audit logs error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Güvenlik günlüğü yüklenemedi." } });
  }
});

// ============================================================================
// 21. SOFT-DELETE / CLOSE TEAM (CAPTAIN OR PLATFORM ADMIN ONLY)
// ============================================================================
teamsRouter.delete("/:slug", teamMutationLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = requireAuthContext(req);
    const isAdmin = req.user?.role?.toUpperCase() === "ADMIN" || req.user?.role?.toUpperCase() === "SUPERADMIN";
    const team = await findActiveTeamBySlug(req.params.slug);
    if (!team) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Takım bulunamadı." } });
      return;
    }

    const [actor] = await db
      .select({ role: teamMembers.role })
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!isAdmin && (!actor || actor.role !== "CAPTAIN")) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Takımı yalnızca Takım Kaptanı kapatabilir." },
      });
      return;
    }

    await db.transaction(async (tx: any) => {
      await tx
        .update(teams)
        .set({
          deletedAt: new Date(),
          isLocked: true,
          isRecruiting: false,
          inviteCodeEnabled: false,
          inviteCode: null, // Immediately invalidate invite code on close
          updatedAt: new Date(),
        })
        .where(eq(teams.id, team.id));

      await tx
        .update(teamInvitations)
        .set({ status: "REVOKED", updatedAt: new Date() })
        .where(and(eq(teamInvitations.teamId, team.id), eq(teamInvitations.status, "PENDING")));

      await logTeamAudit(tx, team.id, userId, "TEAM_DELETED", "Takım kapatıldı ve tüm davet kodları iptal edildi.");
    });

    res.json({ success: true, data: { message: "Takım başarıyla kapatıldı." } });
  } catch (err) {
    console.error("[Teams] Delete team error:", err);
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Takım kapatılamadı." } });
  }
});
