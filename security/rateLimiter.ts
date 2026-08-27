/**
 * TBS II — Rate Limiter for Cloudflare Workers / Next.js Edge
 * ===========================================================
 * Su dung D1 hoac KV de luu counter (production).
 * Fallback: in-memory Map (dev only).
 */

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

// In-memory store (DEV ONLY — cleared on cold start)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (now > entry.resetAt) memoryStore.delete(key);
  }
}, 60_000);

export async function rateLimiter(
  request: Request,
  config: RateLimitConfig,
  env?: { RATE_LIMIT_KV?: KVNamespace; DB?: D1Database }
): Promise<RateLimitResult> {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';

  const path = new URL(request.url).pathname;
  const key = `${config.keyPrefix || 'rl'}:${ip}:${path}`;

  // === Production: D1-based ===
  if (env?.DB) {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - config.windowSeconds;

    const { count } = await env.DB
      .prepare(
        `SELECT COUNT(*) as count FROM rate_limits
         WHERE key = ? AND timestamp > ?`
      )
      .bind(key, cutoff)
      .first<{ count: number }>() || { count: 0 };

    if (count >= config.maxRequests) {
      const oldest = await env.DB
        .prepare(
          `SELECT MIN(timestamp) as ts FROM rate_limits
           WHERE key = ? AND timestamp > ?`
        )
        .bind(key, cutoff)
        .first<{ ts: number }>();

      const retryAfter = (oldest?.ts || now) + config.windowSeconds - now + 1;
      return { allowed: false, retryAfter: Math.max(1, retryAfter) };
    }

    await env.DB
      .prepare(`INSERT INTO rate_limits (key, timestamp) VALUES (?, ?)`)
      .bind(key, now)
      .run();

    return { allowed: true, retryAfter: 0 };
  }

  // === Production: KV-based (less precise but simpler) ===
  if (env?.RATE_LIMIT_KV) {
    // Implementation depends on KV structure
    // KV has eventual consistency — D1 is preferred
  }

  // === Dev: In-memory fallback ===
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

// === Pre-configured limiters ===
export const loginLimiter = (request: Request, env?: any) =>
  rateLimiter(request, { maxRequests: 10, windowSeconds: 60, keyPrefix: 'login' }, env);

export const otpLimiter = (request: Request, env?: any) =>
  rateLimiter(request, { maxRequests: 5, windowSeconds: 300, keyPrefix: 'otp' }, env);

export const reportFaultLimiter = (request: Request, env?: any) =>
  rateLimiter(request, { maxRequests: 30, windowSeconds: 60, keyPrefix: 'report' }, env);

export const apiLimiter = (request: Request, env?: any) =>
  rateLimiter(request, { maxRequests: 100, windowSeconds: 60, keyPrefix: 'api' }, env);
