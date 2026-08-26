# Kaizen Auth Guard - Quick Reference Card

## 🚀 One-Minute Overview

**Problem**: `/work/kaizen` needs authentication, but `/work/kaizen/register` should be public.

**Solution**: Middleware in `web/src/proxy.ts` checks route patterns before serving requests.

**Status**: ✅ Live and tested

---

## ⚡ Quick Commands

```bash
# Run tests
npm test -- __tests__/kaizen-auth.test.ts

# Build
npm run build

# View implementation
cat web/src/proxy.ts | grep -A 20 "PUBLIC_PATHS"
```

---

## 📋 Configuration Cheat Sheet

### File: `web/src/proxy.ts`

#### Add a Public Route

```typescript
const PUBLIC_PATHS = [
  '/work/kaizen/register',     // Existing
  '/your/new/route',           // ← Add here
];
```

#### Add a Protected Route

```typescript
const PROTECTED_PATHS = [
  { path: '/work/kaizen', redirect: true },  // Existing
  { path: '/your/new/path', redirect: true },// ← Add here
];
```

#### For API Routes (respond with 401 instead of redirect)

```typescript
const PROTECTED_PATHS = [
  { path: '/api/secure/endpoint', redirect: false },  // API
  { path: '/work/secure', redirect: true },           // UI
];
```

---

## 🔍 Path Matching Reference

```typescript
// These WILL be protected if /work/kaizen is in PROTECTED_PATHS:
✓ /work/kaizen
✓ /work/kaizen/
✓ /work/kaizen/anything
✓ /work/kaizen/foo/bar/baz

// These will NOT be protected:
✗ /work/ci
✗ /work
✗ /workkaizen (no slash)

// These WILL be public if /work/kaizen/register is in PUBLIC_PATHS:
✓ /work/kaizen/register
✓ /work/kaizen/register/success
✓ /work/kaizen/register/confirm

// These will NOT be public:
✗ /work/kaizen
✗ /work/kaizen/registerForm (no slash)
```

---

## 🧪 Test Everything

```bash
cd web

# Run specific test file
npm test -- __tests__/kaizen-auth.test.ts

# Run with verbose output
npm test -- __tests__/kaizen-auth.test.ts --verbose

# Run with coverage
npm test -- __tests__/kaizen-auth.test.ts --coverage

# Build to catch TypeScript errors
npm run build
```

**Expected**: 21/21 tests passing ✓

---

## 🔒 Security Checklist

- [ ] JWT_SECRET set on both frontend and backend
- [ ] `/work/kaizen/register` in PUBLIC_PATHS if it should be public
- [ ] `/work/kaizen` in PROTECTED_PATHS to require auth
- [ ] Cookies use `secure` + `samesite=strict` flags
- [ ] Token verification runs on every request
- [ ] Redis blacklist checked for revoked tokens
- [ ] HTTPS enforced in production
- [ ] No tokens logged in console/audit logs

---

## 🚨 Common Issues & Fixes

### Issue: Users redirected endlessly

**Fix**: Check JWT_SECRET matches on frontend & backend
```bash
# Backend
echo $JWT_SECRET

# Frontend .env
cat .env | grep JWT_SECRET

# They should be identical!
```

### Issue: /work/kaizen/register is blocked

**Fix**: Add to PUBLIC_PATHS
```typescript
const PUBLIC_PATHS = [
  '/work/kaizen/register',  // ← Must be here
];
```

### Issue: Sub-routes not protected

**Fix**: Check path matching uses prefix correctly
```typescript
// In isProtectedPath() function
pathname.startsWith(path + '/')  // ← Ensure this syntax
```

### Issue: Tests failing

**Fix**: Rebuild and run again
```bash
npm run build    # Compile TypeScript
npm test -- __tests__/kaizen-auth.test.ts
```

---

## 📖 Full Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| `KAIZEN_AUTH_GUARD.md` | Quick start guide | 10 min |
| `AUTH_GUARD_IMPLEMENTATION.md` | Technical details | 20 min |
| `IMPLEMENTATION_SUMMARY.md` | Executive summary | 5 min |
| `redirect-example.tsx` | Example code | 15 min |

---

## 🔗 Related Files

```
web/src/
├── proxy.ts                           ← MAIN: Authentication middleware
├── lib/auth.ts                        ← Token verification
├── __tests__/kaizen-auth.test.ts     ← Tests (21 cases)
└── app/login/
    └── redirect-example.tsx           ← Example implementation

Root/
├── KAIZEN_AUTH_GUARD.md              ← Quick start
├── AUTH_GUARD_IMPLEMENTATION.md      ← Technical docs
├── IMPLEMENTATION_SUMMARY.md         ← Summary
└── web/QUICK_REFERENCE.md           ← This file
```

---

## 🎯 Implementation Decision Table

| Scenario | Implementation | Location |
|----------|-----------------|----------|
| Add new public route | Add to PUBLIC_PATHS | proxy.ts line 14 |
| Add new protected route | Add to PROTECTED_PATHS | proxy.ts line 21 |
| Change auth logic | Modify proxy() function | proxy.ts line 46 |
| Update token verification | Modify verifyToken() | lib/auth.ts |
| Add new tests | Add to test file | `__tests__/kaizen-auth.test.ts` |
| Update login behavior | Modify redirect logic | proxy.ts line 70-75 |

---

## ✅ Verification Checklist

After making changes, run:

```bash
# 1. TypeScript compilation
npm run build

# 2. All tests pass
npm test -- __tests__/kaizen-auth.test.ts

# 3. Manual testing
# - Try /work/kaizen without token → should redirect
# - Try /work/kaizen with token → should work
# - Try /work/kaizen/register without token → should work
```

**All green?** ✅ Ready to deploy!

---

## 🧠 Remember

| Key Concept | Remember |
|------------|----------|
| **PUBLIC_PATHS** | Accessible without login |
| **PROTECTED_PATHS** | Requires valid JWT token |
| **Precedence** | PUBLIC_PATHS checked BEFORE auth |
| **Redirect** | Unauthenticated → `/login?redirect_uri=<path>` |
| **Token** | From cookie `tbs_token` or Authorization header |
| **Expiration** | 24 hours from issue |
| **Revocation** | Redis blacklist checked |

---

## 🚀 Deployment

```bash
# 1. Review changes
git diff web/src/proxy.ts

# 2. Run full test suite
npm test

# 3. Build
npm run build

# 4. Deploy
npm run deploy  # or your deployment command

# 5. Verify in production
# Visit: https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen
# Expected: Redirect to login if not authenticated
```

---

## 📞 Need Help?

1. **Quick issue**: Check "Common Issues & Fixes" above
2. **Config help**: See "Configuration Cheat Sheet"
3. **Technical details**: Read `AUTH_GUARD_IMPLEMENTATION.md`
4. **Examples**: See `redirect-example.tsx`
5. **Tests failing**: Run `npm test -- __tests__/kaizen-auth.test.ts --verbose`

---

**Last Updated**: August 2026  
**Version**: 1.0 (Production Ready)  
**Test Status**: 21/21 ✓  
**Build Status**: Clean ✓
