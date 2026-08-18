import { Router } from "express";
import argon2 from "argon2";
import crypto from "crypto";
import { db } from "../../src/db/index.js";
import { users, profiles, refreshTokens, otpVerifications } from "../../src/db/schema.js";
import { eq, or, and, sql, desc } from "drizzle-orm";
import { 
  registerSchema, 
  sendOtpSchema, 
  verifyRegisterOtpSchema, 
  resendOtpSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  verifyTwoFactorSchema,
  enableTwoFactorSchema,
  disableTwoFactorSchema
} from "../validators/auth.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateEmailToken, verifyEmailToken, generateTwoFactorToken, verifyTwoFactorToken } from "../utils/jwt.js";
import { encryptString, decryptString } from "../utils/encryption.js";
import { authenticator } from "otplib";
import { sendVerificationEmail, sendPasswordResetEmail, sendSecurityAlertEmail, sendOtpVerificationEmail } from "../utils/mailer.js";
import { authRateLimiter, loginRateLimiter, registerRateLimiter, otpSendRateLimiter, otpVerifyRateLimiter } from "../middleware/rate-limit.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// Helper to handle OTP generation and dispatch
async function handleSendOtp(email: string, displayName: string, username: string, password?: string) {
  // Check if username already exists
  const existingUsername = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (existingUsername.length > 0) {
    return {
      status: 409,
      body: {
        success: false,
        error: { code: "USERNAME_TAKEN", message: "Bu kullanıcı adı zaten kullanımda." }
      }
    };
  }

  // Check if email already exists
  const existingEmail = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existingEmail.length > 0) {
    return {
      status: 409,
      body: {
        success: false,
        error: { code: "EMAIL_TAKEN", message: "Bu e-posta adresi zaten bir hesaba kayıtlı." }
      }
    };
  }

  // Check cooldown per email (60 seconds)
  const existingOtpRecords = await db.select().from(otpVerifications).where(
    and(eq(otpVerifications.email, email), eq(otpVerifications.type, 'REGISTER'))
  ).limit(1);

  if (existingOtpRecords.length > 0) {
    const existingOtp = existingOtpRecords[0];
    const diffMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
    if (diffMs < 60 * 1000) {
      const remainingSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
      return {
        status: 429,
        body: {
          success: false,
          error: { 
            code: "COOLDOWN_ACTIVE", 
            message: `Lütfen yeni bir kod talep etmeden önce ${remainingSeconds} saniye bekleyin.`,
            remainingSeconds 
          }
        }
      };
    }
  }

  // Generate cryptographically secure 6-digit OTP
  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await argon2.hash(otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  if (existingOtpRecords.length > 0) {
    await db.update(otpVerifications).set({
      otpHash,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      lastSentAt: new Date(),
      verifiedAt: null,
    }).where(eq(otpVerifications.id, existingOtpRecords[0].id));
  } else {
    await db.insert(otpVerifications).values({
      email,
      otpHash,
      type: 'REGISTER',
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      lastSentAt: new Date(),
    });
  }

  try {
    await sendOtpVerificationEmail(email, displayName, otpCode);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    // Remove the OTP record so they can try again immediately if SMTP fails
    await db.delete(otpVerifications).where(eq(otpVerifications.email, email));
    return {
      status: 500,
      body: {
        success: false,
        error: { code: "SMTP_ERROR", message: "E-posta gönderimi başarısız oldu. Sunucu veya e-posta adresi hatalı olabilir." }
      }
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        message: "Doğrulama kodu e-posta adresinize gönderildi.",
        email,
        cooldownSeconds: 60,
        expiresInSeconds: 600
      }
    }
  };
}

// 1. Send OTP Endpoint
authRouter.post("/register/send-otp", otpSendRateLimiter, async (req, res) => {
  try {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    const { email, displayName, username, password } = parsed.data;
    const result = await handleSendOtp(email, displayName, username, password);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Doğrulama kodu gönderilirken bir hata oluştu." }
    });
  }
});

// Alias for Send OTP
authRouter.post("/send-otp", otpSendRateLimiter, async (req, res) => {
  try {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    const { email, displayName, username, password } = parsed.data;
    const result = await handleSendOtp(email, displayName, username, password);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Doğrulama kodu gönderilirken bir hata oluştu." }
    });
  }
});

// 2. Resend OTP Endpoint
authRouter.post("/register/resend-otp", otpSendRateLimiter, async (req, res) => {
  try {
    const parsed = resendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    const { email, displayName } = parsed.data;

    // Check if user already exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      res.status(409).json({
        success: false,
        error: { code: "EMAIL_TAKEN", message: "Bu e-posta adresi zaten kayıtlı." }
      });
      return;
    }

    // Check cooldown
    const existingOtpRecords = await db.select().from(otpVerifications).where(
      and(eq(otpVerifications.email, email), eq(otpVerifications.type, 'REGISTER'))
    ).limit(1);

    if (existingOtpRecords.length > 0) {
      const existingOtp = existingOtpRecords[0];
      const diffMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      if (diffMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
        res.status(429).json({
          success: false,
          error: {
            code: "COOLDOWN_ACTIVE",
            message: `Lütfen yeni bir kod talep etmeden önce ${remainingSeconds} saniye bekleyin.`,
            remainingSeconds
          }
        });
        return;
      }
    }

    // Generate new OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await argon2.hash(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existingOtpRecords.length > 0) {
      await db.update(otpVerifications).set({
        otpHash,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
        verifiedAt: null,
      }).where(eq(otpVerifications.id, existingOtpRecords[0].id));
    } else {
      await db.insert(otpVerifications).values({
        email,
        otpHash,
        type: 'REGISTER',
        attempts: 0,
        maxAttempts: 5,
        expiresAt,
        lastSentAt: new Date(),
      });
    }

    try {
      await sendOtpVerificationEmail(email, displayName || 'Kullanıcı', otpCode);
    } catch (err) {
      console.error("Failed to resend OTP email:", err);
      return res.status(500).json({
        success: false,
        error: { code: "SMTP_ERROR", message: "E-posta gönderimi başarısız oldu." }
      });
    }

    res.json({
      success: true,
      data: {
        message: "Yeni doğrulama kodu e-posta adresinize gönderildi.",
        cooldownSeconds: 60,
        expiresInSeconds: 600
      }
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Doğrulama kodu yeniden gönderilemedi." }
    });
  }
});

// Alias for Resend OTP
authRouter.post("/resend-otp", otpSendRateLimiter, async (req, res) => {
  try {
    const parsed = resendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    const { email, displayName } = parsed.data;

    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      res.status(409).json({
        success: false,
        error: { code: "EMAIL_TAKEN", message: "Bu e-posta adresi zaten kayıtlı." }
      });
      return;
    }

    const existingOtpRecords = await db.select().from(otpVerifications).where(
      and(eq(otpVerifications.email, email), eq(otpVerifications.type, 'REGISTER'))
    ).limit(1);

    if (existingOtpRecords.length > 0) {
      const existingOtp = existingOtpRecords[0];
      const diffMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      if (diffMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
        res.status(429).json({
          success: false,
          error: {
            code: "COOLDOWN_ACTIVE",
            message: `Lütfen yeni bir kod talep etmeden önce ${remainingSeconds} saniye bekleyin.`,
            remainingSeconds
          }
        });
        return;
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await argon2.hash(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existingOtpRecords.length > 0) {
      await db.update(otpVerifications).set({
        otpHash,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
        verifiedAt: null,
      }).where(eq(otpVerifications.id, existingOtpRecords[0].id));
    } else {
      await db.insert(otpVerifications).values({
        email,
        otpHash,
        type: 'REGISTER',
        attempts: 0,
        maxAttempts: 5,
        expiresAt,
        lastSentAt: new Date(),
      });
    }

    try {
      await sendOtpVerificationEmail(email, displayName || 'Kullanıcı', otpCode);
    } catch (err) {
      console.error("Failed to resend OTP email:", err);
      return res.status(500).json({
        success: false,
        error: { code: "SMTP_ERROR", message: "E-posta gönderimi başarısız oldu." }
      });
    }

    res.json({
      success: true,
      data: {
        message: "Yeni doğrulama kodu e-posta adresinize gönderildi.",
        cooldownSeconds: 60,
        expiresInSeconds: 600
      }
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Doğrulama kodu yeniden gönderilemedi." }
    });
  }
});

// Helper to verify OTP and complete registration
async function handleVerifyOtpAndCreateUser(req: any, res: any, parsedData: any) {
  const { username, email, password, displayName, otp } = parsedData;

  // 1. Find the active OTP verification record
  const otpRecords = await db.select().from(otpVerifications).where(
    and(eq(otpVerifications.email, email), eq(otpVerifications.type, 'REGISTER'))
  ).limit(1);

  if (otpRecords.length === 0) {
    res.status(400).json({
      success: false,
      error: { 
        code: "OTP_NOT_FOUND", 
        message: "Doğrulama kodu bulunamadı. Lütfen önce kayıt formunu doldurarak kod talep edin." 
      }
    });
    return;
  }

  const otpRecord = otpRecords[0];

  // 2. Check expiration
  if (new Date() > new Date(otpRecord.expiresAt)) {
    res.status(400).json({
      success: false,
      error: { 
        code: "OTP_EXPIRED", 
        message: "Doğrulama kodunun süresi dolmuş (10 dakika). Lütfen yeni bir kod isteyin." 
      }
    });
    return;
  }

  // 3. Check brute force / max attempts
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    res.status(400).json({
      success: false,
      error: { 
        code: "MAX_ATTEMPTS_EXCEEDED", 
        message: "Çok fazla hatalı kod denemesi yapıldı. Güvenliğiniz için lütfen yeni bir kod talep edin." 
      }
    });
    return;
  }

  // 4. Verify OTP with argon2
  const isValid = await argon2.verify(otpRecord.otpHash, otp);
  if (!isValid) {
    const updatedAttempts = otpRecord.attempts + 1;
    await db.update(otpVerifications).set({ attempts: updatedAttempts }).where(eq(otpVerifications.id, otpRecord.id));
    const remaining = Math.max(0, otpRecord.maxAttempts - updatedAttempts);
    
    res.status(400).json({
      success: false,
      error: { 
        code: "INVALID_OTP", 
        message: remaining > 0 
          ? `Girdiğiniz doğrulama kodu hatalı. Kalan deneme hakkınız: ${remaining}` 
          : "Çok fazla hatalı deneme yapıldı. Lütfen yeni bir doğrulama kodu talep edin.",
        remainingAttempts: remaining
      }
    });
    return;
  }

  // 5. Code is valid! Proceed with creating user in transaction
  const passwordHash = await argon2.hash(password);

  let newUser: any;
  try {
    newUser = await db.transaction(async (tx) => {
      // Check collision one more time in transaction
      const existingUser = await tx.select().from(users).where(
        or(eq(users.username, username), eq(users.email, email))
      ).limit(1);

      if (existingUser.length > 0) {
        throw new Error("USER_ALREADY_EXISTS");
      }

      const [createdUser] = await tx.insert(users).values({
        username,
        email,
        passwordHash,
        isVerified: false,
        emailVerified: true,
        isActive: true,
      }).returning();

      await tx.insert(profiles).values({
        userId: createdUser.id,
        displayName,
      });

      // Remove OTP record or mark verified
      await tx.delete(otpVerifications).where(eq(otpVerifications.id, otpRecord.id));

      // Auto-follow logic
      try {
        const { systemSettings, follows } = await import("../../src/db/schema.js");
        const setting = await tx.select().from(systemSettings).where(eq(systemSettings.key, 'auto_follow_users')).limit(1);
        if (setting.length > 0 && setting[0].value) {
          let userIds: number[] = JSON.parse(setting[0].value);
          if (Array.isArray(userIds) && userIds.length > 0) {
            userIds = userIds.filter(id => id !== createdUser.id);
            if (userIds.length > 0) {
               const followsToInsert = userIds.map(id => ({
                  followerId: createdUser.id,
                  followingId: id,
                  notificationPreference: 'standard'
               }));
               await tx.insert(follows).values(followsToInsert).onConflictDoNothing();
            }
          }
        }
      } catch (e) {
        console.error("Auto-follow error on register:", e);
      }

      return createdUser;
    });
  } catch (error: any) {
    if (error?.message === "USER_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "Kullanıcı adı veya e-posta zaten kullanımda." }
      });
      return;
    }
    throw error;
  }

  // 6. Generate authenticated session
  const accessToken = generateAccessToken(newUser.id, newUser.role);
  const refreshToken = generateRefreshToken(newUser.id, newUser.role);
  const tokenHash = await argon2.hash(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(refreshTokens).values({
    userId: newUser.id,
    tokenHash,
    expiresAt,
    ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || null,
    deviceInfo: (req.headers["user-agent"] as string) || null,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    success: true,
    data: {
      message: "Hesabınız başarıyla oluşturuldu ve doğrulandı.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName,
        role: newUser.role,
        isVerified: newUser.isVerified
      },
      accessToken
    }
  });
}

// 3. Verify OTP Endpoint
authRouter.post("/register/verify-otp", otpVerifyRateLimiter, async (req, res) => {
  try {
    const parsed = verifyRegisterOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    await handleVerifyOtpAndCreateUser(req, res, parsed.data);
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Doğrulama işlemi sırasında bir hata oluştu." }
    });
  }
});

// Alias for Verify OTP
authRouter.post("/verify-register-otp", otpVerifyRateLimiter, async (req, res) => {
  try {
    const parsed = verifyRegisterOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    await handleVerifyOtpAndCreateUser(req, res, parsed.data);
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Doğrulama işlemi sırasında bir hata oluştu." }
    });
  }
});

// 4. Main /register endpoint — seamlessly handles both flows
authRouter.post("/register", registerRateLimiter, async (req, res) => {
  try {
    if (req.body.otp) {
      // Direct registration with OTP verification
      const parsed = verifyRegisterOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
        });
        return;
      }
      await handleVerifyOtpAndCreateUser(req, res, parsed.data);
    } else {
      // Initiating registration: validate fields and send OTP
      const parsed = sendOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
        });
        return;
      }

      const { email, displayName, username, password } = parsed.data;
      const result = await handleSendOtp(email, displayName, username, password);
      res.status(result.status).json(result.body);
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Kayıt işlemi sırasında bir hata oluştu." }
    });
  }
});


authRouter.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    const { identifier, password } = parsed.data;

    const userRecord = await db.select().from(users).where(
      or(eq(users.username, identifier), eq(users.email, identifier))
    ).limit(1);

    const user = userRecord.length > 0 ? userRecord[0] : null;

    // To prevent timing attacks, we always verify a hash.
    // If user is not found, we verify against a dummy hash.
    const dummyHash = "$argon2id$v=19$m=65536,t=3,p=4$R3q+z0x4J4Q4gVvJ8n5Z9g$O5x1/l4zZ3z0x4J4Q4gVvJ8n5Z9gO5x1/l4zZ3z0x4I";
    const hashToVerify = user ? user.passwordHash : dummyHash;

    const isPasswordValid = await argon2.verify(hashToVerify, password).catch(() => false);

    if (!user || !isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Geçersiz e-posta/kullanıcı adı veya şifre." }
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Hesabınız pasif durumdadır." }
      });
      return;
    }

    if (user.twoFactorEnabled) {
      // We need generateTwoFactorToken imported at the top!
      const { generateTwoFactorToken } = await import("../utils/jwt.js");
      const twoFactorToken = generateTwoFactorToken(user.id, user.role);
      res.json({
        success: true,
        data: {
          requiresTwoFactor: true,
          twoFactorToken,
          message: "İki faktörlü doğrulama gerekiyor."
        }
      });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    const tokenHash = await argon2.hash(refreshToken);

    // Detect device info
    const ua = req.headers['user-agent'] || '';
    let browser = "Bilinmeyen Tarayıcı";
    if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome/") || ua.includes("CriOS/")) browser = "Chrome";
    else if (ua.includes("Safari/")) browser = "Safari";

    let os = "Bilinmeyen OS";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

    // Save refresh token hash in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      deviceInfo: ua.substring(0, 200),
      browser,
      os,
      ipAddress: ipAddress.substring(0, 45),
      lastActiveAt: new Date()
    });

    // Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    sendSecurityAlertEmail(user.email, user.username, "Yeni Giriş İşlemi", new Date().toLocaleString('tr-TR'), ua.substring(0,50), os, browser, ipAddress).catch(console.error);
    res.json({
      success: true,
      data: {
        accessToken,
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Giriş işlemi sırasında bir hata oluştu." }
    });
  }
});

authRouter.post("/login/verify-2fa", loginRateLimiter, async (req, res) => {
  try {
    const parsed = verifyTwoFactorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
      return;
    }

    const { token, code, recoveryCode } = parsed.data;

    let decoded;
    try {
      decoded = verifyTwoFactorToken(token);
    } catch (e) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Geçersiz veya süresi dolmuş 2FA tokeni." }
      });
      return;
    }

    const userRecord = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    const user = userRecord.length > 0 ? userRecord[0] : null;

    if (!user || !user.isActive || !user.twoFactorEnabled || !user.twoFactorSecret) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Geçersiz işlem." }
      });
      return;
    }

    const { securityAuditLogs, recoveryCodes } = await import("../../src/db/schema.js");
    let verified = false;
    let usedRecoveryCodeId: number | null = null;

    if (recoveryCode) {
      // Check recovery code
      const codes = await db.select().from(recoveryCodes).where(
        and(eq(recoveryCodes.userId, user.id), eq(recoveryCodes.used, false))
      );
      
      for (const rc of codes) {
        const isValid = await argon2.verify(rc.codeHash, recoveryCode).catch(() => false);
        if (isValid) {
          verified = true;
          usedRecoveryCodeId = rc.id;
          break;
        }
      }

      if (!verified) {
        res.status(400).json({
          success: false,
          error: { code: "INVALID_CODE", message: "Kurtarma kodu geçersiz veya daha önce kullanılmış." }
        });
        return;
      }
    } else if (code) {
      // Check TOTP
      try {
        const secret = decryptString(user.twoFactorSecret);
        verified = authenticator.verify({ token: code, secret });
      } catch (e) {
        verified = false;
      }

      if (!verified) {
        res.status(400).json({
          success: false,
          error: { code: "INVALID_CODE", message: "Doğrulama kodu geçersiz." }
        });
        return;
      }
    }

    // Mark recovery code as used if used
    if (usedRecoveryCodeId) {
      await db.update(recoveryCodes).set({ used: true, usedAt: new Date() }).where(eq(recoveryCodes.id, usedRecoveryCodeId));
      
      // Audit Log
      await db.insert(securityAuditLogs).values({
        userId: user.id,
        action: "2fa_recovery_used",
                metadata: {
          details: "Kullanıcı hesabına kurtarma kodu ile giriş yaptı.",
          ipAddress: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim().substring(0, 45)
        }
      }).catch(console.error);
    }

    // Normal session issuance
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    const tokenHash = await argon2.hash(refreshToken);

    const ua = req.headers['user-agent'] || '';
    let browser = "Bilinmeyen Tarayıcı";
    if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome/") || ua.includes("CriOS/")) browser = "Chrome";
    else if (ua.includes("Safari/")) browser = "Safari";

    let os = "Bilinmeyen OS";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      deviceInfo: ua.substring(0, 200),
      browser,
      os,
      ipAddress: ipAddress.substring(0, 45),
      lastActiveAt: new Date()
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    sendSecurityAlertEmail(user.email, user.username, "Yeni Giriş İşlemi (2FA Onaylı)", new Date().toLocaleString('tr-TR'), ua.substring(0,50), os, browser, ipAddress).catch(console.error);

    res.json({
      success: true,
      data: {
        accessToken,
      }
    });

  } catch (error) {
    console.error("2FA verify error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Doğrulama işlemi sırasında bir hata oluştu." }
    });
  }
});

authRouter.post("/2fa/setup", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userRecord.length === 0 || !userRecord[0].isActive) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Geçersiz işlem." } });
      return;
    }

    if (userRecord[0].twoFactorEnabled) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "İki faktörlü doğrulama zaten aktif." } });
      return;
    }

    const secret = authenticator.generateSecret();
    const encryptedSecret = encryptString(secret);

    await db.update(users).set({ twoFactorSecret: encryptedSecret }).where(eq(users.id, userId));

    const otpauthUrl = authenticator.keyuri(userRecord[0].username, "Genç Sosyal", secret);

    res.json({
      success: true,
      data: {
        secret, // This is only returned once during setup!
        otpauthUrl
      }
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "2FA kurulumu başlatılamadı." }
    });
  }
});

authRouter.post("/2fa/enable", requireAuth, async (req, res) => {
  try {
    const parsed = enableTwoFactorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
      return;
    }

    const userId = req.user!.userId;
    const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userRecord.length === 0 || !userRecord[0].twoFactorSecret || userRecord[0].twoFactorEnabled) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz işlem veya 2FA zaten aktif." } });
      return;
    }

    let secret;
    try {
      secret = decryptString(userRecord[0].twoFactorSecret);
    } catch (e) {
      res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Güvenlik ayarları okunamadı." } });
      return;
    }

    const isValid = authenticator.verify({ token: parsed.data.code, secret });
    if (!isValid) {
      res.status(400).json({ success: false, error: { code: "INVALID_CODE", message: "Doğrulama kodu hatalı." } });
      return;
    }

    const { securityAuditLogs, recoveryCodes } = await import("../../src/db/schema.js");

    // Generate 10 recovery codes
    const newCodes = [];
    const plainCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      plainCodes.push(code);
      const hash = await argon2.hash(code);
      newCodes.push({ userId, codeHash: hash });
    }

    await db.transaction(async (tx) => {
      await tx.update(users).set({ twoFactorEnabled: true }).where(eq(users.id, userId));
      await tx.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId)); // clear any old codes
      await tx.insert(recoveryCodes).values(newCodes);
      
      await tx.insert(securityAuditLogs).values({
        userId: userId,
        action: "2fa_enabled",
                metadata: {
          details: "İki faktörlü doğrulama etkinleştirildi.",
          ipAddress: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim().substring(0, 45)
        }
      }).catch(console.error);
    });

    res.json({
      success: true,
      data: {
        message: "İki faktörlü doğrulama başarıyla etkinleştirildi.",
        recoveryCodes: plainCodes
      }
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "2FA etkinleştirilirken bir hata oluştu." } });
  }
});

authRouter.post("/2fa/disable", requireAuth, async (req, res) => {
  try {
    const parsed = disableTwoFactorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
      return;
    }

    const userId = req.user!.userId;
    const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userRecord.length === 0 || !userRecord[0].twoFactorEnabled) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "2FA aktif değil." } });
      return;
    }

    const isPasswordValid = await argon2.verify(userRecord[0].passwordHash, parsed.data.password).catch(() => false);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, error: { code: "INVALID_PASSWORD", message: "Şifre hatalı." } });
      return;
    }

    let secret;
    try {
      secret = decryptString(userRecord[0].twoFactorSecret!);
    } catch (e) {
      res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Güvenlik ayarları okunamadı." } });
      return;
    }

    const isValid = authenticator.verify({ token: parsed.data.code, secret });
    if (!isValid) {
      res.status(400).json({ success: false, error: { code: "INVALID_CODE", message: "Doğrulama kodu hatalı." } });
      return;
    }

    const { securityAuditLogs, recoveryCodes } = await import("../../src/db/schema.js");

    await db.transaction(async (tx) => {
      await tx.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where(eq(users.id, userId));
      await tx.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId));
      
      await tx.insert(securityAuditLogs).values({
        userId: userId,
        action: "2fa_disabled",
                metadata: {
          details: "İki faktörlü doğrulama devre dışı bırakıldı.",
          ipAddress: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim().substring(0, 45)
        }
      }).catch(console.error);
    });

    res.json({
      success: true,
      data: { message: "İki faktörlü doğrulama devre dışı bırakıldı." }
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "2FA devre dışı bırakılırken bir hata oluştu." } });
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Oturum süresi dolmuş, lütfen tekrar giriş yapın." }
      });
      return;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (e) {
      res.clearCookie("refreshToken");
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Geçersiz oturum." }
      });
      return;
    }

    // Check if token exists and is valid in DB
    const activeTokens = await db.select().from(refreshTokens).where(eq(refreshTokens.userId, decoded.userId));
    
    let matchedTokenId: number | null = null;

    for (const record of activeTokens) {
      if (record.revokedAt) continue;
      if (new Date() > record.expiresAt) continue;

      const isValid = await argon2.verify(record.tokenHash, refreshToken);
      if (isValid) {
        matchedTokenId = record.id;
        break;
      }
    }

    if (!matchedTokenId) {
      res.clearCookie("refreshToken");
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Geçersiz oturum." }
      });
      return;
    }

    // Revoke old token
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, matchedTokenId));

    // Generate new tokens
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (user.length === 0 || !user[0].isActive) {
      res.clearCookie("refreshToken");
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Hesap pasif." }
      });
      return;
    }

    const newAccessToken = generateAccessToken(user[0].id, user[0].role);
    const newRefreshToken = generateRefreshToken(user[0].id, user[0].role);
    const tokenHash = await argon2.hash(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user[0].id,
      tokenHash,
      expiresAt,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Oturum yenilenirken bir hata oluştu." }
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const activeTokens = await db.select().from(refreshTokens).where(eq(refreshTokens.userId, decoded.userId));
        
        for (const record of activeTokens) {
          if (!record.revokedAt) {
            const isValid = await argon2.verify(record.tokenHash, refreshToken);
            if (isValid) {
              await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, record.id));
              break;
            }
          }
        }
      } catch (e) {
        // Ignore verify error on logout
      }
    }

    res.clearCookie("refreshToken");
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Çıkış yapılırken bir hata oluştu." }
    });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const userRecord = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      onboardingCompleted: profiles.onboardingCompleted,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, userId))
    .limit(1);

    if (userRecord.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." }
      });
      return;
    }

    res.json({
      success: true,
      data: userRecord[0]
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Bilgiler alınırken hata oluştu." }
    });
  }
});

authRouter.post("/verify-email", authRateLimiter, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Token gereklidir." } });
    }

    const decoded = verifyEmailToken(token);
    if (decoded.purpose !== "verify_email") {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz token türü." } });
    }

    const userRecord = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    if (userRecord.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kullanıcı bulunamadı." } });
    }

    if (userRecord[0].isVerified) {
      return res.json({ success: true, data: { message: "Hesap zaten doğrulanmış." } });
    }

    await db.update(users).set({ isVerified: true, updatedAt: new Date() }).where(eq(users.id, decoded.userId));

    res.json({ success: true, data: { message: "Hesabınız başarıyla doğrulandı." } });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz veya süresi dolmuş token." } });
  }
});

authRouter.post("/forgot-password", authRateLimiter, async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
    }

    const { email } = parsed.data;
    const userRecord = await db.select({ id: users.id, username: users.username, displayName: profiles.displayName, passwordHash: users.passwordHash })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.email, email))
      .limit(1);

    if (userRecord.length > 0) {
      const user = userRecord[0];
      // Generate a single-use token by appending passwordHash to the secret
      const jwt = require("jsonwebtoken");
      const { getEmailTokenSecret } = await import("../utils/jwt.js");
      const secret = getEmailTokenSecret() + user.passwordHash;
      const resetToken = jwt.sign({ userId: user.id, purpose: "reset_password" }, secret, { expiresIn: "15m" });
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      sendPasswordResetEmail(email, user.displayName || user.username, `${frontendUrl}/reset-password?token=${resetToken}&id=${user.id}`).catch(console.error);
    }

    // Always return success to prevent email enumeration
    res.json({ success: true, data: { message: "Eğer e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi." } });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Sunucu hatası." } });
  }
});

authRouter.post("/reset-password", authRateLimiter, async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } });
    }

    const { token, newPassword } = parsed.data;
    const jwt = require("jsonwebtoken");
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.userId || decoded.purpose !== "reset_password") {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz token türü." } });
    }

    const userRecord = await db.select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userRecord.length === 0) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz kullanıcı." } });
    }

    const { getEmailTokenSecret } = await import("../utils/jwt.js");
    const secret = getEmailTokenSecret() + userRecord[0].passwordHash;
    
    try {
      jwt.verify(token, secret);
    } catch (e) {
      return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz veya kullanılmış token." } });
    }

    const passwordHash = await argon2.hash(newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, decoded.userId));

    // Optional: Revoke all existing refresh tokens
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, decoded.userId));

    res.json({ success: true, data: { message: "Şifreniz başarıyla güncellendi." } });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Geçersiz veya süresi dolmuş token." } });
  }
});

// --- SESSION MANAGEMENT ---

authRouter.get("/sessions", requireAuth, async (req, res) => {
  try {
    const activeTokens = await db.select().from(refreshTokens).where(
      and(
        eq(refreshTokens.userId, req.user!.userId),
        sql`${refreshTokens.revokedAt} IS NULL`,
        sql`${refreshTokens.expiresAt} > NOW()`
      )
    ).orderBy(desc(refreshTokens.lastActiveAt));

    // Get current session token hash if possible
    let currentHash = "";
    const currentToken = req.cookies.refreshToken;
    if (currentToken) {
      // Find which token hash matches
      for (const t of activeTokens) {
        try {
          const isMatch = await argon2.verify(t.tokenHash, currentToken);
          if (isMatch) {
            currentHash = t.tokenHash;
            // Also update lastActiveAt
            await db.update(refreshTokens)
              .set({ lastActiveAt: new Date() })
              .where(eq(refreshTokens.id, t.id));
            t.lastActiveAt = new Date(); // update memory
            break;
          }
        } catch(e) {}
      }
    }

    const sessions = activeTokens.map(t => ({
      id: t.id,
      deviceInfo: t.deviceInfo,
      browser: t.browser,
      os: t.os,
      ipAddress: t.ipAddress?.replace(/\d+\.\d+$/, '***.***'), // mask IP
      createdAt: t.createdAt,
      lastActiveAt: t.lastActiveAt,
      isCurrent: t.tokenHash === currentHash
    }));

    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ success: false, error: { message: "Oturumlar alınamadı." } });
  }
});

authRouter.delete("/sessions/others", requireAuth, async (req, res) => {
  try {
    const currentToken = req.cookies.refreshToken;
    let currentId = null;

    if (currentToken) {
      const activeTokens = await db.select().from(refreshTokens).where(
        and(
          eq(refreshTokens.userId, req.user!.userId),
          sql`${refreshTokens.revokedAt} IS NULL`,
          sql`${refreshTokens.expiresAt} > NOW()`
        )
      );

      for (const t of activeTokens) {
        try {
          if (await argon2.verify(t.tokenHash, currentToken)) {
            currentId = t.id;
            break;
          }
        } catch(e) {}
      }
    }

    if (currentId) {
      await db.update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.userId, req.user!.userId),
            sql`${refreshTokens.id} != ${currentId}`
          )
        );
    } else {
      // if current session not identified, revoke all
      await db.update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.userId, req.user!.userId));
    }

    res.json({ success: true, message: "Diğer oturumlar başarıyla kapatıldı." });
  } catch (error) {
    console.error("Revoke other sessions error:", error);
    res.status(500).json({ success: false, error: { message: "Oturumlar kapatılamadı." } });
  }
});

authRouter.delete("/sessions/:id", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id as string);
    if (isNaN(sessionId)) return res.status(400).json({ success: false, error: { message: "Geçersiz ID" } });

    // IDOR protection: only update if it belongs to req.user!.userId
    const result = await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.id, sessionId),
          eq(refreshTokens.userId, req.user!.userId)
        )
      );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { message: "Oturum bulunamadı veya yetkiniz yok." } });
    }

    res.json({ success: true, message: "Oturum kapatıldı." });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({ success: false, error: { message: "Oturum kapatılamadı." } });
  }
});

