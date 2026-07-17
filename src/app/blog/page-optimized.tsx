'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Facebook, MessageCircle, LinkIcon, ChevronLeft, ChevronRight, Calendar, RotateCw } from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import { BlogGridSkeleton, BlogCardSkeleton } from '../components/Skeleton/BlogCardSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useMultipleAds } from '../../hooks/useAds';
import { useBlogsCache } from '../../hooks/useBlogsCache';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';
import { Breadcrumb } from '@/components/Breadcrumb';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  featuredImage: string;
  subHeading: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profileImage?: string;
    bio?: string;
  };
  category: {
    name: string;
    slug: string;
  };
  likes?: string[];
  likesCount: number;
  publishedAt: string;
  createdAt: string;
}

const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '/photos/everest-sunrise.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (normalizedPath.startsWith('/uploads')) return normalizedPath;
  return `/uploads/${normalizedPath.replace(/^\/+/, '')}`;
};

const SORT_OPTIONS = [
  { value: 'latest', label: '⏱️ Latest' },
  { value: 'trending', label: '🔥 Trending' },
  { value: 'mostViewed', label: '👁️ Most Viewed' },
  { value: 'mostLiked', label: '❤️ Most Liked' },
  { value: 'oldest', label: '📅 Oldest' }
];

function BlogPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { recordMetric } = usePerformanceMonitoring('blog-page');
  
  const tag = searchParams.get('tag') || '';
  const [sortBy, setSortBy] = useState('latest');
  const [likedBlogs, setLikedBlogs] = useState<Set<string>>(new Set());
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

  // Use optimized cache hook
  const {
    blogs,
    pagination,
    isLoading,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    invalidateCache,
    cacheSize
  } = useBlogsCache({
    type: tag ? 'tag' : 'all',
    tag: tag || undefined,
    page: 1,
    limit: 12,
    sortBy
  });

  const { adsByPosition } = useMultipleAds(['blog_top', 'blog_sidebar_1', 'blog_sidebar_2']);
  const topBannerAd = adsByPosition['blog_top']?.[0] || null;
  const sidebarAds = [
    adsByPosition['blog_sidebar_1']?.[0],
    adsByPosition['blog_sidebar_2']?.[0]
  ].filter(Boolean);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    recordMetric('sort-change', 1);
  };

  const handleRefreshCache = () => {
    invalidateCache();
    recordMetric('cache-refresh', 1);
  };

  const handleLike = async (blogId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    try {
      const response = await fetch(`${API_URL}/api/blogs/${blogId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setLikedBlogs(prev => {
          const newSet = new Set(prev);
          if (newSet.has(blogId)) {
            newSet.delete(blogId);
          } else {
            newSet.add(blogId);
          }
          return newSet;
        });
        invalidateCache();
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blogs' }]} />

      {/* Top Banner Ad */}
      {topBannerAd && (
        <div className="mb-8 px-4">
          <Link href={topBannerAd.link || topBannerAd.weblink || '#'} target="_blank" rel="noopener noreferrer">
            <Image
              src={getImageUrl(topBannerAd.image?.url)}
              alt={topBannerAd.title}
              width={1200}
              height={300}
              className="w-full rounded-lg object-cover"
              priority
            />
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Sort Controls */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {tag ? `Blogs tagged: ${tag}` : 'Blog Articles'}
          </h1>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={`Sort by ${option.label}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshCache}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                title="Refresh cache"
              >
                <RotateCw size={20} />
              </button>
              <span className="text-sm text-gray-600 px-2">Cache: {cacheSize}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Grid */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <BlogGridSkeleton count={12} />
            ) : blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {blogs.map((blog: Blog) => (
                    <div key={blog._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      {/* Featured Image */}
                      <Link href={`/blog/${blog.slug}`}>
                        <div className="relative h-48 overflow-hidden cursor-pointer">
                          <Image
                            src={getImageUrl(blog.featuredImage)}
                            alt={blog.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4">
                        {/* Category and Date */}
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-blue-600 uppercase">
                            {blog.category?.name || 'General'}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={14} />
                            {new Date(blog.publishedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Title */}
                        <Link href={`/blog/${blog.slug}`} className="block mb-2">
                          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-2">
                            {blog.title}
                          </h3>
                        </Link>

                        {/* Sub-heading */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {blog.subHeading}
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-2 mb-4 border-t pt-3">
                          {blog.author?.profileImage && (
                            <Image
                              src={getImageUrl(blog.author.profileImage)}
                              alt={blog.author.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {blog.author?.name || 'Unknown'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <button
                            onClick={() => handleLike(blog._id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                              likedBlogs.has(blog._id)
                                ? 'bg-red-100 text-red-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Heart size={16} fill={likedBlogs.has(blog._id) ? 'currentColor' : 'none'} />
                            <span className="text-xs">{blog.likesCount}</span>
                          </button>
                          <Link
                            href={`/blog/${blog.slug}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-4 mb-8">
                    <button
                      onClick={prevPage}
                      disabled={!pagination.hasPrev}
                      className="p-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                        const pageNum = currentPage - 2 + i;
                        if (pageNum < 1 || pageNum > pagination.pages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={!pagination.hasNext}
                      className="p-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No blogs found</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {sidebarAds.map((ad, index) => (
              <Link key={index} href={ad.link || ad.weblink || '#'} target="_blank" rel="noopener noreferrer" className="mb-6 block">
                <Image
                  src={getImageUrl(ad.image?.url)}
                  alt={ad.title}
                  width={300}
                  height={400}
                  className="w-full rounded-lg object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogGridSkeleton count={12} />}>
      <BlogPageContent />
    </Suspense>
  );
}
