'use client';

import { useState } from 'react';
import ModeratorSidebar from './components/ModeratorSidebar';
import ModeratorTopBar from './components/ModeratorTopBar';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface ModeratorLayoutClientProps {
  children: React.ReactNode;
  user: User;
}

/**
 * 🔐 MODERATOR LAYOUT CLIENT - Enterprise Sidebar + TopBar
 * 
 * This client component:
 * - Manages sidebar collapsed/expanded state
 * - Composes ModeratorSidebar with all features (moderation items, badges, profile)
 * - Composes ModeratorTopBar with notifications and user menu
 * - Renders page content
 */
export default function ModeratorLayoutClient({
  children,
  user,
}: ModeratorLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    // Logout will be handled by the TopBar dropdown menu
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* 🔐 ENTERPRISE SIDEBAR - Overlay on mobile, fixed on desktop */}
      <ModeratorSidebar user={user} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area - Full width on mobile, flex-1 on desktop */}
      <main className="flex-1 w-full overflow-auto flex flex-col">
        {/* 🔐 ENTERPRISE TOP BAR WITH NOTIFICATIONS & USER MENU */}
        <ModeratorTopBar user={user} title="Dashboard" onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
