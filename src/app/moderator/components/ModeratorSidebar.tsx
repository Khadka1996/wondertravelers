'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  DashboardOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  RightOutlined,
  BellOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { Avatar, Modal } from 'antd';
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

interface ModeratorSidebarProps {
  user: User;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

/**
 * 🔐 MODERATOR SIDEBAR - ENTERPRISE QUALITY
 * 
 * Features:
 * - Collapsible navigation with moderation-specific items
 * - User profile section with online status
 * - Notification badges for pending reviews
 * - Mobile responsive
 * - Tooltips for collapsed state
 * - Logout confirmation modal
 */
export default function ModeratorSidebar({ user, collapsed, setCollapsed }: ModeratorSidebarProps) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'comment-management': true
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock notification data
  const [notificationCounts] = useState({
    pendingReviews: 12,
    reportedComments: 5,
    flaggedContent: 3
  });

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setCollapsed]);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/auth/login';
    }
    setIsLogoutModalOpen(false);
  };

  const handleMouseEnter = (item: any, event: React.MouseEvent<HTMLDivElement>) => {
    if (collapsed) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.right + 8
      });
      setHoveredItem(item);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined className="text-lg" />,
      label: 'Dashboard',
      href: '/moderator'
    },
    {
      key: 'comments',
      icon: <CommentOutlined className="text-lg" />,
      label: 'Comments',
      href: '/moderator/comments'
    },
    {
      key: 'review',
      icon: <CheckCircleOutlined className="text-lg" />,
      label: 'Reviews',
      href: '/moderator/review',
      badge: notificationCounts.pendingReviews
    },
    {
      key: 'reports',
      icon: <AlertOutlined className="text-lg" />,
      label: 'Reports',
      href: '/moderator/reports',
      badge: notificationCounts.reportedComments
    },
    {
      key: 'settings',
      icon: <SettingOutlined className="text-lg" />,
      label: 'Settings',
      href: '/moderator/settings'
    },
  ];

  const MenuItem = ({ item, level = 0 }: { item: any; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSubmenus[item.key];
    const isSelected = selectedKey === item.key;

    return (
      <div>
        <div
          className={`
            flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 cursor-pointer relative group
            ${isSelected 
              ? 'bg-amber-50 border-r-4 border-[#f59e0b] text-[#d97706] font-semibold' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-[#d97706]'
            }
            ${level > 0 ? 'pl-8' : ''}
            ${isMobile ? 'touch-manipulation' : ''}
          `}
          onClick={() => {
            if (hasChildren && !collapsed) {
              toggleSubmenu(item.key);
            } else if (!hasChildren && item.href) {
              setSelectedKey(item.key);
              if (isMobile) {
                setCollapsed(true);
              }
              setTimeout(scrollToTop, 100);
            }
          }}
          onMouseEnter={(e) => handleMouseEnter(item, e)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 ${isSelected ? 'text-[#d97706]' : 'text-[#ef4444]'}`}>
              {item.icon}
            </div>
            {!collapsed && (
              <span className="truncate flex-1 text-sm font-medium">
                {item.label}
              </span>
            )}
          </div>
          
          {!collapsed && hasChildren && (
            <div className={`flex-shrink-0 ${isSelected ? 'text-[#d97706]' : 'text-gray-400'}`}>
              {isOpen ? (
                <DownOutlined className="text-xs transition-transform duration-200" />
              ) : (
                <RightOutlined className="text-xs transition-transform duration-200" />
              )}
            </div>
          )}
          
          {!collapsed && item.badge && (
            <span className="flex-shrink-0 bg-[#ef4444] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
              {item.badge}
            </span>
          )}
        </div>

        {/* Expanded submenu for non-collapsed sidebar */}
        {hasChildren && isOpen && !collapsed && (
          <div className="ml-4 mt-1 space-y-1 border-l border-gray-200">
            {item.children.map((child: any) => (
              <Link key={child.key} href={child.href} className="block">
                <div
                  className={`
                    flex items-center justify-between p-2 rounded-lg transition-all duration-200 ml-3
                    ${selectedKey === child.key
                      ? 'bg-amber-50 text-[#d97706] font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#d97706]'
                    }
                    ${isMobile ? 'touch-manipulation' : ''}
                  `}
                  onClick={() => {
                    setSelectedKey(child.key);
                    if (isMobile) {
                      setCollapsed(true);
                    }
                    setTimeout(scrollToTop, 100);
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {child.icon && (
                      <div className="text-gray-400">
                        {child.icon}
                      </div>
                    )}
                    <span className="truncate text-sm">{child.label}</span>
                  </div>
                  {child.badge && (
                    <span className="flex-shrink-0 bg-[#ef4444] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {child.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getUserInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return 'M';
  };

  const displayName = user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : user?.username || 'Moderator';

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          bg-white border-r border-gray-200
          h-screen
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isMobile 
            ? `fixed left-0 top-0 bottom-0 z-50 shadow-2xl ${collapsed ? '-translate-x-full' : 'translate-x-0'} w-64`
            : `relative z-0 ${collapsed ? 'w-16' : 'w-64'}`
          }
        `}
      >
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            {!collapsed && (
              <div className="text-[#d97706] font-bold text-xl tracking-tight">
                Moderator
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-[#d97706] transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 active:scale-95"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <MenuUnfoldOutlined className="w-5 h-5" /> : <MenuFoldOutlined className="w-5 h-5" />}
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200 bg-white">
            {collapsed ? (
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar
                    src={user?.avatar}
                    size={32}
                    style={{ 
                      backgroundColor: '#d97706',
                      border: '2px solid #d97706'
                    }}
                  >
                    {getUserInitials(user?.firstName, user?.lastName, user?.username)}
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center bg-amber-50 p-3 rounded-lg">
                <div className="relative">
                  <Avatar
                    src={user?.avatar}
                    size={40}
                    style={{ 
                      backgroundColor: '#d97706',
                      border: '2px solid #d97706'
                    }}
                  >
                    {getUserInitials(user?.firstName, user?.lastName, user?.username)}
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="min-w-0 flex-1 ml-3">
                  <div className="text-gray-900 font-semibold text-sm truncate">
                    {displayName}
                  </div>
                  <div className="text-gray-600 text-xs flex items-center space-x-2 mt-1">
                    <span className="bg-[#d97706] text-white px-2 py-0.5 rounded-full">
                      {user?.role || 'Moderator'}
                    </span>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto mobile-scroll-fix"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          <div className="py-4">
            <div className="space-y-1 px-3">
              {menuItems.map((item) => (
                <div key={item.key} className="group">
                  {item.href ? (
                    <Link href={item.href}>
                      <MenuItem item={item} />
                    </Link>
                  ) : (
                    <MenuItem item={item} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer Section */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <div className="p-4">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center p-3 rounded-lg transition-all duration-200 group relative
                text-gray-700 hover:text-[#ef4444] hover:bg-red-50 border border-transparent hover:border-red-200
                active:scale-95
                ${collapsed ? 'justify-center' : ''}
                ${isMobile ? 'touch-manipulation' : ''}
              `}
            >
              <LogoutOutlined className="w-5 h-5" />
              {!collapsed && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Tooltip for collapsed sidebar items */}
      {collapsed && hoveredItem && (
        <div
          className="fixed bg-gray-900 text-white text-sm rounded-lg py-2 px-3 z-50 shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-200"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="font-medium">{hoveredItem.label}</div>
          {hoveredItem.badge && (
            <div className="absolute -top-2 -right-2 bg-[#ef4444] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {hoveredItem.badge}
            </div>
          )}
        </div>
      )}

      {/* Floating submenu for collapsed sidebar */}
      {collapsed && hoveredItem && hoveredItem.children && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-2 min-w-[200px] backdrop-blur-sm"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
          }}
          onMouseEnter={() => setHoveredItem(hoveredItem)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-gray-50 sticky top-0">
            <div className="font-semibold text-gray-900 text-sm flex items-center">
              <div className="text-[#ef4444] mr-2">
                {hoveredItem.icon}
              </div>
              {hoveredItem.label}
            </div>
          </div>
          <div className="py-1">
            {hoveredItem.children.map((child: any) => (
              <Link key={child.key} href={child.href}>
                <div
                  className={`
                    px-4 py-2 text-sm transition-all duration-150 flex items-center justify-between
                    ${selectedKey === child.key
                      ? 'bg-amber-50 text-[#d97706] font-medium border-r-2 border-[#d97706]'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#d97706] hover:border-r-2 hover:border-amber-200'
                    }
                    ${isMobile ? 'touch-manipulation' : ''}
                  `}
                  onClick={() => {
                    setSelectedKey(child.key);
                    setHoveredItem(null);
                    if (isMobile) {
                      setCollapsed(true);
                    }
                    setTimeout(scrollToTop, 100);
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {child.icon && (
                      <div className="text-gray-400 flex-shrink-0">
                        {child.icon}
                      </div>
                    )}
                    <span className="truncate">{child.label}</span>
                  </div>
                  {child.badge && (
                    <span className="bg-[#ef4444] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2 flex-shrink-0">
                      {child.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-full">
              <LogoutOutlined className="w-6 h-6 text-[#ef4444]" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Confirm Logout
            </span>
          </div>
        }
        open={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        footer={[
          <button
            key="cancel"
            onClick={() => setIsLogoutModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>,
          <button
            key="logout"
            onClick={confirmLogout}
            className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium ml-3"
          >
            Logout
          </button>
        ]}
        centered
      >
        <p className="text-gray-600">
          Are you sure you want to log out of your account?
        </p>
      </Modal>

      {/* Mobile overlay when sidebar is expanded */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
          onClick={() => setCollapsed(true)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .mobile-scroll-fix {
          -webkit-overflow-scrolling: touch !important;
          overflow-scrolling: touch !important;
          scroll-behavior: smooth !important;
          overscroll-behavior: contain !important;
        }

        .mobile-scroll-fix::-webkit-scrollbar {
          width: 4px;
        }

        .mobile-scroll-fix::-webkit-scrollbar-track {
          background: transparent;
        }

        .mobile-scroll-fix::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 2px;
        }

        .mobile-scroll-fix::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </>
  );
}
