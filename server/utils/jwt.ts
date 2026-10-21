import crypto from "crypto";
import jwt from "jsonwebtoken";

const getAccessTokenSecret = () => {
  return process.env.JWT_SECRET || "gencsosyal_secure_access_jwt_secret_2026";
};

const getRefreshTokenSecret = () => {
  return process.env.JWT_REFRESH_SECRET || "gencsosyal_secure_refresh_jwt_secret_2026";
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateAccessToken = (userId: number, role: string) => {
  return jwt.sign(
    { userId, role, type: "access", jti: crypto.randomUUID() },
    getAccessTokenSecret(),
    { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || "24h") as any }
  );
};

export const generateRefreshToken = (userId: number, role: string) => {
  return jwt.sign(
    { userId, role, type: "refresh", jti: crypto.randomUUID() },
    getRefreshTokenSecret(),
    { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "30d") as any }
  );
};

export const verifyAccessToken = (token: string) => {
  const decoded = jwt.verify(token, getAccessTokenSecret(), { algorithms: ["HS256"] }) as any;
  if (decoded.type !== "access") {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const verifyRefreshToken = (token: string) => {
  const decoded = jwt.verify(token, getRefreshTokenSecret(), { algorithms: ["HS256"] }) as any;
  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const getEmailTokenSecret = () => {
  const secret = process.env.JWT_EMAIL_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_EMAIL_SECRET is missing in production!");
    }
    return getAccessTokenSecret() + "_email";
  }
  return secret;
};

export const generateEmailToken = (userId: number, purpose: string) => {
  return jwt.sign(
    { userId, purpose, type: "email" },
    getEmailTokenSecret(),
    { expiresIn: "1h" }
  );
};

export const verifyEmailToken = (token: string) => {
  const decoded = jwt.verify(token, getEmailTokenSecret(), { algorithms: ["HS256"] }) as any;
  if (decoded.type !== "email") {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const getTwoFactorTokenSecret = () => {
  const secret = process.env.JWT_2FA_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_2FA_SECRET is missing in production!");
    }
    return getAccessTokenSecret() + "_2fa";
  }
  return secret;
};

export const generateTwoFactorToken = (userId: number, role: string) => {
  return jwt.sign(
    { userId, role, type: "2fa" },
    getTwoFactorTokenSecret(),
    { expiresIn: "5m" }
  );
};

export const verifyTwoFactorToken = (token: string) => {
  const decoded = jwt.verify(token, getTwoFactorTokenSecret(), { algorithms: ["HS256"] }) as any;
  if (decoded.type !== "2fa") {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const generateSuspensionToken = (userId: number, username: string) => {
  return jwt.sign(
    { userId, username, type: "suspension" },
    getAccessTokenSecret(),
    { expiresIn: "7d" }
  );
};

export const verifySuspensionToken = (token: string) => {
  const decoded = jwt.verify(token, getAccessTokenSecret(), { algorithms: ["HS256"] }) as any;
  if (decoded.type !== "suspension" && decoded.type !== "access") {
    throw new Error("Invalid token type");
  }
  return decoded;
};


