import jwt from "jsonwebtoken";

const getAccessTokenSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET is missing in production!");
    }
    return "dev_secret_do_not_use_in_prod";
  }
  return secret;
};

const getRefreshTokenSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_REFRESH_SECRET is missing in production!");
    }
    return "dev_refresh_secret_do_not_use_in_prod";
  }
  return secret;
};

export const generateAccessToken = (userId: number, role: string) => {
  return jwt.sign(
    { userId, role, type: "access" },
    getAccessTokenSecret(),
    { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || "15m") as any }
  );
};

export const generateRefreshToken = (userId: number, role: string) => {
  return jwt.sign(
    { userId, role, type: "refresh" },
    getRefreshTokenSecret(),
    { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as any }
  );
};

export const verifyAccessToken = (token: string) => {
  const decoded = jwt.verify(token, getAccessTokenSecret(), { algorithms: ["HS256"] }) as any;
  if (decoded.type !== "access" && decoded.role === undefined) {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const verifyRefreshToken = (token: string) => {
  const decoded = jwt.verify(token, getRefreshTokenSecret(), { algorithms: ["HS256"] }) as any;
  if (decoded.type !== "refresh" && decoded.role === undefined) {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const getEmailTokenSecret = () => {
  return process.env.JWT_EMAIL_SECRET || (getAccessTokenSecret() + "_email");
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
  return process.env.JWT_2FA_SECRET || (getAccessTokenSecret() + "_2fa");
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

