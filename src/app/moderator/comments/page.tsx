'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function CommentsContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/moderator/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Comments Queue</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Comments Under Review</h2>
          <p className="text-slate-300 mb-6">Coming soon - Review pending comments and replies.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Pending Comments"
              description="Comments awaiting approval"
              status="Coming Soon"
            />
            <FeatureCard
              title="Approve/Reject"
              description="Review and moderate comments"
              status="Coming Soon"
            />
            <FeatureCard
              title="Comment History"
              description="Review past moderation decisions"
              status="Coming Soon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, status }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-purple-500/30 transition">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      <span className="inline-block text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded">
        {status}
      </span>
    </div>
  );
}

export default function Comments() {
  return (
    <ProtectedRoute requiredRole="moderator">
      <CommentsContent />
    </ProtectedRoute>
  );
}
