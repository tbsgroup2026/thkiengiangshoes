"""
TBS II — Rate Limiter (Production-Ready)
========================================
Rate limiter sliding-window co the swap sang Redis trong production.
Hien tai dung in-memory dict + thread-safe lock.

Tich hop san vao main.py, khong can thay the middleware co san.
"""

import time
import threading
from collections import defaultdict
from typing import Optional, Tuple


class SlidingWindowRateLimiter:
    """
    Sliding window rate limiter — chinh xac hon fixed window.

    Usage:
      limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)
      allowed, retry_after = limiter.check("client_ip:endpoint")
      if not allowed:
          raise HTTPException(429, detail=f"Rate limited, retry after {retry_after}s")
    """

    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._store: dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def _cleanup(self, key: str, now: float):
        """Xoa timestamps cu hon window."""
        cutoff = now - self.window_seconds
        self._store[key] = [t for t in self._store[key] if t > cutoff]
        if not self._store[key]:
            del self._store[key]

    def check(self, key: str) -> Tuple[bool, int]:
        """
        Kiem tra key co vuot rate limit khong.
        Tra ve: (allowed, retry_after_seconds)
        """
        now = time.time()
        with self._lock:
            self._cleanup(key, now)

            timestamps = self._store[key]

            if len(timestamps) < self.max_requests:
                timestamps.append(now)
                self._store[key] = timestamps
                return True, 0

            # Rate limited
            oldest = timestamps[0]
            retry_after = int(self.window_seconds - (now - oldest)) + 1
            return False, max(1, retry_after)

    def reset(self, key: str):
        """Reset counter cho key cu the."""
        with self._lock:
            self._store.pop(key, None)


# ============================================================
# PRE-CONFIGURED LIMITERS
# ============================================================

# Login/OTP endpoints — rat chat che
auth_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)

# QR scan / report fault tu mobile app
report_fault_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60)

# API chung — vua phai
api_limiter = SlidingWindowRateLimiter(max_requests=100, window_seconds=60)

# WebSocket connections
ws_limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=60)


# ============================================================
# FASTAPI MIDDLEWARE (DUNG SONG SONG VOI MIDDLEWARE CO SAN)
# ============================================================

# NOTE: main.py da co global rate limiter middleware.
# Module nay cung cap limiter chi tiet hon cho tung endpoint.
# Su dung nhu dependency injection:

"""
from security.rate_limiter import auth_limiter

@router.post("/api/v1/auth/login")
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)
    allowed, retry_after = auth_limiter.check(f"login:{client_ip}")
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Qua nhieu lan thu. Vui long doi {retry_after} giay.",
            headers={"Retry-After": str(retry_after)}
        )
    ...

@router.post("/api/v1/incidents/report")
def report_fault(req: IncidentCreate, request: Request, ...):
    client_ip = get_client_ip(request)
    allowed, retry_after = report_fault_limiter.check(f"report:{client_ip}")
    if not allowed:
        raise HTTPException(429, detail=f"Qua nhieu bao cao. Thu lai sau {retry_after}s.")
    ...
"""


# ============================================================
# CLOUDFLARE WORKERS KV RATE LIMITER (cho Next.js web app)
# ============================================================

# NOTE: Day la JavaScript stub — dat trong security/rateLimiter.js
# cho Cloudflare Workers runtime cua Next.js app.

RATE_LIMITER_JS_STUB = """
// Cloudflare Workers / Next.js Edge Runtime Rate Limiter
// Su dung: import { rateLimiter } from '../security/rateLimiter';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  keyPrefix?: string;
}

export async function rateLimiter(
  request: Request,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfter: number }> {
  const ip = request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')
    || '127.0.0.1';

  const key = `${config.keyPrefix || 'rl'}:${ip}`;

  // Su dung Workers KV hoac D1 de luu counter
  // Day la placeholder — can D1/KV binding trong production

  // Fallback: in-memory (chi dung cho dev)
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `${key}:${Math.floor(now / config.windowSeconds)}`;

  // NOTE: Trong production, implement voi D1:
  //   const count = await env.DB.prepare(
  //     'SELECT COUNT(*) as c FROM rate_limits WHERE key = ? AND timestamp > ?'
  //   ).bind(windowKey, now - config.windowSeconds).first();

  return { allowed: true, retryAfter: 0 };
}
"""
