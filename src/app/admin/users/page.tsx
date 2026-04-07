'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit2, User, Search, X, Save, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react';


interface AdminUser {
  sno: number;
  id: string;
  _id?: string;
  username: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'moderator' | 'user';
  avatar?: string;
  status: 'active' | 'inactive';
  active?: boolean;
  joined: string;
  lastLogin?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface UserDetails extends AdminUser {
  phone?: string;
  phoneVerified?: boolean;
  twoFactorAuth?: boolean;
  trustedDevices?: number;
  trustedDevicesCount?: number;
  addresses?: Array<Record<string, unknown>>;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalEditData, setModalEditData] = useState<Partial<UserDetails> | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalModerators: 0,
    activeUsers: 0
  });

  // Get API Base URL
  const API_URL = '';

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API_URL]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (activeFilter) params.append('status', activeFilter === 'true' ? 'active' : activeFilter === 'false' ? 'inactive' : '');

      const response = await fetch(`${API_URL}/api/users?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData?.message || `HTTP ${response.status}: Failed to fetch users`);
      }

      const data = await response.json();
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
      setPage(data.pagination?.page || 1);
      await fetchStats();
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load users';
      setErrorMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, limit, searchTerm, roleFilter, activeFilter, fetchStats]);

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    try {
      setUserDetailsLoading(true);
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('User Details API Error:', response.status, errorData);
        throw new Error(errorData?.message || `HTTP ${response.status}: Failed to fetch user details`);
      }

      const data = await response.json();
      setSelectedUser(data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load user details';
      setErrorMsg(errorMsg);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on filter change
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, activeFilter, fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [page, fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!newRole) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData?.message || `Failed to update user role (HTTP ${response.status})`);
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'moderator' | 'user' } : u));
      setEditingUserId(null);
      setSuccessMsg('User role updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update user role';
      setErrorMsg(errorMsg);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveModalChanges = async () => {
    if (!selectedUser || !modalEditData) return;

    try {
      setUpdating(true);
      const updatePayload: Record<string, unknown> = {};

      if (modalEditData.fullName !== selectedUser.fullName) updatePayload.fullName = modalEditData.fullName;
      if (modalEditData.email !== selectedUser.email) updatePayload.email = modalEditData.email;
      if (modalEditData.phone !== selectedUser.phone) updatePayload.phone = modalEditData.phone;
      if (modalEditData.role !== selectedUser.role) updatePayload.role = modalEditData.role;
      if (modalEditData.status !== selectedUser.status) updatePayload.status = modalEditData.status;

      if (Object.keys(updatePayload).length === 0) {
        setModalEditMode(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData?.message || `Failed to update user (HTTP ${response.status})`);
      }

      const updatedUser = { ...selectedUser, ...modalEditData };
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...modalEditData as AdminUser } : u));
      setModalEditMode(false);
      setSuccessMsg('User information updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update user';
      setErrorMsg(errorMsg);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          softDelete: true,
          reason: 'User deleted via admin dashboard'
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData?.message || `Failed to delete user (HTTP ${response.status})`);
      }

      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
      setSuccessMsg('User deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete user';
      setErrorMsg(errorMsg);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setDeleting(false);
    }
  };

  // Check session/authentication status
  const checkSession = async () => {
    try {
      setCheckingSession(true);
      const response = await fetch(`/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSuccessMsg(`✓ Logged in as: ${data.user?.username} (${data.user?.role})`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Session check failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Session check failed';
      setErrorMsg(`Session Error: ${errorMsg}`);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setCheckingSession(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-yellow-100 text-yellow-800',
      user: 'bg-blue-100 text-blue-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">Manage all users and their roles</p>
        </div>
        <button
          onClick={checkSession}
          disabled={checkingSession}
          className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {checkingSession ? 'Checking...' : 'Check Session'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Admins</p>
          <p className="text-2xl font-bold text-red-600">{stats.totalAdmins}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Moderators</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.totalModerators}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Active Users</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
        </div>
      </div>

      {/* Success/Error Messages */}
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
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">S.No</th>
                <th className="px-6 py-3 text-left font-semibold">User Info</th>
                <th className="px-6 py-3 text-left font-semibold">Email</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr key="loading">
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader className="inline animate-spin" size={32} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr key="empty">
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <User size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-700">{((page - 1) * limit) + index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full" />
                          ) : (
                            <User size={20} className="text-blue-600" />
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
                      {editingUserId === user._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-linear-to-br from-blue-50 to-blue-100"
                          >
                            <option value="admin" className="bg-white">Admin</option>
                            <option value="moderator" className="bg-white">Moderator</option>
                            <option value="user" className="bg-white">User</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-center">
                        {editingUserId === user._id ? (
                          <>
                            <button
                              onClick={() => handleUpdateRole(user.id, editingRole)}
                              disabled={updating}
                              className="px-4 py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                            >
                              {updating ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => fetchUserDetails(user.id)}
                              title="View user info"
                              className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-md hover:shadow-lg"
                            >
                              <Info size={14} />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingUserId(user.id);
                                setEditingRole(user.role);
                              }}
                              className="px-3 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium flex items-center gap-1 transition-all shadow-md hover:shadow-lg"
                            >
                              <Edit2 size={14} />
                              <span className="hidden sm:inline">Edit Role</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users</p>
              <p className="text-xs text-gray-500 mt-1">Page {page} of {totalPages}</p>
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
                          p === page
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-100'
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold mb-4">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {deleting && <Loader size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Information</h2>
              <div className="flex gap-2 items-center">
                {modalEditMode ? (
                  <>
                    <button
                      onClick={() => handleSaveModalChanges()}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                      {updating ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setModalEditMode(false);
                        setModalEditData(null);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setModalEditMode(true);
                      setModalEditData(selectedUser);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {userDetailsLoading ? (
              <div className="p-6 flex justify-center">
                <Loader className="animate-spin" size={32} />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center shrink-0">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.username} className="w-full h-full rounded-full" />
                    ) : (
                      <User size={40} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    {modalEditMode ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={modalEditData?.fullName || ''}
                          onChange={(e) => setModalEditData({ ...modalEditData, fullName: e.target.value })}
                          placeholder="Full Name"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          value={modalEditData?.email || ''}
                          onChange={(e) => setModalEditData({ ...modalEditData, email: e.target.value })}
                          placeholder="Email"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold">{selectedUser.fullName || selectedUser.username}</h3>
                        <p className="text-gray-600">@{selectedUser.username}</p>
                        <p className="text-gray-600">{selectedUser.email}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Role and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Role</label>
                    {modalEditMode ? (
                      <select
                        value={modalEditData?.role || selectedUser.role}
                        onChange={(e) => setModalEditData({ ...modalEditData, role: e.target.value as 'admin' | 'moderator' | 'user' })}
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-linear-to-br from-blue-50 to-blue-100 font-medium text-gray-800"
                      >
                        <option value="admin" className="bg-white">Admin - Full Access</option>
                        <option value="moderator" className="bg-white">Moderator - Moderate Content</option>
                        <option value="user" className="bg-white">User - Regular Access</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role === 'admin' && 'Admin'}
                          {selectedUser.role === 'moderator' && 'Moderator'}
                          {selectedUser.role === 'user' && 'User'}
                        </span>
                        <p className="text-xs text-gray-500 ml-2">
                          {selectedUser.role === 'admin' && 'Full system access'}
                          {selectedUser.role === 'moderator' && 'Content management'}
                          {selectedUser.role === 'user' && 'Regular user access'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Account Status</label>
                    {modalEditMode ? (
                      <select
                        value={modalEditData?.status || selectedUser.status}
                        onChange={(e) => setModalEditData({ ...modalEditData, status: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-linear-to-br from-blue-50 to-blue-100 font-medium text-gray-800"
                      >
                        <option value="active" className="bg-white">🟢 Active</option>
                        <option value="inactive" className="bg-white">🔴 Inactive</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold capitalize ${
                        selectedUser.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email Verified:</span>
                      <span className={`font-medium ${selectedUser.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.emailVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone:</span>
                      {modalEditMode ? (
                        <input
                          type="text"
                          value={modalEditData?.phone || ''}
                          onChange={(e) => setModalEditData({ ...modalEditData, phone: e.target.value })}
                          placeholder="Phone number"
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-auto"
                        />
                      ) : (
                        <span className="font-medium">{selectedUser.phone || 'Not provided'}</span>
                      )}
                    </div>
                    {(selectedUser.phone || (modalEditMode && modalEditData?.phone)) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phone Verified:</span>
                        <span className={`font-medium ${selectedUser.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.phoneVerified ? '✓ Yes' : '✗ No'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Dates */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Account Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Created:</span>
                      <span className="font-medium">{formatDate(selectedUser.joined)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="font-medium">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</span>
                    </div>
                  </div>
                </div>

                {/* Security Information */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Security</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Two-Factor Authentication:</span>
                      <span className={`font-medium ${selectedUser.twoFactorAuth ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedUser.twoFactorAuth ? '✓ Enabled' : '✗ Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trusted Devices:</span>
                      <span className="font-medium">
                        {Array.isArray(selectedUser.trustedDevices) ? selectedUser.trustedDevices.length : (selectedUser.trustedDevicesCount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Addresses</h4>
                    <div className="space-y-2">
                      {selectedUser.addresses?.map((addr: Record<string, unknown>, idx: number) => (
                        <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                          <p className="font-medium">{(addr.label as string) || 'Address'}</p>
                          <p className="text-gray-600">{addr.street as string}</p>
                          <p className="text-gray-600">{addr.city as string}, {addr.state as string} {addr.postalCode as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User ID */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <p className="text-xs text-gray-500 font-mono break-all">{selectedUser.id}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
