import { NextRequest, NextResponse } from 'next/server';

// 🔐 ULTRA-STRICT AUTHENTICATION PROXY
// This proxy MUST run on every request to protected routes

const PROTECTED_ROUTES = [
  '/admin/dashboard',
  '/moderator/dashboard',
  '/profile',
];

const ADMIN_ROUTES = ['/admin'];
const MODERATOR_ROUTES = ['/moderator'];

/**
 * 🔐 STRICT PROXY REQUIREMENTS:
 * 
 * 1. Token existence checked FIRST
 * 2. Redirect to login if no token
 * 3. No dashboard HTML sent to client if unauthorized
 * 4. Layout-level verification happens before page renders
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // ✅ STEP 1: CHECK IF ROUTE IS PROTECTED
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isModeratorRoute = MODERATOR_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtectedRoute && !isAdminRoute && !isModeratorRoute) {
    // Not a protected route, allow access
    return NextResponse.next();
  }

  // ✅ STEP 2: TOKEN VALIDATION (MANDATORY FIRST CHECK)
  // Check if authentication token cookie exists
  // ⚠️ IMPORTANT: Backend uses 'access_token' (underscore), other places may use 'accessToken' or 'token'
  const token = request.cookies.get('access_token')?.value ||
                request.cookies.get('accessToken')?.value || 
                request.cookies.get('token')?.value;

  if (!token) {
    // ❌ NO TOKEN FOUND
    // IMMEDIATELY redirect to login
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ✅ Token exists, allow request to continue
  // The actual token verification will happen on backend when:
  // - layout.tsx calls requireRole() (server-side verification)
  // - Page makes API calls to /api/auth/me (token validation)
  // 
  // This prevents UI flash because:
  // 1. Proxy blocks requests without token
  // 2. Layout verifies token + role before rendering
  // 3. Only after both checks pass, HTML is sent to client
  
  return NextResponse.next();
}

// ✅ Configuration: Which routes trigger this proxy
export const config = {
  matcher: [
    // Protect all admin routes
    '/admin/:path*',
    // Protect all moderator routes
    '/moderator/:path*',
    // Protect profile
    '/profile/:path*',
  ],
};
