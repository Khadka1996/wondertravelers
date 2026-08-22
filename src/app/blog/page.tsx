'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Facebook, MessageCircle, LinkIcon, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import { BlogGridSkeleton, BlogCardSkeleton, AdBannerSkeleton } from '../components/Skeleton/BlogCardSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useMultipleAds } from '../../hooks/useAds';
import { Breadcrumb } from '@/components/Breadcrumb';
import CopyAttributionClient from './CopyAttributionClient';
import CopyProtectionGlass from './CopyProtectionGlass';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'https://api.wondertravelers.com').trim().replace(/\/$/, '');

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

// Helper function to convert image paths
const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '/photos/everest-sunrise.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (normalizedPath.startsWith('/uploads')) return normalizedPath;
  return `/uploads/${normalizedPath.replace(/^\/+/, '')}`;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [likedBlogs, setLikedBlogs] = useState<Set<string>>(new Set());
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [jumpPage, setJumpPage] = useState<string>('');

  // Fetch ads using hook
  const { adsByPosition } = useMultipleAds(['blog_top', 'blog_bottom', 'blog_sidebar']);
  const topBannerAds = adsByPosition['blog_top'] || [];
  const bottomBannerAds = adsByPosition['blog_bottom'] || [];
  const sidebarAds = adsByPosition['blog_sidebar'] || [];

  const blogsPerPage = 12;

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      let url = '';
      if (tag) {
        // Fetch blogs by tag
        url = `${API_URL}/api/blogs/tag/${encodeURIComponent(tag)}?page=${currentPage}&limit=${blogsPerPage}`;
      } else {
        // Fetch all blogs
        url = `${API_URL}/api/blogs?page=${currentPage}&limit=${blogsPerPage}`;
      }

      const response = await fetch(url, { cache: 'force-cache' });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Fetch failed (${response.status}): ${text.slice(0, 200)}`);
      }

      const result = await response.json();

      let fetchedBlogs: Blog[] = [];
      let total = 0;

      if (tag) {
        fetchedBlogs = Array.isArray(result.data?.blogs) ? result.data.blogs : [];
        total = Number(result.data?.total || 0);
      } else {
        fetchedBlogs = Array.isArray(result.data) ? result.data : [];
        total = Number(result.pagination?.total || 0);
      }

      setBlogs(fetchedBlogs);
      setTotalPages(Math.max(1, Math.ceil(total / blogsPerPage)));
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load blogs');
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

  const trackShareCount = async (blogId?: string) => {
    if (!blogId) return;

    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const payload = new Blob([JSON.stringify({})], { type: 'application/json' });
        navigator.sendBeacon(`/api/blogs/${blogId}/share`, payload);
        return;
      }

      await fetch(`/api/blogs/${blogId}/share`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      });
    } catch (error) {
      console.warn('Share count tracking failed:', error);
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
        void trackShareCount(blog._id);
        alert('Link copied to clipboard!');
        setShareMenuOpen(null);
        return;
    }
    
    if (shareUrl) {
      void trackShareCount(blog._id);
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShareMenuOpen(null);
  };

  // Loading state
  if (isLoading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 pt-32 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <BlogGridSkeleton count={12} variant="default" />
        </div>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://wondertravelers.com/blog';

  return (
    <>
      <CopyAttributionClient canonicalUrl={currentUrl} />
      <CopyProtectionGlass>
      <main className="bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
        <Breadcrumb items={[{ label: 'Blog', current: true }]} />

        {/* Main Content */}
        <div className="w-full bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pb-12 sm:pb-16">
          <section className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Wonder Travelers Blog</h1>
            <p className="text-slate-600 mb-3">Travel stories, guides, and updates from Nepal.</p>
          </section>

          {/* Advertisement Top */}
          {topBannerAds.length > 0 && (
            <div className="mb-10 space-y-4">
              {topBannerAds.map((ad, index) => ad.image && (
                <Link key={ad._id || `blog-top-${index}`} href={ad.link || ad.weblink || "#"} target={ad.link || ad.weblink ? "_blank" : undefined} rel={ad.link || ad.weblink ? "noopener noreferrer" : undefined} className="block w-full">
                  <div className="relative w-full aspect-21/4">
                    <Image src={typeof ad.image === 'string' ? ad.image : ad.image.url} alt={ad.title || "Top banner advertisement"} fill unoptimized sizes="100vw" className="h-full w-full object-contain" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Blogs Message */}
          {!isLoading && blogs.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">No blogs found</h2>
              <p className="text-slate-600 mb-8">
                {errorMessage
                  ? `Could not load blogs: ${errorMessage}`
                  : tag ? `No blogs found with tag #${tag}.` : 'No blogs published yet.'}
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
                          <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
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
                      <div className="relative w-full overflow-hidden">
                        <div className="relative w-full aspect-4/5 flex items-center justify-center">
                          <Image
                            src={typeof ad.image === 'string' ? ad.image : ad.image.url}
                            alt={ad.title || "Advertisement"}
                            fill
                            unoptimized
                            sizes="300px"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {bottomBannerAds.length > 0 && (
                <div className="mb-12 space-y-4">
                  {bottomBannerAds.map((ad, index) => ad.image && (
                    <Link key={ad._id || `blog-bottom-${index}`} href={ad.link || ad.weblink || "#"} target={ad.link || ad.weblink ? "_blank" : undefined} rel={ad.link || ad.weblink ? "noopener noreferrer" : undefined} className="block w-full">
                      <div className="relative w-full aspect-21/4">
                        <Image src={typeof ad.image === 'string' ? ad.image : ad.image.url} alt={ad.title || "Bottom banner advertisement"} fill unoptimized sizes="100vw" className="h-full w-full object-contain" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-center gap-6 mb-16">
                  {/* Page Info */}
                  <div className="text-sm text-slate-600 font-medium">
                    Page <span className="text-blue-600 font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                  </div>

                  {/* Mobile: Jump to Page Input */}
                  <div className="flex sm:hidden gap-2 w-full max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      placeholder="Page #"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium text-center transition-all"
                    />
                    <button
                      onClick={() => {
                        const pageNum = Math.max(1, Math.min(totalPages, Number(jumpPage) || 1));
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setJumpPage('');
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Go
                    </button>
                  </div>

                  {/* Mobile: Prev/Next Buttons */}
                  <div className="flex sm:hidden gap-2">
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="p-3 rounded-lg bg-white border border-slate-200 text-slate-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-lg bg-white border border-slate-200 text-slate-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Desktop: Pagination Controls */}
                  <div className="hidden sm:flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                    {/* Previous Button */}
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="p-2 sm:p-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md min-w-10 h-10 flex items-center justify-center"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <div className="px-2 py-2 text-slate-400 text-sm">...</div>
                        )}
                      </>
                    )}

                    {/* Page range around current */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return page;
                    }).filter((page, index, arr) => arr.indexOf(page) === index && page > 0 && page <= totalPages).map(page => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold min-w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-lg'
                            : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <div className="px-2 py-2 text-slate-400 text-sm">...</div>
                        )}
                        <button
                          onClick={() => {
                            setCurrentPage(totalPages);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md min-w-10 h-10 flex items-center justify-center"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* Next Button */}
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="p-2 sm:p-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

            
            </>
          )}
          </div>
        </div>
      </main>
      </CopyProtectionGlass>
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogGridSkeleton count={4} />}>
      <BlogPageContent />
    </Suspense>
  );
}
