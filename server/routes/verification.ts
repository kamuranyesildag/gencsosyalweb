import { Router, Request, Response } from "express";
import { db } from "../../src/db/index.js";
import {
  users,
  profiles,
  follows,
  posts,
  comments,
  projects,
  communities,
  moderationLogs,
  reports,
  verificationRequests,
} from "../../src/db/schema.js";
import { requireAuth, requireAuthContext } from "../middleware/auth.js";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export const verificationRouter = Router();

export const VERIFICATION_CATEGORIES = [
  "INDIVIDUAL",
  "CREATOR",
  "ORGANIZATION",
  "COMMUNITY",
  "PROJECT",
] as const;

export type VerificationCategory = (typeof VERIFICATION_CATEGORIES)[number];

export const VERIFICATION_CATEGORY_LABELS: Record<VerificationCategory, string> = {
  INDIVIDUAL: "Bireysel",
  CREATOR: "İçerik Üreticisi",
  ORGANIZATION: "Kurum / Marka",
  COMMUNITY: "Topluluk",
  PROJECT: "Proje",
};

export interface VerificationCriterionResult {
  key: string;
  label: string;
  passed: boolean;
  currentValue: string | number;
  requiredValue: string | number;
  summary: string;
  reasonIfUnmet?: string;
}

export interface VerificationEligibilityReport {
  userId: number;
  category: VerificationCategory;
  isEligible: boolean;
  canApplyNow: boolean;
  blockingReason: string | null;
  cooldownUntil: string | null;
  metrics: {
    followerCount: number;
    requiredFollowers: number;
    accountAgeDays: number;
    requiredAccountAgeDays: number;
    profileCompletionScore: number;
    missingProfileFields: string[];
    postsLast30Days: number;
    commentsLast30Days: number;
    projectsCount: number;
    communitiesOwnedCount: number;
    riskScore: number;
    riskFlags: string[];
    highRiskViolationsCount: number;
    recentApplicationsCount30d: number;
  };
  criteria: {
    followers: VerificationCriterionResult;
    accountAge: VerificationCriterionResult;
    profileCompleteness: VerificationCriterionResult;
    activity: VerificationCriterionResult;
    originality: VerificationCriterionResult;
    reliability: VerificationCriterionResult;
    communityGuidelines: VerificationCriterionResult;
  };
}

export async function evaluateUserVerificationEligibility(
  userId: number,
  requestedCategory: string = "INDIVIDUAL"
): Promise<VerificationEligibilityReport> {
  const category: VerificationCategory = VERIFICATION_CATEGORIES.includes(
    requestedCategory as VerificationCategory
  )
    ? (requestedCategory as VerificationCategory)
    : "INDIVIDUAL";

  const [userRow] = await db
    .select({
      id: users.id,
      username: users.username,
      emailVerified: users.emailVerified,
      isActive: users.isActive,
      isVerified: users.isVerified,
      isMinor: users.isMinor,
      bannedAt: users.bannedAt,
      banReason: users.banReason,
      createdAt: users.createdAt,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      website: profiles.website,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Real accepted followers from active users
  const [followerStats] = await db
    .select({
      totalAccepted: sql<number>`cast(count(*) as integer)`,
      recent24h: sql<number>`cast(count(*) filter (where ${follows.createdAt} >= ${twentyFourHoursAgo}) as integer)`,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(
      and(
        eq(follows.followingId, userId),
        eq(follows.status, "accepted"),
        eq(users.isActive, true)
      )
    );

  // Check low-completeness followers for fake/bot follower signal
  const [lowQualityFollowerStats] = await db
    .select({
      emptyProfileFollowers: sql<number>`cast(count(*) as integer)`,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(
      and(
        eq(follows.followingId, userId),
        eq(follows.status, "accepted"),
        eq(users.isActive, true),
        sql`(${profiles.avatarUrl} IS NULL OR ${profiles.avatarUrl} = '') AND (${profiles.bio} IS NULL OR ${profiles.bio} = '')`
      )
    );

  const followerCount = Number(followerStats?.totalAccepted || 0);
  const followersLast24h = Number(followerStats?.recent24h || 0);
  const emptyProfileFollowers = Number(lowQualityFollowerStats?.emptyProfileFollowers || 0);

  // 2. Account age in days
  const createdAtDate = userRow.createdAt ? new Date(userRow.createdAt) : now;
  const accountAgeDays = Math.max(
    0,
    Math.floor((now.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const requiredAccountAgeDays = 90;

  // 3. Profile completeness
  const hasUsername = Boolean(userRow.username && userRow.username.trim().length >= 3);
  const hasDisplayName = Boolean(userRow.displayName && userRow.displayName.trim().length >= 2);
  const hasAvatar = Boolean(userRow.avatarUrl && userRow.avatarUrl.trim().length > 0);
  const hasBio = Boolean(userRow.bio && userRow.bio.trim().length >= 10);

  const missingProfileFields: string[] = [];
  if (!hasAvatar) missingProfileFields.push("Profil fotoğrafı");
  if (!hasUsername) missingProfileFields.push("Kullanıcı adı");
  if (!hasDisplayName) missingProfileFields.push("Görünen ad");
  if (!hasBio) missingProfileFields.push("Biyografi (en az 10 karakter)");

  const completedFieldsCount = 4 - missingProfileFields.length;
  const profileCompletionScore = Math.round((completedFieldsCount / 4) * 100);
  const profileCompletenessPassed = missingProfileFields.length === 0;

  // 4. Activity in the last 30 days & ecosystem presence
  const [postActivity] = await db
    .select({
      postsLast30d: sql<number>`cast(count(*) as integer)`,
    })
    .from(posts)
    .where(
      and(
        eq(posts.userId, userId),
        eq(posts.moderationStatus, "APPROVED"),
        gte(posts.createdAt, thirtyDaysAgo)
      )
    );

  const [commentActivity] = await db
    .select({
      commentsLast30d: sql<number>`cast(count(*) as integer)`,
    })
    .from(comments)
    .where(
      and(
        eq(comments.userId, userId),
        eq(comments.moderationStatus, "APPROVED"),
        gte(comments.createdAt, thirtyDaysAgo)
      )
    );

  const [projectStats] = await db
    .select({
      totalProjects: sql<number>`cast(count(*) as integer)`,
    })
    .from(projects)
    .where(eq(projects.userId, userId));

  const [communityStats] = await db
    .select({
      ownedCommunities: sql<number>`cast(count(*) as integer)`,
    })
    .from(communities)
    .where(
      and(
        eq(communities.ownerId, userId),
        sql`${communities.deletedAt} IS NULL`
      )
    );

  const postsLast30Days = Number(postActivity?.postsLast30d || 0);
  const commentsLast30Days = Number(commentActivity?.commentsLast30d || 0);
  const projectsCount = Number(projectStats?.totalProjects || 0);
  const communitiesOwnedCount = Number(communityStats?.ownedCommunities || 0);

  const activityPassed =
    postsLast30Days >= 1 ||
    commentsLast30Days >= 3 ||
    (category === "PROJECT" && projectsCount >= 1) ||
    (category === "COMMUNITY" && communitiesOwnedCount >= 1);

  // Follower threshold logic:
  // Standard categories require 1,000 real followers.
  // Student projects (PROJECT) and communities (COMMUNITY) are evaluated with originality, activity, and reliability in addition to follower count.
  const isFlexibleCategory = category === "PROJECT" || category === "COMMUNITY";
  const requiredFollowers = 1000;
  const hasCategoryEcosystemPresence =
    (category === "PROJECT" && projectsCount >= 1) ||
    (category === "COMMUNITY" && communitiesOwnedCount >= 1);

  const followersPassed =
    followerCount >= requiredFollowers ||
    (isFlexibleCategory && hasCategoryEcosystemPresence && activityPassed && profileCompletenessPassed);

  // 5. Originality check
  const originalityPassed =
    profileCompletenessPassed &&
    (category === "PROJECT"
      ? projectsCount >= 1 || followerCount >= 100
      : category === "COMMUNITY"
      ? communitiesOwnedCount >= 1 || followerCount >= 100
      : true);

  // 6. Reliability (Spam, fake engagement, bought followers check)
  const [modStats] = await db
    .select({
      rejectedLast30d: sql<number>`cast(count(*) filter (where (${moderationLogs.actionTaken} = 'REJECTED' or ${moderationLogs.riskLevel} = 'HIGH_RISK') and ${moderationLogs.createdAt} >= ${thirtyDaysAgo}) as integer)`,
      highRiskLast90d: sql<number>`cast(count(*) filter (where ${moderationLogs.riskLevel} = 'HIGH_RISK' and ${moderationLogs.createdAt} >= ${ninetyDaysAgo}) as integer)`,
    })
    .from(moderationLogs)
    .where(eq(moderationLogs.userId, userId));

  const [reportStats] = await db
    .select({
      resolvedReports: sql<number>`cast(count(*) as integer)`,
    })
    .from(reports)
    .where(
      and(
        eq(reports.targetType, "user"),
        eq(reports.targetId, userId),
        eq(reports.status, "RESOLVED")
      )
    );

  const rejectedLast30d = Number(modStats?.rejectedLast30d || 0);
  const highRiskViolationsCount = Number(modStats?.highRiskLast90d || 0);
  const resolvedUserReports = Number(reportStats?.resolvedReports || 0);

  const riskFlags: string[] = [];
  let riskScore = 0;

  if (followerCount >= 50 && followersLast24h >= 100 && followersLast24h / followerCount > 0.6) {
    riskScore += 45;
    riskFlags.push("Son 24 saatte olağandışı takipçi artışı (olası bot/takipçi satın alma sinyali)");
  }

  if (followerCount >= 50 && emptyProfileFollowers / followerCount > 0.75) {
    riskScore += 35;
    riskFlags.push("Takipçi kitlesinde yüksek oranda boş/inaktif profil tespit edildi");
  }

  if (rejectedLast30d >= 3) {
    riskScore += 30;
    riskFlags.push(`Son 30 günde ${rejectedLast30d} adet reddedilen içerik/spam uyarısı`);
  }

  const reliabilityPassed = riskScore < 50 && rejectedLast30d < 5;

  // 7. Community Guidelines
  const isBannedOrInactive = !userRow.isActive || Boolean(userRow.bannedAt);
  const communityGuidelinesPassed =
    !isBannedOrInactive && highRiskViolationsCount === 0 && resolvedUserReports === 0;

  // Check existing verification requests for cooldown / active requests / spam limit
  const recentRequests = await db
    .select()
    .from(verificationRequests)
    .where(eq(verificationRequests.userId, userId))
    .orderBy(desc(verificationRequests.createdAt))
    .limit(10);

  const activeRequest = recentRequests.find((r: any) =>
    ["pending", "under_review", "info_required"].includes(r.status)
  );

  const latestRejected = recentRequests.find((r: any) => r.status === "rejected");
  let cooldownUntil: string | null = null;
  let isUnderCooldown = false;

  if (latestRejected?.cooldownUntil) {
    const cdDate = new Date(latestRejected.cooldownUntil);
    if (cdDate.getTime() > now.getTime()) {
      isUnderCooldown = true;
      cooldownUntil = cdDate.toISOString();
    }
  }

  const recentApplicationsCount30d = recentRequests.filter(
    (r: any) => r.createdAt && new Date(r.createdAt).getTime() >= thirtyDaysAgo.getTime()
  ).length;

  const accountAgePassed = accountAgeDays >= requiredAccountAgeDays;

  const criteria: VerificationEligibilityReport["criteria"] = {
    followers: {
      key: "followers",
      label: "Takipçi Sayısı",
      passed: followersPassed,
      currentValue: followerCount,
      requiredValue: isFlexibleCategory
        ? `${requiredFollowers} takipçi veya aktif ${VERIFICATION_CATEGORY_LABELS[category].toLowerCase()} faaliyeti`
        : requiredFollowers,
      summary:
        followerCount >= requiredFollowers
          ? `${followerCount.toLocaleString("tr-TR")} gerçek takipçi şartı karşılanıyor.`
          : isFlexibleCategory && hasCategoryEcosystemPresence
          ? `${VERIFICATION_CATEGORY_LABELS[category]} kategorisinde aktif proje/topluluk varlığı ile değerlendirilebilir (${followerCount.toLocaleString("tr-TR")} / 1.000 takipçi).`
          : `Mevcut: ${followerCount.toLocaleString("tr-TR")} / Gerekli: 1.000 gerçek takipçi.`,
      reasonIfUnmet: followersPassed
        ? undefined
        : isFlexibleCategory
        ? "En az 1.000 gerçek takipçiye ulaşmalı veya platformda aktif bir proje/topluluk yayınlamış olmalısınız."
        : `Normal doğrulama başvurusu için en az 1.000 gerçek takipçi gereklidir (şu an ${followerCount.toLocaleString("tr-TR")}).`,
    },
    accountAge: {
      key: "accountAge",
      label: "Hesap Yaşı",
      passed: accountAgePassed,
      currentValue: `${accountAgeDays} gün`,
      requiredValue: `${requiredAccountAgeDays} gün`,
      summary: accountAgePassed
        ? `Hesabınız ${accountAgeDays} gündür aktif (90 gün şartı karşılandı).`
        : `Hesabınız ${accountAgeDays} gündür aktif (en az 90 gün olmalı).`,
      reasonIfUnmet: accountAgePassed
        ? undefined
        : `Hesabınızın en az 90 gündür aktif olması gerekir. Kalan süre: ${Math.max(
            1,
            requiredAccountAgeDays - accountAgeDays
          )} gün.`,
    },
    profileCompleteness: {
      key: "profileCompleteness",
      label: "Profil Bütünlüğü",
      passed: profileCompletenessPassed,
      currentValue: `%${profileCompletionScore}`,
      requiredValue: "%100",
      summary: profileCompletenessPassed
        ? "Profil fotoğrafı, kullanıcı adı, görünen ad ve biyografi eksiksiz."
        : `Eksik alanlar: ${missingProfileFields.join(", ")}.`,
      reasonIfUnmet: profileCompletenessPassed
        ? undefined
        : `Lütfen şu profil bilgilerini tamamlayın: ${missingProfileFields.join(", ")}.`,
    },
    activity: {
      key: "activity",
      label: "Son 30 Gün Aktifliği",
      passed: activityPassed,
      currentValue: `${postsLast30Days} gönderi, ${projectsCount} proje`,
      requiredValue: "Düzenli etkinlik",
      summary: activityPassed
        ? `Son 30 günde ${postsLast30Days} onaylı gönderi ve ${commentsLast30Days} yorum etkinliği bulundu.`
        : "Son 30 gün içerisinde düzenli içerik veya proje etkinliği bulunamadı.",
      reasonIfUnmet: activityPassed
        ? undefined
        : "Son 30 gün içerisinde en az 1 onaylı gönderi paylaşmış veya aktif bir proje sergilemiş olmalısınız.",
    },
    originality: {
      key: "originality",
      label: "Özgünlük",
      passed: originalityPassed,
      currentValue: originalityPassed ? "Uygun" : "Eksik",
      requiredValue: "Gerçek kişi, kurum, topluluk veya proje temsili",
      summary: originalityPassed
        ? `${VERIFICATION_CATEGORY_LABELS[category]} kategorisi için özgün profil temsili uygun.`
        : `${VERIFICATION_CATEGORY_LABELS[category]} kategorisi için profil veya proje/topluluk temsili eksik.`,
      reasonIfUnmet: originalityPassed
        ? undefined
        : category === "PROJECT"
        ? "Proje kategorisinde başvurmak için profilinizde en az 1 proje sergilemeli ve profil bilgilerinizi tamamlamalısınız."
        : category === "COMMUNITY"
        ? "Topluluk kategorisinde başvurmak için aktif bir topluluk yönetmeli ve profil bütünlüğünü sağlamalısınız."
        : "Hesabınız gerçek bir kişiyi, içerik üreticisini veya kurumu özgün biçimde temsil etmelidir.",
    },
    reliability: {
      key: "reliability",
      label: "Güvenilirlik ve Etkileşim Kalitesi",
      passed: reliabilityPassed,
      currentValue: `Risk Puanı: ${riskScore}/100`,
      requiredValue: "Manipülasyon / spam içermemeli",
      summary: reliabilityPassed
        ? "Spam, sahte etkileşim veya takipçi manipülasyonu tespit edilmedi."
        : `Güvenilirlik uyarısı: ${riskFlags.join("; ")}`,
      reasonIfUnmet: reliabilityPassed
        ? undefined
        : "Hesabınızda spam veya olağandışı etkileşim sinyalleri tespit edildiği için başvuru yapılamaz.",
    },
    communityGuidelines: {
      key: "communityGuidelines",
      label: "Topluluk Kuralları Uyumu",
      passed: communityGuidelinesPassed,
      currentValue: communityGuidelinesPassed ? "Temiz Sicil" : "İhlal Kaydı Var",
      requiredValue: "Ciddi/aktif ihlal bulunmamalı",
      summary: communityGuidelinesPassed
        ? "Ciddi veya devam eden topluluk kuralı ihlali bulunmuyor."
        : "Hesabınızda ciddi topluluk kuralı ihlali veya yaptırım kaydı bulunuyor.",
      reasonIfUnmet: communityGuidelinesPassed
        ? undefined
        : "Ciddi ve devam eden topluluk kuralı ihlalleri bulunan hesaplar doğrulama başvurusu yapamaz.",
    },
  };

  const isEligible = Object.values(criteria).every((c) => c.passed);

  let blockingReason: string | null = null;
  if (userRow.isVerified) {
    blockingReason = "Hesabınız zaten doğrulanmış (Mavi Tik sahibi) durumda.";
  } else if (activeRequest) {
    blockingReason = "Hâlihazırda inceleme sürecinde olan bir doğrulama başvurunuz bulunuyor.";
  } else if (isUnderCooldown && cooldownUntil) {
    blockingReason = `Önceki başvurunuz reddedildiği için ${new Date(
      cooldownUntil
    ).toLocaleDateString("tr-TR")} tarihine kadar yeni başvuru yapamazsınız.`;
  } else if (recentApplicationsCount30d >= 3) {
    blockingReason = "Son 30 gün içerisinde azami başvuru sınırına (3 başvuru) ulaştınız.";
  } else if (!isEligible) {
    const firstUnmet = Object.values(criteria).find((c) => !c.passed);
    blockingReason =
      firstUnmet?.reasonIfUnmet ||
      "Mavi tik başvurusu için asgari uygunluk kriterlerinin tamamı karşılanmalıdır.";
  }

  return {
    userId,
    category,
    isEligible,
    canApplyNow: isEligible && !blockingReason,
    blockingReason,
    cooldownUntil,
    metrics: {
      followerCount,
      requiredFollowers,
      accountAgeDays,
      requiredAccountAgeDays,
      profileCompletionScore,
      missingProfileFields,
      postsLast30Days,
      commentsLast30Days,
      projectsCount,
      communitiesOwnedCount,
      riskScore,
      riskFlags,
      highRiskViolationsCount,
      recentApplicationsCount30d,
    },
    criteria,
  };
}

function containsSensitiveNationalId(text: string): boolean {
  // Detects 11-digit Turkish National ID (TCKN) patterns to prevent storing sensitive ID data
  return /\b[1-9][0-9]{10}\b/.test(text);
}

verificationRouter.use(requireAuth);

// GET /api/v1/verification/me - Get current user's verification status, eligibility, and requests
verificationRouter.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = requireAuthContext(req);
    const categoryQuery = (req.query.category as string) || "INDIVIDUAL";

    const [userRecord] = await db
      .select({
        isVerified: users.isVerified,
        verificationCategory: users.verificationCategory,
        verifiedAt: users.verifiedAt,
        isMinor: users.isMinor,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const requests = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .orderBy(desc(verificationRequests.createdAt))
      .limit(10);

    const eligibility = await evaluateUserVerificationEligibility(userId, categoryQuery);

    res.json({
      success: true,
      data: requests,
      eligibility,
      currentVerification: {
        isVerified: Boolean(userRecord?.isVerified),
        verificationCategory: userRecord?.verificationCategory || null,
        verifiedAt: userRecord?.verifiedAt || null,
        isMinor: Boolean(userRecord?.isMinor),
      },
    });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// POST /api/v1/verification - Submit a new verification application
verificationRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = requireAuthContext(req);
    const {
      category = "INDIVIDUAL",
      reason,
      supportingLinks = [],
      supportingDocuments = [],
    } = req.body;

    if (!VERIFICATION_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        error: { message: "Geçersiz doğrulama kategorisi seçildi." },
      });
      return;
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 30) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Lütfen başvuru açıklamanızı ve özgünlük gerekçenizi en az 30 karakter olacak şekilde yazın.",
        },
      });
      return;
    }

    if (reason.trim().length > 1500) {
      res.status(400).json({
        success: false,
        error: { message: "Başvuru açıklaması en fazla 1500 karakter olabilir." },
      });
      return;
    }

    if (containsSensitiveNationalId(reason)) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Güvenliğiniz ve KVKK/çocuk güvenliği kuralları gereği başvuru metninde T.C. Kimlik Numarası gibi hassas kişisel veriler paylaşmayın.",
        },
      });
      return;
    }

    // Sanitize supportingLinks
    const sanitizedLinks: string[] = [];
    if (Array.isArray(supportingLinks)) {
      for (const rawLink of supportingLinks.slice(0, 5)) {
        if (typeof rawLink === "string" && rawLink.trim().length > 0) {
          const trimmed = rawLink.trim();
          if (!/^https?:\/\//i.test(trimmed)) {
            res.status(400).json({
              success: false,
              error: {
                message: `Destekleyici bağlantılar http:// veya https:// ile başlamalıdır: ${trimmed}`,
              },
            });
            return;
          }
          sanitizedLinks.push(trimmed.slice(0, 300));
        }
      }
    }

    // Sanitize supportingDocuments (protected metadata & verification reference, never public files)
    const sanitizedDocs: {
      name: string;
      type: string;
      summary: string;
      uploadedAt: string;
    }[] = [];

    if (Array.isArray(supportingDocuments)) {
      for (const doc of supportingDocuments.slice(0, 5)) {
        if (doc && typeof doc.name === "string" && doc.name.trim().length > 0) {
          const summaryText = typeof doc.summary === "string" ? doc.summary.trim() : "";
          if (containsSensitiveNationalId(summaryText) || containsSensitiveNationalId(doc.name)) {
            res.status(400).json({
              success: false,
              error: {
                message:
                  "Destekleyici belge bilgilerinde T.C. Kimlik Numarası veya hassas kimlik verisi yer alamaz.",
              },
            });
            return;
          }
          sanitizedDocs.push({
            name: doc.name.trim().slice(0, 120),
            type:
              typeof doc.type === "string" && doc.type.trim().length > 0
                ? doc.type.trim().slice(0, 60)
                : "Resmî / Kurumsal Referans",
            summary: summaryText.slice(0, 400),
            uploadedAt: new Date().toISOString(),
          });
        }
      }
    }

    // Evaluate server-side eligibility & anti-abuse rules
    const eligibility = await evaluateUserVerificationEligibility(userId, category);

    if (!eligibility.canApplyNow) {
      res.status(400).json({
        success: false,
        error: {
          message:
            eligibility.blockingReason ||
            "Mavi tik başvuru kriterleri henüz karşılanmıyor.",
        },
        eligibility,
      });
      return;
    }

    const [newReq] = await db
      .insert(verificationRequests)
      .values({
        userId,
        category,
        reason: reason.trim(),
        supportingLinks: sanitizedLinks,
        supportingDocuments: sanitizedDocs,
        eligibilitySnapshot: eligibility.metrics,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newReq,
      eligibility,
    });
  } catch (error) {
    console.error("Error creating verification request:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});

// PATCH /api/v1/verification/:id/respond - Submit additional info when status === 'info_required'
verificationRouter.patch("/:id/respond", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = requireAuthContext(req);
    const requestId = parseInt(req.params.id as string, 10);

    if (isNaN(requestId)) {
      res.status(400).json({ success: false, error: { message: "Geçersiz başvuru ID." } });
      return;
    }

    const { applicantResponse, supportingLinks, supportingDocuments } = req.body;

    if (
      !applicantResponse ||
      typeof applicantResponse !== "string" ||
      applicantResponse.trim().length < 10
    ) {
      res.status(400).json({
        success: false,
        error: { message: "Lütfen talep edilen ek bilgiyi en az 10 karakter olarak açıklayın." },
      });
      return;
    }

    if (containsSensitiveNationalId(applicantResponse)) {
      res.status(400).json({
        success: false,
        error: {
          message:
            "Güvenliğiniz için ek bilgi yanıtında T.C. Kimlik Numarası gibi hassas kişisel veriler paylaşmayın.",
        },
      });
      return;
    }

    const [existing] = await db
      .select()
      .from(verificationRequests)
      .where(
        and(eq(verificationRequests.id, requestId), eq(verificationRequests.userId, userId))
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ success: false, error: { message: "Başvuru bulunamadı." } });
      return;
    }

    if (existing.status !== "info_required") {
      res.status(400).json({
        success: false,
        error: {
          message: "Yalnızca 'Ek bilgi gerekli' durumundaki başvurulara yanıt gönderebilirsiniz.",
        },
      });
      return;
    }

    let updatedLinks = Array.isArray(existing.supportingLinks) ? [...existing.supportingLinks] : [];
    if (Array.isArray(supportingLinks)) {
      const validNewLinks = supportingLinks
        .filter((l: any) => typeof l === "string" && /^https?:\/\//i.test(l.trim()))
        .map((l: string) => l.trim().slice(0, 300));
      updatedLinks = Array.from(new Set([...updatedLinks, ...validNewLinks])).slice(0, 8);
    }

    let updatedDocs = Array.isArray(existing.supportingDocuments)
      ? [...existing.supportingDocuments]
      : [];
    if (Array.isArray(supportingDocuments)) {
      for (const doc of supportingDocuments.slice(0, 5)) {
        if (doc && typeof doc.name === "string" && doc.name.trim().length > 0) {
          updatedDocs.push({
            name: doc.name.trim().slice(0, 120),
            type:
              typeof doc.type === "string" && doc.type.trim().length > 0
                ? doc.type.trim().slice(0, 60)
                : "Ek Belge / Referans",
            summary: typeof doc.summary === "string" ? doc.summary.trim().slice(0, 400) : "",
            uploadedAt: new Date().toISOString(),
          });
        }
      }
    }

    const [updated] = await db
      .update(verificationRequests)
      .set({
        applicantResponse: applicantResponse.trim().slice(0, 1500),
        supportingLinks: updatedLinks,
        supportingDocuments: updatedDocs.slice(0, 8),
        status: "under_review",
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, requestId))
      .returning();

    res.json({
      success: true,
      data: updated,
      message: "Ek bilgileriniz kaydedildi ve başvurunuz tekrar incelemeye alındı.",
    });
  } catch (error) {
    console.error("Error responding to verification info request:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası." } });
  }
});
