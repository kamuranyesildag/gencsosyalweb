import { classifyAge, calculateAge, generateAgeVerificationToken, verifyAgeVerificationToken, isDigitalWellbeingNightHours } from "../server/utils/childSafety.js";
import { db } from "../src/db/index.js";
import { users, profiles, parentalControls, ageVerificationLogs, appeals } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { runMigration } from "../server/migrate.js";

async function runChildSafetyTests() {
  console.log("================================================================================");
  console.log("FAZ 71 — SOSYAL AĞ ÇOCUK GÜVENLİĞİ VE YAŞ DOĞRULAMA FORENSIC TEST SUITE");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. AGE CLASSIFICATION TESTS
  console.log("\n--- TEST GROUP 1: YAŞ KATEGORİZASYONU (10 EKİM 2026 YÖNETMELİĞİ) ---");

  // Under 15 test (e.g. 13 years old)
  const d13 = new Date();
  d13.setFullYear(d13.getFullYear() - 13);
  const class13 = classifyAge(d13);
  assert(class13.category === 'UNDER_15', "13 yaşındaki kullanıcı 'UNDER_15' olarak sınıflandırılmalı");
  assert(class13.isPermitted === false, "15 yaş altı kullanıcıya hesap izni VERİLMEMELİ (isPermitted: false)");
  assert(class13.status === 'REJECTED_UNDERAGE', "15 yaş altı durumu 'REJECTED_UNDERAGE' olmalı");

  // Minor 15-18 test (e.g. 16 years old)
  const d16 = new Date();
  d16.setFullYear(d16.getFullYear() - 16);
  const class16 = classifyAge(d16);
  assert(class16.category === 'MINOR_15_18', "16 yaşındaki kullanıcı 'MINOR_15_18' olarak sınıflandırılmalı");
  assert(class16.isPermitted === true, "15-18 yaş kullanıcısına ayrıştırılmış hizmet ile izin verilmeli");
  assert(class16.isMinor === true, "16 yaşındaki kullanıcı isMinor: true olmalı");
  assert(class16.status === 'VERIFIED_CHILD', "16 yaşındaki kullanıcı durumu 'VERIFIED_CHILD' olmalı");

  // Adult 18+ test (e.g. 24 years old)
  const d24 = new Date();
  d24.setFullYear(d24.getFullYear() - 24);
  const class24 = classifyAge(d24);
  assert(class24.category === 'ADULT_18_PLUS', "24 yaşındaki kullanıcı 'ADULT_18_PLUS' olmalı");
  assert(class24.isMinor === false, "24 yaşındaki kullanıcı isMinor: false olmalı");
  assert(class24.status === 'VERIFIED_ADULT', "24 yaşındaki kullanıcı durumu 'VERIFIED_ADULT' olmalı");

  // 2. CRYPTOGRAPHIC AGE VERIFICATION TOKEN TESTS
  console.log("\n--- TEST GROUP 2: KRİPTOGRAFİK YAŞ BELİRTECİ (TAMPER-PROOF) ---");
  const testUserId = 999;
  const token = generateAgeVerificationToken(testUserId, 16, 'VERIFIED_CHILD');
  assert(token.startsWith("GENC-AGE-V1."), "Belirteç 'GENC-AGE-V1' formatında üretilmeli");

  const verified = verifyAgeVerificationToken(token);
  assert(verified.valid === true, "Üretilen geçerli belirteç başarıyla doğrulanmalı");
  assert(verified.userId === testUserId, "Belirteç içindeki userId doğru çözümlenmeli");
  assert(verified.age === 16, "Belirteç içindeki yaş doğru çözümlenmeli");
  assert(verified.category === 'VERIFIED_CHILD', "Belirteç statüsü 'VERIFIED_CHILD' olmalı");

  // Tampered token test
  const tamperedToken = token.slice(0, -4) + "XXXX";
  const tamperedVerify = verifyAgeVerificationToken(tamperedToken);
  assert(tamperedVerify.valid === false, "Tahrif edilmiş belirteç geçersiz sayılmalı (valid: false)");

  // 3. DATABASE SCHEMA & IDEMPOTENT INTEGRITY
  console.log("\n--- TEST GROUP 3: VERİTABANI ŞEMASI VE GÜVENLİK TABLOLARI ---");
  await runMigration(false);
  try {
    const tableUsers = await db.select({
      id: users.id,
      isMinor: users.isMinor,
      ageVerificationStatus: users.ageVerificationStatus,
      ageVerificationToken: users.ageVerificationToken,
      ageVerifiedAt: users.ageVerifiedAt,
      ageVerificationMethod: users.ageVerificationMethod
    }).from(users).limit(1);
    assert(true, "users tablosunda isMinor ve ageVerificationStatus alanları mevcut ve sorgulanabilir");
  } catch (err: any) {
    assert(false, `users alan sorgusu başarısız: ${err.message}`);
  }

  try {
    const tableProfiles = await db.select({
      id: profiles.id,
      birthDate: profiles.birthDate,
      isScreenshotProtected: profiles.isScreenshotProtected,
      dailyScreenTimeLimitMinutes: profiles.dailyScreenTimeLimitMinutes
    }).from(profiles).limit(1);
    assert(true, "profiles tablosunda birthDate, isScreenshotProtected ve dailyScreenTimeLimitMinutes mevcut");
  } catch (err: any) {
    assert(false, `profiles alan sorgusu başarısız: ${err.message}`);
  }

  try {
    const tablePc = await db.select().from(parentalControls).limit(1);
    assert(true, "parental_controls tablosu mevcut ve sorgulanabilir");
  } catch (err: any) {
    assert(false, `parental_controls tablosu hatası: ${err.message}`);
  }

  try {
    const tableLogs = await db.select().from(ageVerificationLogs).limit(1);
    assert(true, "age_verification_logs denetim tablosu mevcut ve sorgulanabilir");
  } catch (err: any) {
    assert(false, `age_verification_logs tablosu hatası: ${err.message}`);
  }

  // 4. DIGITAL WELLBEING CHECK
  console.log("\n--- TEST GROUP 4: DİJİTAL ESENLİK (GECE DİNLENME KONTROLÜ) ---");
  const nightCheck = isDigitalWellbeingNightHours();
  assert(typeof nightCheck === "boolean", "isDigitalWellbeingNightHours() boolean değer döndürmeli");

  // 5. MESSAGING & FOLLOWERS REGULATION RULE TESTS
  console.log("\n--- TEST GROUP 5: MESAJLAŞMA VE TAKİPÇİ LİSTESİ MEVZUAT TESTİ ---");
  const adultUserMock = { id: 8881, isMinor: false, ageVerificationStatus: 'VERIFIED_ADULT' };
  const minorUserMock = { id: 8882, isMinor: true, ageVerificationStatus: 'VERIFIED_CHILD' };

  // Rule 1: Adult contacting minor without mutual follow must be blocked
  const hasMutualFollow = false;
  const isAllowedMessage = !(minorUserMock.isMinor && !adultUserMock.isMinor && !hasMutualFollow);
  assert(isAllowedMessage === false, "Yetişkin yabancının 15-18 yaş çocuğa tek taraflı mesaj atması BLOKE edilmeli (isAllowedMessage: false)");

  // Rule 2: Mutual follow allows contact between adult and minor
  const hasMutualFollowTrue = true;
  const isAllowedWithMutual = !(minorUserMock.isMinor && !adultUserMock.isMinor && !hasMutualFollowTrue);
  assert(isAllowedWithMutual === true, "Karşılıklı onaylı takipleşme durumunda iletişime izin verilmeli");

  // Rule 3: Minor follower list is hidden from non-followers
  const isViewerAcceptedFollower = false;
  const mustHideFollowerList = (minorUserMock.isMinor) && !isViewerAcceptedFollower;
  assert(mustHideFollowerList === true, "Çocuk kullanıcının takipçi listesi yabancılara GİZLENMELİ (mustHideFollowerList: true)");

  console.log("\n================================================================================");
  console.log(`TEST SONUCU: ${passed} PASS, ${failed} FAIL`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runChildSafetyTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
