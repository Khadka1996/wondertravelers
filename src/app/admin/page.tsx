'use client';

import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Settings, Users, BarChart3, AlertCircle, CheckCircle, Megaphone, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const API_URL = '';

interface DashboardData {
  users: {
    total: number;
    admins: number;
    moderators: number;
    regularUsers: number;
    active: number;
    inactive: number;
    locked: number;
  };
  content: {
    blogs: {
      total: number;
      published: number;
      draft: number;
      blog: number;
      news: number;
      engagement: {
        totalViews: number;
        totalLikes: number;
        totalComments: number;
      };
    };
    advertisements: {
      total: number;
      active: number;
      inactive: number;
      totalClicks: number;
    };
    categories: {
      active: number;
    };
  };
  security: {
    criticalEvents: number;
    failedAuthAttempts: number;
    lockedUsers: number;
  };
}

function AdminDashboardContent() {
  const { user, isLoading: authLoading } = useAuth();

  // Initialize with zeros - NO MOCK DATA
  const defaultData: DashboardData = {
    users: {
      total: 0,
      admins: 0,
      moderators: 0,
      regularUsers: 0,
      active: 0,
      inactive: 0,
      locked: 0
    },
    content: {
      blogs: {
        total: 0,
        published: 0,
        draft: 0,
        blog: 0,
        news: 0,
        engagement: {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0
        }
      },
      advertisements: {
        total: 0,
        active: 0,
        inactive: 0,
        totalClicks: 0
      },
      categories: {
        active: 0
      }
    },
    security: {
      criticalEvents: 0,
      failedAuthAttempts: 0,
      lockedUsers: 0
    }
  };

  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch real data from backend
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('=== DASHBOARD FETCH START ===');
        console.log('Is authenticated:', !!user);
        console.log('User:', user?.username);
        console.log('API URL:', API_URL);
        
        const endpoints = [
          `${API_URL}/api/admin/dashboard/stats`, // Protected endpoint
          `${API_URL}/api/admin/dashboard/stats-debug` // Fallback debug endpoint (dev only)
        ];
        
        let response = null;
        let usedEndpoint = '';
        
        // Try endpoints in order
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting endpoint: ${endpoint}`);
            response = await fetch(endpoint, {
              credentials: 'include',
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              usedEndpoint = endpoint;
              console.log(`✅ Success with: ${endpoint}`);
              break;
            } else {
              console.log(`❌ Failed with: ${endpoint} (${response.status})`);
            }
          } catch (err) {
            console.log(`❌ Error with: ${endpoint}`, err instanceof Error ? err.message : err);
          }
        }

        if (!response || !response.ok) {
          console.error('❌ All endpoints failed');
          setError('Failed to connect to dashboard API');
          setDashboardData(defaultData);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('📊 API Response:', data);
        
        if (data.success && data.data) {
          console.log('✅ Dashboard data received successfully');
          setDashboardData(data.data);
          setError('');
        } else {
          console.warn('⚠️ Invalid response format:', data);
          setDashboardData(defaultData);
          setError('Invalid response format from server');
        }
        
        console.log('=== DASHBOARD FETCH END ===\n');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Dashboard fetch error:', errorMessage);
        setError('Failed to load dashboard data');
        setDashboardData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch (user or not) to test the debug endpoint
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user?.fullName || user?.username}!
          </h2>
          <p className="text-gray-600">
            You have full administrative access to the platform.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {authLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Authenticating...</p>
            </div>
          </div>
        )}

        {!authLoading && (
          <>
            {/* User Stats */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">User Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AdminCard
                  icon={<Users className="w-6 h-6" />}
                  title="Total Users"
                  value={dashboardData.users.total.toString()}
                  description="All user accounts"
                  color="blue"
                />
                <AdminCard
                  icon={<CheckCircle className="w-6 h-6" />}
                  title="Active Users"
                  value={dashboardData.users.active.toString()}
                  description={`${dashboardData.users.inactive} inactive`}
                  color="green"
                />
                <AdminCard
                  icon={<Activity className="w-6 h-6" />}
                  title="Admins"
                  value={dashboardData.users.admins.toString()}
                  description={`${dashboardData.users.moderators} moderators`}
                  color="purple"
                />
                <AdminCard
                  icon={<AlertCircle className="w-6 h-6" />}
                  title="Locked Users"
                  value={dashboardData.users.locked.toString()}
                  description="Suspended accounts"
                  color="red"
                />
              </div>
            </div>

            {/* Content Stats */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Content Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AdminCard
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Published Content"
                  value={dashboardData.content.blogs.published.toString()}
                  description={`${dashboardData.content.blogs.draft} drafts`}
                  color="blue"
                />
                <AdminCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Total Views"
                  value={dashboardData.content.blogs.engagement.totalViews.toLocaleString()}
                  description="Blog/News views"
                  color="green"
                />
                <AdminCard
                  icon={<CheckCircle className="w-6 h-6" />}
                  title="Total Likes"
                  value={dashboardData.content.blogs.engagement.totalLikes.toString()}
                  description={`${dashboardData.content.blogs.engagement.totalComments} comments`}
                  color="pink"
                />
                <AdminCard
                  icon={<Megaphone className="w-6 h-6" />}
                  title="Advertisements"
                  value={dashboardData.content.advertisements.active.toString()}
                  description={`${dashboardData.content.advertisements.total} total`}
                  color="orange"
                />
              </div>
            </div>

            {/* Content Breakdown */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Content Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox
                  title="Blog Posts"
                  value={dashboardData.content.blogs.blog}
                  total={dashboardData.content.blogs.published}
                  percentage={
                    dashboardData.content.blogs.published > 0
                      ? ((dashboardData.content.blogs.blog / dashboardData.content.blogs.published) * 100).toFixed(1)
                      : '0'
                  }
                  icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
                />
                <StatBox
                  title="News Articles"
                  value={dashboardData.content.blogs.news}
                  total={dashboardData.content.blogs.published}
                  percentage={
                    dashboardData.content.blogs.published > 0
                      ? ((dashboardData.content.blogs.news / dashboardData.content.blogs.published) * 100).toFixed(1)
                      : '0'
                  }
                  icon={<AlertCircle className="w-5 h-5 text-red-600" />}
                />
                <StatBox
                  title="Ad Clicks"
                  value={dashboardData.content.advertisements.totalClicks}
                  total={dashboardData.content.advertisements.totalClicks}
                  percentage="100"
                  icon={<Megaphone className="w-5 h-5 text-orange-600" />}
                />
              </div>
            </div>

            {/* Security Stats */}
            {dashboardData.security.criticalEvents > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Security Alerts (24h)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SecurityAlert
                    title="Critical Events"
                    value={dashboardData.security.criticalEvents}
                    color="red"
                  />
                  <SecurityAlert
                    title="Failed Auth Attempts"
                    value={dashboardData.security.failedAuthAttempts}
                    color="orange"
                  />
                  <SecurityAlert
                    title="Locked Users"
                    value={dashboardData.security.lockedUsers}
                    color="yellow"
                  />
                </div>
              </div>
            )}

            {/* Admin Menu */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Management</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <AdminMenuItem
                  icon={<Users className="w-5 h-5" />}
                  title="User Management"
                  description="View, edit, and manage user accounts"
                  href="/admin/users"
                />
                <AdminMenuItem
                  icon={<BarChart3 className="w-5 h-5" />}
                  title="Content Moderation"
                  description="Review and moderate user-generated content"
                  href="/admin/moderation"
                />
                <AdminMenuItem
                  icon={<AlertCircle className="w-5 h-5" />}
                  title="Reports & Alerts"
                  description="View user reports and system alerts"
                  href="/admin/reports"
                />
                <AdminMenuItem
                  icon={<Megaphone className="w-5 h-5" />}
                  title="Manage Advertisements"
                  description="Create, edit, and manage advertisements"
                  href="/admin/advertisements"
                />
                <AdminMenuItem
                  icon={<Settings className="w-5 h-5" />}
                  title="System Settings"
                  description="Configure platform settings and features"
                  href="/admin/settings"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface AdminCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'pink';
}

interface AdminMenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

interface StatBoxProps {
  title: string;
  value: number;
  total: number;
  percentage: string;
  icon: React.ReactNode;
}

interface SecurityAlertProps {
  title: string;
  value: number;
  color: 'red' | 'orange' | 'yellow';
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  pink: 'bg-pink-50 border-pink-200 text-pink-700'
};

const iconColorMap = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600'
};

function AdminCard({ icon, title, value, description, color = 'blue' }: AdminCardProps) {
  return (
    <div className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition ${colorMap[color]}`}>
      <div className={`flex items-center justify-between mb-4 ${iconColorMap[color]}`}>
        <div>{icon}</div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

function StatBox({ title, value, total, percentage, icon }: StatBoxProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-600 mt-2">{percentage}% of published content</p>
    </div>
  );
}

function SecurityAlert({ title, value, color }: SecurityAlertProps) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  };

  return (
    <div className={`rounded-lg border p-6 shadow-sm ${colorClasses[color]}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function AdminMenuItem({ icon, title, description, href }: AdminMenuItemProps) {
  return (
    <Link
      href={href}
      className="p-6 hover:bg-gray-50 transition flex items-start gap-4 group"
    >
      <div className="text-blue-600 group-hover:text-blue-700 transition">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
          {title}
        </h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="text-gray-400 group-hover:text-blue-600 transition">→</div>
    </Link>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
