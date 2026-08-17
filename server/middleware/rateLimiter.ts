import rateLimit from "express-rate-limit";

export const standardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." } }
});

export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // Uploads and post creations should be limited to 15 per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "İşlem sınırına ulaştınız. Biraz bekleyip tekrar deneyin." } }
});
