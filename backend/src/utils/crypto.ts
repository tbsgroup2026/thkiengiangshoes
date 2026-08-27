import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LEN = 32; // 256 bits
const DIGEST = "sha256";

/**
 * Hash a password using PBKDF2-HMAC-SHA256 with a 16-byte salt.
 * Returns a string formatted as pbkdf2_sha256$iterations$saltHex$hashHex
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
  return `pbkdf2_sha256$${ITERATIONS}$${salt}$${hash}`;
}

/**
 * Verify a password against a stored PBKDF2 hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
      return false;
    }
    
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];
    
    const hash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST).toString("hex");
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
  } catch (error) {
    return false;
  }
}

/**
 * Validates password complexity: minimum 8 characters, at least 1 uppercase,
 * 1 lowercase, 1 digit, and 1 special symbol.
 */
export function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpperCase && hasLowerCase && hasDigit && hasSpecial;
}
