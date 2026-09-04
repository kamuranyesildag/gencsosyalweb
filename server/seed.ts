import { db } from "../src/db/index.js";
import { users, profiles, posts, systemSettings, badges } from "../src/db/schema.js";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

export async function seedBadgesIfNeeded() {
  try {
    const existingBadges = await db.select({ id: badges.id }).from(badges).limit(1);
    if (existingBadges.length > 0) return;

    console.log("🏅 Seeding initial platform badges...");
    await db.insert(badges).values([
      {
        key: "EARLY_ADOPTER",
        name: "İlk Katılanlar",
        description: "Genç Sosyal'in öncü topluluk üyelerinden biri.",
        iconUrl: "Medal"
      },
      {
        key: "CREATIVE_MIND",
        name: "Üretken Zihin",
        description: "Proje ve içerikleriyle topluluğu besleyen üretici.",
        iconUrl: "Sparkles"
      },
      {
        key: "COMMUNITY_HERO",
        name: "Topluluk Kahramanı",
        description: "Yorum ve etkileşimleriyle tartışmaları canlandıran üye.",
        iconUrl: "Users"
      },
      {
        key: "VERIFIED_CREATOR",
        name: "Onaylı Profil",
        description: "Kimliği doğrulanmış resmi veya tanınmış profil.",
        iconUrl: "CheckCircle2"
      }
    ]);
  } catch (err) {
    console.error("Error seeding badges:", err);
  }
}

export async function seedInitialDataIfNeeded() {
  try {
    await seedBadgesIfNeeded();

    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
    if (existingUsers.length > 0) {
      return; // Database already has users
    }

    console.log("🌱 Database is empty. Seeding initial admin and official account...");

    const passwordHash = await argon2.hash("AdminPassword123!");

    // 1. Admin Account
    const [adminUser] = await db.insert(users).values({
      email: "admin@gencsosyal.com",
      username: "admin",
      passwordHash: passwordHash,
      role: "admin",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      isOfficialAccount: true,
      officialPriority: "high",
    }).returning();

    await db.insert(profiles).values({
      userId: adminUser.id,
      displayName: "Genç Sosyal Yönetim",
      bio: "Genç Sosyal Resmi Yönetim Hesabı",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isPrivate: false,
      onboardingCompleted: true,
    });

    // 2. Official Platform Account
    const [officialUser] = await db.insert(users).values({
      email: "iletisim@gencsosyal.com",
      username: "gencsosyal",
      passwordHash: passwordHash,
      role: "user",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      isOfficialAccount: true,
      officialPriority: "high",
    }).returning();

    await db.insert(profiles).values({
      userId: officialUser.id,
      displayName: "Genç Sosyal",
      bio: "Gençlerin fikirlerini, projelerini ve enerjilerini paylaştığı yeni nesil sosyal platform. 🚀",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      isPrivate: false,
      onboardingCompleted: true,
    });

    // 3. Welcome Post
    await db.insert(posts).values({
      userId: officialUser.id,
      content: "Genç Sosyal'e hoş geldiniz! 🎉\nBurada yeni projeler keşfedebilir, topluluklarla etkileşime geçebilir ve fikirlerinizi özgürce paylaşabilirsiniz. Hep birlikte büyüyoruz!",
      visibility: "PUBLIC",
      postType: "NORMAL",
      moderationStatus: "APPROVED",
      baseScore: 10,
    });

    // 4. Auto-Follow Setting with official accounts
    await db.insert(systemSettings).values({
      key: "auto_follow_users",
      value: JSON.stringify([officialUser.id]),
      updatedBy: adminUser.id,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: systemSettings.key,
      set: {
        value: JSON.stringify([officialUser.id]),
        updatedBy: adminUser.id,
        updatedAt: new Date()
      }
    });

    console.log("✅ Initial seeding completed successfully.");
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}
