'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, CheckCircle2, CircleSlash } from 'lucide-react';

const comments = [
  {
    id: 'CM-301',
    author: 'Anita Sharma',
    excerpt: 'This article is misleading and seems promotional...',
    status: 'Pending',
    updated: '9m ago'
  },
  {
    id: 'CM-302',
    author: 'Ramesh Adhikari',
    excerpt: 'The comment includes inappropriate language...',
    status: 'Under review',
    updated: '23m ago'
  },
  {
    id: 'CM-303',
    author: 'Maya Thapa',
    excerpt: 'Please clarify the source of this data.',
    status: 'Pending',
    updated: '47m ago'
  }
];

function CommentsContent() {
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
              <h1 className="text-3xl font-bold text-white">Comments Queue</h1>
              <p className="text-slate-400 mt-1">Moderate comment submissions with clear approve/reject options.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 xl:grid-cols-3 mb-8">
          <InfoCard
            icon={<MessageSquare className="w-5 h-5" />}
            title="Pending Comments"
            value="24"
            description="Comments waiting for review"
          />
          <InfoCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="Approved"
            value="112"
            description="Comments approved this week"
          />
          <InfoCard
            icon={<CircleSlash className="w-5 h-5" />}
            title="Rejected"
            value="9"
            description="Comments rejected this week"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-sm">
          <div className="bg-slate-900 px-6 py-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Pending Comments</h2>
            <p className="text-sm text-slate-400 mt-1">Review each comment and approve or reject without delete-only actions.</p>
          </div>
          <div className="divide-y divide-slate-800">
            {comments.map((item) => (
              <div key={item.id} className="px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-400">{item.id}</p>
                  <h3 className="text-lg font-semibold text-white">{item.author}</h3>
                  <p className="text-sm text-slate-500 mb-2">{item.excerpt}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.status} • Updated {item.updated}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="rounded-full border border-emerald-600 bg-emerald-600/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/20 transition">
                    Approve
                  </button>
                  <button className="rounded-full border border-rose-600 bg-rose-600/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-600/20 transition">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value, description }: { icon: React.ReactNode; title: string; value: string; description: string; }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4 text-slate-200">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-3xl font-semibold text-white mb-2">{value}</p>
      <p className="text-sm text-slate-400">{description}</p>
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
