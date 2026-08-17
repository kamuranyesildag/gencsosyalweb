import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Returns a 32-byte key using the secret from process.env.
 */
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error("CRITICAL: ENCRYPTION_KEY is missing in production environment!");
      process.exit(1);
    }
    // Only for local development (not production) if not explicitly provided
    console.warn("WARNING: ENCRYPTION_KEY is missing, using insecure dev fallback.");
  }
  
  const finalSecret = secret || "dev_fallback_secret_do_not_use_in_prod!";
  return crypto.scryptSync(finalSecret, "salt", 32);
}

export function encryptString(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedText
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptString(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
