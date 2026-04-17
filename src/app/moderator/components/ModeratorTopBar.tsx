'use client';

import { BellOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Badge, Avatar, Dropdown } from 'antd';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface ModeratorTopBarProps {
  user: User;
  title?: string;
  onLogout?: () => void;
  collapsed?: boolean;
  setCollapsed?: (value: boolean) => void;
}

/**
 * 🔐 MODERATOR TOP BAR COMPONENT - ENTERPRISE QUALITY
 * 
 * Displays:
 * - Page title with welcome message
 * - Notifications bell with badge for pending reviews
 * - User profile dropdown menu
 * - Quick actions (Profile, Settings, Logout)
 */
export default function ModeratorTopBar({
  user,
  title = 'Dashboard',
  onLogout,
  collapsed = false,
  setCollapsed
}: ModeratorTopBarProps) {
  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'M';
  const displayName = user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : user?.username || 'Moderator';

  const userMenuItems: any[] = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Profile</span>
        </div>
      ),
    },
    {
      key: 'settings',
      label: (
        <div className="flex items-center gap-2">
          <span>⚙️</span>
          <span>Settings</span>
        </div>
      ),
    },
    {
      type: 'divider',
    } as any,
    {
      key: 'logout',
      label: (
        <div className="flex items-center gap-2 text-red-500">
          <LogoutOutlined />
          <span>Logout</span>
        </div>
      ),
      onClick: onLogout,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setCollapsed && setCollapsed(!collapsed)}
          className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
          title="Toggle sidebar"
        >
          <MenuOutlined className="text-lg text-gray-600" />
        </button>
        
        {/* Page Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
            Welcome back, {displayName}
          </p>
        </div>
      </div>

      {/* Right: Icons & User */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Notifications - Pending Reviews */}
        <button className="relative p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition">
          <Badge count={5} color="#ef4444">
            <BellOutlined className="text-lg sm:text-xl text-gray-600 hover:text-[#d97706]" />
          </Badge>
        </button>

        {/* Divider - Hidden on mobile */}
        <div className="w-px h-5 sm:h-6 bg-gray-200 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
          <div className="flex items-center gap-1 sm:gap-3 cursor-pointer hover:bg-gray-50 px-1 sm:px-3 py-1 sm:py-2 rounded-lg transition">
            <Avatar
              src={user?.avatar}
              size={32}
              style={{
                backgroundColor: '#d97706',
                border: '2px solid #d97706'
              }}
            >
              {userInitial}
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-xs sm:text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
