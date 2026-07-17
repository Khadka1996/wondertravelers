'use client';

import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Facebook, MessageCircle, LinkIcon, Calendar, Zap, Star, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import { BlogGridSkeleton } from '../components/Skeleton/BlogCardSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useMultipleAds } from '../../hooks/useAds';
import { useBlogsCache } from '../../hooks/useBlogsCache';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';

interface News {
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
  isBreaking?: boolean;
  isFeatured?: boolean;
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
  { value: 'mostLiked', label: '❤️ Most Liked' }
];

function NewsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { recordMetric } = usePerformanceMonitoring('news-page');

  const [sortBy, setSortBy] = useState('latest');
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

  // Use optimized cache hook for news
  const {
    blogs: news,
    pagination,
    isLoading,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    invalidateCache,
    cacheSize
  } = useBlogsCache({
    type: 'news',
    page: 1,
    limit: 12,
    sortBy
  });

  const { adsByPosition } = useMultipleAds(['news_top', 'news_bottom']);
  const topBannerAd = adsByPosition['news_top']?.[0] || null;
  const bottomBannerAd = adsByPosition['news_bottom']?.[0] || null;

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    recordMetric('sort-change', 1);
  };

  const handleRefreshCache = () => {
    invalidateCache();
    recordMetric('cache-refresh', 1);
  };

  const handleLike = async (newsId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
    try {
      const response = await fetch(`${API_URL}/api/blogs/${newsId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setLikedNews(prev => {
          const newSet = new Set(prev);
          if (newSet.has(newsId)) {
            newSet.delete(newsId);
          } else {
            newSet.add(newsId);
          }
          return newSet;
        });
        invalidateCache();
      }
    } catch (error) {
      console.error('Error liking news:', error);
    }
  };

  const toggleShareMenu = (newsId: string) => {
    setShareMenuOpen(shareMenuOpen === newsId ? null : newsId);
  };

  // Separate breaking and featured news for highlights
  const breakingNews = news.filter((n: News) => n.isBreaking);
  const featuredNews = news.filter((n: News) => n.isFeatured && !n.isBreaking);
  const regularNews = news.filter((n: News) => !n.isBreaking && !n.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Banner Ad */}
      {topBannerAd && (
        <div className="mb-8 px-4">
          <Link href={topBannerAd.link || topBannerAd.weblink || '#'} target="_blank" rel="noopener noreferrer">
            <Image
              src={getImageUrl(topBannerAd.image?.url)}
              alt={topBannerAd.title}
              width={1200}
              height={300}
              className="w-full rounded-lg object-cover shadow-lg"
              priority
            />
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold mb-2 text-white flex items-center justify-center gap-3">
            <Zap className="text-yellow-400" size={40} />
            Breaking News
          </h1>
          <p className="text-gray-300">Stay updated with the latest travel news and updates</p>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshCache}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Refresh cache"
            >
              <RotateCw size={20} className="text-white" />
            </button>
            <span className="text-sm text-gray-400 px-2">Cache: {cacheSize}</span>
          </div>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <BlogGridSkeleton count={12} />
        ) : news.length > 0 ? (
          <>
            {/* Breaking News Section */}
            {breakingNews.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-2">
                  <Zap size={28} />
                  Breaking News
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {breakingNews.slice(0, 2).map((newsItem: News) => (
                    <div
                      key={newsItem._id}
                      className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg overflow-hidden shadow-lg border-2 border-red-500 hover:shadow-xl transition-shadow"
                    >
                      <Link href={`/blog/${newsItem.slug}`}>
                        <div className="relative h-64 overflow-hidden cursor-pointer">
                          <Image
                            src={getImageUrl(newsItem.featuredImage)}
                            alt={newsItem.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full">
                            <span className="text-white font-bold text-sm flex items-center gap-1">
                              <Zap size={14} /> BREAKING
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="p-5">
                        <Link href={`/blog/${newsItem.slug}`} className="block mb-3">
                          <h3 className="text-xl font-bold text-white hover:text-red-200 line-clamp-2">
                            {newsItem.title}
                          </h3>
                        </Link>

                        <p className="text-gray-200 text-sm mb-4 line-clamp-2">
                          {newsItem.subHeading}
                        </p>

                        <div className="flex justify-between items-center pt-4 border-t border-red-700">
                          <button
                            onClick={() => handleLike(newsItem._id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                              likedNews.has(newsItem._id)
                                ? 'bg-red-600 text-white'
                                : 'hover:bg-red-700 text-red-200'
                            }`}
                          >
                            <Heart size={16} fill={likedNews.has(newsItem._id) ? 'currentColor' : 'none'} />
                            <span className="text-xs">{newsItem.likesCount}</span>
                          </button>
                          <Link
                            href={`/blog/${newsItem.slug}`}
                            className="text-sm font-semibold text-red-200 hover:text-red-100"
                          >
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured News Section */}
            {featuredNews.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                  <Star size={28} />
                  Featured
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredNews.slice(0, 2).map((newsItem: News) => (
                    <div
                      key={newsItem._id}
                      className="bg-gradient-to-br from-yellow-900 to-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-yellow-500 hover:shadow-xl transition-shadow"
                    >
                      <Link href={`/blog/${newsItem.slug}`}>
                        <div className="relative h-48 overflow-hidden cursor-pointer">
                          <Image
                            src={getImageUrl(newsItem.featuredImage)}
                            alt={newsItem.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-4 left-4 bg-yellow-500 px-3 py-1 rounded-full">
                            <span className="text-gray-900 font-bold text-sm flex items-center gap-1">
                              <Star size={14} /> FEATURED
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link href={`/blog/${newsItem.slug}`} className="block mb-2">
                          <h3 className="text-lg font-bold text-white hover:text-yellow-200 line-clamp-2">
                            {newsItem.title}
                          </h3>
                        </Link>

                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {newsItem.subHeading}
                        </p>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                          <button
                            onClick={() => handleLike(newsItem._id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                              likedNews.has(newsItem._id)
                                ? 'bg-yellow-600 text-gray-900'
                                : 'hover:bg-gray-700 text-yellow-200'
                            }`}
                          >
                            <Heart size={14} fill={likedNews.has(newsItem._id) ? 'currentColor' : 'none'} />
                            <span className="text-xs">{newsItem.likesCount}</span>
                          </button>
                          <Link
                            href={`/blog/${newsItem.slug}`}
                            className="text-sm font-semibold text-yellow-300 hover:text-yellow-200"
                          >
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular News Grid */}
            {regularNews.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Latest News</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularNews.map((newsItem: News) => (
                    <div
                      key={newsItem._id}
                      className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-700"
                    >
                      <Link href={`/blog/${newsItem.slug}`}>
                        <div className="relative h-40 overflow-hidden cursor-pointer">
                          <Image
                            src={getImageUrl(newsItem.featuredImage)}
                            alt={newsItem.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      </Link>

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-400 uppercase">
                            {newsItem.category?.name || 'General'}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(newsItem.publishedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link href={`/blog/${newsItem.slug}`} className="block mb-2">
                          <h3 className="text-base font-bold text-white hover:text-blue-300 line-clamp-2">
                            {newsItem.title}
                          </h3>
                        </Link>

                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                          {newsItem.subHeading}
                        </p>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                          <button
                            onClick={() => handleLike(newsItem._id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                              likedNews.has(newsItem._id)
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-700 text-gray-300'
                            }`}
                          >
                            <Heart size={12} fill={likedNews.has(newsItem._id) ? 'currentColor' : 'none'} />
                            {newsItem.likesCount}
                          </button>
                          <Link
                            href={`/blog/${newsItem.slug}`}
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                          >
                            Read →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mb-8">
                <button
                  onClick={prevPage}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-lg bg-gray-700 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft size={20} className="text-white" />
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
                            ? 'bg-yellow-500 text-gray-900'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
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
                  className="p-2 rounded-lg bg-gray-700 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No news found</p>
          </div>
        )}

        {/* Bottom Banner Ad */}
        {bottomBannerAd && (
          <div className="mt-12 px-4">
            <Link href={bottomBannerAd.link || bottomBannerAd.weblink || '#'} target="_blank" rel="noopener noreferrer">
              <Image
                src={getImageUrl(bottomBannerAd.image?.url)}
                alt={bottomBannerAd.title}
                width={1200}
                height={300}
                className="w-full rounded-lg object-cover shadow-lg"
              />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<BlogGridSkeleton count={12} />}>
      <NewsPageContent />
    </Suspense>
  );
}
