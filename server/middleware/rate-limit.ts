import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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

