/**
 * 🔐 MODERATOR DASHBOARD - SERVER COMPONENT
 * 
 * This page is safe because:
 * 1. Parent layout (layout.tsx) verifies moderator role on server
 * 2. This page only renders if layout verification succeeds
 * 3. No client-side auth check needed (already done by layout)
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LogOut, Settings, Shield, MessageSquare, AlertCircle, Flag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ModeratorDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Moderator Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome, {user?.fullName || user?.username}!
          </h2>
          <p className="text-slate-300">
            You have moderation access to manage content and user behavior on the platform.
          </p>
        </div>

        {/* Moderator Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ModeratorCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Pending Review"
            value="--"
            description="Items awaiting moderation"
          />
          <ModeratorCard
            icon={<Flag className="w-6 h-6" />}
            title="Reports"
            value="--"
            description="User reports received"
          />
          <ModeratorCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Comments"
            value="--"
            description="Comments under review"
          />
          <ModeratorCard
            icon={<Shield className="w-6 h-6" />}
            title="Moderation Score"
            value="--"
            description="Your activity score"
          />
        </div>

        {/* Moderator Menu */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">Moderation Tools</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <ModeratorMenuItem
              icon={<AlertCircle className="w-5 h-5" />}
              title="Review Content"
              description="Review flagged content and take action"
              href="/moderator/review"
            />
            <ModeratorMenuItem
              icon={<Flag className="w-5 h-5" />}
              title="User Reports"
              description="Review and respond to user reports"
              href="/moderator/reports"
            />
            <ModeratorMenuItem
              icon={<MessageSquare className="w-5 h-5" />}
              title="Comments Queue"
              description="Review pending comments and replies"
              href="/moderator/comments"
            />
            <ModeratorMenuItem
              icon={<Settings className="w-5 h-5" />}
              title="Moderator Settings"
              description="Update your preferences and settings"
              href="/moderator/settings"
            />
          </div>
        </div>

        {/* Activity Guidelines */}
        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
          <h4 className="text-amber-400 font-semibold mb-3">Moderation Guidelines</h4>
          <ul className="text-amber-200 text-sm space-y-2">
            <li>✓ Maintain objectivity and fairness in all decisions</li>
            <li>✓ Document reasons for content removal or user warnings</li>
            <li>✓ Refer escalated issues to administrators</li>
            <li>✓ Follow community standards and platform policies</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface ModeratorCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

interface ModeratorMenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function ModeratorCard({ icon, title, value, description }: ModeratorCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-6 hover:border-purple-500/50 transition">
      <div className="flex items-center justify-between mb-4">
        <div className="text-purple-400">{icon}</div>
      </div>
      <h3 className="text-slate-300 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

function ModeratorMenuItem({ icon, title, description, href }: ModeratorMenuItemProps) {
  return (
    <Link
      href={href}
      className="p-6 hover:bg-white/5 transition flex items-start gap-4 group"
    >
      <div className="text-purple-400 group-hover:text-purple-300 transition">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-white group-hover:text-purple-300 transition">
          {title}
        </h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="text-slate-500 group-hover:text-purple-400 transition">→</div>
    </Link>
  );
}

export default function ModeratorDashboard() {
  return (
    <ProtectedRoute requiredRole="moderator">
      <ModeratorDashboardContent />
    </ProtectedRoute>
  );
}
