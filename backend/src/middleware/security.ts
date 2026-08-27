import { Request, Response, NextFunction } from "express";
import { redis } from "../utils/redis";
import { broadcast } from "../utils/websocket";
import prisma from "../utils/prisma";

// Fallback in-memory rate-limit storage
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const loginRateLimits = new Map<string, RateLimitRecord>();
const apiRateLimits = new Map<string, RateLimitRecord>();

/**
 * Log security alerts to Database (TicketLog) and broadcast to administrators
 */
export async function logSecurityAlert(ip: string, action: string, comment: string) {
  const alertData = {
    ip,
    action,
    comment,
    timestamp: new Date()
  };
  
  // 1. WebSocket Broadcast to admin channels
  broadcast("security-alert", alertData);
  
  // 2. Console security warning
  console.warn(`[SECURITY_ALERT] [${action}] IP: ${ip}. ${comment}`);
}

/**
 * Record a failed login attempt to block brute force candidates
 */
export async function recordFailedLogin(ip: string) {
  const key = `failedlogin:ip:${ip}`;
  try {
    if (redis && redis.status === "ready") {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 300); // 5 minutes window
      }
      if (count >= 5) {
        await logSecurityAlert(ip, "SUSPECT_BRUTE_FORCE", "Suspicious login failure rate: 5+ errors in 5 mins.");
      }
    }
  } catch (e) {}
}

/**
 * Reset failed attempts when a user successfully logs in
 */
export async function clearFailedLogin(ip: string) {
  const key = `failedlogin:ip:${ip}`;
  try {
    if (redis && redis.status === "ready") {
      await redis.del(key);
    }
  } catch (e) {}
}

/**
 * Helper to perform Redis rate limits increments
 */
async function checkRedisRateLimit(key: string, limit: number, windowSecs: number) {
  if (!redis || redis.status !== "ready") {
    throw new Error("Redis connection offline");
  }
  const count = await redis.incr(key);
  let ttl = windowSecs;
  if (count === 1) {
    await redis.expire(key, windowSecs);
  } else {
    ttl = await redis.ttl(key);
    if (ttl < 0) ttl = windowSecs;
  }
  return { allowed: count <= limit, count, ttl };
}

/**
 * Middleware to restrict direct access to text files, logs, environment variables and configuration files.
 */
export function blockSensitiveFiles(req: Request, res: Response, next: NextFunction) {
  const path = req.path.toLowerCase();
  const blockedExtensions = [
    ".txt",
    ".log",
    ".env",
    ".yml",
    ".yaml",
    ".bak",
    ".conf",
    ".ini",
    ".sql"
  ];
  
  const isBlocked = blockedExtensions.some(ext => path.endsWith(ext) || path.includes(ext + "?"));
  if (isBlocked) {
    return res.status(403).json({
      error: "Access Denied",
      message: "Direct access to text/log documents is restricted for security reasons."
    });
  }
  next();
}

/**
 * Hardened HTTP Security Headers Middleware.
 */
export function setSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' ws: wss:;"
  );
  next();
}

/**
 * Rate Limiter for authentication endpoints to prevent brute-force attacks.
 * Limit: 10 attempts per minute per IP address.
 */
export async function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
  const now = Date.now();
  const limitWindowMs = 60 * 1000; // 1 minute
  const maxAttempts = 10;
  const key = `ratelimit:auth:ip:${ip}`;

  try {
    const { allowed, ttl } = await checkRedisRateLimit(key, maxAttempts, 60);
    if (!allowed) {
      await logSecurityAlert(ip, "LOGIN_RATE_LIMIT_HIT", `Brute-force window breached. Blocked for ${ttl}s.`);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Too many login attempts. Please try again after ${ttl} seconds.`
      });
    }
    return next();
  } catch (err) {
    // In-memory fallback
    const record = loginRateLimits.get(ip);
    if (!record) {
      loginRateLimits.set(ip, { count: 1, resetTime: now + limitWindowMs });
      return next();
    }
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + limitWindowMs;
      return next();
    }
    record.count++;
    if (record.count > maxAttempts) {
      const waitTimeSeconds = Math.ceil((record.resetTime - now) / 1000);
      await logSecurityAlert(ip, "LOGIN_RATE_LIMIT_HIT_FALLBACK", `Brute-force window hit (in-memory).`);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Too many login attempts. Please try again after ${waitTimeSeconds} seconds.`
      });
    }
    next();
  }
}

/**
 * General API Rate Limiter (Max 100 requests per 15 minutes per IP address)
 */
export async function globalRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
  const now = Date.now();
  const limitWindowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 100;
  const key = `ratelimit:global:ip:${ip}`;

  try {
    const { allowed, ttl } = await checkRedisRateLimit(key, maxAttempts, 900);
    if (!allowed) {
      await logSecurityAlert(ip, "GLOBAL_RATE_LIMIT_HIT", `General API threshold crossed. Hold for ${ttl}s.`);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Too many API requests. Please try again after ${Math.ceil(ttl / 60)} minutes.`
      });
    }
    return next();
  } catch (err) {
    // In-memory fallback
    const record = apiRateLimits.get(ip);
    if (!record) {
      apiRateLimits.set(ip, { count: 1, resetTime: now + limitWindowMs });
      return next();
    }
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + limitWindowMs;
      return next();
    }
    record.count++;
    if (record.count > maxAttempts) {
      const waitMinutes = Math.ceil((record.resetTime - now) / (60 * 1000));
      await logSecurityAlert(ip, "GLOBAL_RATE_LIMIT_HIT_FALLBACK", `General API rate limit hit (in-memory).`);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Too many API requests. Please try again after ${waitMinutes} minutes.`
      });
    }
    next();
  }
}

function cleanHTML(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return cleanHTML(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      cleaned[key] = sanitizeObject(obj[key]);
    }
    return cleaned;
  }
  return obj;
}

/**
 * Global Input Sanitization Middleware (Anti-XSS protection)
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
}
