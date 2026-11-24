import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { db } from "../../src/db/index.js";
import { conversationMembers, users, profiles } from "../../src/db/schema.js";
import { eq, and, inArray, not } from "drizzle-orm";

interface AuthenticatedMessageSocket extends WebSocket {
  userId?: number;
  username?: string;
  isAlive?: boolean;
}

// Track active sockets per userId for genuine real-time presence & targeted delivery
const userSockets = new Map<number, Set<AuthenticatedMessageSocket>>();

export function getOnlineUserIds(): number[] {
  return Array.from(userSockets.keys());
}

export function isUserOnline(userId: number): boolean {
  const sockets = userSockets.get(userId);
  return Boolean(sockets && sockets.size > 0);
}

export function broadcastToUsers(
  userIds: number[],
  event: string,
  data: unknown,
  excludeUserId?: number
) {
  if (!userIds.length) return;
  const payload = JSON.stringify({ event, data, timestamp: Date.now() });
  const uniqueIds = Array.from(new Set(userIds));

  for (const uid of uniqueIds) {
    if (excludeUserId !== undefined && uid === excludeUserId) continue;
    const sockets = userSockets.get(uid);
    if (!sockets || sockets.size === 0) continue;

    for (const sock of sockets) {
      if (sock.readyState === WebSocket.OPEN) {
        try {
          sock.send(payload);
        } catch {
          // Ignore transient send errors on closing sockets
        }
      }
    }
  }
}

async function getPeerUserIdsForPresence(userId: number): Promise<number[]> {
  try {
    const myConvs = await db
      .select({ conversationId: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, userId));

    const convIds = myConvs.map((c: { conversationId: number }) => c.conversationId);
    if (convIds.length === 0) return [];

    const peers = await db
      .select({ userId: conversationMembers.userId })
      .from(conversationMembers)
      .where(
        and(
          inArray(conversationMembers.conversationId, convIds),
          not(eq(conversationMembers.userId, userId))
        )
      );

    return Array.from(new Set(peers.map((p: { userId: number }) => p.userId)));
  } catch {
    return [];
  }
}

export function setupMessagesWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);

    if (url.pathname === "/ws/messages" || url.pathname === "/api/v1/messages/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  // Heartbeat keep-alive every 30s
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client: WebSocket) => {
      const sock = client as AuthenticatedMessageSocket;
      if (sock.isAlive === false) {
        return sock.terminate();
      }
      sock.isAlive = false;
      try {
        sock.ping();
      } catch {
        // Ignore ping errors
      }
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  wss.on("connection", async (ws: AuthenticatedMessageSocket, req) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Authenticate via access token query parameter or refreshToken HttpOnly cookie
    try {
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const token = url.searchParams.get("token");

      if (token && token !== "null" && token !== "undefined") {
        try {
          const decoded = verifyAccessToken(token);
          if (decoded?.userId) {
            ws.userId = decoded.userId;
            ws.username = decoded.username || "";
          }
        } catch {
          // Expired access token: fall back to refreshToken cookie
        }
      }

      if (!ws.userId && req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)refreshToken=([^;]+)/);
        if (match && match[1]) {
          try {
            const refDecoded = verifyRefreshToken(decodeURIComponent(match[1]));
            if (refDecoded?.userId) {
              ws.userId = refDecoded.userId;
              ws.username = refDecoded.username || "";
            }
          } catch {
            // Invalid cookie
          }
        }
      }
    } catch {
      // Malformed URL
    }

    if (!ws.userId) {
      ws.close(4401, "Unauthorized");
      return;
    }

    const userId = ws.userId;

    // Verify user is active in database
    try {
      const [userRec] = await db
        .select({ id: users.id, username: users.username, isActive: users.isActive })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userRec || !userRec.isActive) {
        ws.close(4403, "Forbidden");
        return;
      }
      ws.username = userRec.username;
    } catch {
      ws.close(4500, "Internal Error");
      return;
    }

    // Register socket & notify peers if this is user's first active socket
    let sockets = userSockets.get(userId);
    const wasOffline = !sockets || sockets.size === 0;
    if (!sockets) {
      sockets = new Set();
      userSockets.set(userId, sockets);
    }
    sockets.add(ws);

    // Send initial presence snapshot of only their conversation peers
    const peerIds = await getPeerUserIdsForPresence(userId);
    const onlinePeers = peerIds.filter((pid) => isUserOnline(pid));
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "presence:snapshot",
          data: { onlineUserIds: onlinePeers },
          timestamp: Date.now(),
        })
      );
    }

    if (wasOffline && peerIds.length > 0) {
      broadcastToUsers(peerIds, "presence:online", { userId });
    }

    ws.on("message", async (raw) => {
      try {
        const text = raw.toString();
        if (text.length > 4096) return;
        const parsed = JSON.parse(text);
        const event = parsed?.event;
        const payload = parsed?.payload || {};

        if (event === "ping") {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "pong", timestamp: Date.now() }));
          }
          return;
        }

        if (event === "typing:start" || event === "typing:stop") {
          const conversationId = Number(payload.conversationId);
          if (!Number.isInteger(conversationId) || conversationId <= 0) return;

          // Verify caller is a member of this conversation before broadcasting typing state
          const members = await db
            .select({ userId: conversationMembers.userId })
            .from(conversationMembers)
            .where(eq(conversationMembers.conversationId, conversationId));

          const memberIds = members.map((m: { userId: number }) => m.userId);
          if (!memberIds.includes(userId)) return;

          const [senderProfile] = await db
            .select({ displayName: profiles.displayName })
            .from(profiles)
            .where(eq(profiles.userId, userId))
            .limit(1);

          broadcastToUsers(
            memberIds,
            event,
            {
              conversationId,
              userId,
              username: ws.username || "",
              displayName: senderProfile?.displayName || ws.username || "",
            },
            userId
          );
        }
      } catch {
        // Ignore malformed messages
      }
    });

    const handleDisconnect = async () => {
      const currentSet = userSockets.get(userId);
      if (currentSet) {
        currentSet.delete(ws);
        if (currentSet.size === 0) {
          userSockets.delete(userId);
          const peers = await getPeerUserIdsForPresence(userId);
          if (peers.length > 0) {
            broadcastToUsers(peers, "presence:offline", { userId });
          }
        }
      }
    };

    ws.on("close", () => {
      handleDisconnect().catch(() => {});
    });

    ws.on("error", () => {
      handleDisconnect().catch(() => {});
    });
  });

  return wss;
}
