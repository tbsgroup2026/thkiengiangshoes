# Authentication Guard Implementation for /work/kaizen

## Overview

This document describes the authentication guard system implemented for the `/work/kaizen` routes on the TBS II platform (deployed at `https://vpchuoiskechers.tbsgroup2026.workers.dev`).

## Requirements

✅ **Implemented**:
1. Route `/work/kaizen` and all sub-routes → **REQUIRE authentication**
2. Route `/work/kaizen/register` → **PUBLIC** (exception to rule #1)
3. Redirect unauthenticated users to login with original URL preserved
4. Maintain consistency with existing auth architecture (JWT-based)
5. Easy-to-maintain public routes list (array-based configuration)
6. Comprehensive test coverage

## Architecture

### 1. Authentication Mechanism

**Location**: `src/proxy.ts` (Next.js middleware for request interception)

**Token Storage**:
- Primary: Cookie `tbs_token`
- Secondary: Authorization header (Bearer token)

**Verification**:
- Uses `verifyToken()` from `src/lib/auth.ts`
- JWT verification with HS256 algorithm
- 24-hour token expiration

### 2. Protected Path Configuration

**File**: `src/proxy.ts` (lines 15-26)

```typescript
/**
 * Public routes that do NOT require authentication
 * This list takes precedence over path-based auth requirements
 */
const PUBLIC_PATHS = [
  '/work/kaizen/register', // Public kaizen registration (open form, no login needed)
];

/**
 * Routes that REQUIRE authentication with redirect on failure
 */
const PROTECTED_PATHS = [
  { path: '/work/kaizen', redirect: true }, // Protect /work/kaizen & all sub-routes
];
```

**How to Add Routes**:
- Add public exceptions to `PUBLIC_PATHS` array
- Add protected routes to `PROTECTED_PATHS` array
- Order matters: **PUBLIC_PATHS is checked BEFORE PROTECTED_PATHS**

### 3. Middleware Flow

```
Request arrives
    ↓
Is it a public website route? (/about, /news, etc.) → Allow
    ↓ No
Is it a public path exception? (/work/kaizen/register) → Allow
    ↓ No
Is it a protected path? (/work/kaizen*) → Check token
    ↓
Has valid token? → Allow
    ↓ No
Redirect to /login?redirect_uri=<original_path>
```

### 4. Helper Functions

**`isProtectedPath(pathname: string): boolean`**
- Returns true if pathname matches any pattern in PROTECTED_PATHS
- Supports exact match: `/work/kaizen`
- Supports prefix match: `/work/kaizen/proposal/123`

**`isPublicPath(pathname: string): boolean`**
- Returns true if pathname matches any pattern in PUBLIC_PATHS
- Supports exact match: `/work/kaizen/register`
- Supports prefix match: `/work/kaizen/register/success`

## Implementation Details

### Protected Behavior

| Route | Auth Required | Behavior |
|-------|---------------|----------|
| `/work/kaizen` | ✅ YES | Redirect to login if not authenticated |
| `/work/kaizen/proposal/123` | ✅ YES | Redirect to login if not authenticated |
| `/work/kaizen/dashboard` | ✅ YES | Redirect to login if not authenticated |
| `/work/kaizen/register` | ❌ NO | Allow public access |
| `/work/kaizen/register/success` | ❌ NO | Allow public access |

### Redirect Logic

When an unauthenticated user accesses `/work/kaizen`:

```
Before: GET /work/kaizen (no token)
After:  GET /login?redirect_uri=/work/kaizen
```

The `redirect_uri` query parameter preserves the original URL for post-login redirect (must be implemented on the login page).

### Error Responses

**API Routes** (if accessing `/api/work/kaizen/*`):
- Status: `401 Unauthorized`
- Body: `{ error: 'Unauthorized', message: 'Authentication required' }`

**UI Routes** (standard pages):
- Status: `302 Found`
- Redirect to `/login?redirect_uri=<path>`

## Testing

### Running Tests

```bash
cd web
npm test -- __tests__/kaizen-auth.test.ts
```

### Test Coverage

The test suite (`src/__tests__/kaizen-auth.test.ts`) includes:

1. **Token Verification Tests**
   - Valid token acceptance
   - Invalid token rejection
   - Expired token rejection

2. **Configuration Tests**
   - PUBLIC_PATHS correctness
   - PROTECTED_PATHS correctness
   - No overlap between protected/public

3. **Path Detection Tests**
   - /work/kaizen protection
   - /work/kaizen/* sub-route protection
   - /work/kaizen/register exception
   - Other routes unaffected

4. **Redirect Logic Tests**
   - redirect_uri parameter formation
   - Nested route preservation
   - URL encoding correctness

5. **Edge Case Tests**
   - Sub-paths of /work/kaizen/register allowed
   - Boundary conditions (/work/kaizen/registerXXX not allowed)
   - Trailing slash handling

6. **Integration Scenarios**
   - Scenario 1: Unauth → /work/kaizen → 302 to /login
   - Scenario 2: Unauth → /work/kaizen/register → 200 OK
   - Scenario 3: Auth → /work/kaizen → 200 OK
   - Scenario 4: Auth → /work/kaizen/register → 200 OK
   - Scenario 5: Auth → /work/kaizen/proposal/123 → 200 OK
   - Scenario 6: Invalid token → /work/kaizen → 302 to /login

### Expected Test Results

```
✓ Token Verification
  ✓ should verify a valid token
  ✓ should reject an invalid token
  ✓ should reject an expired token

✓ Public Paths Configuration
  ✓ should define /work/kaizen/register as public
  ✓ should NOT include /work/kaizen in public paths

✓ Protected Path Detection
  ✓ should protect /work/kaizen
  ✓ should protect /work/kaizen/xxx sub-routes
  ✓ should mark /work/kaizen/register as public
  ✓ should allow /work/kaizen/register as exception
  ✓ should not protect other /work routes

✓ Redirect Logic
  ✓ should redirect to /login with redirect_uri param
  ✓ should preserve redirect_uri for nested routes

✓ Edge Cases
  ✓ should allow sub-paths of /work/kaizen/register
  ✓ should distinguish between /work/kaizen/register and /work/kaizen/registerXXX
  ✓ should protect /work/kaizen regardless of trailing content

✓ Middleware Integration Scenarios (6 scenarios)
```

## Login Page Implementation (TODO)

The login page should handle the `redirect_uri` query parameter:

**Example** (`src/app/login/page.tsx`):
```typescript
'use client';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUri = searchParams.get('redirect_uri') || '/work';

  const handleLoginSuccess = (token: string) => {
    // Save token to cookie
    document.cookie = `tbs_token=${token}; path=/; secure; samesite=strict`;
    // Redirect to original path
    router.push(redirectUri);
  };

  return (
    <div>
      {/* Login form */}
      {redirectUri && (
        <p className="text-gray-500 text-sm">
          You'll be redirected to: {redirectUri}
        </p>
      )}
    </div>
  );
}
```

## Configuration Maintenance

### Adding a New Public Route

To make another `/work/kaizen/*` route public, update `PUBLIC_PATHS`:

```typescript
const PUBLIC_PATHS = [
  '/work/kaizen/register',           // Existing
  '/work/kaizen/new-public-route',   // Add this
];
```

### Adding a New Protected Path

To protect a different path, update `PROTECTED_PATHS`:

```typescript
const PROTECTED_PATHS = [
  { path: '/work/kaizen', redirect: true },    // Existing
  { path: '/admin/sensitive', redirect: true }, // Add this
];
```

### Path Matching Logic

- **Exact match**: `/work/kaizen` matches only `/work/kaizen`
- **Prefix match**: `/work/kaizen/` prefix matches `/work/kaizen/anything`
- **Combined**: Both exact and prefix patterns supported

## Security Considerations

1. **Token Verification**: Every protected route request verifies the JWT signature
2. **Token Blacklist**: Redis blacklist checked for revoked tokens (logout, password change)
3. **CORS Protection**: Enforced for token-bearing requests
4. **Secure Cookies**: `tbs_token` cookie uses secure + samesite flags
5. **No Token in URL**: Redirect URI is never exposed in sensitive contexts

## Performance

- **Zero Database Hits**: JWT verification uses only cryptographic operations
- **Redis Cache Hit**: Blacklist check (~1ms) prevents revoked token reuse
- **Fast Path Matching**: Simple string prefix comparison (O(n) where n = path count)

## Troubleshooting

### Issue: User redirected to login even with valid token

**Check**:
1. Is token cookie set correctly? (`document.cookie` shows `tbs_token=...`)
2. Is JWT_SECRET environment variable same on workers and local?
3. Has token expired? (24-hour expiration)
4. Is token in Redis blacklist? (check after logout)

### Issue: /work/kaizen/register is blocked

**Check**:
1. Ensure `/work/kaizen/register` is in `PUBLIC_PATHS` array
2. PUBLIC_PATHS check runs BEFORE PROTECTED_PATHS check
3. No typos in path (case-sensitive)

### Issue: Sub-routes like /work/kaizen/proposal/123 not protected

**Check**:
1. Is `/work/kaizen` in `PROTECTED_PATHS`?
2. Path matching should use prefix logic: `pathname.startsWith(path + '/')`
3. Verify `isProtectedPath()` function is correctly called

## Related Files

- **Authentication Core**: `src/lib/auth.ts`
- **Middleware**: `src/proxy.ts`
- **Tests**: `src/__tests__/kaizen-auth.test.ts`
- **Backend Auth**: `backend/src/middleware/auth.ts` (Express.js)
- **Backend Routes**: `backend/src/routes/auth.ts` (Login endpoint)

## Future Enhancements

1. **Per-Route Permissions**: Add role-based access control (RBAC) to specific kaizen views
2. **Dynamic PUBLIC_PATHS**: Load from database for runtime configuration
3. **Audit Logging**: Log all /work/kaizen access attempts
4. **Rate Limiting**: Prevent brute-force registration attempts on `/work/kaizen/register`
5. **Refresh Token**: Implement token refresh without re-login
6. **Multi-Factor Auth**: Add TOTP/SMS verification for admin routes

---

**Last Updated**: August 2026  
**Framework**: Next.js 16.2 + Express.js  
**Auth Method**: JWT (HS256) + Redis Blacklist  
**Deployment**: Cloudflare Workers  
