/**
 * 🔐 SERVER-SIDE AUTHENTICATION UTILITIES
 * 
 * These utilities are used ONLY on the server (Server Components, Server Actions)
 * to verify user roles BEFORE any content is rendered to prevent UI flash.
 * 
 * ZERO-FLASH POLICY:
 * - No dashboard HTML should be sent to client if user lacks required role
 * - No admin/moderator components should mount before verification
 * - Redirect happens BEFORE rendering
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/apiUrl';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  active: boolean;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  success: boolean;
  user: User;
}

/**
 * ✅ Fetch current user from backend
 * 
 * This function makes a server-to-server request to verify the token
 * WITHOUT relying on client-side context or local state.
 * 
 * Called only once during server component render = NO FLASH
 */
export async function getCurrentUser(): Promise<User | null> {
  // Expired access tokens are refreshed in middleware.ts, which (unlike a
  // server component) can hand the rotated cookies back to the browser.
  const accessToken = (await cookies()).get('access_token')?.value;
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Accept: 'application/json', Cookie: `access_token=${accessToken}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data: AuthResponse = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('[auth] Could not verify the current user:', error);
    return null;
  }
}

/**
 * ✅ Verify user has required role
 * 
 * @param requiredRoles - Array of roles that are allowed (e.g., ['admin'])
 * @param redirectUrl - Where to redirect if unauthorized (default: /unauthorized)
 * 
 * THROWS: Never throws. Returns void if successful, redirects if unauthorized.
 * 
 * USAGE IN SERVER COMPONENT:
 * ```
 * export default async function AdminLayout({ children }) {
 *   await requireRole(['admin']); // ⬅️ Blocks render if user is not admin
 *   // If we reach here, user is definitely an admin
 *   return <AdminUI>{children}</AdminUI>;
 * }
 * ```
 */
export async function requireRole(
  requiredRoles: string[],
  redirectUrl: string = '/unauthorized'
): Promise<User> {
  
  const user = await getCurrentUser();

  // ❌ No user found - redirect to login
  if (!user) {
    redirect('/auth/login');
  }

  // ✅ Verify role
  if (!requiredRoles.includes(user.role)) {
    // ❌ User exists but lacks required role - redirect to unauthorized
    redirect(redirectUrl);
  }

  // ✅ User has required role - safe to render
  return user;
}

/**
 * ✅ Check if user has required role (non-blocking)
 * 
 * Same as requireRole but returns boolean instead of redirect.
 * Use when you need conditional rendering.
 * 
 * @param requiredRoles - Array of roles to check
 * @returns True if user has one of the required roles, false otherwise
 */
export async function hasRole(requiredRoles: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? requiredRoles.includes(user.role) : false;
}

/**
 * ✅ Require authentication (any role, just must be logged in)
 * 
 * Use for pages that require login but don't care about role.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return user;
}
