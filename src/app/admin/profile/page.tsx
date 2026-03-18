'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Upload, Save, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ProfileData {
  _id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  role: 'admin' | 'moderator' | 'user';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading2, setLoading2] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Use auth context user data to populate profile
    if (user) {
      const profileData: ProfileData = {
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        role: user.role || 'user',
        avatar: user.avatar || '',
      };
      
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
      });
      
      if (profileData.avatar) {
        setAvatarPreview(profileData.avatar);
      }
      
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading2(true);

      // Update profile via API
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const data = await response.json();
      const updatedProfile = {
        ...profile,
        ...data.data,
      } as ProfileData;

      // If avatar was changed, upload it separately
      if (avatar) {
        await handleAvatarUpload(avatar);
      }

      setProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      setAvatar(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error updating profile' });
    } finally {
      setLoading2(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_URL}/api/auth/avatar/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      if (data.data?.avatar) {
        setAvatarPreview(data.data.avatar);
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error uploading avatar' });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    try {
      setLoading2(true);

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error changing password' });
    } finally {
      setLoading2(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#174fa2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and security settings</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {message.type === 'success' ? (
            <Check className={`w-5 h-5 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>{message.text}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Avatar & Basic Info */}
        <div className="p-6 sm:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden border-2 border-[#174fa2]">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#174fa2]">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
              <p className="text-gray-600 mb-2">@{profile.username}</p>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#174fa2]" />
                <span className="px-3 py-1 bg-[#174fa2] text-white text-xs font-semibold rounded-full capitalize">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-[#174fa2] text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6 sm:p-8">
          {!editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                <p className="mt-1 text-lg text-gray-900">{profile.firstName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                <p className="mt-1 text-lg text-gray-900">{profile.lastName}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <p className="mt-1 text-lg text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <p className="mt-1 text-lg text-gray-900">{profile.address || 'Not provided'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden border-2 border-[#174fa2]">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#174fa2]">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Change Photo</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setAvatar(null);
                    if (profile) {
                      setAvatarPreview(profile.avatar || '');
                      setFormData({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email,
                        phoneNumber: profile.phoneNumber || '',
                        address: profile.address || '',
                      });
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading2}
                  className="px-4 py-2 bg-[#174fa2] text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading2 ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Security Section */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Security & Password</h3>
              <p className="text-sm text-gray-600 mt-1">Change your password and manage security</p>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                    placeholder="Enter your current password"
                  />
                  <button
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                    placeholder="Enter new password (minimum 8 characters)"
                  />
                  <button
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#174fa2] focus:border-transparent transition"
                    placeholder="Confirm your new password"
                  />
                  <button
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading2}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading2 ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
