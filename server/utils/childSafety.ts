import crypto from "crypto";

export interface AgeClassification {
  age: number;
  category: 'UNDER_15' | 'MINOR_15_18' | 'ADULT_18_PLUS';
  isMinor: boolean;
  isPermitted: boolean;
  status: 'REJECTED_UNDERAGE' | 'DECLARED_CHILD' | 'DECLARED_ADULT';
  legalExplanation: string;
}

/**
 * Calculates accurate age from a birth date
 */
export function calculateAge(birthDate: Date | string | null | undefined): number {
  if (!birthDate) return 0;
  const bDate = new Date(birthDate);
  if (isNaN(bDate.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - bDate.getFullYear();
  const m = today.getMonth() - bDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Classifies user age according to 10 Ekim 2026 Sosyal Ağ Sağlayıcı Çocuk Yönetmeliği.
 * IMPORTANT: This represents SELF-DECLARED age classification, NOT official government verification.
 */
export function classifyAge(birthDate: Date | string | null | undefined): AgeClassification {
  const age = calculateAge(birthDate);

  if (age < 15) {
    return {
      age,
      category: 'UNDER_15',
      isMinor: true,
      isPermitted: false,
      status: 'REJECTED_UNDERAGE',
      legalExplanation: '10 Ekim 2026 tarihli Sosyal Ağ Sağlayıcı Yönetmeliği ve 5651 sayılı Kanun Ek Madde 4 uyarınca, 15 yaşını doldurmamış çocuklara sosyal ağ hizmeti sunulamaz.'
    };
  }

  if (age < 18) {
    return {
      age,
      category: 'MINOR_15_18',
      isMinor: true,
      isPermitted: true,
      status: 'DECLARED_CHILD',
      legalExplanation: '15-18 yaş aralığındaki çocuk kullanıcılar için ayrıştırılmış yüksek güvenlikli hizmet (varsayılan gizli hesap, yabancılardan doğrudan mesaj kısıtlaması, takipçi gizliliği ve içerik koruması) uygulanmaktadır.'
    };
  }

  return {
    age,
    category: 'ADULT_18_PLUS',
    isMinor: false,
    isPermitted: true,
    status: 'DECLARED_ADULT',
    legalExplanation: '18 yaşını doldurmuş yetişkin kullanıcı beyanı kaydedilmiştir. Resmî yaş doğrulaması kamu entegrasyonu aşamasındadır.'
  };
}

/**
 * Generates internal application-level cryptographic age token (Tamper-proof HMAC-SHA256).
 * NOTE: This is an internal Genç Sosyal token for session integrity, NOT a substitute for official e-Devlet proof.
 */
export function generateAgeVerificationToken(userId: number, age: number, category: string, customTimestamp?: number): string {
  const secret = process.env.JWT_SECRET || "gencsosyal-age-verification-secret-salt";
  const timestamp = customTimestamp || Date.now();
  const payload = `${userId}:${age}:${category}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `GENC-AGE-V1.${Buffer.from(payload).toString("base64")}.${hmac}`;
}

/**
 * Verifies internal cryptographic age token with signature check, expiration (default 30 days), and user binding.
 */
export function verifyAgeVerificationToken(
  token: string, 
  expectedUserId?: number,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000
): { valid: boolean; userId?: number; age?: number; category?: string; timestamp?: number; error?: string } {
  try {
    const secret = process.env.JWT_SECRET || "gencsosyal-age-verification-secret-salt";
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "GENC-AGE-V1") {
      return { valid: false, error: "MALFORMED_TOKEN_STRUCTURE" };
    }

    const payload = Buffer.from(parts[1], "base64").toString("utf-8");
    const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expectedHmac))) {
      return { valid: false, error: "INVALID_SIGNATURE" };
    }

    const [uIdStr, ageStr, category, tsStr] = payload.split(":");
    const parsedUserId = parseInt(uIdStr);
    const parsedAge = parseInt(ageStr);
    const parsedTimestamp = tsStr ? parseInt(tsStr) : 0;

    // 1. Expiration check
    if (parsedTimestamp > 0 && Date.now() - parsedTimestamp > maxAgeMs) {
      return { valid: false, error: "TOKEN_EXPIRED" };
    }

    // 2. Bound User ID check
    if (expectedUserId !== undefined && parsedUserId !== expectedUserId) {
      return { valid: false, error: "USER_MISMATCH" };
    }

    return {
      valid: true,
      userId: parsedUserId,
      age: parsedAge,
      category,
      timestamp: parsedTimestamp
    };
  } catch {
    return { valid: false, error: "DECODE_ERROR" };
  }
}

/**
 * Checks whether current local time in Turkey (UTC+3) is within night hours (22:00 - 06:00)
 * Digital wellbeing recommendation for minor accounts
 */
export function isDigitalWellbeingNightHours(): boolean {
  const now = new Date();
  // Get Turkey hours (UTC+3)
  const utcHours = now.getUTCHours();
  const trHours = (utcHours + 3) % 24;
  return trHours >= 22 || trHours < 6;
}

/**
 * KVKK-safe IP hash for audit logs
 */
export function hashIpForAudit(rawIp: string | undefined): string {
  if (!rawIp) return "UNKNOWN_IP";
  const salt = process.env.JWT_SECRET?.substring(0, 8) || "salt-gs";
  return crypto.createHash("sha256").update(`${rawIp}:${salt}`).digest("hex");
}
