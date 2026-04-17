'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Facebook, MessageCircle, LinkIcon, ChevronLeft, ChevronRight, Eye, Calendar } from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import { BlogGridSkeleton } from '../components/Skeleton/BlogCardSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useMultipleAds } from '../../hooks/useAds';

const API_URL = 'https://wonder.shirijanga.com';

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
  views: number;
  publishedAt: string;
  createdAt: string;
}

// Helper function to convert image paths
const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '/photos/everest-sunrise.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (normalizedPath.startsWith('/uploads')) return normalizedPath;
  return `/uploads/${normalizedPath.replace(/^\/+/, '')}`;
};

export default function NewsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [news, setNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [likedNews, setLikedNews] = useState<Set<string>>(new Set());
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

  // Fetch ads from backend
  const { adsByPosition } = useMultipleAds(['news_top', 'news_bottom', 'news_sidebar']);
  const topBannerAd = adsByPosition['news_top']?.[0] || null;
  const bottomBannerAd = adsByPosition['news_bottom']?.[0] || null;
  const sidebarAds = [
    adsByPosition['news_sidebar']?.[0]
  ].filter(Boolean);

  const newsPerPage = 4;

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const url = `${API_URL}/api/blogs/news?page=${currentPage}&limit=${newsPerPage}`;

      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        
        // News endpoint: data is array, pagination info in pagination object
        const fetchedNews = Array.isArray(result.data) ? result.data : [];
        const total = result.pagination?.total || 0;
        
        setNews(fetchedNews);
        setTotalPages(Math.ceil(total / newsPerPage));
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchNews();
  }, [currentPage, fetchNews]);

  const handleLike = async (newsId: string) => {
    if (!user) {
      alert('Please login to like news');
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    try {
      const newLiked = new Set(likedNews);
      const wasLiked = newLiked.has(newsId);
      
      if (wasLiked) {
        newLiked.delete(newsId);
      } else {
        newLiked.add(newsId);
      }
      setLikedNews(newLiked);

      const response = await fetch(
        `${API_URL}/api/blogs/${newsId}/like`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setNews(news.map(item => 
          item._id === newsId 
            ? { ...item, likesCount: result.data.likesCount }
            : item
        ));
      } else {
        const revertLiked = new Set(likedNews);
        if (wasLiked) {
          revertLiked.add(newsId);
        } else {
          revertLiked.delete(newsId);
        }
        setLikedNews(revertLiked);
        alert('Error: ' + (result.error || result.message || 'Failed to like'));
      }
    } catch (error) {
      const revertLiked = new Set(likedNews);
      if (revertLiked.has(newsId)) {
        revertLiked.delete(newsId);
      } else {
        revertLiked.add(newsId);
      }
      setLikedNews(revertLiked);
      alert('Network error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const getShareUrl = (item: News): string => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}${'/blog/' + item.slug}`;
  };

  const shareOnSocial = (platform: string, item: News) => {
    const url = getShareUrl(item);
    const title = item.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShareMenuOpen(null);
  };

  // Loading state
  if (isLoading && news.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 pt-32 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <BlogGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <main className="bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen pt-16 sm:pt-20 md:pt-24">


        {/* Main Content */}
        <div className="w-full bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pb-12 sm:pb-16">
          {/* Advertisement Top - Only show if ad exists */}
          {topBannerAd && (
            <div className="mb-10">
              <Link
                href={topBannerAd.link || topBannerAd.weblink || "#"}
                target={topBannerAd.link || topBannerAd.weblink ? "_blank" : undefined}
                rel={topBannerAd.link || topBannerAd.weblink ? "noopener noreferrer" : undefined}
                className="block w-full"
              >
                <div className="relative w-full overflow-hidden shadow-md aspect-21/4">
                  <img
                    src={typeof topBannerAd.image === 'string' ? topBannerAd.image : topBannerAd.image.url}
                    alt="Top banner advertisement"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>
          )}

          {/* No News Message */}
          {!isLoading && news.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">No news yet</h2>
              <p className="text-slate-600 mb-8">Check back soon for the latest travel updates and news.</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Back to Home
              </Link>
            </div>
          )}

          {/* News Grid */}
          {news.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {news.map((item) => {
                  const isLiked = likedNews.has(item._id);
                  return (
                    <div key={item._id} className="bg-white rounded-lg overflow-hidden shadow-md">
                      {/* News Image */}
                      <div className="relative h-48 bg-slate-200 overflow-hidden group">
                        {item.featuredImage ? (
                          <Image
                            src={getImageUrl(item.featuredImage)}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
                            <div className="text-white text-4xl">📰</div>
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {item.category?.name || 'News'}
                          </span>
                        </div>
                      </div>

                      {/* News Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 hover:text-blue-600">
                          <Link href={`/blog/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>

                        {/* Meta Info */}
                        <div className="flex flex-col gap-2 mb-4 pb-4 border-b">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={14} />
                            <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="mx-1">•</span>
                            <Eye size={14} />
                            <span>{item.views ? item.views.toLocaleString() : '0'} views</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Like Count Button */}
                          <button onClick={() => handleLike(item._id)} className="flex items-center gap-1 flex-1 text-slate-600 py-2 px-3 rounded-lg border border-slate-200 transition hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                            <Heart size={16} className={isLiked ? 'fill-red-600 text-red-600' : ''} />
                            <span className="text-sm font-medium">{item.likesCount}</span>
                          </button>

                          {/* Share Button */}
                          <div className="relative flex-1">
                            <button
                              onClick={() => setShareMenuOpen(shareMenuOpen === item._id ? null : item._id)}
                              className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-red-600 transition py-2 px-3 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-300"
                            >
                              <Share2 size={16} />
                              <span className="text-sm font-medium">Share</span>
                            </button>

                            {/* Share Menu Dropdown */}
                            {shareMenuOpen === item._id && (
                              <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 py-2">
                                <button
                                  onClick={() => { shareOnSocial('facebook', item); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-slate-700"
                                >
                                  <Facebook size={18} className="text-blue-600" />
                                  <span className="text-sm font-medium">Facebook</span>
                                </button>
                                <button
                                  onClick={() => { shareOnSocial('twitter', item); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-slate-700"
                                >
                                  <SiX size={18} className="text-black" />
                                  <span className="text-sm font-medium">X</span>
                                </button>
                                <button
                                  onClick={() => { shareOnSocial('whatsapp', item); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition text-slate-700"
                                >
                                  <SiWhatsapp size={18} className="text-green-600" />
                                  <span className="text-sm font-medium">WhatsApp</span>
                                </button>
                                <button
                                  onClick={() => { shareOnSocial('linkedin', item); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-slate-700"
                                >
                                  <MessageCircle size={18} className="text-blue-700" />
                                  <span className="text-sm font-medium">LinkedIn</span>
                                </button>
                                <hr className="my-2" />
                                <button
                                  onClick={() => { shareOnSocial('copy', item); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-slate-700"
                                >
                                  <LinkIcon size={18} className="text-slate-600" />
                                  <span className="text-sm font-medium">Copy Link</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Read More */}
                          <Link
                            href={`/blog/${item.slug}`}
                            className="flex-1 text-center py-2 px-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            Read More
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advertisement Sidebar */}
              {sidebarAds.length > 0 && (
                <div className="mb-12">
                  <div className="space-y-3">
                    {sidebarAds.map((ad, index) => (
                      <Link
                        key={index}
                        href={ad.link || ad.weblink || "#"}
                        target={ad.link || ad.weblink ? "_blank" : undefined}
                        rel={ad.link || ad.weblink ? "noopener noreferrer" : undefined}
                        className="block w-full"
                      >
                        <div className="relative w-full overflow-hidden bg-slate-100 border border-slate-200">
                          <div className="relative w-full aspect-4/5 flex items-center justify-center">
                            <img
                              src={typeof ad.image === 'string' ? ad.image : ad.image.url}
                              alt={ad.title || "Advertisement"}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mb-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={20} style={{ color: '#0F172B' }} />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-10 h-10 rounded-lg font-semibold transition ${
                          currentPage === page
                            ? 'text-white shadow-lg'
                            : 'text-slate-900 hover:bg-slate-100'
                        }`}
                        style={{
                          backgroundColor: currentPage === page ? '#DC2626' : 'transparent',
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={20} style={{ color: '#0F172B' }} />
                  </button>
                </div>
              )}

              {/* Advertisement Bottom - Only show if ad exists */}
              {bottomBannerAd && (
                <div className="mt-12 mb-12">
                  <Link
                    href={bottomBannerAd.link || bottomBannerAd.weblink || "#"}
                    target={bottomBannerAd.link || bottomBannerAd.weblink ? "_blank" : undefined}
                    rel={bottomBannerAd.link || bottomBannerAd.weblink ? "noopener noreferrer" : undefined}
                    className="block w-full"
                  >
                    <div className="relative w-full overflow-hidden shadow-md aspect-21/4">
                      <img
                        src={typeof bottomBannerAd.image === 'string' ? bottomBannerAd.image : bottomBannerAd.image.url}
                        alt="Bottom banner advertisement"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Link>
                </div>
              )}

            
            </>
          )}
          </div>
        </div>
      </main>
  );
}
