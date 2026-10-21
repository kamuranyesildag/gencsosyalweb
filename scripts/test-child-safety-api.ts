import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import { db } from "../src/db/index.js";
import { 
  users, 
  profiles, 
  parentalControls, 
  ageVerificationLogs, 
  appeals, 
  conversations, 
  conversationMembers, 
  messages, 
  follows, 
  blocks, 
  posts 
} from "../src/db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { generateAccessToken } from "../server/utils/jwt.js";
import { runMigration } from "../server/migrate.js";

// Import all relevant API routers
import { authRouter } from "../server/routes/auth.js";
import { childSafetyRouter } from "../server/routes/childSafety.js";
import { usersRouter } from "../server/routes/users.js";
import { followsRouter } from "../server/routes/follows.js";
import { postsRouter } from "../server/routes/posts.js";
import { messagesRouter } from "../server/routes/messages.js";
import { searchRouter } from "../server/routes/search.js";
import { feedRouter } from "../server/routes/feed.js";
import { adminRouter } from "../server/routes/admin.js";
import { appealsRouter } from "../server/routes/appeals.js";

async function runRealApiForensicTests() {
  console.log("================================================================================");
  console.log("FAZ 71C — GERÇEK HTTP API & POSTGRESQL INTEGRATION FORENSIC TEST SUITE");
  console.log("================================================================================");

  // 1. Run database migrations to ensure full schema alignment
  console.log("Ensuring database schema is migrated...");
  await runMigration(false);

  // 2. Setup Express test server
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Mount routers matching production server.ts paths
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/child-safety", childSafetyRouter);
  app.use("/api/v1/users", followsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/posts", postsRouter);
  app.use("/api/v1/messages", messagesRouter);
  app.use("/api/v1/search", searchRouter);
  app.use("/api/v1/feed", feedRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/appeals", appealsRouter);

  // Start HTTP server on dynamic port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Live HTTP Test Server listening at: ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testId: string, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] [${testId}] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] [${testId}] ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  // Helper HTTP request sender
  async function apiRequest(method: string, path: string, body?: any, token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const status = res.status;
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // not json
    }
    return { status, json };
  }

  try {
    // --- STEP 1: CREATE SYNTHETIC USERS IN DATABASE ---
    console.log("\n--- SEEDING ISOLATED SYNTHETIC USERS IN POSTGRESQL ---");
    const testSuffix = Math.floor(Math.random() * 89999 + 10000);

    // 1. Synthetic Minor User (16 years old)
    const minorBirthDate = new Date();
    minorBirthDate.setFullYear(minorBirthDate.getFullYear() - 16);
    const [minorUser] = await db.insert(users).values({
      username: `synth_minor_${testSuffix}`,
      email: `synth_minor_${testSuffix}@example.com`,
      passwordHash: "argon2_test_hash",
      role: "USER",
      isActive: true,
      isMinor: true,
      ageVerificationStatus: "UNVERIFIED",
    }).returning();

    await db.insert(profiles).values({
      userId: minorUser.id,
      displayName: "Synthetic Minor User",
      birthDate: minorBirthDate,
      isPrivate: true,
      allowSearchEngineIndexing: false,
      messagePreference: "FOLLOWERS",
      defaultPostVisibility: "FOLLOWERS",
      isScreenshotProtected: true,
    });

    const minorToken = generateAccessToken(minorUser.id, "USER");

    // 2. Synthetic Adult Stranger User (25 years old)
    const adultBirthDate = new Date();
    adultBirthDate.setFullYear(adultBirthDate.getFullYear() - 25);
    const [adultStranger] = await db.insert(users).values({
      username: `synth_adult_${testSuffix}`,
      email: `synth_adult_${testSuffix}@example.com`,
      passwordHash: "argon2_test_hash",
      role: "USER",
      isActive: true,
      isMinor: false,
      ageVerificationStatus: "UNVERIFIED",
    }).returning();

    await db.insert(profiles).values({
      userId: adultStranger.id,
      displayName: "Synthetic Adult Stranger",
      birthDate: adultBirthDate,
      isPrivate: false,
      allowSearchEngineIndexing: true,
      messagePreference: "ANYONE",
      defaultPostVisibility: "PUBLIC",
      isScreenshotProtected: false,
    });

    const adultStrangerToken = generateAccessToken(adultStranger.id, "USER");

    // 3. Synthetic Normal Non-Admin User
    const [normalUser] = await db.insert(users).values({
      username: `synth_normal_${testSuffix}`,
      email: `synth_normal_${testSuffix}@example.com`,
      passwordHash: "argon2_test_hash",
      role: "USER",
      isActive: true,
      isMinor: false,
      ageVerificationStatus: "UNVERIFIED",
    }).returning();

    const normalUserToken = generateAccessToken(normalUser.id, "USER");

    // 4. Synthetic Admin User
    const [adminUser] = await db.insert(users).values({
      username: `synth_admin_${testSuffix}`,
      email: `synth_admin_${testSuffix}@example.com`,
      passwordHash: "argon2_test_hash",
      role: "ADMIN",
      isActive: true,
      isMinor: false,
      ageVerificationStatus: "UNVERIFIED",
    }).returning();

    const adminToken = generateAccessToken(adminUser.id, "ADMIN");

    console.log(`Synthetic users created: minor=${minorUser.id}, adult=${adultStranger.id}, admin=${adminUser.id}`);

    // --- TEST 1: İSTEMCİ ageVerificationStatus: VERIFIED_ADULT GÖNDERİR ---
    console.log("\n--- TEST GROUP: REAL HTTP API ENDPOINT SECURITY ---");

    const t1Res = await apiRequest("PATCH", "/api/v1/users/me", {
      ageVerificationStatus: "VERIFIED_ADULT",
      displayName: "Attempted Adult Claim"
    }, minorToken);
    
    // Check DB state to confirm ageVerificationStatus was NOT altered
    const [t1UserDb] = await db.select({ status: users.ageVerificationStatus }).from(users).where(eq(users.id, minorUser.id)).limit(1);
    assert(
      t1UserDb.status === "UNVERIFIED", 
      "API-01", 
      "İstemci PATCH /users/me ile ageVerificationStatus: 'VERIFIED_ADULT' gönderdiğinde mass-assignment reddedilmeli ve DB'de UNVERIFIED kalmalı",
      `Actual status in DB: ${t1UserDb.status}`
    );

    // --- TEST 2: ÇOCUK KULLANICI isPrivate: false VEYA allowSearchEngineIndexing: true YAPMAYA ÇALIŞIR ---
    const t2Res = await apiRequest("PATCH", "/api/v1/users/me", {
      isPrivate: false
    }, minorToken);

    assert(
      t2Res.status === 403 && t2Res.json?.error?.code === "CHILD_PROTECTION_RESTRICTION",
      "API-02",
      "Çocuk kullanıcı profil gizliliğini (isPrivate: false) kapatmaya çalıştığında 403 CHILD_PROTECTION_RESTRICTION dönmeli",
      `Status: ${t2Res.status}, Error code: ${t2Res.json?.error?.code}`
    );

    const t2bRes = await apiRequest("PATCH", "/api/v1/users/me", {
      allowSearchEngineIndexing: true
    }, minorToken);

    assert(
      t2bRes.status === 403 && t2bRes.json?.error?.code === "CHILD_PROTECTION_RESTRICTION",
      "API-03",
      "Çocuk kullanıcı arama motoru dizinini açmaya çalıştığında 403 CHILD_PROTECTION_RESTRICTION dönmeli",
      `Status: ${t2bRes.status}`
    );

    // --- TEST 3: RESMÎ E-DEVLET DOĞRULAMA ENDPOINT'İ ÇAĞRILDIĞINDA BLOCKED_EXTERNAL_DEPENDENCY DÖNER ---
    const t3Res = await apiRequest("POST", "/api/v1/child-safety/verify-age", {
      birthDate: "2000-01-01",
      verificationMethod: "E_DEVLET"
    }, adultStrangerToken);

    assert(
      t3Res.status === 503 && t3Res.json?.error?.code === "BLOCKED_EXTERNAL_DEPENDENCY",
      "API-04",
      "Resmî e-Devlet yöntemi çağrıldığında sunucu sahte başarı dönmemeli, 503 BLOCKED_EXTERNAL_DEPENDENCY dönmeli",
      `Status: ${t3Res.status}, Code: ${t3Res.json?.error?.code}`
    );

    // --- TEST 4: KULLANICI BEYANLA DOĞRULAMA YAPTIĞINDA ASLA 'VERIFIED_ADULT' VERİLMEMELİ ---
    const t4Res = await apiRequest("POST", "/api/v1/child-safety/verify-age", {
      birthDate: "1998-05-12",
      verificationMethod: "DECLARATION"
    }, adultStrangerToken);

    const [t4UserDb] = await db.select({ status: users.ageVerificationStatus, isMinor: users.isMinor }).from(users).where(eq(users.id, adultStranger.id)).limit(1);
    assert(
      t4Res.status === 200 && t4UserDb.status === "UNVERIFIED" && t4UserDb.isMinor === false,
      "API-05",
      "Yetişkin doğum tarihi beyanında statü UNVERIFIED olarak kalmalı, asla sahte VERIFIED_ADULT olmamalı",
      `Status in DB: ${t4UserDb.status}`
    );

    // --- TEST 5: 15 YAŞ ALTI DOĞUM TARİHİ BEYANI HESABI ASKILAMALIDIR (REJECTED_UNDERAGE) ---
    const [underageUser] = await db.insert(users).values({
      username: `synth_under_${testSuffix}`,
      email: `synth_under_${testSuffix}@example.com`,
      passwordHash: "argon2_test_hash",
      role: "USER",
      isActive: true,
      isMinor: false,
      ageVerificationStatus: "UNVERIFIED"
    }).returning();
    const underageToken = generateAccessToken(underageUser.id, "USER");

    const t5Res = await apiRequest("POST", "/api/v1/child-safety/verify-age", {
      birthDate: "2015-01-01", // 11 years old
      verificationMethod: "DECLARATION"
    }, underageToken);

    const [t5UserDb] = await db.select({ 
      status: users.ageVerificationStatus, 
      isActive: users.isActive, 
      isMinor: users.isMinor 
    }).from(users).where(eq(users.id, underageUser.id)).limit(1);

    assert(
      t5Res.status === 403 && t5UserDb.status === "REJECTED_UNDERAGE" && t5UserDb.isActive === false,
      "API-06",
      "15 yaş altı doğum tarihi beyan edildiğinde kullanıcı hesabı dondurulmalı ve REJECTED_UNDERAGE atanmalı",
      `HTTP: ${t5Res.status}, DB isActive: ${t5UserDb.isActive}, Status: ${t5UserDb.status}`
    );

    // --- TEST 6: ÖZEL ÇOCUK GÖNDERİSİ DOĞRUDAN POST ID İLE YABANCIYA İSTENDİĞİNDE 403 FORBIDDEN ---
    const [minorPost] = await db.insert(posts).values({
      userId: minorUser.id,
      content: "Gizli çocuk kullanıcının özel gönderisi",
      visibility: "FOLLOWERS",
      moderationStatus: "APPROVED"
    }).returning();

    // Adult stranger tries to read minor post directly via GET /api/v1/posts/:id
    const t6Res = await apiRequest("GET", `/api/v1/posts/${minorPost.id}`, undefined, adultStrangerToken);
    assert(
      t6Res.status === 403 && t6Res.json?.error?.code === "FORBIDDEN",
      "API-07",
      "Onaylı takipçisi olmayan yabancı yetişkin, çocuğun gönderisine doğrudan post ID ile erişmeye çalıştığında 403 FORBIDDEN dönmeli",
      `Status: ${t6Res.status}, Error code: ${t6Res.json?.error?.code}`
    );

    // Unauthenticated visitor also gets 403
    const t6bRes = await apiRequest("GET", `/api/v1/posts/${minorPost.id}`);
    assert(
      t6bRes.status === 403,
      "API-08",
      "Anonim oturumsuz ziyaretçi çocuğun gönderisine erişmeye çalıştığında 403 FORBIDDEN dönmeli",
      `Status: ${t6bRes.status}`
    );

    // --- TEST 7: YETKİŞKİN YABANCIDAN ÇOCUĞA KARŞILIKLI TAKİP OLMADAN MESAJ BAŞLATMA ENGELİ ---
    const t7Res = await apiRequest("POST", "/api/v1/messages/conversations", {
      targetUserId: minorUser.id
    }, adultStrangerToken);

    assert(
      t7Res.status === 403 && t7Res.json?.error?.code === "CHILD_PROTECTION_RESTRICTION",
      "API-09",
      "Yetişkin yabancı karşılıklı onaylı takipleşme olmadan çocukla yeni sohbet başlatmaya çalıştığında 403 CHILD_PROTECTION_RESTRICTION dönmeli",
      `Status: ${t7Res.status}, Code: ${t7Res.json?.error?.code}`
    );

    // --- TEST 8: ENGELLENMİŞ VEYA TAKİBİ BOZULMUŞ KULLANICI ESKİ SOHBETE MESAJ YAZAMAZ ---
    // Create an existing conversation directly in DB between minor and adult
    const [existingConv] = await db.insert(conversations).values({}).returning();
    await db.insert(conversationMembers).values([
      { conversationId: existingConv.id, userId: minorUser.id },
      { conversationId: existingConv.id, userId: adultStranger.id }
    ]);

    // Adult stranger tries to post a message into this conversation without mutual follow
    const t8Res = await apiRequest("POST", `/api/v1/messages/conversations/${existingConv.id}/messages`, {
      content: "Yabancıdan çocuğa mesaj denemesi"
    }, adultStrangerToken);

    assert(
      t8Res.status === 403 && t8Res.json?.error?.code === "CHILD_PROTECTION_RESTRICTION",
      "API-10",
      "Karşılıklı onaylı takip bulunmadığında yetişkinin eski sohbet ID'sine mesaj göndermesi 403 ile engellenmeli",
      `Status: ${t8Res.status}, Code: ${t8Res.json?.error?.code}`
    );

    // Now test with BLOCK: Block the adult
    await db.insert(blocks).values({
      blockerId: minorUser.id,
      blockedId: adultStranger.id
    });

    const t8bRes = await apiRequest("POST", `/api/v1/messages/conversations/${existingConv.id}/messages`, {
      content: "Engellendikten sonra mesaj denemesi"
    }, adultStrangerToken);

    assert(
      t8bRes.status === 403 && t8bRes.json?.error?.code === "FORBIDDEN",
      "API-11",
      "Engellenen kullanıcının eski sohbete mesaj göndermesi 403 FORBIDDEN ile engellenmeli",
      `Status: ${t8bRes.status}`
    );

    // --- TEST 9: EBEVEYN KONTROLÜ EŞLEŞTİRME VE ATOMİK KİLİTLENME (BRUTE FORCE) ---
    // Child requests pairing code
    const t9Req = await apiRequest("POST", "/api/v1/child-safety/parental-control/request", {
      parentEmail: `parent_${testSuffix}@example.com`,
      dailyScreenTimeMinutes: 120
    }, minorToken);

    assert(
      t9Req.status === 200 && t9Req.json?.data?.pairingCode?.startsWith("GS-"),
      "API-12",
      "Ebeveyn eşleştirme kodu talebi 200 dönmeli ve yüksek entropili GS- formatında olmalı",
      `Pairing Code: ${t9Req.json?.data?.pairingCode}`
    );

    const validCode = t9Req.json?.data?.pairingCode;

    // Simulate 5 wrong code attempts to trigger brute-force lockout
    for (let i = 0; i < 5; i++) {
      await apiRequest("POST", "/api/v1/child-safety/parental-control/verify", {
        pairingCode: "GS-WRONG-CODE",
        parentConfirmationEmail: `parent_${testSuffix}@example.com`
      }, minorToken);
    }

    // 6th attempt with the CORRECT code should now be rejected due to lockout
    const t9LockoutRes = await apiRequest("POST", "/api/v1/child-safety/parental-control/verify", {
      pairingCode: validCode,
      parentConfirmationEmail: `parent_${testSuffix}@example.com`
    }, minorToken);

    assert(
      t9LockoutRes.status === 429 && t9LockoutRes.json?.error?.code === "TOO_MANY_FAILED_ATTEMPTS",
      "API-13",
      "5 hatalı denemeden sonra doğru kod girilse bile kod kilitlenmeli (429 TOO_MANY_FAILED_ATTEMPTS)",
      `Status: ${t9LockoutRes.status}, Code: ${t9LockoutRes.json?.error?.code}`
    );

    // --- TEST 10: YETKİSİZ KULLANICININ ADMİN İTİRAZ ENDPOINT'İNİ ÇAĞIRMASI (403 REDDİ) ---
    // Create an appeal record in DB
    const [sampleAppeal] = await db.insert(appeals).values({
      userId: underageUser.id,
      appealType: "AGE_VERIFICATION_DISPUTE",
      reason: "Hatalı yaş girişi yapıldı, 16 yaşındayım.",
      status: "PENDING"
    }).returning();

    // Normal user tries to approve the appeal
    const t10NormalRes = await apiRequest("PATCH", `/api/v1/admin/appeals/${sampleAppeal.id}`, {
      action: "APPROVE",
      adminResponse: "Yetkisiz onay"
    }, normalUserToken);

    assert(
      t10NormalRes.status === 403,
      "API-14",
      "Yetkisiz normal kullanıcının admin itiraz çözümleme endpoint'ine erişimi 403 FORBIDDEN ile engellenmeli",
      `Status: ${t10NormalRes.status}`
    );

    // Authorized admin approves appeal: verify humanReviewNotes is saved in DB!
    const t10AdminRes = await apiRequest("PATCH", `/api/v1/admin/appeals/${sampleAppeal.id}`, {
      action: "APPROVE",
      adminResponse: "İtirazınız yetkili inceleme uzmanımızca incelenmiş ve kabul edilmiştir.",
      humanReviewNotes: "Mevzuat kriterlerine göre incelendi ve onaylandı."
    }, adminToken);

    const [resolvedAppealDb] = await db.select().from(appeals).where(eq(appeals.id, sampleAppeal.id)).limit(1);
    const [reconciledUserDb] = await db.select({ status: users.ageVerificationStatus, isActive: users.isActive }).from(users).where(eq(users.id, underageUser.id)).limit(1);

    assert(
      t10AdminRes.status === 200 && 
      resolvedAppealDb.status === "APPROVED" && 
      resolvedAppealDb.humanReviewNotes?.includes("Mevzuat") &&
      reconciledUserDb.isActive === true &&
      reconciledUserDb.status === "UNVERIFIED",
      "API-15",
      "Admin itiraz onayında humanReviewNotes veritabanına kaydedilmeli ve REJECTED_UNDERAGE statüsü tutarlı biçimde UNVERIFIED'a uzlaştırılmalı",
      `Admin HTTP: ${t10AdminRes.status}, Saved notes: ${resolvedAppealDb.humanReviewNotes}, Reconciled status: ${reconciledUserDb.status}`
    );

    // --- TEST 11: ÇOCUK HESABININ TAKİPÇİ LİSTESİ YABANCILARA BOŞ DÖNMELİDİR ---
    const t11Res = await apiRequest("GET", `/api/v1/users/${minorUser.id}/followers`, undefined, adultStrangerToken);
    assert(
      t11Res.status === 200 && Array.isArray(t11Res.json?.data) && t11Res.json.data.length === 0,
      "API-16",
      "Çocuk kullanıcının takipçi listesi onaylı takipçisi olmayan yabancıya boş dizi (gizli) dönmeli",
      `Returned length: ${t11Res.json?.data?.length}`
    );

    // --- TEST 12: ÇOCUK GÖNDERİ OLUŞTURURKEN PUBLIC SEÇSE BİLE OTOMATİK FOLLOWERS YAPILIR ---
    const t12Res = await apiRequest("POST", "/api/v1/posts", {
      content: "Çocuk kullanıcı gönderi içeriği",
      visibility: "PUBLIC"
    }, minorToken);

    assert(
      t12Res.status === 201,
      "API-17",
      "Çocuk kullanıcı gönderi oluşturabilmeli (201 Created)",
      `Status: ${t12Res.status}`
    );

    const createdPostId = t12Res.json?.data?.id;
    const [savedPostDb] = await db.select({ visibility: posts.visibility }).from(posts).where(eq(posts.id, createdPostId)).limit(1);
    assert(
      savedPostDb?.visibility === "FOLLOWERS",
      "API-18",
      "Çocuk kullanıcı PUBLIC seçse bile backend otomatik olarak FOLLOWERS moduna çevirip veritabanına kaydetmeli",
      `Actual visibility in DB: ${savedPostDb?.visibility}`
    );

  } finally {
    // Shutdown HTTP test server
    server.close();
    console.log("HTTP test server stopped.");
  }

  console.log("\n================================================================================");
  console.log(`FAZ 71C GERÇEK HTTP API TEST SONUCU: ${passed} PASS, ${failed} FAIL`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRealApiForensicTests().catch((err) => {
  console.error("FATAL ERROR in real API tests:", err);
  process.exit(1);
});
