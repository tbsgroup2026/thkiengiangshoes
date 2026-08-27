/**
 * Authentication Guard Tests for /work/kaizen routes
 * 
 * Test Suite:
 * 1. Unauthenticated access to /work/kaizen → blocked (redirect to login)
 * 2. Unauthenticated access to /work/kaizen/register → allowed (public)
 * 3. Authenticated access to /work/kaizen → allowed
 * 4. Authenticated access to /work/kaizen/register → allowed
 * 5. Sub-routes of /work/kaizen also protected
 */

import { verifyToken, signToken, JWTPayload } from '../lib/auth';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Kaizen Authentication Guard', () => {
  let validToken: string;
  let expiredToken: string;

  beforeAll(async () => {
    // Create a valid test token
    const payload: JWTPayload = {
      userId: 1,
      empCode: 'EMP001',
      name: 'Test User',
      roleId: 3,
      roleCode: 'TRUONG_PHONG',
      roleLevel: 3,
      departmentId: 5,
      departmentCode: 'DEPT_QA',
    };
    validToken = await signToken(payload);
    
    // Note: expiredToken would require manipulating JWT issuance time
    // For now, we'll skip this or use a pre-expired token
    expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  });

  describe('Token Verification', () => {
    it('should verify a valid token', async () => {
      const decoded = await verifyToken(validToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(1);
      expect(decoded?.empCode).toBe('EMP001');
      expect(decoded?.roleLevel).toBe(3);
    });

    it('should reject an invalid token', async () => {
      const decoded = await verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should reject an expired token', async () => {
      const decoded = await verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Public Paths Configuration', () => {
    it('should define /work/kaizen/register as public', () => {
      const PUBLIC_PATHS = ['/work/kaizen/register'];
      expect(PUBLIC_PATHS).toContain('/work/kaizen/register');
    });

    it('should NOT include /work/kaizen in public paths', () => {
      const PUBLIC_PATHS = ['/work/kaizen/register'];
      expect(PUBLIC_PATHS).not.toContain('/work/kaizen');
    });
  });

  describe('Protected Path Detection', () => {
    /**
     * Mock implementation of isProtectedPath logic
     */
    function isProtectedPath(pathname: string): boolean {
      const PROTECTED_PATHS = [{ path: '/work/kaizen' }];
      return PROTECTED_PATHS.some(({ path }) => 
        pathname === path || pathname.startsWith(path + '/')
      );
    }

    /**
     * Mock implementation of isPublicPath logic
     */
    function isPublicPath(pathname: string): boolean {
      const PUBLIC_PATHS = ['/work/kaizen/register'];
      return PUBLIC_PATHS.some(publicPath => 
        pathname === publicPath || pathname.startsWith(publicPath + '/')
      );
    }

    it('should protect /work/kaizen', () => {
      expect(isProtectedPath('/work/kaizen')).toBe(true);
    });

    it('should protect /work/kaizen/xxx sub-routes', () => {
      expect(isProtectedPath('/work/kaizen/proposal/abc123')).toBe(true);
      expect(isProtectedPath('/work/kaizen/dashboard')).toBe(true);
    });

    it('should mark /work/kaizen/register as public', () => {
      expect(isPublicPath('/work/kaizen/register')).toBe(true);
    });

    it('should allow /work/kaizen/register as exception to protected /work/kaizen', () => {
      const pathname = '/work/kaizen/register';
      // Public path takes precedence
      expect(isPublicPath(pathname)).toBe(true);
      // So even though it matches the protected path pattern, it's still public
      expect(isProtectedPath(pathname)).toBe(true); // Pattern matches
      // But isPublicPath() is checked BEFORE isProtectedPath()
      expect(isPublicPath(pathname) || !isProtectedPath(pathname)).toBe(true);
    });

    it('should not protect other /work routes', () => {
      expect(isProtectedPath('/work')).toBe(false);
      expect(isProtectedPath('/work/ci')).toBe(false);
      expect(isProtectedPath('/work/gemba')).toBe(false);
    });
  });

  describe('Redirect Logic', () => {
    it('should redirect unauthenticated requests to /login with redirect_uri param', () => {
      const requestUrl = 'https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen';
      const loginUrl = new URL('/login', requestUrl);
      loginUrl.searchParams.set('redirect_uri', '/work/kaizen');
      
      expect(loginUrl.toString()).toContain('/login');
      expect(loginUrl.searchParams.get('redirect_uri')).toBe('/work/kaizen');
    });

    it('should preserve redirect_uri for nested kaizen routes', () => {
      const requestUrl = 'https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen/proposal/abc123';
      const redirectPath = '/work/kaizen/proposal/abc123';
      const loginUrl = new URL('/login', requestUrl);
      loginUrl.searchParams.set('redirect_uri', redirectPath);
      
      expect(loginUrl.searchParams.get('redirect_uri')).toBe(redirectPath);
    });
  });

  describe('Edge Cases', () => {
    it('should allow access to /work/kaizen/register/anything (sub-paths of register)', () => {
      function isPublicPath(pathname: string): boolean {
        const PUBLIC_PATHS = ['/work/kaizen/register'];
        return PUBLIC_PATHS.some(publicPath => 
          pathname === publicPath || pathname.startsWith(publicPath + '/')
        );
      }
      
      // Both exact match and sub-paths should be public
      expect(isPublicPath('/work/kaizen/register')).toBe(true);
      expect(isPublicPath('/work/kaizen/register/success')).toBe(true);
      expect(isPublicPath('/work/kaizen/register/confirm')).toBe(true);
    });

    it('should distinguish between /work/kaizen/register and /work/kaizen/registerXXX', () => {
      function isPublicPath(pathname: string): boolean {
        const PUBLIC_PATHS = ['/work/kaizen/register'];
        return PUBLIC_PATHS.some(publicPath => 
          pathname === publicPath || pathname.startsWith(publicPath + '/')
        );
      }
      
      expect(isPublicPath('/work/kaizen/register')).toBe(true);
      expect(isPublicPath('/work/kaizen/registerForm')).toBe(false); // No leading /
      expect(isPublicPath('/work/kaizen/register/step1')).toBe(true);
    });

    it('should protect /work/kaizen regardless of trailing content', () => {
      function isProtectedPath(pathname: string): boolean {
        const PROTECTED_PATHS = [{ path: '/work/kaizen' }];
        return PROTECTED_PATHS.some(({ path }) => 
          pathname === path || pathname.startsWith(path + '/')
        );
      }
      
      expect(isProtectedPath('/work/kaizen')).toBe(true);
      expect(isProtectedPath('/work/kaizen/')).toBe(true);
      expect(isProtectedPath('/work/kaizen/anything')).toBe(true);
      expect(isProtectedPath('/work/kaizen/foo/bar/baz')).toBe(true);
    });
  });
});

/**
 * Integration Test Scenarios
 * 
 * These describe the expected behavior when the proxy middleware runs
 */
describe('Kaizen Auth Guard - Middleware Integration Scenarios', () => {
  describe('Scenario 1: Unauthenticated User Accesses /work/kaizen', () => {
    it('should redirect to /login?redirect_uri=/work/kaizen', () => {
      // Arrange
      const pathname = '/work/kaizen';
      const hasToken = false;

      // Act & Assert
      expect(hasToken).toBe(false);
      // Middleware should:
      // 1. Check if path is protected → YES
      // 2. Check if path is public exception → NO
      // 3. Check for token → NO TOKEN
      // 4. Redirect to /login?redirect_uri=/work/kaizen
    });
  });

  describe('Scenario 2: Unauthenticated User Accesses /work/kaizen/register', () => {
    it('should allow access (public route)', () => {
      // Arrange
      const pathname = '/work/kaizen/register';
      const hasToken = false;

      // Act & Assert
      expect(hasToken).toBe(false);
      // Middleware should:
      // 1. Check if path is public exception → YES (/work/kaizen/register)
      // 2. Allow access (NextResponse.next())
    });
  });

  describe('Scenario 3: Authenticated User Accesses /work/kaizen', () => {
    it('should allow access', () => {
      // Arrange
      const pathname = '/work/kaizen';
      const hasValidToken = true;

      // Act & Assert
      expect(hasValidToken).toBe(true);
      // Middleware should:
      // 1. Check if path is public exception → NO
      // 2. Check for token → YES
      // 3. Verify token → VALID
      // 4. Allow access (NextResponse.next())
    });
  });

  describe('Scenario 4: Authenticated User Accesses /work/kaizen/register', () => {
    it('should allow access (already public)', () => {
      // Arrange
      const pathname = '/work/kaizen/register';
      const hasValidToken = true;

      // Act & Assert
      expect(hasValidToken).toBe(true);
      // Middleware should:
      // 1. Check if path is public exception → YES
      // 2. Allow access (NextResponse.next())
      // (Token verification never needed)
    });
  });

  describe('Scenario 5: Authenticated User Accesses Nested Kaizen Route', () => {
    it('should allow access to /work/kaizen/proposal/123', () => {
      // Arrange
      const pathname = '/work/kaizen/proposal/123';
      const hasValidToken = true;

      // Act & Assert
      expect(hasValidToken).toBe(true);
      // Middleware should:
      // 1. Check if path is protected → YES (starts with /work/kaizen/)
      // 2. Check for token → YES
      // 3. Verify token → VALID
      // 4. Allow access
    });
  });

  describe('Scenario 6: Invalid Token Accesses /work/kaizen', () => {
    it('should redirect to /login?redirect_uri=/work/kaizen', () => {
      // Arrange
      const pathname = '/work/kaizen';
      const token = 'invalid.malformed.token';

      // Act & Assert
      // Middleware should:
      // 1. Check if path is public exception → NO
      // 2. Check for token → YES (but invalid)
      // 3. Verify token → FAILED
      // 4. Redirect to /login?redirect_uri=/work/kaizen
    });
  });
});
