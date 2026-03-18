'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const POSITIONS = [
  'photo_top',
  'photo_bottom',
  'photo_sidebar',
  'destination_sidebar_1',
  'destination_sidebar_2',
  'destination_inside',
  'blog_top',
  'blog_sidebar',
  'blog_popup',
  'blog_content_paragraph_1',
  'blog_content_paragraph_2',
  'blog_content_paragraph_3',
  'blog_content_paragraph_4',
  'blog_content_paragraph_6',
  'blog_content_paragraph_8',
  'video_top',
  'video_bottom',
  'homepage_banner',
  'homepage_bottom',
  'footer'
];

function AddAdvertisementContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    weblink: '',
    position: 'blog_top',
    isActive: true,
    image: {
      url: '',
      alt: '',
      width: 0,
      height: 0
    }
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setFormData(prev => ({
        ...prev,
        image: {
          ...prev.image,
          url: reader.result as string
        }
      }));
    };
    reader.readAsDataURL(file);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setFormData(prev => ({
        ...prev,
        image: {
          ...prev.image,
          width: img.width,
          height: img.height
        }
      }));
    };
    img.src = URL.createObjectURL(file);

    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.image.url) {
        throw new Error('Image is required');
      }
      if (!formData.weblink.trim()) {
        throw new Error('Website link is required');
      }
      if (!formData.position) {
        throw new Error('Position is required');
      }

      // Validate URL
      try {
        new URL(formData.weblink);
      } catch {
        throw new Error('Invalid URL format');
      }

      const response = await fetch(`${API_URL}/api/advertisements`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create advertisement');
      }

      router.push('/admin/advertisements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating advertisement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/admin/advertisements"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Advertisements
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Advertisement</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Advertisement Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Summer Travel Deals"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Advertisement Image <span className="text-red-600">*</span>
              </label>
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="Preview" className="w-full max-w-sm rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview('');
                      setFormData(prev => ({ ...prev, image: { ...prev.image, url: '' } }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <Upload className="w-6 h-6" />
                  <span>Click to upload or drag and drop</span>
                  <span className="text-xs">PNG, JPG, GIF up to 5MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {formData.image.width && (
                <p className="text-xs text-gray-600 mt-2">
                  Image size: {formData.image.width}x{formData.image.height}px
                </p>
              )}
            </div>

            {/* Image Alt Text */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Image Alt Text
              </label>
              <input
                type="text"
                value={formData.image.alt}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  image: { ...prev.image, alt: e.target.value }
                }))}
                placeholder="Describe the image for accessibility"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Website Link */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Website Link <span className="text-red-600">*</span>
              </label>
              <input
                type="url"
                value={formData.weblink}
                onChange={(e) => setFormData(prev => ({ ...prev, weblink: e.target.value }))}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Position <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
              >
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                Choose where this advertisement will be displayed on the website
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-900">
                Activate this advertisement immediately
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create Advertisement'}
              </button>
              <Link
                href="/admin/advertisements"
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AddAdvertisementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AddAdvertisementContent />
    </ProtectedRoute>
  );
}
