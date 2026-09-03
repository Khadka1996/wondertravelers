'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Star,
  FileText,
  MessageSquare,
  ClipboardList,
  ShieldAlert,
  CheckCircle,
  Ban,
  Activity,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { API_URL } from '@/lib/apiUrl';

interface Summary {
  users: { total: number; active: number; deactivated: number };
  logins: { successful: number; failed: number; failureRate: string };
  security: { suspiciousActivities: number };
}

const EMPTY: Summary = {
  users: { total: 0, active: 0, deactivated: 0 },
  logins: { successful: 0, failed: 0, failureRate: 'N/A' },
  security: { suspiciousActivities: 0 },
};

function ModeratorDashboardContent() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<Summary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/moderator/security/summary?days=7`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || `Failed to load summary (HTTP ${res.status})`);
        }
        const json = await res.json();
        if (json?.success && json?.data) {
          setData({
            users: json.data.users ?? EMPTY.users,
            logins: json.data.logins ?? EMPTY.logins,
            security: json.data.security ?? EMPTY.security,
          });
          setError('');
        } else {
          setError('Unexpected response from server');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
        setData(EMPTY);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome, {user?.fullName || user?.username || 'Moderator'}!
        </h2>
        <p className="text-gray-600">
          Moderation tools for users, featured images, blog posts, and reported content.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {authLoading || loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Overview (last 7 days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                title="Total Users"
                value={data.users.total}
                hint={`${data.users.active} active`}
                color="amber"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                title="Active Users"
                value={data.users.active}
                hint={`${data.users.deactivated} deactivated`}
                color="green"
              />
              <StatCard
                icon={<Ban className="w-6 h-6" />}
                title="Login Failures"
                value={data.logins.failed}
                hint={`${data.logins.failureRate} failure rate`}
                color="red"
              />
              <StatCard
                icon={<ShieldAlert className="w-6 h-6" />}
                title="Suspicious Events"
                value={data.security.suspiciousActivities}
                hint="high / critical severity"
                color="orange"
              />
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Moderation Tools</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
              <ToolLink
                href="/moderator/users"
                icon={<Users className="w-5 h-5" />}
                title="User Management"
                desc="Deactivate, reactivate, force logout, review activity"
              />
              <ToolLink
                href="/moderator/featured-images"
                icon={<Star className="w-5 h-5" />}
                title="Featured Images"
                desc="Upload, reorder, and toggle homepage images"
              />
              <ToolLink
                href="/moderator/blog/edit"
                icon={<FileText className="w-5 h-5" />}
                title="Blog Posts"
                desc="Review and remove published posts"
              />
              <ToolLink
                href="/moderator/review"
                icon={<ClipboardList className="w-5 h-5" />}
                title="Content Review"
                desc="Approve or reject flagged content"
              />
              <ToolLink
                href="/moderator/comments"
                icon={<MessageSquare className="w-5 h-5" />}
                title="Comments"
                desc="Moderate reported comments"
              />
              <ToolLink
                href="/moderator/reports"
                icon={<Activity className="w-5 h-5" />}
                title="Reports & Audit"
                desc="Security summary and audit log"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const cardColor: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
};

function StatCard({
  icon,
  title,
  value,
  hint,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  hint: string;
  color: keyof typeof cardColor;
}) {
  return (
    <div className={`rounded-lg border p-5 shadow-sm ${cardColor[color]}`}>
      <div className="mb-3">{icon}</div>
      <h4 className="text-gray-600 text-sm font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-600">{hint}</p>
    </div>
  );
}

function ToolLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="p-5 hover:bg-gray-50 transition flex items-start gap-4 group">
      <div className="text-amber-600 group-hover:text-amber-700 transition">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 group-hover:text-amber-700 transition">{title}</h4>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
      <div className="text-gray-400 group-hover:text-amber-600 transition">→</div>
    </Link>
  );
}

export default function ModeratorDashboard() {
  // Role is enforced by the server layout (requireRole(['moderator','admin'])).
  return (
    <ProtectedRoute requiredRole={null}>
      <ModeratorDashboardContent />
    </ProtectedRoute>
  );
}
