'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Search,
  Loader,
  CheckCircle,
  AlertCircle,
  Info,
  Ban,
  RotateCcw,
  LogOut,
  X,
  ShieldAlert,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { API_URL } from '@/lib/apiUrl';

interface ModUser {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'moderator' | 'user';
  avatar?: string;
  active?: boolean;
  lastLogin?: string;
  failedLoginAttemptsCount?: number;
  createdAt?: string;
}

interface AuditRow {
  action: string;
  category?: string;
  severity?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  createdAt?: string;
}

type ModalTab = 'info' | 'history' | 'activity';

const PAGE_LIMIT = 20;

function formatDate(value?: string) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value?: string) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function roleBadge(role: string) {
  const map: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    moderator: 'bg-amber-100 text-amber-800',
    user: 'bg-blue-100 text-blue-800',
  };
  return map[role] || 'bg-gray-100 text-gray-800';
}

function ModeratorUsersContent() {
  const [users, setUsers] = useState<ModUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [stats, setStats] = useState({ total: 0, active: 0, deactivated: 0, suspicious: 0 });

  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<null | {
    type: 'deactivate' | 'reactivate' | 'force-logout';
    user: ModUser;
  }>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [detailUser, setDetailUser] = useState<ModUser | null>(null);
  const [detailTab, setDetailTab] = useState<ModalTab>('info');
  const [detailLoading, setDetailLoading] = useState(false);
  const [history, setHistory] = useState<AuditRow[]>([]);
  const [activity, setActivity] = useState<AuditRow[]>([]);

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };
  const flashError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/moderator/security/summary?days=7`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats({
        total: data?.data?.users?.total ?? 0,
        active: data?.data?.users?.active ?? 0,
        deactivated: data?.data?.users?.deactivated ?? 0,
        suspicious: data?.data?.security?.suspiciousActivities ?? 0,
      });
    } catch {
      /* stats are best-effort */
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_LIMIT.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (activeFilter) params.append('active', activeFilter);

      const res = await fetch(`${API_URL}/api/moderator/users?${params}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(err?.message || `HTTP ${res.status}: Failed to load users`);
      }
      const data = await res.json();
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      flashError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, roleFilter, activeFilter]);

  // Debounced refetch when filters change (also resets to page 1)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 450);
    return () => clearTimeout(t);
  }, [searchTerm, roleFilter, activeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [page, fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const runAction = async () => {
    if (!pendingAction) return;
    const { type, user } = pendingAction;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/moderator/users/${user._id}/${type}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'force-logout' ? {} : { reason: reason || 'No reason provided' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Action failed (HTTP ${res.status})`);
      }

      if (type === 'deactivate') {
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, active: false } : u)));
        flashSuccess(`${user.username} has been deactivated`);
      } else if (type === 'reactivate') {
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, active: true } : u)));
        flashSuccess(`${user.username} has been reactivated`);
      } else {
        flashSuccess(`${user.username} was logged out of all sessions`);
      }
      setPendingAction(null);
      setReason('');
      setActionUserId(null);
      fetchStats();
    } catch (error) {
      flashError(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetails = async (user: ModUser) => {
    setDetailUser(user);
    setDetailTab('info');
    setHistory([]);
    setActivity([]);
    try {
      setDetailLoading(true);
      const res = await fetch(`${API_URL}/api/moderator/users/${user._id}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setDetailUser({ ...user, ...(data.data || {}) });
      }
    } catch {
      /* keep the row data we already have */
    } finally {
      setDetailLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!detailUser || history.length) return;
    try {
      setDetailLoading(true);
      const res = await fetch(
        `${API_URL}/api/moderator/users/${detailUser._id}/login-history?limit=25`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json' } },
      );
      if (res.ok) {
        const data = await res.json();
        setHistory(data?.data?.loginHistory || []);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const loadActivity = async () => {
    if (!detailUser || activity.length) return;
    try {
      setDetailLoading(true);
      const res = await fetch(
        `${API_URL}/api/moderator/users/${detailUser._id}/activity?limit=50`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json' } },
      );
      if (res.ok) {
        const data = await res.json();
        setActivity(data?.data?.activities || []);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (detailTab === 'history') loadHistory();
    if (detailTab === 'activity') loadActivity();
  }, [detailTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">
          Review accounts and apply moderation actions. Deleting users and changing roles are
          admin-only.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-amber-600">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Deactivated</p>
          <p className="text-2xl font-bold text-red-600">{stats.deactivated}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Suspicious (7d)</p>
          <p className="text-2xl font-bold text-orange-600">{stats.suspicious}</p>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">S.No</th>
                <th className="px-6 py-3 text-left font-semibold">User Info</th>
                <th className="px-6 py-3 text-left font-semibold">Email</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr key="loading">
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Loader className="inline animate-spin text-amber-600" size={32} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr key="empty">
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <User size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {(page - 1) * PAGE_LIMIT + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName || user.username}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${roleBadge(
                            user.role,
                          )}`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.active === false ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Deactivated
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center flex-wrap">
                          <button
                            onClick={() => openDetails(user)}
                            title="View details"
                            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-sm"
                          >
                            <Info size={14} />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          {user.active === false ? (
                            <button
                              onClick={() => {
                                setPendingAction({ type: 'reactivate', user });
                                setReason('');
                              }}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-sm"
                            >
                              <RotateCcw size={14} />
                              <span className="hidden sm:inline">Reactivate</span>
                            </button>
                          ) : (
                            <button
                              disabled={isAdmin}
                              onClick={() => {
                                setPendingAction({ type: 'deactivate', user });
                                setReason('');
                              }}
                              title={isAdmin ? 'Admins cannot be deactivated by a moderator' : 'Deactivate'}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-sm"
                            >
                              <Ban size={14} />
                              <span className="hidden sm:inline">Deactivate</span>
                            </button>
                          )}

                          <button
                            onClick={() => setActionUserId(actionUserId === user._id ? null : user._id)}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-sm"
                            title="More actions"
                          >
                            •••
                          </button>

                          {actionUserId === user._id && (
                            <button
                              onClick={() => {
                                setPendingAction({ type: 'force-logout', user });
                                setReason('');
                              }}
                              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-sm"
                            >
                              <LogOut size={14} />
                              <span className="hidden sm:inline">Force logout</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                Showing {(page - 1) * PAGE_LIMIT + 1} to {Math.min(page * PAGE_LIMIT, total)} of{' '}
                {total} users
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Page {page} of {totalPages}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                ← Previous
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          p === page ? 'bg-amber-600 text-white' : 'border hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action confirm modal */}
      {pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-full">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold capitalize">
                  {pendingAction.type.replace('-', ' ')}
                </h3>
                <p className="text-sm text-gray-600">
                  {pendingAction.type === 'deactivate' &&
                    `Prevent ${pendingAction.user.username} from logging in.`}
                  {pendingAction.type === 'reactivate' &&
                    `Restore login access for ${pendingAction.user.username}.`}
                  {pendingAction.type === 'force-logout' &&
                    `End all active sessions for ${pendingAction.user.username}.`}
                </p>
              </div>
            </div>

            {pendingAction.type !== 'force-logout' && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional, logged to the audit trail)"
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setPendingAction(null);
                  setReason('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={runAction}
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 font-medium flex items-center gap-2"
              >
                {submitting && <Loader size={16} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{detailUser.fullName || detailUser.username}</h2>
                <p className="text-sm text-gray-500">@{detailUser.username}</p>
              </div>
              <button
                onClick={() => setDetailUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-4 flex gap-2 border-b">
              {(['info', 'history', 'activity'] as ModalTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition ${
                    detailTab === tab
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'history' ? 'Login history' : tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {detailLoading && (
                <div className="py-8 text-center">
                  <Loader className="inline animate-spin text-amber-600" size={28} />
                </div>
              )}

              {!detailLoading && detailTab === 'info' && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-medium">{detailUser.email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Role</dt>
                    <dd className="font-medium capitalize">{detailUser.role}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Status</dt>
                    <dd className="font-medium">
                      {detailUser.active === false ? 'Deactivated' : 'Active'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Failed logins</dt>
                    <dd className="font-medium">{detailUser.failedLoginAttemptsCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Last login</dt>
                    <dd className="font-medium">{formatDateTime(detailUser.lastLogin)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Joined</dt>
                    <dd className="font-medium">{formatDate(detailUser.createdAt)}</dd>
                  </div>
                </dl>
              )}

              {!detailLoading && detailTab === 'history' && (
                <AuditList rows={history} emptyLabel="No login history recorded." />
              )}
              {!detailLoading && detailTab === 'activity' && (
                <AuditList rows={activity} emptyLabel="No activity recorded." />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditList({ rows, emptyLabel }: { rows: AuditRow[]; emptyLabel: string }) {
  if (!rows.length) {
    return <p className="text-sm text-gray-500 py-6 text-center">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-3">
      {rows.map((row, i) => (
        <li key={i} className="border rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">{row.action}</span>
            <span className="text-xs text-gray-400">{formatDateTime(row.createdAt)}</span>
          </div>
          {row.details && <p className="text-gray-600 mt-1">{row.details}</p>}
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
            {row.ipAddress && <span>IP {row.ipAddress}</span>}
            {row.severity && <span className="uppercase">{row.severity}</span>}
            {typeof row.success === 'boolean' && (
              <span className={row.success ? 'text-green-600' : 'text-red-600'}>
                {row.success ? 'success' : 'failed'}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ModeratorUsersPage() {
  // The server layout (requireRole(['moderator','admin'])) is the real gate;
  // ProtectedRoute here only guards against an unauthenticated client render.
  return (
    <ProtectedRoute requiredRole={null}>
      <ModeratorUsersContent />
    </ProtectedRoute>
  );
}
