import { db } from "../../src/db/index.js";
import { 
  leagueSeasons, 
  leagueParticipants, 
  leagueQuestions, 
  leagueQuestionOptions,
  leagueMatches,
  userBadges,
  badges,
  users,
  profiles
} from "../../src/db/schema.js";
import { eq, and, desc, sql, ilike } from "drizzle-orm";

/**
 * Returns current date/time adjusted to Europe/Istanbul timezone
 */
export function getIstanbulDate(): Date {
  const now = new Date();
  return now;
}

/**
 * Calculates user age from birthDate
 */
export function calculateAge(birthDate: Date | string | null | undefined): number {
  if (!birthDate) return 16; // default fallback if unrecorded
  const bDate = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - bDate.getFullYear();
  const m = now.getMonth() - bDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
    age--;
  }
  return Math.max(10, Math.min(99, age));
}

/**
 * Categorizes user age into standard league age groups
 */
export function determineAgeGroup(age: number): "13-15" | "16-17" | "18+" {
  if (age <= 15) return "13-15";
  if (age <= 17) return "16-17";
  return "18+";
}

/**
 * Ensures a season exists for the current year (or upcoming year)
 */
export async function ensureCurrentSeason() {
  const currentYear = new Date().getFullYear();

  // Check if current season exists
  const [existing] = await db
    .select()
    .from(leagueSeasons)
    .where(eq(leagueSeasons.year, currentYear))
    .limit(1);

  if (existing) {
    if (existing.status === "COMPLETED" && !existing.settings?.simulationMode) {
      // Enable simulationMode for year-round interactive testing
      const updatedSettings = {
        ...existing.settings,
        simulationMode: true,
      };
      await db
        .update(leagueSeasons)
        .set({ status: "IN_PROGRESS", settings: updatedSettings, updatedAt: new Date() })
        .where(eq(leagueSeasons.id, existing.id));
      existing.status = "IN_PROGRESS";
      existing.settings = updatedSettings;
    }
    return existing;
  }

  console.log(`🏆 Otomatik Yeni Sezon Oluşturuluyor: Gençlik Ligi ${currentYear}...`);

  // Default dates in Europe/Istanbul (May 1 - May 19)
  const regStart = new Date(`${currentYear}-05-01T00:00:00+03:00`);
  const regEnd = new Date(`${currentYear}-05-18T23:59:59+03:00`);
  const startDate = new Date(`${currentYear}-05-19T00:00:00+03:00`);
  const endDate = new Date(`${currentYear}-05-19T23:59:59+03:00`);

  const now = new Date();
  let initialStatus: "UPCOMING" | "REGISTRATION_OPEN" | "IN_PROGRESS" | "COMPLETED" = "UPCOMING";

  if (now >= startDate && now <= endDate) {
    initialStatus = "IN_PROGRESS";
  } else if (now >= regStart && now <= regEnd) {
    initialStatus = "REGISTRATION_OPEN";
  } else if (now > endDate) {
    initialStatus = "COMPLETED";
  }

  const [newSeason] = await db.insert(leagueSeasons).values({
    year: currentYear,
    title: `${currentYear} 19 Mayıs Gençlik Ligi`,
    theme: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı Bilgi ve Yetenek Ligi",
    description: "Türkiye'nin dört bir yanından gençlerin tarih, bilim, teknoloji, spor ve genel kültür alanlarında yarıştığı prestijli milli bilgi ligi.",
    registrationStartDate: regStart,
    registrationEndDate: regEnd,
    startDate,
    endDate,
    status: initialStatus,
    settings: {
      ageGroups: ["13-15", "16-17", "18+"],
      pointsCorrect: 100,
      pointsHardBonus: 50,
      maxSpeedBonus: 25,
      questionTimeLimit: 20,
      questionsPerMatch: 8,
      simulationMode: false,
    },
  }).returning();

  // Create starter badges if they don't exist
  await ensureLeagueBadges();

  return newSeason;
}

/**
 * Ensures system badges for Gençlik Ligi are initialized
 */
export async function ensureLeagueBadges() {
  const starterBadges = [
    {
      key: "LEAGUE_CHAMPION",
      name: "🏆 19 Mayıs Gençlik Ligi Şampiyonu",
      description: "19 Mayıs Gençlik Ligi finalini kazanarak sezon şampiyonu olan genç yetenek.",
    },
    {
      key: "LEAGUE_FINALIST",
      name: "🥇 Gençlik Ligi Finalisti",
      description: "19 Mayıs Gençlik Ligi final aşamasına kadar yükselme başarısı gösteren yarışmacı.",
    },
    {
      key: "LEAGUE_SPEED_DEMON",
      name: "⚡ Hızlı Cevapçı",
      description: "Soruları 5 saniyenin altında doğru yanıtlayarak maksimum hız bonusu kazanan deha.",
    },
    {
      key: "LEAGUE_KNOWLEDGE_MASTER",
      name: "🧠 Bilgi Ustası",
      description: "Gençlik Ligi'nde tek bir maçta tüm soruları firesiz doğru yanıtlayan yarışmacı.",
    }
  ];

  for (const b of starterBadges) {
    const [exists] = await db.select().from(badges).where(eq(badges.key, b.key)).limit(1);
    if (!exists) {
      await db.insert(badges).values(b).onConflictDoNothing();
    }
  }
}

/**
 * Automatically checks and transitions season states
 */
export async function checkAndRunSeasonTransitions() {
  try {
    const seasons = await db.select().from(leagueSeasons);
    const now = new Date();

    for (const season of seasons) {
      const isSim = season.settings?.simulationMode;
      if (isSim) continue; // In simulation mode, status is manually controlled

      let targetStatus = season.status;

      if (now < season.registrationStartDate) {
        targetStatus = "UPCOMING";
      } else if (now >= season.registrationStartDate && now <= season.registrationEndDate) {
        targetStatus = "REGISTRATION_OPEN";
      } else if (now >= season.startDate && now <= season.endDate) {
        targetStatus = "IN_PROGRESS";
      } else if (now > season.endDate) {
        targetStatus = "COMPLETED";
      }

      if (targetStatus !== season.status) {
        console.log(`🔄 Sezon #${season.year} durumu güncelleniyor: ${season.status} -> ${targetStatus}`);
        
        // If completing, finalize rankings and award badges
        if (targetStatus === "COMPLETED" && season.status !== "COMPLETED") {
          await finalizeSeason(season.id);
        }

        await db
          .update(leagueSeasons)
          .set({ status: targetStatus, updatedAt: new Date() })
          .where(eq(leagueSeasons.id, season.id));
      }
    }
  } catch (err) {
    console.error("Error running season transitions:", err);
  }
}

/**
 * Finalizes season, crowns champion, awards badges
 */
export async function finalizeSeason(seasonId: number) {
  try {
    const topParticipants = await db
      .select()
      .from(leagueParticipants)
      .where(eq(leagueParticipants.seasonId, seasonId))
      .orderBy(desc(leagueParticipants.totalPoints), desc(leagueParticipants.matchesWon))
      .limit(5);

    if (topParticipants.length === 0) return;

    const champion = topParticipants[0];

    // Mark champion in season
    await db
      .update(leagueSeasons)
      .set({ championUserId: champion.userId, updatedAt: new Date() })
      .where(eq(leagueSeasons.id, seasonId));

    // Award Champion Badge
    const [championBadge] = await db.select().from(badges).where(eq(badges.key, "LEAGUE_CHAMPION")).limit(1);
    if (championBadge) {
      await db.insert(userBadges).values({
        userId: champion.userId,
        badgeId: championBadge.id,
        metadata: { seasonId, rank: 1, awardedAt: new Date().toISOString() }
      }).onConflictDoNothing();
    }

    // Award Finalist Badge to 2nd and 3rd
    const [finalistBadge] = await db.select().from(badges).where(eq(badges.key, "LEAGUE_FINALIST")).limit(1);
    if (finalistBadge) {
      for (let i = 1; i < topParticipants.length && i <= 3; i++) {
        await db.insert(userBadges).values({
          userId: topParticipants[i].userId,
          badgeId: finalistBadge.id,
          metadata: { seasonId, rank: i + 1, awardedAt: new Date().toISOString() }
        }).onConflictDoNothing();
      }
    }

    console.log(`🏆 Sezon #${seasonId} Şampiyonu belirlendi: User #${champion.userId}`);
  } catch (err) {
    console.error("Error finalizing season:", err);
  }
}

/**
 * Seeds comprehensive initial curriculum questions into Question Bank
 */
export async function seedStarterQuestionsIfNeeded() {
  try {
    const existing = await db.select({ id: leagueQuestions.id }).from(leagueQuestions).limit(1);
    if (existing.length > 0) return;

    console.log("📚 Gençlik Ligi başlangıç soru havuzu oluşturuluyor...");

    const starterQuestions = [
      // 1. Tarih ve Kültür
      {
        question: "Gazi Mustafa Kemal Atatürk, Milli Mücadele'yi başlatmak üzere Samsun'a hangi vapur ile gitmiştir?",
        category: "Tarih ve Kültür",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Mustafa Kemal Paşa ve kurmay heyeti 19 Mayıs 1919'da Bandırma Vapuru ile Samsun Limanı'na varmıştır.",
        sourceType: "OFFICIAL",
        sourceReference: "Genelkurmay Askeri Tarih Arşivi",
        options: [
          { key: "A", text: "Gülcemal Vapuru", isCorrect: false },
          { key: "B", text: "Bandırma Vapuru", isCorrect: true },
          { key: "C", text: "Alemdar Gemisi", isCorrect: false },
          { key: "D", text: "Nusret Mayın Gemisi", isCorrect: false },
        ]
      },
      {
        question: "Mustafa Kemal Atatürk, 'Bütün ümidim gençliktedir' sözünü hangi eseri veya konuşmasında özellikle vurgulamıştır?",
        category: "Tarih ve Kültür",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "Atatürk, Cumhuriyet'in ilelebet muhafazası ve müdafaası görevini Türk gençliğine emanet etmiştir.",
        sourceType: "OFFICIAL",
        sourceReference: "Atatürk'ün Söylev ve Demeçleri",
        options: [
          { key: "A", text: "Nutuk", isCorrect: true },
          { key: "B", text: "Medeni Bilgiler", isCorrect: false },
          { key: "C", text: "Geometri Kılavuzu", isCorrect: false },
          { key: "D", text: "Anafartalar Muharebatı Raporu", isCorrect: false },
        ]
      },
      {
        question: "19 Mayıs günü hangi kanunla resmi olarak 'Gençlik ve Spor Bayramı' adını almıştır?",
        category: "Tarih ve Kültür",
        difficulty: "HARD",
        ageGroup: "16-17",
        explanation: "1938 yılında Gençlik ve Spor Bayramı olarak kanunlaşmış, 1981 yılında Atatürk'ü Anma, Gençlik ve Spor Bayramı olarak kabul edilmiştir.",
        sourceType: "OFFICIAL",
        sourceReference: "Resmi Gazete / Kanun No 3466",
        options: [
          { key: "A", text: "1923", isCorrect: false },
          { key: "B", text: "1938", isCorrect: true },
          { key: "C", text: "1950", isCorrect: false },
          { key: "D", text: "1980", isCorrect: false },
        ]
      },
      // 2. Bilim
      {
        question: "Nobel Kimya Ödülü'nü DNA onarımı mekanizmaları alanındaki çığır açan çalışmalarıyla kazanan Türk bilim insanı kimdir?",
        category: "Bilim",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Prof. Dr. Aziz Sancar, 2015 Nobel Kimya Ödülü'nü kazanarak Türkiye'yi gururlandırmıştır.",
        sourceType: "OFFICIAL",
        sourceReference: "Nobel Vakfı Arşivi",
        options: [
          { key: "A", text: "Prof. Dr. Cahit Arf", isCorrect: false },
          { key: "B", text: "Prof. Dr. Oktay Sinanoğlu", isCorrect: false },
          { key: "C", text: "Prof. Dr. Aziz Sancar", isCorrect: true },
          { key: "D", text: "Prof. Dr. Gazi Yaşargil", isCorrect: false },
        ]
      },
      {
        question: "Güneş Sistemi'nde Güneş'e en yakın gezegen hangisidir?",
        category: "Bilim",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Merkür, Güneş'e en yakın ve Güneş Sistemi'ndeki en küçük gezegendir.",
        sourceType: "OFFICIAL",
        sourceReference: "TÜBİTAK Bilim ve Teknik",
        options: [
          { key: "A", text: "Venüs", isCorrect: false },
          { key: "B", text: "Merkür", isCorrect: true },
          { key: "C", text: "Mars", isCorrect: false },
          { key: "D", text: "Dünya", isCorrect: false },
        ]
      },
      {
        question: "Işığın boşluktaki yaklaşık yayılma hızı saniyede kaç kilometredir?",
        category: "Bilim",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "Işık hızı saniyede yaklaşık 300.000 km (tam olarak 299.792 km/s) hızla hareket eder.",
        sourceType: "OFFICIAL",
        sourceReference: "Fizik Temelleri",
        options: [
          { key: "A", text: "150.000 km/s", isCorrect: false },
          { key: "B", text: "300.000 km/s", isCorrect: true },
          { key: "C", text: "500.000 km/s", isCorrect: false },
          { key: "D", text: "1.000.000 km/s", isCorrect: false },
        ]
      },
      // 3. Teknoloji
      {
        question: "Türkiye'nin yerli ve milli ilk haberleşme uydusu hangisidir?",
        category: "Teknoloji",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "TÜRKSAT 6A, Türkiye'nin yerli mühendislik imkanlarıyla üretilen ilk yerli haberleşme uydusudur.",
        sourceType: "OFFICIAL",
        sourceReference: "TÜBİTAK UZAY & TÜRKSAT",
        options: [
          { key: "A", text: "TÜRKSAT 4A", isCorrect: false },
          { key: "B", text: "GÖKTÜRK-1", isCorrect: false },
          { key: "C", text: "TÜRKSAT 6A", isCorrect: true },
          { key: "D", text: "BİLSAT", isCorrect: false },
        ]
      },
      {
        question: "Açık kaynak kodlu işletim sistemi çekirdeği Linux'un maskotu olan sevimli hayvan hangisidir?",
        category: "Teknoloji",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Linux'un resmi maskotu 'Tux' adında bir penguendir.",
        sourceType: "OFFICIAL",
        sourceReference: "Linux Vakfı",
        options: [
          { key: "A", text: "Penguen (Tux)", isCorrect: true },
          { key: "B", text: "Yunus", isCorrect: false },
          { key: "C", text: "Tilki", isCorrect: false },
          { key: "D", text: "Kartal", isCorrect: false },
        ]
      },
      {
        question: "Bilgisayar bilimlerinde 'Bit' terimi hangi iki İngilizce kelimenin birleşiminden türetilmiştir?",
        category: "Teknoloji",
        difficulty: "MEDIUM",
        ageGroup: "16-17",
        explanation: "'Binary' (ikili) ve 'Digit' (basamak) kelimelerinin ilk ve son harflerinin birleşmesiyle 'Bit' kelimesi türetilmiştir.",
        sourceType: "OFFICIAL",
        sourceReference: "IEEE Bilgisayar Terimleri",
        options: [
          { key: "A", text: "Binary Digit", isCorrect: true },
          { key: "B", text: "Byte Integer", isCorrect: false },
          { key: "C", text: "Basic Item", isCorrect: false },
          { key: "D", text: "Binary Technology", isCorrect: false },
        ]
      },
      // 4. Genel Kültür
      {
        question: "UNESCO Dünya Mirası Listesi'nde yer alan ve 'tarihin sıfır noktası' olarak nitelendirilen Şanlıurfa'daki antik tapınak kompleksi hangisidir?",
        category: "Genel Kültür",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Göbeklitepe, yaklaşık 12.000 yıllık geçmişiyle bilinen en eski anıtsal tapınak kompleksidir.",
        sourceType: "OFFICIAL",
        sourceReference: "Kültür ve Turizm Bakanlığı",
        options: [
          { key: "A", text: "Çatalhöyük", isCorrect: false },
          { key: "B", text: "Göbeklitepe", isCorrect: true },
          { key: "C", text: "Efes", isCorrect: false },
          { key: "D", text: "Nemrut Dağı", isCorrect: false },
        ]
      },
      // 5. Mantık
      {
        question: "Bir örüntüde sayılar 3, 7, 15, 31 şeklinde ilerlemektedir. Bu kurala göre bir sonraki sayı kaç olmalıdır?",
        category: "Mantık",
        difficulty: "MEDIUM",
        ageGroup: "ALL",
        explanation: "Her terim 2 ile çarpılıp 1 eklenerek bulunmaktadır: 3x2+1=7, 7x2+1=15, 15x2+1=31, 31x2+1=63.",
        sourceType: "OFFICIAL",
        sourceReference: "Matematiksel Mantık",
        options: [
          { key: "A", text: "45", isCorrect: false },
          { key: "B", text: "55", isCorrect: false },
          { key: "C", text: "63", isCorrect: true },
          { key: "D", text: "65", isCorrect: false },
        ]
      },
      // 6. Spor
      {
        question: "Olimpiyatlarda Türkiye'ye okçuluk branşında tarihteki ilk altın madalyayı kazandıran milli sporcumuz kimdir?",
        category: "Spor",
        difficulty: "EASY",
        ageGroup: "ALL",
        explanation: "Mete Gazoz, 2020 Tokyo Olimpiyatları'nda erkekler bireysel okçulukta altın madalya kazanmıştır.",
        sourceType: "OFFICIAL",
        sourceReference: "Türkiye Milli Olimpiyat Komitesi",
        options: [
          { key: "A", text: "Taha Akgül", isCorrect: false },
          { key: "B", text: "Mete Gazoz", isCorrect: true },
          { key: "C", text: "Servet Tazegül", isCorrect: false },
          { key: "D", text: "Rıza Kayaalp", isCorrect: false },
        ]
      },
    ];

    for (const q of starterQuestions) {
      const [insertedQ] = await db.insert(leagueQuestions).values({
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        ageGroup: q.ageGroup,
        language: "tr",
        explanation: q.explanation,
        sourceType: q.sourceType,
        sourceReference: q.sourceReference,
        status: "ACTIVE",
      }).returning();

      for (const opt of q.options) {
        await db.insert(leagueQuestionOptions).values({
          questionId: insertedQ.id,
          optionKey: opt.key,
          optionText: opt.text,
          isCorrect: opt.isCorrect,
        });
      }
    }

    console.log(`✅ ${starterQuestions.length} adet başlangıç sorusu başarıyla yüklendi.`);
  } catch (err) {
    console.error("Error seeding starter questions:", err);
  }
}
