'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function ReviewContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Review</h1>
        <p className="text-gray-600">Review flagged posts and media, then approve or reject.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-10 text-center">
        <ClipboardList className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Review queue coming soon</h2>
        <p className="text-gray-600 max-w-md mx-auto text-sm">
          Flagged content will be listed here once the reporting API is enabled. Published blog
          posts can already be reviewed and removed from{' '}
          <Link href="/moderator/blog/edit" className="text-amber-700 underline">
            Blog Posts
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function Review() {
  return (
    <ProtectedRoute requiredRole={null}>
      <ReviewContent />
    </ProtectedRoute>
  );
}
