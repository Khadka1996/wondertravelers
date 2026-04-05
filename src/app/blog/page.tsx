'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Facebook, MessageCircle, LinkIcon, ChevronLeft, ChevronRight, Eye, Calendar } from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import { BlogGridSkeleton, BlogCardSkeleton, AdBannerSkeleton } from '../components/Skeleton/BlogCardSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useMultipleAds } from '../../hooks/useAds';

const API_URL = 'https://wonder.shirijanga.com';

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
  views: number;
  publishedAt: string;
  createdAt: string;
}

// Helper function to convert image paths
const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '/photos/everest-sunrise.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) return imagePath;
  if (imagePath.startsWith('uploads')) return `/${imagePath}`;
  return `/uploads/${imagePath}`;
};

function BlogPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const tag = searchParams.get('tag') || '';
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [likedBlogs, setLikedBlogs] = useState<Set<string>>(new Set());
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

  // Fetch ads using hook
  const { adsByPosition } = useMultipleAds(['blog_top', 'blog_sidebar_1', 'blog_sidebar_2']);
  const topBannerAd = adsByPosition['blog_top']?.[0] || null;
  const sidebarAds = [
    adsByPosition['blog_sidebar_1']?.[0],
    adsByPosition['blog_sidebar_2']?.[0]
  ].filter(Boolean);

  const blogsPerPage = 4;

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let url = '';
      if (tag) {
        // Fetch blogs by tag
        url = `${API_URL}/api/blogs/tag/${encodeURIComponent(tag)}?page=${currentPage}&limit=${blogsPerPage}`;
      } else {
        // Fetch all blogs
        url = `${API_URL}/api/blogs?page=${currentPage}&limit=${blogsPerPage}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        
        let fetchedBlogs = [];
        let total = 0;
        
        if (tag) {
          // Tag endpoint: data.blogs
          fetchedBlogs = result.data?.blogs || [];
          total = result.data?.total || 0;
        } else {
          // General blogs endpoint: data is array
          fetchedBlogs = Array.isArray(result.data) ? result.data : [];
          total = result.pagination?.total || 0;
        }
        
        setBlogs(fetchedBlogs);
        setTotalPages(Math.ceil(total / blogsPerPage));
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [tag, currentPage]);

  useEffect(() => {
    fetchBlogs();
  }, [tag, currentPage, fetchBlogs]);

  const handleLike = async (blogId: string) => {
    if (!user) {
      alert('Please login to like blogs');
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    try {
      const newLiked = new Set(likedBlogs);
      const wasLiked = newLiked.has(blogId);
      
      if (wasLiked) {
        newLiked.delete(blogId);
      } else {
        newLiked.add(blogId);
      }
      setLikedBlogs(newLiked);

      const response = await fetch(
        `${API_URL}/api/blogs/${blogId}/like`,
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
        setBlogs(blogs.map(blog => 
          blog._id === blogId 
            ? { ...blog, likesCount: result.data.likesCount }
            : blog
        ));
      } else {
        const revertLiked = new Set(likedBlogs);
        if (wasLiked) {
          revertLiked.add(blogId);
        } else {
          revertLiked.delete(blogId);
        }
        setLikedBlogs(revertLiked);
        alert('Error: ' + (result.error || result.message || 'Failed to like'));
      }
    } catch (error) {
      const revertLiked = new Set(likedBlogs);
      if (revertLiked.has(blogId)) {
        revertLiked.delete(blogId);
      } else {
        revertLiked.add(blogId);
      }
      setLikedBlogs(revertLiked);
      alert('Network error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const getShareUrl = (blog: Blog): string => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}${'/blog/' + blog.slug}`;
  };

  const shareOnSocial = (platform: string, blog: Blog) => {
    const url = getShareUrl(blog);
    const title = blog.title;
    
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
  if (isLoading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-32 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <BlogGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen pt-16 sm:pt-20 md:pt-24">
        {/* Main Content */}
        <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pb-12 sm:pb-16">
          {/* Advertisement Top */}
          {topBannerAd && (
            <div className="mb-10">
              <Link
                href={topBannerAd.link || topBannerAd.weblink || "#"}
                target={topBannerAd.link || topBannerAd.weblink ? "_blank" : undefined}
                rel={topBannerAd.link || topBannerAd.weblink ? "noopener noreferrer" : undefined}
                className="block w-full"
              >
                <div className="relative w-full overflow-hidden shadow-md aspect-[21/4]">
                  <img
                    src={typeof topBannerAd.image === 'string' ? topBannerAd.image : topBannerAd.image.url}
                    alt="Top banner advertisement"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>
          )}

          {/* No Blogs Message */}
          {!isLoading && blogs.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">No blogs found</h2>
              <p className="text-slate-600 mb-8">
                {tag ? `No blogs found with tag #${tag}.` : 'No blogs published yet.'}
              </p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Back to Home
              </Link>
            </div>
          )}

          {/* Blogs Grid */}
          {blogs.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {blogs.map((blog) => {
                  const isLiked = likedBlogs.has(blog._id);
                  return (
                    <div key={blog._id} className="bg-white rounded-lg overflow-hidden shadow-md">
                      {/* Blog Image */}
                      <div className="relative h-48 bg-slate-200 overflow-hidden group">
                        {blog.featuredImage ? (
                          <Image
                            src={getImageUrl(blog.featuredImage)}
                            alt={blog.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <div className="text-white text-4xl">📷</div>
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {blog.category?.name || 'Travel'}
                          </span>
                        </div>
                      </div>

                      {/* Blog Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 hover:text-blue-600">
                          <Link href={`/blog/${blog.slug}`}>
                            {blog.title}
                          </Link>
                        </h3>

                        {/* Meta Info */}
                        <div className="flex flex-col gap-2 mb-4 pb-4 border-b">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={14} />
                            <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="mx-1">•</span>
                            <Eye size={14} />
                            <span>{blog.views ? blog.views.toLocaleString() : '0'} views</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Like Count Button */}
                          <button onClick={() => handleLike(blog._id)} className="flex items-center gap-1 flex-1 text-slate-600 py-2 px-3 rounded-lg border border-slate-200 transition hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                            <Heart size={16} className={isLiked ? 'fill-red-600 text-red-600' : ''} />
                            <span className="text-sm font-medium">{blog.likesCount}</span>
                          </button>

                          {/* Share Button */}
                          <div className="relative flex-1">
                            <button
                              onClick={() => setShareMenuOpen(shareMenuOpen === blog._id ? null : blog._id)}
                              className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 transition py-2 px-3 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300"
                            >
                              <Share2 size={16} />
                              <span className="text-sm font-medium">Share</span>
                            </button>

                            {/* Share Menu Dropdown */}
                            {shareMenuOpen === blog._id && (
                              <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 py-2">
                                <button
                                  onClick={() => { shareOnSocial('facebook', blog); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-slate-700"
                                >
                                  <Facebook size={18} className="text-blue-600" />
                                  <span className="text-sm font-medium">Facebook</span>
                                </button>
                                <button
                                  onClick={() => { shareOnSocial('twitter', blog); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-slate-700"
                                >
                                  <SiX size={18} className="text-black" />
                                  <span className="text-sm font-medium">X</span>
                                </button>
                                <button
                                  onClick={() => { shareOnSocial('whatsapp', blog); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition text-slate-700"
                                >
                                  <SiWhatsapp size={18} className="text-green-600" />
                                  <span className="text-sm font-medium">WhatsApp</span>
                                </button>
                                <button
                                  onClick={() => { shareOnSocial('linkedin', blog); setShareMenuOpen(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition text-slate-700"
                                >
                                  <MessageCircle size={18} className="text-blue-700" />
                                  <span className="text-sm font-medium">LinkedIn</span>
                                </button>
                                <hr className="my-2" />
                                <button
                                  onClick={() => { shareOnSocial('copy', blog); setShareMenuOpen(null); }}
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
                            href={`/blog/${blog.slug}`}
                            className="flex-1 text-center py-2 px-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            Read More
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advertisement Middle */}
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
                        <div className="relative w-full aspect-[4/5] flex items-center justify-center">
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
                          backgroundColor: currentPage === page ? '#00BCFF' : 'transparent',
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

            
            </>
          )}
          </div>
        </div>
      </main>
    );
  }

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogGridSkeleton count={4} />}>
      <BlogPageContent />
    </Suspense>
  );
}
