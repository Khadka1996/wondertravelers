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

import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value ||
                        cookieStore.get('accessToken')?.value ||
                        cookieStore.get('token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value ||
                          cookieStore.get('refreshToken')?.value;

    if (!accessToken) {
      console.log('[AUTH:getCurrentUser] No access token found in cookies, returning null');
      return null;
    }

    // ✅ For Vercel: Use NEXT_PUBLIC_API_URL for server-to-server communication
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';

    console.log('[AUTH:getCurrentUser] Attempting to fetch user from', apiUrl, {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length
    });

    // Build cookie header with both tokens
    let cookieHeader = `access_token=${accessToken}`;
    if (refreshToken) {
      cookieHeader += `; refresh_token=${refreshToken}`;
    }

    // 🔒 Server-to-server request with explicit cookie header
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Authorization': `Bearer ${accessToken}`, // ✅ Add Bearer token as fallback
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.log('[AUTH:getCurrentUser] /api/auth/me failed with status:', response.status);

      // Try to refresh token if we have a refresh token
      if (refreshToken) {
        console.log('[AUTH:getCurrentUser] Attempting token refresh with refresh_token...');
        const refreshUrl = `${apiUrl}/api/auth/refresh`;
        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
            'Authorization': `Bearer ${refreshToken}`, // ✅ Add Bearer token as fallback
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (refreshResponse.ok) {
          console.log('[AUTH:getCurrentUser] Token refresh successful');
          // Token refreshed, retry get user
          const retryResponse = await fetch(`${apiUrl}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': cookieHeader,
              'Authorization': `Bearer ${accessToken}`, // ✅ Add Bearer token
            },
            cache: 'no-store',
            next: { revalidate: 0 }
          });

          if (retryResponse.ok) {
            const data: AuthResponse = await retryResponse.json();
            console.log('[AUTH:getCurrentUser] User fetched successfully after refresh:', data.user?._id);
            return data.user || null;
          }
        } else {
          console.log('[AUTH:getCurrentUser] Token refresh failed with status:', refreshResponse.status);
        }
      } else {
        console.log('[AUTH:getCurrentUser] No refresh token available to retry');
      }

      console.log('[AUTH:getCurrentUser] Clearing auth - returning null');
      return null;
    }

    const data: AuthResponse = await response.json();
    console.log('[AUTH:getCurrentUser] User fetched successfully:', data.user?._id);
    return data.user || null;
  } catch (error) {
    console.error('[AUTH:getCurrentUser] Error fetching current user:', error);
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
  console.log('[AUTH:requireRole] Checking role requirement:', requiredRoles);
  
  const user = await getCurrentUser();

  // ❌ No user found - redirect to login
  if (!user) {
    console.log('[AUTH:requireRole] No user found, REDIRECTING to /auth/login');
    redirect('/auth/login');
  }

  // ✅ Verify role
  if (!requiredRoles.includes(user.role)) {
    // ❌ User exists but lacks required role - redirect to unauthorized
    console.log('[AUTH:requireRole] User role NOT authorized:', user.role, '- Required:', requiredRoles, '- REDIRECTING to', redirectUrl);
    redirect(redirectUrl);
  }

  // ✅ User has required role - safe to render
  console.log('[AUTH:requireRole] User AUTHORIZED with role:', user.role, '- Returning user:', user._id);
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
