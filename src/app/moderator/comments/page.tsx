'use client';

import { MessageSquare } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function CommentsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Comments</h1>
        <p className="text-gray-600">Moderate reported comments with approve / reject actions.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-10 text-center">
        <MessageSquare className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Comment moderation coming soon</h2>
        <p className="text-gray-600 max-w-md mx-auto text-sm">
          The comment moderation queue will appear here once the backend comment API is enabled.
          Until then, use Content Review for flagged posts.
        </p>
      </div>
    </div>
  );
}

export default function Comments() {
  return (
    <ProtectedRoute requiredRole={null}>
      <CommentsContent />
    </ProtectedRoute>
  );
}
