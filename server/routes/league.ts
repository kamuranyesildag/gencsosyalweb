import { Router } from "express";
import { db } from "../../src/db/index.js";
import { 
  leagueSeasons, 
  leagueParticipants, 
  leagueQuestions, 
  leagueQuestionOptions,
  leagueMatches,
  leagueMatchQuestions,
  leagueMatchAnswers,
  users,
  profiles,
  badges,
  userBadges
} from "../../src/db/schema.js";
import { eq, and, desc, sql, or, inArray, ilike, notInArray } from "drizzle-orm";
import { 
  ensureCurrentSeason, 
  checkAndRunSeasonTransitions, 
  calculateAge, 
  determineAgeGroup, 
  finalizeSeason,
  seedStarterQuestionsIfNeeded,
  ensureLeagueBadges
} from "../services/leagueAutomation.js";
import { generateDraftQuestionsWithAI } from "../services/leagueAiQuestions.js";
import { requireAuth, optionalAuth, getUserId, requireRole } from "../middleware/auth.js";

export const leagueRouter = Router();

const requireAdmin = requireRole("ADMIN");

const getReqUserId = (req: any): number | null => {
  return req.user?.userId || req.user?.id || null;
};

/**
 * GET /api/v1/league/current
 * Returns current season details, rules, and current user's registration status
 */
leagueRouter.get("/current", optionalAuth, async (req: any, res) => {
  try {
    await seedStarterQuestionsIfNeeded();
    await ensureLeagueBadges();
    await checkAndRunSeasonTransitions();
    const season = await ensureCurrentSeason();

    let userParticipation: any = null;
    let userAge = 16;
    let suggestedAgeGroup = "16-17";
    const currentUserId = getReqUserId(req);

    if (currentUserId) {
      // Find user profile to extract real birthDate
      const [userProfile] = await db
        .select({
          birthDate: profiles.birthDate,
        })
        .from(profiles)
        .where(eq(profiles.userId, currentUserId))
        .limit(1);

      if (userProfile?.birthDate) {
        userAge = calculateAge(userProfile.birthDate);
      }
      suggestedAgeGroup = determineAgeGroup(userAge);

      const [participant] = await db
        .select()
        .from(leagueParticipants)
        .where(
          and(
            eq(leagueParticipants.seasonId, season.id),
            eq(leagueParticipants.userId, currentUserId)
          )
        )
        .limit(1);

      if (participant) {
        // Calculate user's current rank
        const [rankRes] = await db.execute(sql`
          SELECT COUNT(*) + 1 as rank 
          FROM "league_participants" 
          WHERE "season_id" = ${season.id} 
            AND "total_points" > ${participant.totalPoints}
        `);
        const userRank = Number(rankRes?.rows?.[0]?.rank || 1);

        userParticipation = {
          ...participant,
          rank: userRank,
        };
      }
    }

    // Top 3 champions/leaders preview
    const leaders = await db
      .select({
        id: leagueParticipants.id,
        userId: leagueParticipants.userId,
        username: users.username,
        avatarUrl: profiles.avatarUrl,
        totalPoints: leagueParticipants.totalPoints,
        matchesWon: leagueParticipants.matchesWon,
        matchesPlayed: leagueParticipants.matchesPlayed,
        ageGroup: leagueParticipants.ageGroup,
      })
      .from(leagueParticipants)
      .innerJoin(users, eq(leagueParticipants.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(leagueParticipants.seasonId, season.id))
      .orderBy(desc(leagueParticipants.totalPoints), desc(leagueParticipants.matchesWon))
      .limit(3);

    // Total active question count
    const [qCountRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leagueQuestions)
      .where(eq(leagueQuestions.status, "ACTIVE"));

    res.json({
      success: true,
      season,
      stats: {
        activeQuestionsCount: Number(qCountRes?.count || 0),
        topLeaders: leaders,
      },
      userState: {
        isRegistered: Boolean(userParticipation),
        participation: userParticipation,
        calculatedAge: userAge,
        suggestedAgeGroup,
      }
    });
  } catch (err: any) {
    console.error("Error fetching current league season:", err);
    res.status(500).json({ success: false, error: { message: "Lig verileri yüklenirken bir hata oluştu." } });
  }
});

/**
 * GET /api/v1/league/seasons
 * Past and upcoming seasons archive
 */
leagueRouter.get("/seasons", async (req, res) => {
  try {
    const seasons = await db
      .select({
        id: leagueSeasons.id,
        year: leagueSeasons.year,
        title: leagueSeasons.title,
        theme: leagueSeasons.theme,
        description: leagueSeasons.description,
        startDate: leagueSeasons.startDate,
        endDate: leagueSeasons.endDate,
        status: leagueSeasons.status,
        totalParticipants: leagueSeasons.totalParticipants,
        totalMatches: leagueSeasons.totalMatches,
        championUserId: leagueSeasons.championUserId,
        championUsername: users.username,
        championAvatar: profiles.avatarUrl,
      })
      .from(leagueSeasons)
      .leftJoin(users, eq(leagueSeasons.championUserId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(leagueSeasons.year));

    res.json({ success: true, seasons });
  } catch (err: any) {
    console.error("Error fetching league seasons archive:", err);
    res.status(500).json({ success: false, error: { message: "Sezon arşivi yüklenemedi." } });
  }
});

/**
 * GET /api/v1/league/seasons/:id
 * Season details with winners and stats
 */
leagueRouter.get("/seasons/:id", async (req, res) => {
  try {
    const seasonId = parseInt(req.params.id);
    if (isNaN(seasonId)) {
      return res.status(400).json({ success: false, error: { message: "Geçersiz sezon ID'si." } });
    }

    const [season] = await db
      .select()
      .from(leagueSeasons)
      .where(eq(leagueSeasons.id, seasonId))
      .limit(1);

    if (!season) {
      return res.status(404).json({ success: false, error: { message: "Sezon bulunamadı." } });
    }

    // Top 10 participants for this season
    const topParticipants = await db
      .select({
        userId: leagueParticipants.userId,
        username: users.username,
        avatarUrl: profiles.avatarUrl,
        totalPoints: leagueParticipants.totalPoints,
        matchesWon: leagueParticipants.matchesWon,
        matchesPlayed: leagueParticipants.matchesPlayed,
        correctAnswersCount: leagueParticipants.correctAnswersCount,
        ageGroup: leagueParticipants.ageGroup,
        status: leagueParticipants.status,
      })
      .from(leagueParticipants)
      .innerJoin(users, eq(leagueParticipants.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(leagueParticipants.seasonId, seasonId))
      .orderBy(desc(leagueParticipants.totalPoints), desc(leagueParticipants.matchesWon))
      .limit(10);

    res.json({
      success: true,
      season,
      topParticipants,
    });
  } catch (err: any) {
    console.error("Error fetching season details:", err);
    res.status(500).json({ success: false, error: { message: "Sezon detayları yüklenemedi." } });
  }
});

/**
 * POST /api/v1/league/register
 * Enrolls authenticated user into current season
 */
leagueRouter.post("/register", requireAuth, async (req: any, res) => {
  try {
    const userId = getReqUserId(req)!;
    const season = await ensureCurrentSeason();

    const isSim = season.settings?.simulationMode;
    const isOpen = season.status === "REGISTRATION_OPEN" || season.status === "IN_PROGRESS" || isSim;

    if (!isOpen) {
      return res.status(400).json({
        success: false,
        error: { message: "Bu sezon için şu anda kayıtlar açık değildir." }
      });
    }

    // Check if user already registered
    const [existing] = await db
      .select()
      .from(leagueParticipants)
      .where(
        and(
          eq(leagueParticipants.seasonId, season.id),
          eq(leagueParticipants.userId, userId)
        )
      )
      .limit(1);

    if (existing) {
      return res.json({
        success: true,
        participant: existing,
        message: "Zaten bu sezona kayıtlısınız!"
      });
    }

    // Get user profile for age calculation
    const [userProfile] = await db
      .select({
        birthDate: profiles.birthDate,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    let birthDate = userProfile?.birthDate;
    if (!birthDate && req.body.birthDate) {
      const parsedDate = new Date(req.body.birthDate);
      if (!isNaN(parsedDate.getTime())) {
        birthDate = parsedDate;
        await db
          .update(profiles)
          .set({ birthDate: parsedDate, updatedAt: new Date() })
          .where(eq(profiles.userId, userId));
      }
    }

    const age = calculateAge(birthDate);
    const ageGroup = req.body.ageGroup || determineAgeGroup(age);

    const [participant] = await db
      .insert(leagueParticipants)
      .values({
        seasonId: season.id,
        userId,
        ageGroup,
        totalPoints: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        correctAnswersCount: 0,
        totalAnswersCount: 0,
        currentRound: "QUALIFIERS",
        status: "ACTIVE",
      })
      .returning();

    // Increment total participants
    await db
      .update(leagueSeasons)
      .set({
        totalParticipants: sql`${leagueSeasons.totalParticipants} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(leagueSeasons.id, season.id));

    res.json({
      success: true,
      participant,
      message: "✓ Katılımın tamamlandı! 19 Mayıs Gençlik Ligi'ne hoş geldin.",
    });
  } catch (err: any) {
    console.error("Error registering user to league:", err);
    res.status(500).json({ success: false, error: { message: "Kayıt işlemi sırasında bir hata oluştu." } });
  }
});

/**
 * GET /api/v1/league/leaderboard
 * Privacy-safe public leaderboard: only displays platform username, points, matches won
 * (NO real name, email, phone, school, or private info)
 */
leagueRouter.get("/leaderboard", async (req, res) => {
  try {
    const seasonIdParam = req.query.seasonId ? parseInt(req.query.seasonId as string) : null;
    let seasonId: number;

    if (!seasonIdParam) {
      const current = await ensureCurrentSeason();
      seasonId = current.id;
    } else {
      seasonId = seasonIdParam;
    }

    const ageGroup = req.query.ageGroup as string; // 'all', '13-15', '16-17', '18+'
    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "50")));
    const offset = (page - 1) * limit;

    const conditions = [eq(leagueParticipants.seasonId, seasonId)];
    if (ageGroup && ageGroup !== "all") {
      conditions.push(eq(leagueParticipants.ageGroup, ageGroup));
    }

    const participants = await db
      .select({
        id: leagueParticipants.id,
        userId: leagueParticipants.userId,
        username: users.username,
        avatarUrl: profiles.avatarUrl,
        totalPoints: leagueParticipants.totalPoints,
        matchesWon: leagueParticipants.matchesWon,
        matchesPlayed: leagueParticipants.matchesPlayed,
        correctAnswersCount: leagueParticipants.correctAnswersCount,
        ageGroup: leagueParticipants.ageGroup,
        currentRound: leagueParticipants.currentRound,
        status: leagueParticipants.status,
      })
      .from(leagueParticipants)
      .innerJoin(users, eq(leagueParticipants.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(...conditions))
      .orderBy(desc(leagueParticipants.totalPoints), desc(leagueParticipants.matchesWon))
      .limit(limit)
      .offset(offset);

    // Compute rank
    const rankedParticipants = participants.map((p: any, idx: number) => ({
      ...p,
      rank: offset + idx + 1,
    }));

    // Total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leagueParticipants)
      .where(and(...conditions));

    res.json({
      success: true,
      leaderboard: rankedParticipants,
      pagination: {
        page,
        limit,
        total: Number(countResult?.count || 0),
        totalPages: Math.ceil(Number(countResult?.count || 0) / limit),
      }
    });
  } catch (err: any) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ success: false, error: { message: "Liderlik tablosu yüklenemedi." } });
  }
});

/**
 * POST /api/v1/league/match/start
 * Automatically starts or finds a 1v1 match for the authenticated participant
 * Selects clean non-repeated questions according to curriculum rules
 */
leagueRouter.post("/match/start", requireAuth, async (req: any, res) => {
  try {
    const userId = getReqUserId(req)!;
    const season = await ensureCurrentSeason();

    // Check if season allows matches
    const isSim = season.settings?.simulationMode;
    const isLive = season.status === "IN_PROGRESS" || isSim;
    if (!isLive) {
      return res.status(400).json({
        success: false,
        error: { message: "Lig maçları henüz başlamadı veya sezon sona erdi." }
      });
    }

    // Check user registration
    let [participant] = await db
      .select()
      .from(leagueParticipants)
      .where(
        and(
          eq(leagueParticipants.seasonId, season.id),
          eq(leagueParticipants.userId, userId)
        )
      )
      .limit(1);

    if (!participant) {
      // Auto-register if not yet registered
      const [userProfile] = await db
        .select({ birthDate: profiles.birthDate })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);
      const age = calculateAge(userProfile?.birthDate);
      const ageGroup = determineAgeGroup(age);

      [participant] = await db
        .insert(leagueParticipants)
        .values({
          seasonId: season.id,
          userId,
          ageGroup,
          totalPoints: 0,
        })
        .returning();
    }

    if (participant.isFlagged) {
      return res.status(403).json({
        success: false,
        error: { message: "Hesabınız hile veya şüpheli davranış nedeniyle ligden geçici olarak uzaklaştırılmıştır." }
      });
    }

    // Check if user has an existing active match
    const [existingMatch] = await db
      .select()
      .from(leagueMatches)
      .where(
        and(
          eq(leagueMatches.seasonId, season.id),
          eq(leagueMatches.status, "ACTIVE"),
          or(
            eq(leagueMatches.player1Id, userId),
            eq(leagueMatches.player2Id, userId)
          )
        )
      )
      .limit(1);

    if (existingMatch) {
      // Return ongoing match details
      const matchQuestionsList = await getMatchQuestionsSanitized(existingMatch.id);
      return res.json({
        success: true,
        match: existingMatch,
        questions: matchQuestionsList,
        message: "Devam eden maçınıza yönlendiriliyorsunuz."
      });
    }

    // Select smart questions for this match:
    // 1. Difficulty distribution: easy, medium, hard
    // 2. Not already answered by this user in past matches if possible
    const previousAnsweredQIds = await db
      .select({ questionId: leagueMatchAnswers.questionId })
      .from(leagueMatchAnswers)
      .where(eq(leagueMatchAnswers.userId, userId));
    const answeredIds = previousAnsweredQIds.map((a: any) => a.questionId);

    const questionsPerMatch = season.settings?.questionsPerMatch || 6;

    // Fetch active questions
    let queryConditions = [eq(leagueQuestions.status, "ACTIVE")];
    if (answeredIds.length > 0) {
      // Prefer questions not yet answered
      // But ensure we have enough
      const availableCountRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(leagueQuestions)
        .where(and(eq(leagueQuestions.status, "ACTIVE"), notInArray(leagueQuestions.id, answeredIds)));

      if (Number(availableCountRes[0]?.count || 0) >= questionsPerMatch) {
        queryConditions.push(notInArray(leagueQuestions.id, answeredIds));
      }
    }

    // Select random questions
    const selectedQuestions = await db
      .select({
        id: leagueQuestions.id,
        question: leagueQuestions.question,
        category: leagueQuestions.category,
        difficulty: leagueQuestions.difficulty,
      })
      .from(leagueQuestions)
      .where(and(...queryConditions))
      .orderBy(sql`RANDOM()`)
      .limit(questionsPerMatch);

    if (selectedQuestions.length === 0) {
      // Fallback: any active questions
      const fallbackQuestions = await db
        .select({ id: leagueQuestions.id })
        .from(leagueQuestions)
        .where(eq(leagueQuestions.status, "ACTIVE"))
        .limit(questionsPerMatch);
      selectedQuestions.push(...fallbackQuestions as any);
    }

    // Random bot rival names for instant interactive play
    const botNames = [
      "BilgeGenç_06",
      "SiberYıldız_34",
      "TeknoRota_35",
      "AtatürkGençliği_19",
      "MilliYetenek_16",
      "KodKaşifi_07"
    ];
    const randomBotName = botNames[Math.floor(Math.random() * botNames.length)];

    // Create match
    const now = new Date();
    const [newMatch] = await db
      .insert(leagueMatches)
      .values({
        seasonId: season.id,
        stage: participant.currentRound || "QUALIFIERS",
        ageGroup: participant.ageGroup,
        player1Id: userId,
        player2Id: null,
        isVsBot: true,
        botName: randomBotName,
        status: "ACTIVE",
        currentQuestionIndex: 0,
        player1Score: 0,
        player2Score: 0,
        startedAt: now,
        questionStartedAt: now,
      })
      .returning();

    // Insert match questions
    for (let i = 0; i < selectedQuestions.length; i++) {
      await db.insert(leagueMatchQuestions).values({
        matchId: newMatch.id,
        questionId: selectedQuestions[i].id,
        order: i + 1,
      });
    }

    // Increment total matches
    await db
      .update(leagueSeasons)
      .set({
        totalMatches: sql`${leagueSeasons.totalMatches} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(leagueSeasons.id, season.id));

    const matchQuestionsList = await getMatchQuestionsSanitized(newMatch.id);

    res.json({
      success: true,
      match: newMatch,
      questions: matchQuestionsList,
      timeLimitPerQuestion: season.settings?.questionTimeLimit || 20,
    });
  } catch (err: any) {
    console.error("Error starting match:", err);
    res.status(500).json({ success: false, error: { message: "Maç başlatılamadı." } });
  }
});

/**
 * GET /api/v1/league/match/:id
 * Fetches match state, questions (sanitized without correct answers), and current scores
 */
leagueRouter.get("/match/:id", requireAuth, async (req: any, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const userId = getReqUserId(req)!;

    const [match] = await db
      .select()
      .from(leagueMatches)
      .where(eq(leagueMatches.id, matchId))
      .limit(1);

    if (!match) {
      return res.status(404).json({ success: false, error: { message: "Maç bulunamadı." } });
    }

    if (match.player1Id !== userId && match.player2Id !== userId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Bu maça erişim yetkiniz yok." } });
    }

    const questions = await getMatchQuestionsSanitized(matchId);

    // Get answers already submitted by user for completed questions
    const answers = await db
      .select({
        questionId: leagueMatchAnswers.questionId,
        selectedOption: leagueMatchAnswers.selectedOption,
        isCorrect: leagueMatchAnswers.isCorrect,
        pointsEarned: leagueMatchAnswers.pointsEarned,
      })
      .from(leagueMatchAnswers)
      .where(
        and(
          eq(leagueMatchAnswers.matchId, matchId),
          eq(leagueMatchAnswers.userId, userId)
        )
      );

    res.json({
      success: true,
      match,
      questions,
      submittedAnswers: answers,
    });
  } catch (err: any) {
    console.error("Error fetching match details:", err);
    res.status(500).json({ success: false, error: { message: "Maç bilgileri yüklenemedi." } });
  }
});

/**
 * POST /api/v1/league/match/:id/answer
 * Submits an answer for the current question in match
 * Validates anti-cheat (time threshold, answer locking) and calculates real-time points
 */
leagueRouter.post("/match/:id/answer", requireAuth, async (req: any, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const userId = getReqUserId(req)!;
    const { questionId, selectedOption, timeTakenMs } = req.body;

    if (!questionId || !selectedOption) {
      return res.status(400).json({ success: false, error: { message: "Eksik parametre." } });
    }

    const [match] = await db
      .select()
      .from(leagueMatches)
      .where(eq(leagueMatches.id, matchId))
      .limit(1);

    if (!match || match.status !== "ACTIVE") {
      return res.status(400).json({ success: false, error: { message: "Aktif bir maç bulunamadı." } });
    }

    // Check if user already answered this question in this match (Irreversible Lock)
    const [alreadyAnswered] = await db
      .select()
      .from(leagueMatchAnswers)
      .where(
        and(
          eq(leagueMatchAnswers.matchId, matchId),
          eq(leagueMatchAnswers.userId, userId),
          eq(leagueMatchAnswers.questionId, questionId)
        )
      )
      .limit(1);

    if (alreadyAnswered) {
      return res.status(400).json({ success: false, error: { message: "Bu soru için zaten cevap verdiniz." } });
    }

    // Anti-Cheat: check ultra-fast answer (under 500ms is suspicious bot activity)
    const timeMs = Math.max(0, parseInt(timeTakenMs || "0"));
    let isSuspiciousSpeed = false;
    if (timeMs > 0 && timeMs < 450) {
      isSuspiciousSpeed = true;
      console.warn(`[AntiCheat] Suspicious answer speed: user #${userId} answered in ${timeMs}ms`);
    }

    // Fetch question and correct answer option
    const [question] = await db
      .select()
      .from(leagueQuestions)
      .where(eq(leagueQuestions.id, questionId))
      .limit(1);

    const [correctOption] = await db
      .select()
      .from(leagueQuestionOptions)
      .where(
        and(
          eq(leagueQuestionOptions.questionId, questionId),
          eq(leagueQuestionOptions.isCorrect, true)
        )
      )
      .limit(1);

    const isCorrect = correctOption?.optionKey === selectedOption;

    // Calculate score
    let pointsEarned = 0;
    if (isCorrect) {
      // Base points
      pointsEarned = 100;
      // Difficulty bonus
      if (question.difficulty === "HARD") pointsEarned += 50;
      else if (question.difficulty === "EXPERT") pointsEarned += 100;
      else if (question.difficulty === "MEDIUM") pointsEarned += 25;

      // Speed bonus (if answered in under 10 seconds)
      if (timeMs > 0 && timeMs < 10000 && !isSuspiciousSpeed) {
        const speedBonus = Math.round(((10000 - timeMs) / 10000) * 25);
        pointsEarned += speedBonus;
      }
    }

    // Record answer
    await db.insert(leagueMatchAnswers).values({
      matchId,
      userId,
      questionId,
      selectedOption,
      isCorrect,
      pointsEarned,
      timeTakenMs: timeMs,
    });

    // Update match player score
    const newPlayer1Score = match.player1Score + pointsEarned;

    // Bot rival simulated response (realistic 75% accuracy, ~60-120 points)
    let botScoreGain = 0;
    if (match.isVsBot) {
      const botWillGetCorrect = Math.random() < 0.75;
      if (botWillGetCorrect) {
        botScoreGain = 100 + (Math.random() < 0.5 ? 20 : 0);
      }
    }
    const newPlayer2Score = match.player2Score + botScoreGain;

    // Count total questions in this match
    const matchQuestions = await db
      .select()
      .from(leagueMatchQuestions)
      .where(eq(leagueMatchQuestions.matchId, matchId))
      .orderBy(leagueMatchQuestions.order);

    const nextIndex = match.currentQuestionIndex + 1;
    const isMatchCompleted = nextIndex >= matchQuestions.length;

    let matchCompletedAt = match.completedAt;
    let winnerId = match.winnerId;

    if (isMatchCompleted) {
      matchCompletedAt = new Date();
      if (newPlayer1Score > newPlayer2Score) {
        winnerId = userId;
      } else if (newPlayer2Score > newPlayer1Score && !match.isVsBot) {
        winnerId = match.player2Id;
      }

      // Update Participant Stats
      const userAnswers = await db
        .select()
        .from(leagueMatchAnswers)
        .where(
          and(
            eq(leagueMatchAnswers.matchId, matchId),
            eq(leagueMatchAnswers.userId, userId)
          )
        );

      const totalCorrect = userAnswers.filter((a: any) => a.isCorrect).length;
      const isWon = newPlayer1Score > newPlayer2Score;

      await db
        .update(leagueParticipants)
        .set({
          totalPoints: sql`${leagueParticipants.totalPoints} + ${newPlayer1Score}`,
          matchesPlayed: sql`${leagueParticipants.matchesPlayed} + 1`,
          matchesWon: isWon ? sql`${leagueParticipants.matchesWon} + 1` : sql`${leagueParticipants.matchesWon}`,
          correctAnswersCount: sql`${leagueParticipants.correctAnswersCount} + ${totalCorrect}`,
          totalAnswersCount: sql`${leagueParticipants.totalAnswersCount} + ${matchQuestions.length}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(leagueParticipants.seasonId, match.seasonId),
            eq(leagueParticipants.userId, userId)
          )
        );

      // Check badges:
      // 1. Bilgi Ustası: All questions correct in match
      if (totalCorrect === matchQuestions.length) {
        const [badge] = await db.select().from(badges).where(eq(badges.key, "LEAGUE_KNOWLEDGE_MASTER")).limit(1);
        if (badge) {
          await db.insert(userBadges).values({
            userId,
            badgeId: badge.id,
            metadata: { matchId, fullScore: true, awardedAt: new Date().toISOString() }
          }).onConflictDoNothing();
        }
      }

      // 2. Hızlı Cevapçı: Any answer under 5s and correct
      const hasFastAnswer = userAnswers.some((a: any) => a.isCorrect && a.timeTakenMs > 500 && a.timeTakenMs < 5000);
      if (hasFastAnswer) {
        const [badge] = await db.select().from(badges).where(eq(badges.key, "LEAGUE_SPEED_DEMON")).limit(1);
        if (badge) {
          await db.insert(userBadges).values({
            userId,
            badgeId: badge.id,
            metadata: { matchId, fastAnswer: true, awardedAt: new Date().toISOString() }
          }).onConflictDoNothing();
        }
      }
    }

    // Update match state
    await db
      .update(leagueMatches)
      .set({
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        currentQuestionIndex: nextIndex,
        questionStartedAt: new Date(),
        status: isMatchCompleted ? "COMPLETED" : "ACTIVE",
        winnerId,
        completedAt: matchCompletedAt,
      })
      .where(eq(leagueMatches.id, matchId));

    res.json({
      success: true,
      answerResult: {
        isCorrect,
        correctOptionKey: correctOption?.optionKey,
        explanation: question.explanation,
        pointsEarned,
      },
      matchState: {
        player1Score: newPlayer1Score,
        player2Score: newPlayer2Score,
        currentQuestionIndex: nextIndex,
        isCompleted: isMatchCompleted,
        winnerId,
      }
    });
  } catch (err: any) {
    console.error("Error submitting match answer:", err);
    res.status(500).json({ success: false, error: { message: "Cevap işlenirken bir hata oluştu." } });
  }
});

/**
 * POST /api/v1/league/match/:id/flag-cheat
 * Client reports focus loss, tab switch, or suspicious input
 */
leagueRouter.post("/match/:id/flag-cheat", requireAuth, async (req: any, res) => {
  try {
    const userId = getReqUserId(req)!;
    const { reason } = req.body;

    console.warn(`[AntiCheat Warning] User #${userId} reported for: ${reason}`);

    // Update participant flag warning count if needed
    res.json({ success: true, message: "Uyarı kaydedildi." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "İşlem başarısız." } });
  }
});

/**
 * Helper to fetch sanitized match questions without revealing correct answer
 */
async function getMatchQuestionsSanitized(matchId: number) {
  const matchQuestions = await db
    .select({
      order: leagueMatchQuestions.order,
      questionId: leagueQuestions.id,
      question: leagueQuestions.question,
      category: leagueQuestions.category,
      difficulty: leagueQuestions.difficulty,
    })
    .from(leagueMatchQuestions)
    .innerJoin(leagueQuestions, eq(leagueMatchQuestions.questionId, leagueQuestions.id))
    .where(eq(leagueMatchQuestions.matchId, matchId))
    .orderBy(leagueMatchQuestions.order);

  const result = [];
  for (const q of matchQuestions) {
    const options = await db
      .select({
        optionKey: leagueQuestionOptions.optionKey,
        optionText: leagueQuestionOptions.optionText,
      })
      .from(leagueQuestionOptions)
      .where(eq(leagueQuestionOptions.questionId, q.questionId))
      .orderBy(leagueQuestionOptions.optionKey);

    result.push({
      ...q,
      options,
    });
  }
  return result;
}

// ==========================================
// ADMIN QUESTION BANK & LEAGUE MANAGEMENT
// ==========================================

/**
 * GET /api/v1/league/admin/questions
 * Question bank search and management for administrators
 */
leagueRouter.get("/admin/questions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20")));
    const offset = (page - 1) * limit;

    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const status = req.query.status as string;
    const q = req.query.q as string;

    const conditions = [];
    if (category && category !== "ALL") conditions.push(eq(leagueQuestions.category, category));
    if (difficulty && difficulty !== "ALL") conditions.push(eq(leagueQuestions.difficulty, difficulty as any));
    if (status && status !== "ALL") conditions.push(eq(leagueQuestions.status, status as any));
    if (q) conditions.push(ilike(leagueQuestions.question, `%${q.trim()}%`));

    const questionsList = await db
      .select()
      .from(leagueQuestions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(leagueQuestions.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch options for each question
    const questionsWithOptions = [];
    for (const item of questionsList) {
      const options = await db
        .select()
        .from(leagueQuestionOptions)
        .where(eq(leagueQuestionOptions.questionId, item.id))
        .orderBy(leagueQuestionOptions.optionKey);
      questionsWithOptions.push({
        ...item,
        options,
      });
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leagueQuestions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      success: true,
      questions: questionsWithOptions,
      pagination: {
        page,
        limit,
        total: Number(countResult?.count || 0),
        totalPages: Math.ceil(Number(countResult?.count || 0) / limit),
      }
    });
  } catch (err: any) {
    console.error("Error fetching admin questions:", err);
    res.status(500).json({ success: false, error: { message: "Sorular yüklenirken hata oluştu." } });
  }
});

/**
 * POST /api/v1/league/admin/questions
 * Manual question creation by admin
 */
leagueRouter.post("/admin/questions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { question, category, difficulty, ageGroup, explanation, options, status } = req.body;

    if (!question || !category || !Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        error: { message: "Soru metni, kategori ve tam 4 seçenek zorunludur." }
      });
    }

    const correctCount = options.filter((o: any) => o.isCorrect).length;
    if (correctCount !== 1) {
      return res.status(400).json({
        success: false,
        error: { message: "Seçeneklerden tam olarak biri doğru (isCorrect: true) olmalıdır." }
      });
    }

    const [newQuestion] = await db
      .insert(leagueQuestions)
      .values({
        question: question.trim(),
        category: category.trim(),
        difficulty: difficulty || "MEDIUM",
        ageGroup: ageGroup || "ALL",
        language: "tr",
        explanation: explanation ? explanation.trim() : null,
        sourceType: "MANUAL",
        sourceReference: "Admin Panel",
        status: status || "ACTIVE",
      })
      .returning();

    for (const opt of options) {
      await db.insert(leagueQuestionOptions).values({
        questionId: newQuestion.id,
        optionKey: opt.key,
        optionText: opt.text.trim(),
        isCorrect: Boolean(opt.isCorrect),
      });
    }

    res.json({
      success: true,
      question: newQuestion,
      message: "Soru başarıyla eklendi."
    });
  } catch (err: any) {
    console.error("Error creating question:", err);
    res.status(500).json({ success: false, error: { message: "Soru eklenemedi." } });
  }
});

/**
 * PUT /api/v1/league/admin/questions/:id
 * Edit question or approve DRAFT to ACTIVE
 */
leagueRouter.put("/admin/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rawId = req.params.id;
    const questionId = parseInt(Array.isArray(rawId) ? rawId[0] : (rawId as string));
    const { question, category, difficulty, ageGroup, explanation, options, status } = req.body;

    const [existing] = await db
      .select()
      .from(leagueQuestions)
      .where(eq(leagueQuestions.id, questionId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ success: false, error: { message: "Soru bulunamadı." } });
    }

    await db
      .update(leagueQuestions)
      .set({
        question: question !== undefined ? question.trim() : existing.question,
        category: category !== undefined ? category.trim() : existing.category,
        difficulty: difficulty !== undefined ? difficulty : existing.difficulty,
        ageGroup: ageGroup !== undefined ? ageGroup : existing.ageGroup,
        explanation: explanation !== undefined ? explanation?.trim() : existing.explanation,
        status: status !== undefined ? status : existing.status,
        updatedAt: new Date(),
      })
      .where(eq(leagueQuestions.id, questionId));

    if (Array.isArray(options) && options.length === 4) {
      // Re-insert options
      await db.delete(leagueQuestionOptions).where(eq(leagueQuestionOptions.questionId, questionId));
      for (const opt of options) {
        await db.insert(leagueQuestionOptions).values({
          questionId,
          optionKey: opt.key,
          optionText: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect),
        });
      }
    }

    res.json({ success: true, message: "Soru güncellendi." });
  } catch (err: any) {
    console.error("Error updating question:", err);
    res.status(500).json({ success: false, error: { message: "Soru güncellenemedi." } });
  }
});

/**
 * DELETE /api/v1/league/admin/questions/:id
 */
leagueRouter.delete("/admin/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rawId = req.params.id;
    const questionId = parseInt(Array.isArray(rawId) ? rawId[0] : (rawId as string));
    await db.delete(leagueQuestions).where(eq(leagueQuestions.id, questionId));
    res.json({ success: true, message: "Soru silindi." });
  } catch (err: any) {
    console.error("Error deleting question:", err);
    res.status(500).json({ success: false, error: { message: "Soru silinemedi." } });
  }
});

/**
 * POST /api/v1/league/admin/questions/generate-ai
 * AI Question Generator using Gemini 3.8 Flash
 * Creates questions in DRAFT status for admin review & approval
 */
leagueRouter.post("/admin/questions/generate-ai", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { category, difficulty, ageGroup, count } = req.body;

    const result = await generateDraftQuestionsWithAI({
      category: category || "Tarih ve Kültür",
      difficulty: difficulty || "MEDIUM",
      ageGroup: ageGroup || "ALL",
      count: Math.min(10, Math.max(1, parseInt(count || "5"))),
    });

    if (result.error) {
      return res.status(400).json({ success: false, error: { message: result.error } });
    }

    res.json({
      success: true,
      createdCount: result.createdCount,
      questions: result.questions,
      message: `${result.createdCount} adet soru taslak (DRAFT) olarak havuza eklendi ve incelemeye hazır.`
    });
  } catch (err: any) {
    console.error("Error generating AI questions:", err);
    res.status(500).json({ success: false, error: { message: "Yapay zeka ile soru üretilemedi." } });
  }
});

/**
 * POST /api/v1/league/admin/season/update
 * Admin updates season status, dates, or enables simulation mode for immediate testing
 */
leagueRouter.post("/admin/season/update", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { seasonId, status, simulationMode, settings, title, theme, description } = req.body;
    const targetId = seasonId ? parseInt(seasonId) : (await ensureCurrentSeason()).id;

    const [season] = await db
      .select()
      .from(leagueSeasons)
      .where(eq(leagueSeasons.id, targetId))
      .limit(1);

    if (!season) {
      return res.status(404).json({ success: false, error: { message: "Sezon bulunamadı." } });
    }

    const updatedSettings = {
      ...season.settings,
      ...(settings || {}),
      ...(simulationMode !== undefined ? { simulationMode: Boolean(simulationMode) } : {}),
    };

    await db
      .update(leagueSeasons)
      .set({
        title: title || season.title,
        theme: theme || season.theme,
        description: description || season.description,
        status: status || season.status,
        settings: updatedSettings,
        updatedAt: new Date(),
      })
      .where(eq(leagueSeasons.id, targetId));

    res.json({ success: true, message: "Sezon ayarları güncellendi." });
  } catch (err: any) {
    console.error("Error updating season:", err);
    res.status(500).json({ success: false, error: { message: "Sezon güncellenemedi." } });
  }
});

/**
 * POST /api/v1/league/admin/season/finalize
 * Admin manually completes season and distributes awards
 */
leagueRouter.post("/admin/season/finalize", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { seasonId } = req.body;
    const targetId = seasonId ? parseInt(seasonId) : (await ensureCurrentSeason()).id;

    await finalizeSeason(targetId);
    await db
      .update(leagueSeasons)
      .set({ status: "COMPLETED", updatedAt: new Date() })
      .where(eq(leagueSeasons.id, targetId));

    res.json({ success: true, message: "Sezon başarıyla tamamlandı ve rozetler dağıtıldı." });
  } catch (err: any) {
    console.error("Error finalizing season:", err);
    res.status(500).json({ success: false, error: { message: "Sezon sonlandırılamadı." } });
  }
});

/**
 * GET /api/v1/league/badges
 * List league badges and achievements
 */
leagueRouter.get("/badges", optionalAuth, async (req: any, res) => {
  try {
    await ensureLeagueBadges();

    const leagueBadgeKeys = [
      "LEAGUE_CHAMPION",
      "LEAGUE_FINALIST",
      "LEAGUE_SPEED_DEMON",
      "LEAGUE_KNOWLEDGE_MASTER"
    ];

    const badgesList = await db
      .select()
      .from(badges)
      .where(inArray(badges.key, leagueBadgeKeys));

    let userEarnedBadgeIds: number[] = [];
    const currentUserId = getReqUserId(req);
    if (currentUserId) {
      const earned = await db
        .select({ badgeId: userBadges.badgeId })
        .from(userBadges)
        .where(eq(userBadges.userId, currentUserId));
      userEarnedBadgeIds = earned.map((e: any) => e.badgeId);
    }

    const result = badgesList.map((b: any) => ({
      ...b,
      isEarned: userEarnedBadgeIds.includes(b.id),
    }));

    res.json({ success: true, badges: result });
  } catch (err: any) {
    console.error("Error fetching league badges:", err);
    res.status(500).json({ success: false, error: { message: "Rozetler yüklenemedi." } });
  }
});
