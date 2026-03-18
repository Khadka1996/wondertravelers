/**
 * 🔐 ADMIN LAYOUT - SERVER COMPONENT (ZERO-FLASH POLICY)
 * 
 * This layout MUST be a server component to:
 * 1. Verify role BEFORE rendering any HTML
 * 2. Redirect if unauthorized BEFORE component mounts
 * 3. Prevent UI flash of admin panel to non-admins
 */

import { requireRole } from '@/utils/server-auth';
import AdminLayoutClient from './layout-client';
import { redirect } from 'next/navigation';

// ✅ SERVER COMPONENT - No "use client" directive
// This ensures verification happens on server before HTML is sent

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 🔐 CRITICAL: Verify role BEFORE rendering anything
  // If user is not an admin, this will redirect immediately
  // No HTML is sent to the client if verification fails
  
  let user;
  try {
    user = await requireRole(['admin']);
  } catch (error) {
    console.error('[ADMIN-LAYOUT] Auth check error:', error);
    // If requireRole throws (shouldn't happen), redirect to login
    redirect('/auth/login');
  }

  // ✅ If we reach here, user is definitely an admin
  // Safe to render admin UI
  // NOTE: navItems is defined in the CLIENT component to avoid passing React components
  // through the server-client boundary (which is not allowed)

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
