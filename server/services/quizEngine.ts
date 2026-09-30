import { WebSocket } from "ws";
import { db } from "../../src/db/index.js";
import { 
  quizRooms, 
  quizRoomPlayers, 
  quizRoomQuestions, 
  quizAnswers, 
  quizResults, 
  quizQuestionSets,
  quizQuestionSetItems,
  leagueQuestions, 
  leagueQuestionOptions,
  users, 
  profiles,
  notifications
} from "../../src/db/schema.js";
import { eq, and, desc, sql, inArray, or, notInArray } from "drizzle-orm";

export interface ConnectedPlayer {
  userId: number;
  username: string;
  avatarUrl: string | null;
  ws?: WebSocket | null;
  score: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  unansweredCount: number;
  streak: number;
  maxStreak: number;
  rank: number;
  isHost: boolean;
  isConnected: boolean;
  hasAnsweredCurrent: boolean;
  lastActiveAt?: number;
}

export interface ActiveRoomQuestion {
  id: number; // quiz_room_questions.id
  questionText: string;
  category: string;
  difficulty: string;
  explanation: string | null;
  order: number;
  options: {
    key: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface ActiveRoom {
  id: number;
  code: string;
  title: string;
  hostId: number;
  category: string;
  difficulty: string;
  questionCount: number;
  timePerQuestion: number;
  roomType: string;
  maxPlayers: number;
  status: "LOBBY" | "PLAYING" | "QUESTION_ACTIVE" | "QUESTION_RESULT" | "FINISHED" | "CANCELLED";
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  questionTimer?: NodeJS.Timeout | null;
  players: Map<number, ConnectedPlayer>;
  questions: ActiveRoomQuestion[];
  createdAt: number;
  lastActiveAt: number;
}

// In-memory active rooms registry
export const activeRoomsByCode = new Map<string, ActiveRoom>();
export const activeRoomsById = new Map<number, ActiveRoom>();

// Rate limiter for room code attempts (brute-force protection)
const roomCodeAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkCodeRateLimit(ipOrUserId: string): boolean {
  const now = Date.now();
  const entry = roomCodeAttempts.get(ipOrUserId);
  if (!entry || now > entry.resetAt) {
    roomCodeAttempts.set(ipOrUserId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 20) {
    return false; // Rate limit exceeded (20 attempts per minute)
  }
  entry.count++;
  return true;
}

/**
 * Generates an easy-to-read, unique 6-digit room code (e.g. "482731")
 */
export async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 15; attempt++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (!activeRoomsByCode.has(code)) {
      // Also check DB for unclosed rooms
      const [existing] = await db
        .select({ id: quizRooms.id })
        .from(quizRooms)
        .where(and(eq(quizRooms.code, code), inArray(quizRooms.status, ["LOBBY", "PLAYING", "QUESTION_ACTIVE", "QUESTION_RESULT"])))
        .limit(1);

      if (!existing) {
        return code;
      }
    }
  }
  // Fallback random alphanumeric
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Loads questions for room from central bank (leagueQuestions) or user's question set
 */
export async function prepareRoomQuestions({
  count = 10,
  category = "Karışık",
  difficulty = "Karışık",
  sourceType = "SYSTEM",
  questionSetId,
}: {
  count?: number;
  category?: string;
  difficulty?: string;
  sourceType?: string;
  questionSetId?: number | null;
}): Promise<ActiveRoomQuestion[]> {
  const questions: ActiveRoomQuestion[] = [];

  // Case 1: Custom question set
  if (sourceType === "QUESTION_SET" && questionSetId) {
    const setItems = await db
      .select()
      .from(quizQuestionSetItems)
      .where(eq(quizQuestionSetItems.setId, questionSetId))
      .orderBy(quizQuestionSetItems.order)
      .limit(count);

    let idx = 1;
    for (const item of setItems) {
      questions.push({
        id: item.id,
        questionText: item.question,
        category: category || "Özel Soru Seti",
        difficulty: difficulty || "Orta",
        explanation: item.explanation,
        order: idx++,
        options: (item.options as any) || [],
      });
    }
    if (questions.length >= count) {
      return questions;
    }
  }

  // Case 2: System question bank
  const conditions = [eq(leagueQuestions.status, "ACTIVE")];
  if (category && category !== "Karışık" && category !== "ALL") {
    conditions.push(eq(leagueQuestions.category, category));
  }
  if (difficulty && difficulty !== "Karışık" && difficulty !== "ALL") {
    conditions.push(eq(leagueQuestions.difficulty, difficulty));
  }

  let dbQuestions = await db
    .select()
    .from(leagueQuestions)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(count);

  // If not enough questions with strict filter, fallback to any active questions
  if (dbQuestions.length < count) {
    const needed = count - dbQuestions.length;
    const existingIds = dbQuestions.map((q: any) => q.id);
    const fallbackConditions = [eq(leagueQuestions.status, "ACTIVE")];
    if (existingIds.length > 0) {
      fallbackConditions.push(notInArray(leagueQuestions.id, existingIds));
    }
    const extraQuestions = await db
      .select()
      .from(leagueQuestions)
      .where(and(...fallbackConditions))
      .orderBy(sql`RANDOM()`)
      .limit(needed);
    dbQuestions = [...dbQuestions, ...extraQuestions];
  }

  let orderCounter = questions.length + 1;
  for (const q of dbQuestions) {
    const options = await db
      .select({
        optionKey: leagueQuestionOptions.optionKey,
        optionText: leagueQuestionOptions.optionText,
        isCorrect: leagueQuestionOptions.isCorrect,
      })
      .from(leagueQuestionOptions)
      .where(eq(leagueQuestionOptions.questionId, q.id))
      .orderBy(leagueQuestionOptions.optionKey);

    questions.push({
      id: q.id,
      questionText: q.question,
      category: q.category,
      difficulty: q.difficulty,
      explanation: q.explanation,
      order: orderCounter++,
      options: options.map((o: any) => ({
        key: o.optionKey,
        text: o.optionText,
        isCorrect: Boolean(o.isCorrect),
      })),
    });
  }

  return questions.slice(0, count);
}

/**
 * Broadcasts an event to all connected players in room
 */
export function broadcastToRoom(room: ActiveRoom, event: string, payload: any) {
  const message = JSON.stringify({ event, data: payload, timestamp: Date.now() });
  for (const player of room.players.values()) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      try {
        player.ws.send(message);
      } catch (err) {
        console.error(`Error sending message to user #${player.userId}:`, err);
      }
    }
  }
}

/**
 * Sanitizes question for clients so that isCorrect is completely stripped!
 */
export function sanitizeQuestionForClients(q: ActiveRoomQuestion, currentIndex: number, totalCount: number, duration: number) {
  return {
    order: q.order,
    currentIndex,
    totalCount,
    duration,
    category: q.category,
    difficulty: q.difficulty,
    questionText: q.questionText,
    options: q.options.map(opt => ({
      key: opt.key,
      text: opt.text,
    })),
  };
}

/**
 * Sorts and updates player ranks in room
 */
export function updateRoomLeaderboard(room: ActiveRoom) {
  const playersList = Array.from(room.players.values());
  playersList.sort((a, b) => b.score - a.score || b.correctAnswersCount - a.correctAnswersCount);

  playersList.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return playersList.map(p => ({
    userId: p.userId,
    username: p.username,
    avatarUrl: p.avatarUrl,
    score: p.score,
    correctAnswersCount: p.correctAnswersCount,
    wrongAnswersCount: p.wrongAnswersCount,
    streak: p.streak,
    rank: p.rank,
    isHost: p.isHost,
    isConnected: p.isConnected,
    hasAnsweredCurrent: p.hasAnsweredCurrent,
  }));
}

/**
 * Advances room to next question or finishes quiz
 */
export async function advanceRoomQuestion(room: ActiveRoom) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  // Check if there are more questions
  if (room.currentQuestionIndex + 1 < room.questions.length) {
    room.currentQuestionIndex++;
    room.status = "QUESTION_ACTIVE";
    room.questionStartedAt = Date.now();
    room.lastActiveAt = Date.now();

    // Reset current question answered status for players
    for (const p of room.players.values()) {
      p.hasAnsweredCurrent = false;
    }

    const currentQ = room.questions[room.currentQuestionIndex];

    // Update DB
    await db
      .update(quizRooms)
      .set({
        currentQuestionIndex: room.currentQuestionIndex,
        questionStartedAt: new Date(room.questionStartedAt),
        status: "QUESTION_ACTIVE",
        updatedAt: new Date(),
      })
      .where(eq(quizRooms.id, room.id));

    // Broadcast QUESTION_STARTED
    broadcastToRoom(room, "QUESTION_STARTED", {
      question: sanitizeQuestionForClients(currentQ, room.currentQuestionIndex, room.questions.length, room.timePerQuestion),
      currentQuestionIndex: room.currentQuestionIndex,
      totalQuestions: room.questions.length,
      duration: room.timePerQuestion,
      leaderboard: updateRoomLeaderboard(room),
    });

    // Schedule question timeout
    room.questionTimer = setTimeout(() => {
      endRoomQuestion(room).catch(console.error);
    }, room.timePerQuestion * 1000 + 1000); // 1s buffer
  } else {
    // Finish Quiz
    await finishQuizRoom(room);
  }
}

/**
 * Ends active question, reveals correct answer, calculates final points for question, broadcasts result
 */
export async function endRoomQuestion(room: ActiveRoom) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  room.status = "QUESTION_RESULT";
  room.lastActiveAt = Date.now();

  const currentQ = room.questions[room.currentQuestionIndex];
  const correctOption = currentQ.options.find(o => o.isCorrect);

  // Check for players who didn't answer (timeout)
  for (const player of room.players.values()) {
    if (!player.hasAnsweredCurrent) {
      player.unansweredCount++;
      player.streak = 0; // reset streak
    }
  }

  // Update DB room status
  await db
    .update(quizRooms)
    .set({
      status: "QUESTION_RESULT",
      updatedAt: new Date(),
    })
    .where(eq(quizRooms.id, room.id));

  const leaderboard = updateRoomLeaderboard(room);

  // Broadcast QUESTION_ENDED with correct answer and explanation
  broadcastToRoom(room, "QUESTION_ENDED", {
    currentQuestionIndex: room.currentQuestionIndex,
    correctOptionKey: correctOption?.key || "A",
    correctOptionText: correctOption?.text || "",
    explanation: currentQ.explanation,
    leaderboard,
  });

  // Automatically advance to next question after 5 seconds review
  room.questionTimer = setTimeout(() => {
    advanceRoomQuestion(room).catch(console.error);
  }, 5000);
}

/**
 * Submits answer for a player
 */
export async function submitPlayerAnswer(
  room: ActiveRoom,
  userId: number,
  selectedOption: string,
  timeTakenMs: number
): Promise<{ success: boolean; pointsEarned: number; isCorrect: boolean; message?: string }> {
  if (room.status !== "QUESTION_ACTIVE") {
    return { success: false, pointsEarned: 0, isCorrect: false, message: "Soru aktif değil." };
  }

  const player = room.players.get(userId);
  if (!player) {
    return { success: false, pointsEarned: 0, isCorrect: false, message: "Oyuncu odada değil." };
  }

  if (player.hasAnsweredCurrent) {
    return { success: false, pointsEarned: 0, isCorrect: false, message: "Bu soru için zaten cevap verdiniz." };
  }

  const currentQ = room.questions[room.currentQuestionIndex];
  const correctOption = currentQ.options.find(o => o.isCorrect);
  const isCorrect = correctOption?.key === selectedOption;

  // Server-authoritative scoring & speed bonus
  let pointsEarned = 0;
  if (isCorrect) {
    const basePoints = 100;
    // Speed bonus: up to 50 extra points if answered fast
    const totalTimeMs = room.timePerQuestion * 1000;
    const remainingMs = Math.max(0, totalTimeMs - timeTakenMs);
    const speedBonus = Math.round((remainingMs / totalTimeMs) * 50);

    // Streak bonus: +10 per consecutive correct answer up to +50
    const streakBonus = Math.min(50, player.streak * 10);

    pointsEarned = basePoints + speedBonus + streakBonus;

    player.score += pointsEarned;
    player.correctAnswersCount++;
    player.streak++;
    if (player.streak > player.maxStreak) {
      player.maxStreak = player.streak;
    }
  } else {
    player.wrongAnswersCount++;
    player.streak = 0;
  }

  player.hasAnsweredCurrent = true;
  player.lastActiveAt = Date.now();

  // Save answer to DB
  await db.insert(quizAnswers).values({
    roomId: room.id,
    userId,
    roomQuestionId: currentQ.id,
    selectedOption,
    isCorrect,
    pointsEarned,
    timeTakenMs: Math.max(0, timeTakenMs),
  }).onConflictDoNothing();

  // Update player stats in DB
  await db
    .update(quizRoomPlayers)
    .set({
      score: player.score,
      correctAnswersCount: player.correctAnswersCount,
      wrongAnswersCount: player.wrongAnswersCount,
      unansweredCount: player.unansweredCount,
      streak: player.streak,
      maxStreak: player.maxStreak,
      lastActiveAt: new Date(),
    })
    .where(and(eq(quizRoomPlayers.roomId, room.id), eq(quizRoomPlayers.userId, userId)));

  // Notify individual player of receipt
  if (player.ws && player.ws.readyState === WebSocket.OPEN) {
    player.ws.send(JSON.stringify({
      event: "ANSWER_ACK",
      data: {
        pointsEarned,
        isCorrect,
        streak: player.streak,
      },
      timestamp: Date.now(),
    }));
  }

  // Broadcast updated leaderboard state
  const updatedLeaderboard = updateRoomLeaderboard(room);
  broadcastToRoom(room, "LEADERBOARD_UPDATED", { leaderboard: updatedLeaderboard });

  // Check if ALL active players have answered; if so, trigger end immediately without waiting for full timer!
  const allAnswered = Array.from(room.players.values()).every(p => p.hasAnsweredCurrent || !p.isConnected);
  if (allAnswered && room.players.size > 0) {
    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = null;
    }
    // Small 600ms grace for visual satisfaction
    setTimeout(() => {
      endRoomQuestion(room).catch(console.error);
    }, 600);
  }

  return { success: true, pointsEarned, isCorrect };
}

/**
 * Finishes quiz room, writes final results to quizResults archive
 */
export async function finishQuizRoom(room: ActiveRoom) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  room.status = "FINISHED";
  room.lastActiveAt = Date.now();

  const finalLeaderboard = updateRoomLeaderboard(room);

  // Update room in DB
  await db
    .update(quizRooms)
    .set({
      status: "FINISHED",
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(quizRooms.id, room.id));

  // Persist permanent results for every player into quizResults
  for (const p of room.players.values()) {
    await db.insert(quizResults).values({
      roomId: room.id,
      roomTitle: room.title,
      category: room.category,
      userId: p.userId,
      rank: p.rank,
      totalPlayers: room.players.size,
      score: p.score,
      correctCount: p.correctAnswersCount,
      wrongCount: p.wrongAnswersCount,
      unansweredCount: p.unansweredCount,
      totalQuestions: room.questions.length,
      playedAt: new Date(),
    });

    // Update player rank in room players table
    await db
      .update(quizRoomPlayers)
      .set({ rank: p.rank })
      .where(and(eq(quizRoomPlayers.roomId, room.id), eq(quizRoomPlayers.userId, p.userId)));
  }

  // Podium: top 3
  const podium = finalLeaderboard.slice(0, 3);

  broadcastToRoom(room, "QUIZ_FINISHED", {
    podium,
    leaderboard: finalLeaderboard,
    totalQuestions: room.questions.length,
  });

  console.log(`🏁 Quiz #${room.id} (${room.code}) tamamlandı. Kazanan: ${podium[0]?.username || 'N/A'}`);
}

/**
 * Cleans up old inactive rooms from memory and marks abandoned rooms in DB
 */
export function cleanupInactiveRooms() {
  const now = Date.now();
  for (const [code, room] of activeRoomsByCode.entries()) {
    // If room is in LOBBY and inactive for > 1 hour, or finished > 30 minutes ago
    const isLobbyTimeout = room.status === "LOBBY" && now - room.lastActiveAt > 60 * 60 * 1000;
    const isFinishedTimeout = room.status === "FINISHED" && now - room.lastActiveAt > 30 * 60 * 1000;
    const isAbandoned = now - room.lastActiveAt > 2 * 60 * 60 * 1000;

    if (isLobbyTimeout || isFinishedTimeout || isAbandoned) {
      if (room.questionTimer) clearTimeout(room.questionTimer);
      activeRoomsByCode.delete(code);
      activeRoomsById.delete(room.id);
      db.update(quizRooms)
        .set({ status: "CANCELLED", updatedAt: new Date() })
        .where(eq(quizRooms.id, room.id))
        .catch(console.error);
    }
  }
}

/**
 * Gets an active room from memory or rehydrates it from DB if available
 */
export async function getOrRehydrateRoom(code: string): Promise<ActiveRoom | null> {
  const cleanCode = code.trim().toUpperCase();
  let room = activeRoomsByCode.get(cleanCode);
  if (room) return room;

  // Check database
  const [dbRoom] = await db
    .select()
    .from(quizRooms)
    .where(eq(quizRooms.code, cleanCode))
    .limit(1);

  if (!dbRoom || dbRoom.status === "CANCELLED" || dbRoom.status === "FINISHED") {
    return null;
  }

  // Fetch questions from DB
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
    status: (dbRoom.status as any) || "LOBBY",
    currentQuestionIndex: dbRoom.currentQuestionIndex || 0,
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
    createdAt: dbRoom.createdAt ? dbRoom.createdAt.getTime() : Date.now(),
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

  activeRoomsByCode.set(cleanCode, rehydratedRoom);
  activeRoomsById.set(dbRoom.id, rehydratedRoom);
  return rehydratedRoom;
}

// Run cleanup every 15 minutes
setInterval(cleanupInactiveRooms, 15 * 60 * 1000);
