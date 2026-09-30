import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken } from "../utils/jwt.js";
import { db } from "../../src/db/index.js";
import { users, profiles, quizRooms, quizRoomPlayers } from "../../src/db/schema.js";
import { eq, and } from "drizzle-orm";
import { 
  activeRoomsByCode, 
  activeRoomsById, 
  broadcastToRoom, 
  updateRoomLeaderboard, 
  advanceRoomQuestion,
  submitPlayerAnswer,
  sanitizeQuestionForClients,
  ActiveRoom
} from "./quizEngine.js";

interface AuthenticatedSocket extends WebSocket {
  userId?: number;
  username?: string;
  avatarUrl?: string | null;
  roomCode?: string;
  isAlive?: boolean;
}

export function setupQuizWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade to WebSocket
  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    
    // Only accept connections for Genç Quiz WebSocket endpoint
    if (url.pathname === "/api/v1/quiz/ws" || url.pathname === "/ws/quiz") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  // Keep-alive heartbeat interval (every 30 seconds)
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client: any) => {
      if (client.isAlive === false) {
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  wss.on("connection", (ws: AuthenticatedSocket, req) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Check token from query param (e.g. ?token=...)
    try {
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const token = url.searchParams.get("token");
      if (token) {
        const decoded = verifyAccessToken(token);
        if (decoded?.userId) {
          ws.userId = decoded.userId;
          ws.username = decoded.username || "";
        }
      }
    } catch (e) {
      // Ignored; can authenticate via AUTH message
    }

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { event, payload } = message;

        switch (event) {
          case "PING": {
            ws.send(JSON.stringify({ event: "PONG", timestamp: Date.now() }));
            break;
          }

          case "AUTH": {
            if (payload?.token) {
              const decoded = verifyAccessToken(payload.token);
              if (decoded?.userId) {
                ws.userId = decoded.userId;
                ws.username = decoded.username || "";
                ws.send(JSON.stringify({ event: "AUTH_SUCCESS", data: { userId: decoded.userId } }));
              } else {
                ws.send(JSON.stringify({ event: "ERROR", data: { message: "Yetkisiz token." } }));
              }
            }
            break;
          }

          case "JOIN_ROOM": {
            const { roomCode, token } = payload || {};
            let userId = ws.userId;
            let username = ws.username;

            if (!userId && token) {
              const decoded = verifyAccessToken(token);
              if (decoded?.userId) {
                userId = decoded.userId;
                username = decoded.username || "";
                ws.userId = userId;
                ws.username = username;
              }
            }

            if (!userId) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Odaya katılmak için giriş yapmalısınız." } }));
              return;
            }

            if (!roomCode) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Geçersiz oda kodu." } }));
              return;
            }

            const cleanCode = roomCode.toString().trim();
            const room = activeRoomsByCode.get(cleanCode);

            if (!room) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Bu kodla aktif bir quiz odası bulunamadı." } }));
              return;
            }

            if (room.status === "FINISHED" || room.status === "CANCELLED") {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Bu quiz sona ermiştir." } }));
              return;
            }

            // Check capacity
            if (room.players.size >= room.maxPlayers && !room.players.has(userId)) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Bu quiz odası tamamen dolu." } }));
              return;
            }

            // Fetch user profile info
            const [userProfile] = await db
              .select({ avatarUrl: profiles.avatarUrl, username: users.username })
              .from(users)
              .leftJoin(profiles, eq(users.id, profiles.userId))
              .where(eq(users.id, userId))
              .limit(1);

            const userAvatar = userProfile?.avatarUrl || null;
            const finalUsername = userProfile?.username || username || `Oyuncu_${userId}`;
            ws.username = finalUsername;
            ws.avatarUrl = userAvatar;
            ws.roomCode = cleanCode;

            // Player state
            let player = room.players.get(userId);
            if (player) {
              // Reconnect
              player.ws = ws;
              player.isConnected = true;
              player.lastActiveAt = Date.now();
            } else {
              // New Player
              const isHost = room.hostId === userId;
              player = {
                userId,
                username: finalUsername,
                avatarUrl: userAvatar,
                ws,
                score: 0,
                correctAnswersCount: 0,
                wrongAnswersCount: 0,
                unansweredCount: 0,
                streak: 0,
                maxStreak: 0,
                rank: room.players.size + 1,
                isHost,
                isConnected: true,
                hasAnsweredCurrent: false,
                lastActiveAt: Date.now(),
              };
              room.players.set(userId, player);

              // Persist into DB
              await db.insert(quizRoomPlayers).values({
                roomId: room.id,
                userId,
                score: 0,
                isHost,
                isConnected: true,
              }).onConflictDoNothing();
            }

            room.lastActiveAt = Date.now();

            // Send full ROOM_STATE to the joining player
            const currentQ = room.questions[room.currentQuestionIndex];
            const sanitizedQ = (room.status === "QUESTION_ACTIVE" && currentQ)
              ? sanitizeQuestionForClients(currentQ, room.currentQuestionIndex, room.questions.length, room.timePerQuestion)
              : null;

            ws.send(JSON.stringify({
              event: "ROOM_STATE",
              data: {
                roomId: room.id,
                code: room.code,
                title: room.title,
                hostId: room.hostId,
                category: room.category,
                difficulty: room.difficulty,
                timePerQuestion: room.timePerQuestion,
                totalQuestions: room.questions.length,
                status: room.status,
                currentQuestionIndex: room.currentQuestionIndex,
                currentQuestion: sanitizedQ,
                isHost: room.hostId === userId,
                leaderboard: updateRoomLeaderboard(room),
              },
              timestamp: Date.now(),
            }));

            // Broadcast PLAYER_JOINED to other players in room
            broadcastToRoom(room, "PLAYER_JOINED", {
              player: {
                userId,
                username: finalUsername,
                avatarUrl: userAvatar,
                score: player.score,
                isHost: player.isHost,
                rank: player.rank,
              },
              totalPlayers: room.players.size,
              leaderboard: updateRoomLeaderboard(room),
            });

            break;
          }

          case "START_QUIZ": {
            if (!ws.userId || !ws.roomCode) return;
            const room = activeRoomsByCode.get(ws.roomCode);
            if (!room) return;

            // Only host can start quiz
            if (room.hostId !== ws.userId) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Yalnızca oda kurucusu quiz'i başlatabilir." } }));
              return;
            }

            if (room.status !== "LOBBY") {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Quiz zaten başlatıldı." } }));
              return;
            }

            if (room.questions.length === 0) {
              ws.send(JSON.stringify({ event: "ERROR", data: { message: "Soru havuzunda soru bulunamadı." } }));
              return;
            }

            room.status = "PLAYING";
            room.currentQuestionIndex = -1; // so advanceRoomQuestion moves to index 0
            room.lastActiveAt = Date.now();

            await db
              .update(quizRooms)
              .set({
                status: "PLAYING",
                startedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(quizRooms.id, room.id));

            broadcastToRoom(room, "QUIZ_STARTED", {
              title: room.title,
              totalQuestions: room.questions.length,
              timePerQuestion: room.timePerQuestion,
            });

            // Start first question after 3-second countdown
            setTimeout(() => {
              advanceRoomQuestion(room).catch(console.error);
            }, 3000);

            break;
          }

          case "SUBMIT_ANSWER": {
            if (!ws.userId || !ws.roomCode) return;
            const room = activeRoomsByCode.get(ws.roomCode);
            if (!room) return;

            const { optionKey, timeTakenMs } = payload || {};
            if (!optionKey) return;

            await submitPlayerAnswer(room, ws.userId, optionKey, timeTakenMs || 0);
            break;
          }

          case "KICK_PLAYER": {
            if (!ws.userId || !ws.roomCode) return;
            const room = activeRoomsByCode.get(ws.roomCode);
            if (!room || room.hostId !== ws.userId) return;

            const targetUserId = parseInt(payload?.targetUserId);
            if (!targetUserId || targetUserId === ws.userId) return;

            const targetPlayer = room.players.get(targetUserId);
            if (targetPlayer) {
              if (targetPlayer.ws && targetPlayer.ws.readyState === WebSocket.OPEN) {
                targetPlayer.ws.send(JSON.stringify({
                  event: "PLAYER_KICKED",
                  data: { message: "Oda kurucusu tarafından odadan çıkarıldınız." },
                }));
                targetPlayer.ws.close();
              }
              room.players.delete(targetUserId);

              // Delete from DB
              await db
                .delete(quizRoomPlayers)
                .where(and(eq(quizRoomPlayers.roomId, room.id), eq(quizRoomPlayers.userId, targetUserId)));

              broadcastToRoom(room, "PLAYER_LEFT", {
                userId: targetUserId,
                username: targetPlayer.username,
                totalPlayers: room.players.size,
                leaderboard: updateRoomLeaderboard(room),
              });
            }
            break;
          }

          case "LEAVE_ROOM": {
            handlePlayerLeave(ws);
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error("WebSocket message handling error:", err);
      }
    });

    ws.on("close", () => {
      handlePlayerLeave(ws, true);
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      handlePlayerLeave(ws, true);
    });
  });

  return wss;
}

/**
 * Handles graceful player departure or temporary disconnect
 */
function handlePlayerLeave(ws: AuthenticatedSocket, isDisconnect = false) {
  if (!ws.userId || !ws.roomCode) return;

  const room = activeRoomsByCode.get(ws.roomCode);
  if (!room) return;

  const player = room.players.get(ws.userId);
  if (!player) return;

  if (isDisconnect && (room.status === "QUESTION_ACTIVE" || room.status === "PLAYING")) {
    // If during live quiz, keep their score and mark as disconnected to allow seamless reconnect
    player.isConnected = false;
    player.ws = null;
    broadcastToRoom(room, "PLAYER_DISCONNECTED", {
      userId: ws.userId,
      username: player.username,
      leaderboard: updateRoomLeaderboard(room),
    });
    return;
  }

  // Remove player completely
  room.players.delete(ws.userId);

  // If host leaves
  if (room.hostId === ws.userId) {
    if (room.players.size > 0) {
      // Assign new host to the next player
      const nextPlayer = room.players.values().next().value;
      if (nextPlayer) {
        room.hostId = nextPlayer.userId;
        nextPlayer.isHost = true;

        db.update(quizRooms)
          .set({ hostId: nextPlayer.userId, updatedAt: new Date() })
          .where(eq(quizRooms.id, room.id))
          .catch(console.error);

        broadcastToRoom(room, "HOST_CHANGED", {
          newHostId: nextPlayer.userId,
          newHostUsername: nextPlayer.username,
        });
      }
    } else {
      // Room is empty: cancel/close room
      room.status = "CANCELLED";
      if (room.questionTimer) clearTimeout(room.questionTimer);
      activeRoomsByCode.delete(room.code);
      activeRoomsById.delete(room.id);

      db.update(quizRooms)
        .set({ status: "CANCELLED", updatedAt: new Date() })
        .where(eq(quizRooms.id, room.id))
        .catch(console.error);

      return;
    }
  }

  // Broadcast player left
  broadcastToRoom(room, "PLAYER_LEFT", {
    userId: ws.userId,
    username: player.username,
    totalPlayers: room.players.size,
    leaderboard: updateRoomLeaderboard(room),
  });
}
