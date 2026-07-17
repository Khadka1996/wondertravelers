'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ModeratorPageShell from '@/app/moderator/components/ModeratorPageShell';

interface ModerationUser {
  id: string;
  name: string;
  role: string;
  status: string;
}

const users = [
  { id: 'U-101', name: 'Anita Sharma', role: 'Moderator', status: 'Active' },
  { id: 'U-102', name: 'Ramesh Adhikari', role: 'User', status: 'Active' },
  { id: 'U-103', name: 'Maya Thapa', role: 'User', status: 'Inactive' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<ModerationUser[]>(users);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  return (
    <ProtectedRoute requiredRole="moderator">
      <ModeratorPageShell
        title="User Management"
        description="Review users and moderator assignments, without delete-only admin actions."
      >
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:outline-none focus:border-slate-500"
          />
        </div>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{user.id}</p>
                  <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                  <p className="text-slate-400">Role: {user.role}</p>
                </div>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">{user.status}</span>
              </div>
            </div>
          ))}
        </div>
      </ModeratorPageShell>
    </ProtectedRoute>
  );
}
