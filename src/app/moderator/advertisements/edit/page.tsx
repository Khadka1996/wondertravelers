'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import ModeratorPageShell from '@/app/moderator/components/ModeratorPageShell';

export default function EditAdvertisement() {
  return (
    <ProtectedRoute requiredRole="moderator">
      <ModeratorPageShell
        title="Edit Advertisement"
        description="Update existing advertisement details and visibility settings."
      >
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
          <p className="text-slate-400">This page is scaffolded for moderator advertisement editing. Fill in the form and preview features as needed.</p>
        </div>
      </ModeratorPageShell>
    </ProtectedRoute>
  );
}
