"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useMultipleAds } from "../../hooks/useAds";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  subHeading: string;
  author?: { name: string };
  category?: { name: string };
  featuredImage: string;
  views: number;
  publishedAt: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  type: 'blog' | 'news';
}



// Helper function to format view count with K/M suffix
const formatViews = (views: number): string => {
  if (!views || views === 0) return '0 views';
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
};

// Helper function to safely format date
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

const resolveImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '/photos/everest-sunrise.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (normalizedPath.startsWith('/uploads')) return normalizedPath;
  return `/uploads/${normalizedPath.replace(/^\/+/, '')}`;
};

export default function BlogSection() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ads from backend
  const { adsByPosition } = useMultipleAds(['blog_top', 'blog_bottom', 'blog_sidebar']);
  const topBannerAd = adsByPosition['blog_top']?.[0] || null;
  const bottomBannerAd = adsByPosition['blog_bottom']?.[0] || null;
  const sidebarAds = [
    adsByPosition['blog_sidebar']?.[0]
  ].filter(Boolean);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const API_URL = 'https://wonder.shirijanga.com';
        const response = await fetch(`${API_URL}/api/blogs`, {
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          // Silently fail if response is not OK
          setBlogs([]);
          return;
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, silently set empty blogs
          setBlogs([]);
          return;
        }
        
        // Extract blog array - backend now filters for published
        const blogArray = Array.isArray(data) ? data : data?.data || [];
        
        // Limit to 6 and transform
        const transformedBlogs = blogArray
          .slice(0, 6)
          .map((blog: Blog) => {
            return {
              id: blog._id,
              title: blog.title,
              slug: blog.slug,
              excerpt: blog.subHeading || blog.content.replace(/<[^>]*>/g, '').substring(0, 100),
              date: formatDate(blog.publishedAt),
              views: formatViews(blog.views || 0),
              category: blog.category?.name || (blog.type === 'news' ? 'News' : 'Travel'),
              image: resolveImageUrl(blog.featuredImage),
            };
          });

        // Only update if we have blogs
        if (transformedBlogs.length > 0) {
          setBlogs(transformedBlogs);
        }
      } catch (error) {
        // Silently handle any errors - show empty state
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Blog Header - More descriptive for multiple blog posts */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Travel Stories & Nepal Guides
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            Insider tips, detailed itineraries, and authentic experiences from the heart of the Himalayas
          </p>
        </div>

        {/* Top banner ad - position: blog_top - Only show if ad exists */}
        {topBannerAd && (
          <div className="mb-10">
            <Link 
              href={topBannerAd.link || topBannerAd.weblink || "#"}
              target={topBannerAd.link || topBannerAd.weblink ? "_blank" : undefined}
              rel={topBannerAd.link || topBannerAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-xl shadow-md aspect-21/4">
                <img
                  src={typeof topBannerAd.image === 'string' ? topBannerAd.image : topBannerAd.image.url}
                  alt={typeof topBannerAd.image === 'string' ? "Advertisement" : topBannerAd.image.alt || "Advertisement"}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Blog posts - 9 columns */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="inline-block">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0284C7] rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-slate-600 font-medium">Loading blogs...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {blogs.map(blog => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.slug}`}
                      className="group block h-full"
                    >
                      <div className="relative h-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="relative h-44 md:h-48 w-full overflow-hidden bg-slate-100">
                          <img
                            src={blog.image}
                            alt={`Image for ${blog.title}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <Calendar size={12} />
                            <span>{blog.date}</span>
                            <span className="text-slate-300">•</span>
                            <Eye size={12} />
                            <span>{blog.views}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
                            {blog.title}
                          </h3>

                          <p className="text-slate-600 text-xs line-clamp-2 mb-3">
                            {blog.excerpt}
                          </p>

                          <div className="flex items-center text-[#0284C7] text-xs font-medium group-hover:gap-1.5 transition-all">
                            Read More <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-10 text-center">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Browse All Articles
                    <ChevronRight size={18} />
                  </Link>
                </div>

                {/* Bottom banner ad - position: blog_bottom - Only show if ad exists */}
                {bottomBannerAd && (
                  <div className="mt-10">
                    <Link 
                      href={bottomBannerAd.link || bottomBannerAd.weblink || "#"}
                      target={bottomBannerAd.link || bottomBannerAd.weblink ? "_blank" : undefined}
                      rel={bottomBannerAd.link || bottomBannerAd.weblink ? "noopener noreferrer" : undefined}
                      className="block w-full"
                    >
                      <div className="relative w-full rounded-xl shadow-md aspect-21/4">
                        <img
                          src={typeof bottomBannerAd.image === 'string' ? bottomBannerAd.image : bottomBannerAd.image.url}
                          alt={typeof bottomBannerAd.image === 'string' ? "Advertisement" : bottomBannerAd.image.alt || "Advertisement"}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - 2 ads with position: blog_sidebar_1, blog_sidebar_2 */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-2">
                {/* Advertisement header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Advertisement
                  </h3>
                </div>
                
                {/* 2 ads with tight gaps */}
                <div className="space-y-2">
                  {sidebarAds.map((ad, idx) => (
                    <Link
                      key={ad._id || `ad-${idx}`}
                      href={ad.link || ad.weblink || "#"}
                      target={ad.link || ad.weblink ? "_blank" : undefined}
                      rel={ad.link || ad.weblink ? "noopener noreferrer" : undefined}
                      className="block w-full"
                    >
                      <div className="relative w-full rounded-lg bg-slate-100 border border-slate-200">
                        <div className="relative w-full aspect-4/5 flex items-center justify-center">
                          <img
                            src={typeof ad.image === 'string' ? ad.image : ad.image.url}
                            alt={typeof ad.image === 'string' ? "Advertisement" : ad.image.alt || "Advertisement"}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Mobile view - visible only on small screens */}
                <div className="mt-3 pt-3 border-t border-slate-100 lg:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    {sidebarAds.map((ad, idx) => (
                      <Link
                        key={`mobile-${ad._id || idx}`}
                        href={ad.link || ad.weblink || "#"}
                        target={ad.link || ad.weblink ? "_blank" : undefined}
                        rel={ad.link || ad.weblink ? "noopener noreferrer" : undefined}
                        className="block w-full"
                      >
                        <div className="relative w-full rounded-lg bg-slate-100 border border-slate-200">
                          <div className="relative w-full aspect-square">
                            <img
                              src={typeof ad.image === 'string' ? ad.image : ad.image.url}
                              alt={typeof ad.image === 'string' ? "Advertisement" : ad.image.alt || "Advertisement"}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Advertise link */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <Link 
                    href="/advertise" 
                    className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Advertise with us →
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}