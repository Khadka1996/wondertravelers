'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const API_URL = '';

interface Advertisement {
  _id: string;
  title: string;
  image: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  weblink: string;
  position: string;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  createdBy?: {
    _id: string;
    username: string;
  };
}

const POSITIONS = [
  'photo_top',
  'photo_bottom',
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

function AdvertisementManagementContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAds, setTotalAds] = useState(0);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const itemsPerPage = 10;

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError('');

      let query = `?skip=${(currentPage - 1) * itemsPerPage}&limit=${itemsPerPage}`;
      if (positionFilter) query += `&position=${positionFilter}`;

      const response = await fetch(`${API_URL}/api/advertisements${query}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch advertisements');

      const data = await response.json();
      let ads = data.advertisements || [];

      // Filter by search term
      if (searchTerm) {
        ads = ads.filter((ad: Advertisement) =>
          ad.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by active status
      if (activeFilter === 'active') {
        ads = ads.filter((ad: Advertisement) => ad.isActive);
      } else if (activeFilter === 'inactive') {
        ads = ads.filter((ad: Advertisement) => !ad.isActive);
      }

      setAdvertisements(ads);
      setTotalAds(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [currentPage, positionFilter]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/advertisements/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete advertisement');

      setAdvertisements(advertisements.filter(ad => ad._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting advertisement');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/advertisements/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update advertisement');

      const updated = await response.json();
      setAdvertisements(
        advertisements.map(ad =>
          ad._id === id ? updated.advertisement : ad
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating advertisement');
    }
  };

  const totalPages = Math.ceil(totalAds / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Manage Advertisements</h1>
            <Link
              href="/admin/advertisements/add"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Advertisement
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Total Advertisements</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalAds}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {advertisements.filter(ad => ad.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm">Total Clicks</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {advertisements.reduce((sum, ad) => sum + ad.clicks, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Position Filter */}
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Positions</option>
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>

            {/* Active Filter */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading advertisements...</p>
          </div>
        )}

        {/* Advertisement Table */}
        {!loading && advertisements.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {advertisements.map(ad => (
                    <tr key={ad._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="relative w-16 h-12">
                          <Image
                            src={ad.image.url}
                            alt={ad.image.alt || ad.title}
                            fill
                            className="object-cover rounded border border-gray-300"
                            unoptimized
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-medium">{ad.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {ad.position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{ad.clicks}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(ad._id, ad.isActive)}
                          className={`p-2 rounded transition ${
                            ad.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={ad.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {ad.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(ad.weblink);
                          }}
                          className="p-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/advertisements/${ad._id}/edit`}
                            className="p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(ad._id)}
                            className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Ads */}
        {!loading && advertisements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-600 mb-4">No advertisements found</p>
            <Link
              href="/admin/advertisements/add"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Create First Advertisement
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-sm shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Advertisement?</h3>
            <p className="text-gray-700 mb-6">
              This action cannot be undone. Are you sure you want to delete this advertisement?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded bg-gray-200 text-gray-900 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdvertisementsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdvertisementManagementContent />
    </ProtectedRoute>
  );
}
