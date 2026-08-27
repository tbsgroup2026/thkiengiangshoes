# TBS II — Security Module

Lop bao mat runtime cho du an TBS II (FastAPI backend + Next.js web + Flutter mobile).

## Cau truc

```
security/
├── __init__.py              # Python package init
├── README.md                # File nay
├── auth_middleware.py        # JWT + RBAC (FastAPI dependency injection)
├── rate_limiter.py           # Rate limiter sliding-window (Python)
├── rateLimiter.ts            # Rate limiter cho Next.js/Cloudflare Workers
├── validation_schemas.py     # Input validation (Pydantic-style)
├── upload_guard.py           # File upload security (size, MIME, malware)
├── sanitizer.py              # XSS prevention cho BI dashboard (Python)
├── sanitizer.ts              # XSS prevention cho Next.js (TypeScript)
├── rag_guard.py              # Prompt injection filter + RAG scope limiter
└── firebaseRules/
    ├── README.md             # Huong dan trien khai Firebase rules
    ├── firestore.rules       # Firestore security rules (least privilege)
    └── storage.rules         # Firebase Storage rules
```

## Tich hop vao backend (FastAPI)

### 1. Auth middleware
```python
from security.auth_middleware import require_permission

@router.get("/hr/employees")
def get_employees(
    current_user = Depends(require_permission(["hr:read"])),
    db: Session = Depends(get_db)
):
    ...
```

### 2. Rate limiter
```python
from security.rate_limiter import auth_limiter

@router.post("/auth/login")
def login(req: LoginRequest, request: Request, ...):
    client_ip = get_client_ip(request)
    allowed, retry = auth_limiter.check(f"login:{client_ip}")
    if not allowed:
        raise HTTPException(429, detail=f"Thu lai sau {retry}s")
```

### 3. Validation
```python
from security.validation_schemas import validate_incident_report

result = validate_incident_report(
    machine_id=req.machine_id,
    description=req.description,
    priority=req.priority
)
if not result:
    raise HTTPException(400, detail="; ".join(result.errors))
```

### 4. Upload guard
```python
from security.upload_guard import get_qr_upload_guard

guard = get_qr_upload_guard()
guard.validate(file)
await guard.validate_after_read(file)
```

### 5. Sanitizer
```python
from security.sanitizer import sanitize_dashboard_data

safe = sanitize_dashboard_data(user_input)
```

### 6. RAG guard
```python
from security.rag_guard import RagGuard

guard = RagGuard()
if guard.is_attack(user_input=prompt):
    raise HTTPException(400, "Invalid prompt")
clean = guard.filter(prompt)
```

## Tich hop vao web (Next.js)

```typescript
import { sanitizeDashboardData } from '../security/sanitizer';
import { loginLimiter } from '../security/rateLimiter';

// API route
export async function POST(request: Request) {
  const { allowed, retryAfter } = await loginLimiter(request);
  if (!allowed) {
    return Response.json({ error: 'Rate limited' }, {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) }
    });
  }
  // ...
}
```

## Tich hop vao mobile (Flutter)

Firebase rules duoc deploy len Firebase console. Flutter app khong can thay doi code —
rules duoc ap dung server-side. Dam bao custom claims duoc set dung khi tao user.
