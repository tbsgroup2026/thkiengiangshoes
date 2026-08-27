import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const PUBLIC_ROUTES = ['/', '/about', '/careers', '/contact', '/login', '/mobile-guide', '/news'];

/**
 * Public routes that do NOT require authentication
 * This list takes precedence over path-based auth requirements
 */
const PUBLIC_PATHS = [
  '/work/kaizen/register', // Public kaizen registration (open form, no login needed)
];

/**
 * Routes that REQUIRE authentication with redirect on failure
 * Format: { path: string pattern, redirect?: boolean (default true for UI routes) }
 */
const PROTECTED_PATHS = [
  { path: '/work/kaizen', redirect: true }, // Protect /work/kaizen & all sub-routes
];

/**
 * Check if a given pathname matches a protected path pattern
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(({ path }) => {
    // Exact match or prefix match (with / boundary)
    return pathname === path || pathname.startsWith(path + '/');
  });
}

/**
 * Check if a given pathname is explicitly public (exception to protected paths)
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(publicPath => {
    // Exact match or prefix match (with / boundary)
    return pathname === publicPath || pathname.startsWith(publicPath + '/');
  });
}

export async function proxy(request: NextRequest) {
  const { pathname: rawPathname } = request.nextUrl;
  // next.config.ts có trailingSlash: true nên URL thực tế luôn có dấu "/" cuối (VD "/login/"),
  // trong khi PUBLIC_ROUTES/PROTECTED_PATHS bên dưới viết không có dấu "/" cuối — bỏ dấu "/" cuối
  // trước khi so khớp để tránh vòng lặp redirect vô hạn (đã xảy ra thật với /login, /about,
  // /contact, /mobile-guide — mọi route "public" liệt kê exact-match ở trên).
  const pathname = rawPathname !== '/' && rawPathname.endsWith('/') ? rawPathname.slice(0, -1) : rawPathname;

  // 1. Allow public website pages & static assets
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/news') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Check if this path is explicitly public (e.g., /work/kaizen/register)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 3. Check Auth Cookie or Authorization Header
  const authHeader = request.headers.get('Authorization');
  let token = authHeader ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    token = request.cookies.get('tbs_token')?.value || null;
  }

  // 4. Handle missing token for protected paths
  if (!token) {
    // Protected path requires auth
    if (isProtectedPath(pathname)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
      }
      // Redirect to login with redirect_uri param for post-login navigation
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_uri', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Generic unprotected route without token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 5. Verify JWT Payload
  const user = await verifyToken(token);
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    // Redirect to login with redirect_uri for protected paths
    if (isProtectedPath(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_uri', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. Role Protection for Admin Routes
  if (pathname.startsWith('/admin') && user.roleLevel > 1) {
    return NextResponse.redirect(new URL('/work', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
