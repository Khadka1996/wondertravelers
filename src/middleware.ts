import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, isLocalizablePath, LOCALE_COOKIE, splitLocale } from '@/i18n/config';

// Runs on the Node.js runtime so it can reach the API on 127.0.0.1 and read env at runtime.
export const config = {
  runtime: 'nodejs',
  // Everything except Next internals, the API/uploads proxy and files with an extension.
  matcher: ['/((?!_next/|api/|uploads/|.*\\.[a-zA-Z0-9]+$).*)'],
};

const PROTECTED_PREFIXES = ['/admin', '/moderator', '/profile'];
const BACKEND = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.wondertravelers.com').replace(/\/$/, '');

const isProtected = (path: string) => PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Absolute URL on the address the visitor used. Behind nginx, request.nextUrl
 * points at Next's own listener (localhost:3000), so take the forwarded host.
 */
function publicUrl(request: NextRequest, pathname: string, search = '') {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
  return new URL(`${proto}://${host}${pathname}${search}`);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isProtected(pathname)) return guard(request);

  // Language: every public page lives under /en or /ne.
  if (isLocalizablePath(pathname) && !splitLocale(pathname).locale) {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(preferred) ? preferred : defaultLocale;
    // 308 keeps old indexed URLs' ranking (e.g. /blog/x -> /en/blog/x).
    return NextResponse.redirect(publicUrl(request, `/${locale}${pathname === '/' ? '' : pathname}`, search), 308);
  }

  return NextResponse.next();
}

/**
 * Dashboards need a session. When only the refresh token is left (access
 * token expired), refresh here: unlike a server component, middleware can
 * hand the rotated cookies back to the browser AND to this render.
 */
async function guard(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (accessToken) return NextResponse.next();

  if (refreshToken) {
    try {
      const refreshed = await fetch(`${BACKEND}/api/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', Cookie: `refresh_token=${refreshToken}` },
        cache: 'no-store',
      });
      if (refreshed.ok) {
        const setCookies = refreshed.headers.getSetCookie();
        const newAccess = setCookies.map((c) => c.match(/^access_token=([^;]+)/)?.[1]).find(Boolean);
        if (newAccess) {
          const headers = new Headers(request.headers);
          request.cookies.set('access_token', newAccess);
          headers.set('cookie', request.cookies.toString());
          const response = NextResponse.next({ request: { headers } });
          setCookies.forEach((cookie) => response.headers.append('set-cookie', cookie));
          return response;
        }
      }
    } catch (error) {
      console.error('[middleware] Session refresh failed:', error);
    }
  }

  const back = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(publicUrl(request, '/auth/login', `?redirect=${back}`));
}
