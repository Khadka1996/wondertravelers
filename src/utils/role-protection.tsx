/**
 * 🔐 ROLE PROTECTION WRAPPER
 * 
 * A reusable wrapper component for protecting routes/pages with role verification.
 * Used to wrap content that requires specific roles.
 * 
 * USAGE:
 * ```
 * async function MyAdminPage() {
 *   return (
 *     <RoleProtectedPage requiredRoles={['admin']}>
 *       <AdminContent />
 *     </RoleProtectedPage>
 *   );
 * }
 * ```
 */

import { ReactNode } from 'react';
import { requireRole } from './server-auth';

interface RoleProtectedPageProps {
  children: ReactNode;
  requiredRoles: string[];
  fallbackUrl?: string;
}

/**
 * ✅ Server-side role protection wrapper
 * 
 * This component verifies role before rendering content.
 * If verification fails, user is redirected immediately.
 * 
 * CRITICAL: This must be used in Server Components only
 */
export async function RoleProtectedPage({
  children,
  requiredRoles,
  fallbackUrl = '/unauthorized',
}: RoleProtectedPageProps) {
  // 🔐 Verify role BEFORE rendering children
  // If verification fails, user is redirected
  await requireRole(requiredRoles, fallbackUrl);

  // ✅ If we reach here, user has required role
  // Safe to render content
  return <>{children}</>;
}

/**
 * ✅ Role-based conditional rendering in Server Components
 * 
 * USAGE:
 * ```
 * const canViewAdmin = await hasPermission('admin');
 * return canViewAdmin ? <AdminSection /> : null;
 * ```
 */
export async function hasPermission(requiredRole: string): Promise<boolean> {
  try {
    const { hasRole } = await import('./server-auth');
    return await hasRole([requiredRole]);
  } catch {
    return false;
  }
}
