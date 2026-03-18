'use client';

import { useState } from 'react';
import { BellOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Badge, Avatar, Dropdown, MenuProps, Modal, message } from 'antd';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface AdminTopBarProps {
  user: User;
  title?: string;
  onLogout?: () => void;
  collapsed?: boolean;
  setCollapsed?: (value: boolean) => void;
}

/**
 * 🔐 ADMIN TOP BAR COMPONENT - ENTERPRISE QUALITY
 * 
 * Displays:
 * - Page title with welcome message
 * - Notifications bell with badge
 * - User profile dropdown menu
 * - Quick actions (Profile, Settings, Logout)
 */
export default function AdminTopBar({
  user,
  title = 'Dashboard',
  onLogout,
  collapsed = false,
  setCollapsed
}: AdminTopBarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'A';
  const displayName = user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : user?.username || 'Admin';

  const handleLogout = async () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout from your admin account?',
      okText: 'Yes, Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setIsLoggingOut(true);
          
          // Call logout API
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            message.success('Logged out successfully');
            
            // Clear any local storage/session data
            try {
              localStorage.clear();
              sessionStorage.clear();
            } catch (err) {
              console.error('Error clearing storage:', err);
            }

            // Wait a moment then redirect
            setTimeout(() => {
              router.push('/auth/login');
              window.location.href = '/auth/login'; // Force full page redirect
            }, 500);
          } else {
            const errorData = await response.json();
            message.error(errorData.message || 'Logout failed');
            setIsLoggingOut(false);
          }
        } catch (error) {
          console.error('Logout error:', error);
          message.error('Logout failed. Please try again.');
          setIsLoggingOut(false);
        }
      },
    });
  };

  const handleProfileClick = () => {
    message.info('Navigating to your profile...');
    router.push('/admin/profile');
  };

  const handleSettingsClick = () => {
    message.info('Opening settings...');
    router.push('/admin/settings');
  };

  const notificationItems: MenuProps['items'] = [
    {
      key: 'no-notifications',
      label: (
        <div className="text-center py-4 text-gray-500 text-sm">
          No notifications yet
        </div>
      ),
      disabled: true,
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-blue-600" />
          <span className="font-medium">My Profile</span>
        </div>
      ),
      onClick: handleProfileClick,
    },
    {
      key: 'settings',
      label: (
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <span className="font-medium">Settings</span>
        </div>
      ),
      onClick: handleSettingsClick,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <div className="flex items-center gap-2 text-red-600">
          <LogoutOutlined className="text-red-600" />
          <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </div>
      ),
      onClick: handleLogout,
      disabled: isLoggingOut,
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
        {/* Notifications */}
        <Dropdown 
          menu={{ items: notificationItems }} 
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="relative p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition">
            <Badge count={0} color="#d92026">
              <BellOutlined className="text-lg sm:text-xl text-gray-600 hover:text-[#174fa2]" />
            </Badge>
          </button>
        </Dropdown>

        {/* Divider - Hidden on mobile */}
        <div className="w-px h-5 sm:h-6 bg-gray-200 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <Dropdown 
          menu={{ items: userMenuItems }} 
          trigger={['click']}
          placement="bottomRight"
        >
          <div className="flex items-center gap-1 sm:gap-3 cursor-pointer hover:bg-blue-50 px-1 sm:px-3 py-1 sm:py-2 rounded-lg transition duration-200 border border-transparent hover:border-blue-200">
            <Avatar
              src={user?.avatar}
              size={32}
              style={{
                backgroundColor: '#174fa2',
                border: '2px solid #174fa2'
              }}
            >
              {userInitial}
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-xs sm:text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
