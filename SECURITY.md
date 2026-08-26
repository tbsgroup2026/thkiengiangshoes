# SECURITY POLICY & GUIDELINES – TBS KIÊN GIANG SHOES KAIZEN

## Security Standards

1. **Secret & Credential Management**:
   - Environment variables, secrets, Cloudflare tokens, and private keys MUST NOT be committed to git.
   - Verified via `.gitignore` and pre-commit checks.

2. **Authentication & JWT Verification**:
   - All authenticated API routes check `Authorization: Bearer <token>` or `tbs_token` cookie.
   - JWT tokens signed with `HS256` using secure `JWT_SECRET`.

3. **Database Access Control**:
   - D1 Queries use parameterized bindings (`env.DB.prepare(...).bind(...)`) to prevent SQL Injection.

4. **Security Headers**:
   - Strict CORS policy and security headers set in `_worker.js`.
   - RFC 9116 security.txt available at `/.well-known/security.txt`.
