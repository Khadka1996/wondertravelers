'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, LogOut, Edit2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/login?redirect=/profile');
      return;
    }

    // Populate form with user data
    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
    });
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleUpdateProfile = async () => {
    // Validate form
    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    if (!formData.username.trim() || !/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setError('Username must contain only letters, numbers, underscore, and hyphen');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com'}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.fullName || user.username}</h2>
                <p className="text-blue-100">
                  {user.role === 'admin' && '👑 Administrator'}
                  {user.role === 'moderator' && '🛡️ Moderator'}
                  {user.role === 'user' && '👤 User'}
                </p>
              </div>
            </div>
          </div>

          {/* Account Info Section */}
          <div className="p-8 border-b border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <div className="text-red-400 mt-0.5">!</div>
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                <Check className="w-4 h-4 text-green-400 mt-0.5" />
                <p className="text-green-300">{success}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition ${
                    isEditing
                      ? 'bg-white/10 border-blue-500/50 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500'
                      : 'bg-white/5 border-white/10 text-slate-300 cursor-not-allowed'
                  }`}
                  placeholder="Your full name"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border transition ${
                    isEditing
                      ? 'bg-white/10 border-blue-500/50 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500'
                      : 'bg-white/5 border-white/10 text-slate-300 cursor-not-allowed'
                  }`}
                  placeholder="Your username"
                />
                {isEditing && (
                  <p className="text-xs text-slate-400 mt-1">
                    Alphanumeric, underscore, and hyphen only
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition ${
                      isEditing
                        ? 'bg-white/10 border-blue-500/50 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500'
                        : 'bg-white/5 border-white/10 text-slate-300 cursor-not-allowed'
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: user.fullName || '',
                        username: user.username || '',
                        email: user.email || '',
                      });
                      setError('');
                    }}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-8 border-b border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="User ID" value={user._id} />
              <InfoItem label="Account Status" value={user.active ? '✓ Active' : '✗ Inactive'} />
              <InfoItem
                label="Last Login"
                value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              />
              <InfoItem
                label="Member Since"
                value={new Date(user.createdAt || '').toLocaleDateString()}
              />
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-8 bg-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-6 py-3 rounded-lg transition w-full sm:w-auto justify-center sm:justify-start"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h4 className="text-blue-400 font-semibold mb-3">Data Security</h4>
          <ul className="text-blue-200 text-sm space-y-2">
            <li>✓ Your password is encrypted and never stored in plain text</li>
            <li>✓ This page is only accessible when you're logged in</li>
            <li>✓ Profile changes are immediate and permanent</li>
            <li>✓ Need to change your password? Use the forgot password option at login</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-white font-medium break-all">{value}</p>
    </div>
  );
}
