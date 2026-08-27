"""
TBS II — Security Module (Runtime)
===================================
Lop bao mat bao quanh toan bo he thong.
KHONG sua logic nghiep vu cua Antigravity — chi them lop bao ve.

Modules:
  - auth_middleware  : JWT + RBAC dependency injection cho FastAPI
  - rate_limiter     : Rate limiting nang cao (Redis-ready, sliding window)
  - validation_schemas : Pydantic/Zod-style schema validation
  - upload_guard     : File upload bao mat (size, MIME, malware scan stub)
  - sanitizer        : XSS/HTML sanitizer cho BI dashboard & response
  - rag_guard        : Prompt injection filter + department scope limiter
"""

__version__ = "1.0.0"
__author__ = "TBS II Security Team (claude-deepseek)"
