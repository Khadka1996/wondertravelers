/**
 * 🔐 MODERATOR LAYOUT - SERVER COMPONENT (ZERO-FLASH POLICY)
 * 
 * This layout MUST be a server component to:
 * 1. Verify moderator role BEFORE rendering any HTML
 * 2. Redirect if unauthorized BEFORE component mounts
 * 3. Prevent UI flash of moderator panel to non-moderators
 */

export const dynamic = 'force-dynamic';

import { requireRole } from '@/utils/server-auth';
import ModeratorLayoutClient from './layout-client';

// ✅ SERVER COMPONENT - No "use client" directive
// This ensures verification happens on server before HTML is sent

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  // 🔐 CRITICAL: Verify role BEFORE rendering anything
  // If user is not a moderator or admin, this will redirect immediately
  // No HTML is sent to the client if verification fails
  
  // requireRole redirects by throwing; it must not be wrapped in try/catch,
  // or the /unauthorized redirect turns into a login redirect.
  const user = await requireRole(['moderator', 'admin']);

  // ✅ If we reach here, user is definitely a moderator or admin
  // Safe to render moderator UI
  // NOTE: navItems is defined in the CLIENT component to avoid passing React components
  // through the server-client boundary (which is not allowed)

  return (
    <ModeratorLayoutClient user={user}>
      {children}
    </ModeratorLayoutClient>
  );
}
