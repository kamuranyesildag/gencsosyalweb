import rateLimit from "express-rate-limit";

export const standardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  keyGenerator: (req) => (req.headers["x-forwarded-for"] as string || req.ip as string),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." } }
});

export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // Uploads and post creations should be limited to 15 per minute
  keyGenerator: (req) => (req.headers["x-forwarded-for"] as string || req.ip as string),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "İşlem sınırına ulaştınız. Biraz bekleyip tekrar deneyin." } }
});


export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req.headers["x-forwarded-for"] as string || req.ip as string),
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => (req.headers["x-forwarded-for"] as string || req.ip as string),
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour per IP
  keyGenerator: (req) => (req.headers["x-forwarded-for"] as string || req.ip as string),
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Aynı IP adresinden çok fazla hesap açma denemesi yapıldı. Lütfen daha sonra tekrar deneyin."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpSendRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, // max 6 OTP requests per 15 minutes per IP
  keyGenerator: (req) => (req.headers["x-forwarded-for"] as string || req.ip as string),
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Çok fazla doğrulama kodu talep ettiniz. Lütfen 15 dakika sonra tekrar deneyin."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 attempts
  keyGenerator: (req) => (req.headers["x-forwarded-for"] as string || req.ip as string),
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Çok fazla kod doğrulama denemesi yaptınız. Lütfen daha sonra tekrar deneyin."
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

