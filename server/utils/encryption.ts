import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

function getSecret(): string {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: ENCRYPTION_KEY is required in production environment.");
    }
    console.warn("WARNING: ENCRYPTION_KEY ayarlı değil, izole bir fallback anahtar kullanılıyor - production için önerilmez.");
    return "isolated_dev_fallback_secret_only_for_local_development";
  }
  return secret;
}

function deriveKey(salt: Buffer | string): Buffer {
  return crypto.scryptSync(getSecret(), salt, 32);
}

export function encryptString(text: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  
  // Format: salt:iv:authTag:encryptedText
  return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptString(encryptedText: string): string {
  const parts = encryptedText.split(":");
  let key: Buffer;
  let iv: Buffer;
  let authTag: Buffer;
  let encrypted: string;

  if (parts.length === 4) {
    const salt = Buffer.from(parts[0], "hex");
    iv = Buffer.from(parts[1], "hex");
    authTag = Buffer.from(parts[2], "hex");
    encrypted = parts[3];
    key = deriveKey(salt);
  } else if (parts.length === 3) {
    // Backward compatibility for legacy 3-part format
    iv = Buffer.from(parts[0], "hex");
    authTag = Buffer.from(parts[1], "hex");
    encrypted = parts[2];
    key = deriveKey(process.env.ENCRYPTION_SALT || "salt");
  } else {
    throw new Error("Invalid encrypted text format");
  }

  if (authTag.length !== TAG_LENGTH) {
    throw new Error("Invalid authentication tag length");
  }
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
