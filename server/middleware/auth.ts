import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateSuspensionToken,
  hashRefreshToken,
} from "../utils/jwt.js";
import { db } from "../../src/db/index.js";
import { users, refreshTokens } from "../../src/db/schema.js";
import { eq, and } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
        username?: string;
      };
    }
  }
}

const cleanBearerToken = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  if (!raw || raw === "null" || raw === "undefined") return null;
  return raw;
};

const extractAccessToken = (req: Request): string | null => {
  const bearer = cleanBearerToken(req.headers.authorization);
  if (bearer) return bearer;
  const cookieToken = req.cookies?.accessToken;
  if (typeof cookieToken === "string" && cookieToken.trim() && cookieToken !== "null" && cookieToken !== "undefined") {
    return cookieToken.trim();
  }
  return null;
};

/**
 * Attempts to validate a fallback refresh token from HttpOnly cookie or x-refresh-token header
 * when the access token is expired or missing.
 */
async function tryFallbackRefreshAuth(req: Request, res: Response): Promise<{ userId: number; role: string; username?: string } | null> {
  const fallbackRefresh =
    req.cookies?.refreshToken ||
    (typeof req.headers["x-refresh-token"] === "string" ? req.headers["x-refresh-token"] : null);

  if (!fallbackRefresh || fallbackRefresh === "null" || fallbackRefresh === "undefined") {
    return null;
  }

  try {
    const refDecoded = verifyRefreshToken(fallbackRefresh);
    if (!refDecoded || !refDecoded.userId) return null;

    const tokenSha = hashRefreshToken(fallbackRefresh);
    const records = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, refDecoded.userId), eq(refreshTokens.tokenHash, tokenSha)))
      .limit(1);

    const record = records[0];
    if (!record) return null;

    if (new Date() > new Date(record.expiresAt)) {
      return null;
    }

    // Allow active tokens or tokens rotated within the last 10 minutes
    if (record.revokedAt) {
      const revokedAgoMs = Date.now() - new Date(record.revokedAt).getTime();
      if (revokedAgoMs > 10 * 60 * 1000) {
        return null;
      }
    }

    const freshAccessToken = generateAccessToken(refDecoded.userId, refDecoded.role || "USER");
    res.setHeader("x-refreshed-access-token", freshAccessToken);

    return {
      userId: refDecoded.userId,
      role: refDecoded.role || "USER",
      username: refDecoded.username,
    };
  } catch {
    return null;
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = extractAccessToken(req);
  let decoded: { userId: number; role: string; username?: string } | null = null;

  if (token) {
    try {
      const verified = verifyAccessToken(token);
      if (verified && verified.userId) {
        decoded = verified;
      }
    } catch {
      // Access token expired or invalid; will attempt refresh token fallback below
    }
  }

  if (!decoded) {
    decoded = await tryFallbackRefreshAuth(req, res);
  }

  if (!decoded || !decoded.userId) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: token
          ? "Oturum süreniz sona erdi. Lütfen tekrar giriş yapın."
          : "Yetkilendirme token'ı bulunamadı.",
      },
    });
    return;
  }

  try {
    // Verify account active status in database
    const userRecord = await db.select({
      id: users.id,
      role: users.role,
      isActive: users.isActive,
      banReason: users.banReason,
      bannedAt: users.bannedAt,
      banExpiresAt: users.banExpiresAt
    }).from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (userRecord.length === 0) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Kullanıcı bulunamadı." }
      });
      return;
    }

    const u = userRecord[0];
    if (!u.isActive) {
      // Check if temporary ban has expired
      if (u.banExpiresAt && new Date(u.banExpiresAt) <= new Date()) {
        await db.update(users).set({
          isActive: true,
          banReason: null,
          bannedAt: null,
          banExpiresAt: null,
          updatedAt: new Date()
        }).where(eq(users.id, u.id));
      } else {
        const suspensionToken = generateSuspensionToken(u.id, decoded.username || '');
        res.status(403).json({
          success: false,
          error: {
            code: "ACCOUNT_SUSPENDED",
            message: "Hesabınız askıya alınmıştır.",
            suspension: {
              userId: u.id,
              isPermanent: !u.banExpiresAt,
              banReason: u.banReason || "Topluluk kurallarının ihlali",
              bannedAt: u.bannedAt,
              banExpiresAt: u.banExpiresAt,
              suspensionToken
            }
          }
        });
        return;
      }
    }

    req.user = {
      userId: u.id,
      role: u.role || decoded.role,
      username: decoded.username,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Oturum doğrulanamadı. Lütfen tekrar giriş yapın." }
    });
  }
};

export const getUserId = (req: Request): number => {
  if (!req.user || !req.user.userId) {
    throw new Error("UNAUTHORIZED_ACCESS");
  }
  return req.user.userId;
};


export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Lütfen giriş yapın." }
      });
      return;
    }

    if (req.user.role.toUpperCase() !== role.toUpperCase() && req.user.role.toUpperCase() !== "ADMIN") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Bu işlem için yetkiniz yok." }
      });
      return;
    }

    next();
  };
};


export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = extractAccessToken(req);
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.userId) {
        req.user = decoded;
        next();
        return;
      }
    } catch {
      // Fallback to refresh token if present
    }
  }

  const fallbackUser = await tryFallbackRefreshAuth(req, res);
  if (fallbackUser) {
    req.user = fallbackUser;
  }
  next();
};



export const optionalAuthContext = (req: Request): number | null => {
  return req.user?.userId || null;
};

export class AuthContextError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 401;
    this.name = "AuthContextError";
  }
}

export const requireAuthContext = (req: Request): number => {
  if (!req.user || !req.user.userId) {
    throw new AuthContextError("UNAUTHORIZED_CONTEXT");
  }
  return req.user.userId;
};

