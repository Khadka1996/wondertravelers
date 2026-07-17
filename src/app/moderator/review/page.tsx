'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, FileSearch, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const reviewTasks = [
  {
    id: 'RQ-101',
    title: 'Flagged travel blog post',
    category: 'Blog',
    status: 'Needs review',
    updated: '17 minutes ago'
  },
  {
    id: 'RQ-102',
    title: 'Suspicious news article',
    category: 'News',
    status: 'Pending approval',
    updated: '42 minutes ago'
  },
  {
    id: 'RQ-103',
    title: 'Image content flagged by AI',
    category: 'Media',
    status: 'Under review',
    updated: '1 hour ago'
  }
];

function ReviewContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-700/60 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/moderator/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Review Content</h1>
              <p className="text-slate-400 mt-1">Moderate flagged posts, verify reports, and approve safe content.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 xl:grid-cols-3 mb-8">
          <InfoCard
            icon={<FileSearch className="w-5 h-5" />}
            title="Review Queue"
            value="12"
            description="Items waiting for moderator review"
            accent="bg-slate-800 text-slate-100"
          />
          <InfoCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Safe Approvals"
            value="37"
            description="Content approved by moderators"
            accent="bg-slate-800 text-slate-100"
          />
          <InfoCard
            icon={<AlertCircle className="w-5 h-5" />}
            title="Flagged Items"
            value="8"
            description="Reported items under review"
            accent="bg-slate-800 text-slate-100"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-sm">
          <div className="bg-slate-900 px-6 py-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Review Task List</h2>
            <p className="text-sm text-slate-400 mt-1">Review items and take moderation actions without admin-only delete controls.</p>
          </div>

          <div className="divide-y divide-slate-800">
            {reviewTasks.map((task) => (
              <div key={task.id} className="px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-400">{task.id}</p>
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <p className="text-sm text-slate-500">{task.category} • Updated {task.updated}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 border border-slate-700">{task.status}</span>
                  <Link href="/moderator/review" className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 transition">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value, description, accent }: { icon: React.ReactNode; title: string; value: string; description: string; accent: string; }) {
  return (
    <div className={`rounded-3xl border border-slate-700 p-6 ${accent}`}>
      <div className="flex items-center justify-between mb-4 text-slate-100">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-3xl font-semibold text-white mb-2">{value}</p>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

export default function Review() {
  return (
    <ProtectedRoute requiredRole="moderator">
      <ReviewContent />
    </ProtectedRoute>
  );
}
