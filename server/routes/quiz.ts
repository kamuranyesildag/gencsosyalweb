import { Router } from "express";
import { db } from "../../src/db/index.js";
import { 
  quizRooms, 
  quizRoomPlayers, 
  quizRoomQuestions, 
  quizAnswers, 
  quizResults, 
  quizQuestionSets,
  quizQuestionSetItems,
  quizInvites,
  users, 
  profiles,
  notifications,
  blocks
} from "../../src/db/schema.js";
import { eq, and, desc, sql, inArray, or, ilike } from "drizzle-orm";
import { requireAuth, optionalAuth, getUserId } from "../middleware/auth.js";
import { 
  generateUniqueRoomCode, 
  prepareRoomQuestions, 
  activeRoomsByCode, 
  activeRoomsById, 
  checkCodeRateLimit,
  ActiveRoom
} from "../services/quizEngine.js";

export const quizRouter = Router();

/**
 * POST /api/v1/quiz/rooms
 * Create a new quiz room
 */
quizRouter.post("/rooms", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const {
      title,
      category = "Karışık",
      difficulty = "Karışık",
      questionCount = 10,
      timePerQuestion = 20,
      roomType = "PUBLIC",
      sourceType = "SYSTEM",
      questionSetId,
      maxPlayers = 30,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: { message: "Quiz oda başlığı zorunludur." } });
    }

    const qCount = Math.min(25, Math.max(5, parseInt(questionCount) || 10));
    const tPerQ = Math.min(60, Math.max(10, parseInt(timePerQuestion) || 20));
    const mPlayers = Math.min(100, Math.max(2, parseInt(maxPlayers) || 30));

    const code = await generateUniqueRoomCode();

    // Prepare questions
    const selectedQuestions = await prepareRoomQuestions({
      count: qCount,
      category,
      difficulty,
      sourceType,
      questionSetId: questionSetId ? parseInt(questionSetId) : null,
    });

    if (selectedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Seçilen kategori veya zorlukta yeterli soru bulunamadı. Lütfen 'Karışık' seçeneğini deneyiniz." }
      });
    }

    // Insert room into DB
    const [newRoom] = await db
      .insert(quizRooms)
      .values({
        code,
        title: title.trim(),
        hostId: userId,
        category,
        difficulty,
        questionCount: selectedQuestions.length,
        timePerQuestion: tPerQ,
        roomType,
        sourceType,
        questionSetId: questionSetId ? parseInt(questionSetId) : null,
        maxPlayers: mPlayers,
        status: "LOBBY",
        currentQuestionIndex: 0,
      })
      .returning();

    // Insert room questions snapshot
    for (const q of selectedQuestions) {
      const [insertedQ] = await db.insert(quizRoomQuestions).values({
        roomId: newRoom.id,
        questionId: q.id,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        explanation: q.explanation,
        options: q.options,
        order: q.order,
      }).returning();
      q.id = insertedQ.id; // Map to room question ID
    }

    // Insert host as first player
    await db.insert(quizRoomPlayers).values({
      roomId: newRoom.id,
      userId,
      isHost: true,
      isConnected: true,
    });

    // Fetch host profile
    const [hostProfile] = await db
      .select({ avatarUrl: profiles.avatarUrl, username: users.username })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, userId))
      .limit(1);

    // Initialize in-memory active room
    const activeRoomObj: ActiveRoom = {
      id: newRoom.id,
      code,
      title: newRoom.title,
      hostId: userId,
      category: newRoom.category,
      difficulty: newRoom.difficulty,
      questionCount: selectedQuestions.length,
      timePerQuestion: tPerQ,
      roomType: newRoom.roomType,
      maxPlayers: mPlayers,
      status: "LOBBY",
      currentQuestionIndex: 0,
      questionStartedAt: null,
      players: new Map(),
      questions: selectedQuestions,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    activeRoomObj.players.set(userId, {
      userId,
      username: hostProfile?.username || "Host",
      avatarUrl: hostProfile?.avatarUrl || null,
      score: 0,
      correctAnswersCount: 0,
      wrongAnswersCount: 0,
      unansweredCount: 0,
      streak: 0,
      maxStreak: 0,
      rank: 1,
      isHost: true,
      isConnected: true,
      hasAnsweredCurrent: false,
    });

    activeRoomsByCode.set(code, activeRoomObj);
    activeRoomsById.set(newRoom.id, activeRoomObj);

    res.json({
      success: true,
      room: newRoom,
      code,
      message: "Quiz odası oluşturuldu! Arkadaşlarını kod ile davet edebilirsin.",
    });
  } catch (err: any) {
    console.error("Error creating quiz room:", err);
    res.status(500).json({ success: false, error: { message: "Quiz odası oluşturulamadı." } });
  }
});

/**
 * GET /api/v1/quiz/rooms/public
 * List open public rooms in lobby
 */
quizRouter.get("/rooms/public", async (req, res) => {
  try {
    const roomsList = [];
    for (const room of activeRoomsByCode.values()) {
      if (room.roomType === "PUBLIC" && room.status === "LOBBY") {
        roomsList.push({
          id: room.id,
          code: room.code,
          title: room.title,
          category: room.category,
          difficulty: room.difficulty,
          questionCount: room.questionCount,
          timePerQuestion: room.timePerQuestion,
          playerCount: room.players.size,
          maxPlayers: room.maxPlayers,
          createdAt: room.createdAt,
        });
      }
    }

    res.json({ success: true, rooms: roomsList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "Açık odalar alınamadı." } });
  }
});

/**
 * GET /api/v1/quiz/rooms/:code
 * Check and verify room code existence
 */
quizRouter.get("/rooms/:code", optionalAuth, async (req: any, res) => {
  try {
    const rawCode = req.params.code;
    const clientIdentifier = req.ip || (req.user?.userId ? `user_${req.user.userId}` : "unknown");

    if (!checkCodeRateLimit(clientIdentifier)) {
      return res.status(429).json({
        success: false,
        error: { message: "Çok fazla kod denemesi yaptınız. Lütfen 1 dakika sonra tekrar deneyiniz." }
      });
    }

    const code = (rawCode || "").toString().trim();
    let room = activeRoomsByCode.get(code);

    if (!room) {
      // Check database
      const [dbRoom] = await db
        .select()
        .from(quizRooms)
        .where(eq(quizRooms.code, code))
        .limit(1);

      if (!dbRoom || dbRoom.status === "CANCELLED" || dbRoom.status === "FINISHED") {
        return res.status(404).json({
          success: false,
          error: { message: "Bu kodla aktif bir quiz odası bulunamadı." }
        });
      }

      // Rehydrate room questions from DB if needed
      const dbQuestions = await db
        .select()
        .from(quizRoomQuestions)
        .where(eq(quizRoomQuestions.roomId, dbRoom.id))
        .orderBy(quizRoomQuestions.order);

      const dbPlayers = await db
        .select({
          userId: quizRoomPlayers.userId,
          score: quizRoomPlayers.score,
          isHost: quizRoomPlayers.isHost,
          username: users.username,
          avatarUrl: profiles.avatarUrl,
        })
        .from(quizRoomPlayers)
        .innerJoin(users, eq(quizRoomPlayers.userId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(quizRoomPlayers.roomId, dbRoom.id));

      const rehydratedRoom: ActiveRoom = {
        id: dbRoom.id,
        code: dbRoom.code,
        title: dbRoom.title,
        hostId: dbRoom.hostId,
        category: dbRoom.category,
        difficulty: dbRoom.difficulty,
        questionCount: dbRoom.questionCount,
        timePerQuestion: dbRoom.timePerQuestion,
        roomType: dbRoom.roomType,
        maxPlayers: dbRoom.maxPlayers,
        status: dbRoom.status as any,
        currentQuestionIndex: dbRoom.currentQuestionIndex,
        questionStartedAt: dbRoom.questionStartedAt ? dbRoom.questionStartedAt.getTime() : null,
        players: new Map(),
        questions: dbQuestions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          category: q.category,
          difficulty: q.difficulty,
          explanation: q.explanation,
          order: q.order,
          options: (q.options as any) || [],
        })),
        createdAt: dbRoom.createdAt.getTime(),
        lastActiveAt: Date.now(),
      };

      for (const p of dbPlayers) {
        rehydratedRoom.players.set(p.userId, {
          userId: p.userId,
          username: p.username,
          avatarUrl: p.avatarUrl,
          score: p.score,
          correctAnswersCount: 0,
          wrongAnswersCount: 0,
          unansweredCount: 0,
          streak: 0,
          maxStreak: 0,
          rank: 1,
          isHost: p.isHost,
          isConnected: false,
          hasAnsweredCurrent: false,
        });
      }

      activeRoomsByCode.set(code, rehydratedRoom);
      activeRoomsById.set(dbRoom.id, rehydratedRoom);
      room = rehydratedRoom;
    }

    res.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        title: room.title,
        hostId: room.hostId,
        category: room.category,
        difficulty: room.difficulty,
        questionCount: room.questionCount,
        timePerQuestion: room.timePerQuestion,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        status: room.status,
      }
    });
  } catch (err: any) {
    console.error("Error fetching room info:", err);
    res.status(500).json({ success: false, error: { message: "Oda bilgileri alınamadı." } });
  }
});

/**
 * GET /api/v1/quiz/history
 * List current user's past quiz participations
 */
quizRouter.get("/history", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const historyList = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.playedAt))
      .limit(50);

    res.json({ success: true, history: historyList });
  } catch (err: any) {
    console.error("Error fetching quiz history:", err);
    res.status(500).json({ success: false, error: { message: "Geçmiş quizler yüklenemedi." } });
  }
});

/**
 * GET /api/v1/quiz/stats
 * Current user's quiz summary statistics
 */
quizRouter.get("/stats", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const userResults = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    const totalQuizes = userResults.length;
    const wins = userResults.filter((r: any) => r.rank === 1).length;
    const totalScore = userResults.reduce((sum: number, r: any) => sum + r.score, 0);
    const totalCorrect = userResults.reduce((sum: number, r: any) => sum + r.correctCount, 0);
    const totalQuestions = userResults.reduce((sum: number, r: any) => sum + r.totalQuestions, 0);
    const highestScore = userResults.reduce((max: number, r: any) => Math.max(max, r.score), 0);

    const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalQuizes,
        wins,
        totalScore,
        highestScore,
        accuracyRate,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "İstatistikler alınamadı." } });
  }
});

/**
 * GET /api/v1/quiz/user/:username/stats
 * Public profile quiz stats
 */
quizRouter.get("/user/:username/stats", async (req, res) => {
  try {
    const username = req.params.username;
    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!targetUser) {
      return res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
    }

    const userResults = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, targetUser.id));

    const totalQuizes = userResults.length;
    const wins = userResults.filter((r: any) => r.rank === 1).length;
    const totalScore = userResults.reduce((sum: number, r: any) => sum + r.score, 0);
    const totalCorrect = userResults.reduce((sum: number, r: any) => sum + r.correctCount, 0);
    const totalQuestions = userResults.reduce((sum: number, r: any) => sum + r.totalQuestions, 0);
    const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalQuizes,
        wins,
        totalScore,
        accuracyRate,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "Kullanıcı istatistikleri alınamadı." } });
  }
});

/**
 * GET /api/v1/quiz/leaderboard
 * Global Genç Quiz Leaderboard (Privacy-safe: platform username, points, quizes played, wins)
 */
quizRouter.get("/leaderboard", async (req, res) => {
  try {
    const topPlayers = await db
      .select({
        userId: quizResults.userId,
        username: users.username,
        avatarUrl: profiles.avatarUrl,
        totalScore: sql<number>`sum(${quizResults.score})`.as("total_score"),
        totalQuizes: sql<number>`count(${quizResults.id})`.as("total_quizes"),
        wins: sql<number>`sum(case when ${quizResults.rank} = 1 then 1 else 0 end)`.as("wins"),
      })
      .from(quizResults)
      .innerJoin(users, eq(quizResults.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .groupBy(quizResults.userId, users.username, profiles.avatarUrl)
      .orderBy(desc(sql`sum(${quizResults.score})`), desc(sql`sum(case when ${quizResults.rank} = 1 then 1 else 0 end)`))
      .limit(50);

    const ranked = topPlayers.map((p: any, idx: number) => ({
      ...p,
      rank: idx + 1,
      totalScore: Number(p.totalScore || 0),
      totalQuizes: Number(p.totalQuizes || 0),
      wins: Number(p.wins || 0),
    }));

    res.json({ success: true, leaderboard: ranked });
  } catch (err: any) {
    console.error("Error fetching quiz leaderboard:", err);
    res.status(500).json({ success: false, error: { message: "Liderlik tablosu yüklenemedi." } });
  }
});

// ==========================================
// USER QUESTION SETS (Soru Setlerim)
// ==========================================

/**
 * GET /api/v1/quiz/sets
 * List question sets owned by user
 */
quizRouter.get("/sets", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const sets = await db
      .select()
      .from(quizQuestionSets)
      .where(eq(quizQuestionSets.userId, userId))
      .orderBy(desc(quizQuestionSets.createdAt));

    res.json({ success: true, sets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "Soru setleri yüklenemedi." } });
  }
});

/**
 * POST /api/v1/quiz/sets
 * Create a new question set
 */
quizRouter.post("/sets", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const { title, description, category = "Genel Kültür", difficulty = "Orta", isPublic = false, questions = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: { message: "Set başlığı gereklidir." } });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, error: { message: "En az bir soru eklemelisiniz." } });
    }

    const [newSet] = await db
      .insert(quizQuestionSets)
      .values({
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        category,
        difficulty,
        isPublic: Boolean(isPublic),
        questionCount: questions.length,
      })
      .returning();

    // Insert items
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await db.insert(quizQuestionSetItems).values({
        setId: newSet.id,
        question: q.question.trim(),
        explanation: q.explanation?.trim() || null,
        order: i + 1,
        options: q.options,
      });
    }

    res.json({ success: true, set: newSet, message: "Soru seti başarıyla kaydedildi!" });
  } catch (err: any) {
    console.error("Error creating question set:", err);
    res.status(500).json({ success: false, error: { message: "Soru seti oluşturulamadı." } });
  }
});

/**
 * GET /api/v1/quiz/sets/:id
 * Get question set with its questions
 */
quizRouter.get("/sets/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const setId = parseInt(req.params.id);

    const [qSet] = await db
      .select()
      .from(quizQuestionSets)
      .where(eq(quizQuestionSets.id, setId))
      .limit(1);

    if (!qSet) {
      return res.status(404).json({ success: false, error: { message: "Soru seti bulunamadı." } });
    }

    if (qSet.userId !== userId && !qSet.isPublic && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: { message: "Bu soru setine erişim izniniz yok." } });
    }

    const items = await db
      .select()
      .from(quizQuestionSetItems)
      .where(eq(quizQuestionSetItems.setId, setId))
      .orderBy(quizQuestionSetItems.order);

    res.json({ success: true, set: qSet, items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "Soru seti yüklenemedi." } });
  }
});

/**
 * DELETE /api/v1/quiz/sets/:id
 */
quizRouter.delete("/sets/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const setId = parseInt(req.params.id);

    const [qSet] = await db
      .select()
      .from(quizQuestionSets)
      .where(eq(quizQuestionSets.id, setId))
      .limit(1);

    if (!qSet || (qSet.userId !== userId && req.user?.role !== "ADMIN")) {
      return res.status(403).json({ success: false, error: { message: "Yetkisiz işlem." } });
    }

    await db.delete(quizQuestionSets).where(eq(quizQuestionSets.id, setId));
    res.json({ success: true, message: "Soru seti silindi." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "Soru seti silinemedi." } });
  }
});

// ==========================================
// QUIZ INVITATIONS
// ==========================================

/**
 * POST /api/v1/quiz/rooms/:code/invite
 * Send room invite to a friend
 */
quizRouter.post("/rooms/:code/invite", requireAuth, async (req: any, res) => {
  try {
    const senderId = getUserId(req);
    const { receiverUsername } = req.body;
    const code = req.params.code;

    if (!receiverUsername) {
      return res.status(400).json({ success: false, error: { message: "Kullanıcı adı gereklidir." } });
    }

    const room = activeRoomsByCode.get(code);
    if (!room) {
      return res.status(404).json({ success: false, error: { message: "Aktif quiz odası bulunamadı." } });
    }

    const [receiver] = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.username, receiverUsername.trim()))
      .limit(1);

    if (!receiver) {
      return res.status(404).json({ success: false, error: { message: "Kullanıcı bulunamadı." } });
    }

    if (receiver.id === senderId) {
      return res.status(400).json({ success: false, error: { message: "Kendinize davet gönderemezsiniz." } });
    }

    // Check blocked
    const [isBlocked] = await db
      .select()
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, receiver.id), eq(blocks.blockedId, senderId)),
          and(eq(blocks.blockerId, senderId), eq(blocks.blockedId, receiver.id))
        )
      )
      .limit(1);

    if (isBlocked) {
      return res.status(403).json({ success: false, error: { message: "Bu kullanıcıya davet gönderemezsiniz." } });
    }

    // Create invite record
    await db.insert(quizInvites).values({
      roomId: room.id,
      senderId,
      receiverId: receiver.id,
      status: "PENDING",
    }).onConflictDoNothing();

    // Create system notification
    const [senderProfile] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, senderId))
      .limit(1);

    await db.insert(notifications).values({
      recipientId: receiver.id,
      actorId: senderId,
      type: "QUIZ_INVITE",
      content: `@${senderProfile?.username || 'Bir arkadaşın'} seni "${room.title}" Genç Quiz odasına davet etti! (Oda Kodu: ${room.code})`,
    });

    res.json({ success: true, message: `@${receiver.username} kullanıcısına davet gönderildi!` });
  } catch (err: any) {
    console.error("Error sending quiz invite:", err);
    res.status(500).json({ success: false, error: { message: "Davet gönderilemedi." } });
  }
});

/**
 * GET /api/v1/quiz/invites
 * Get pending invites for current user
 */
quizRouter.get("/invites", requireAuth, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    const invites = await db
      .select({
        id: quizInvites.id,
        roomId: quizInvites.roomId,
        status: quizInvites.status,
        createdAt: quizInvites.createdAt,
        senderUsername: users.username,
        senderAvatar: profiles.avatarUrl,
        roomCode: quizRooms.code,
        roomTitle: quizRooms.title,
        roomStatus: quizRooms.status,
      })
      .from(quizInvites)
      .innerJoin(users, eq(quizInvites.senderId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .innerJoin(quizRooms, eq(quizInvites.roomId, quizRooms.id))
      .where(and(eq(quizInvites.receiverId, userId), eq(quizInvites.status, "PENDING")))
      .orderBy(desc(quizInvites.createdAt))
      .limit(20);

    res.json({ success: true, invites });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: "Davetler yüklenemedi." } });
  }
});
