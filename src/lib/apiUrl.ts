/**
 * Central API base URL for the frontend.
 *
 * Every page, route handler and hook imports { API_URL } from here, so the
 * backend origin lives in exactly one place.
 *
 * - On the server (route handlers, server components, SSR) a relative URL has
 *   no host to resolve against, so we use the absolute backend origin.
 * - In the browser we use an empty base, so requests go same-origin
 *   (`/api/...`) and are forwarded to the backend by the Next.js rewrite proxy
 *   in next.config.ts. This keeps the session cookie same-origin and avoids
 *   cross-site SameSite / CORS problems on authenticated calls.
 *
 * To point the whole app at a different backend, change BACKEND_ORIGIN below
 * (and the matching value in next.config.ts / .env for the proxy).
 */
export const BACKEND_ORIGIN =
  process.env.BACKEND_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  'https://api.wondertravelers.com';

export const API_URL = typeof window === 'undefined' ? BACKEND_ORIGIN : '';
