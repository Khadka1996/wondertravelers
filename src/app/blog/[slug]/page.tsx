import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Eye, ChevronRight, Tag
} from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Metadata } from "next";
import ShareButtons from "../share-buttons";
import LikesSection from "../likes-section";
import CommentsSection from "../comments-section";

/* eslint-disable @next/next/no-img-element */

// Advertisement interface
interface Advertisement {
  _id: string;
  position: string;
  title?: string;
  description?: string;
  image: {
    url: string;
  };
  link?: string;
  weblink?: string;
}

// Enable aggressive ISR with revalidation (15 minutes for fresh content)
export const revalidate = 900; 

// API URL constant
const API_URL = 'https://wonder.shirijanga.com';

interface Author {
  _id: string;
  name: string;
  profileImage?: string;
}

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  subHeading: string;
  content: string;
  featuredImage: string;
  author?: Author | string;
  category?: Category | string;
  views: number;
  publishedAt: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  tags?: string[];
  readingTime?: number;
  isFeatured?: boolean;
  likes?: string[];
  likesCount?: number;
  allowComments?: boolean;
  commentsCount?: number;
}

// Helper function to format date with time
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

// Helper function to format views
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

// Helper function to inject ads into content after paragraphs 1, 2, 3
function injectAdsIntoContent(
  htmlContent: string,
  adsByPosition: Record<string, Advertisement[]>
): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return htmlContent;
  }

  // Get ads from different positions for flexible fallback
  const ads = [
    adsByPosition?.['blog_content_paragraph_4']?.[0] ||
    adsByPosition?.['blog_content_paragraph_1']?.[0],
    adsByPosition?.['blog_content_paragraph_6']?.[0] ||
    adsByPosition?.['blog_content_paragraph_2']?.[0],
    adsByPosition?.['blog_content_paragraph_8']?.[0] ||
    adsByPosition?.['blog_content_paragraph_3']?.[0]
  ].filter(Boolean) as Advertisement[];

  // If no ads available, return content unchanged
  if (ads.length === 0) {
    return htmlContent;
  }

  let content = htmlContent;
  let paragraphCount = 0;
  let adIndex = 0;

  // Replace </p> tags and inject first 3 ads after paragraphs 1, 2, 3
  content = content.replace(/<\/p>/g, () => {
    paragraphCount++;

    let adHtml = '';
    
    // Inject ads after paragraphs 1, 2, 3
    if (paragraphCount <= 3 && adIndex < ads.length) {
      adHtml = generateAdHtml(ads[adIndex]);
      adIndex++;
    }

    return '</p>' + adHtml;
  });

  return content;
}

// Helper function to generate ad HTML
function generateAdHtml(ad: Advertisement | null | undefined): string {
  if (!ad || !ad.image?.url) return '';
  
  return `
    <div style="text-align: center; margin: 2rem 0; padding: 1rem; background-color: #f1f5f9; border-radius: 0.5rem;">
      <a href="${ad.link || ad.weblink || '#'}" target="_blank" rel="noopener noreferrer" style="display: block;">
        <img src="${ad.image.url}" alt="${ad.title || 'Advertisement'}" style="max-width: 100%; height: auto; object-fit: contain; border-radius: 0.5rem; margin-bottom: 0.5rem;">
      </a>
    </div>
  `;
}

// Fetch blog by slug with caching headers
async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${API_URL}/api/blogs/slug/${slug}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 900 } // Cache for 15 minutes
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.data || null;
  } catch {
    return null;
  }
}

// Fetch trending blogs with fallback - optimized with caching
async function getTrendingBlogs(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${API_URL}/api/blogs/trending?limit=5`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 } // Cache for 30 minutes
    });

    if (response.ok) {
      const data = await response.json();
      const trendingData = Array.isArray(data) ? data.slice(0, 5) : data?.data?.slice(0, 5) || [];
      if (trendingData.length > 0) return trendingData;
    }

    // Fallback: fetch published blogs sorted by views
    const fallbackResponse = await fetch(`${API_URL}/api/blogs?status=published&limit=10`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 }
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      const blogs = Array.isArray(fallbackData) ? fallbackData : fallbackData?.data || [];
      return blogs.sort((a: BlogPost, b: BlogPost) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    }

    return [];
  } catch {
    return [];
  }
}

// Fetch ads by positions with caching
async function getAdsByPositions(positions: string[]): Promise<Record<string, Advertisement[]>> {
  try {
    const adsByPosition: Record<string, Advertisement[]> = {};
    
    // Fetch ads for all positions in parallel
    const responses = await Promise.all(
      positions.map(position => 
        fetch(`${API_URL}/api/advertisements/position/${position}`, {
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 3600 } // Cache for 1 hour
        })
      )
    );

    // Process each response
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const position = positions[i];
      
      if (response.ok) {
        try {
          const result = await response.json();
          if (result?.advertisements && Array.isArray(result.advertisements)) {
            adsByPosition[position] = result.advertisements;
          } else {
            adsByPosition[position] = [];
          }
        } catch {
          adsByPosition[position] = [];
        }
      } else {
        adsByPosition[position] = [];
      }
    }

    return adsByPosition;
  } catch (error) {
    console.error('Error fetching ads:', error);
    const adsByPosition: Record<string, Advertisement[]> = {};
    positions.forEach(pos => {
      adsByPosition[pos] = [];
    });
    return adsByPosition;
  }
}

// Generate static params for all published blogs (Pre-render at build time)
export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/api/blogs?status=published&limit=1000`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) return [];

    const data = await response.json();
    const blogs: BlogPost[] = Array.isArray(data) ? data : data?.data || [];
    
    return blogs.map((blog) => ({ slug: blog.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  const authorName = typeof blog.author === 'string' ? 'Unknown' : blog.author?.name || 'Unknown';
  const cleanContent = blog.content.replace(/<[^>]*>/g, '').substring(0, 150);

  return {
    title: blog.title,
    description: blog.subHeading || cleanContent,
    keywords: blog.tags?.join(', ') || undefined,
    authors: [{ name: authorName }],
    openGraph: {
      type: 'article',
      title: blog.title,
      description: blog.subHeading || cleanContent,
      images: blog.featuredImage ? [
        {
          url: blog.featuredImage.startsWith('http') 
            ? blog.featuredImage 
            : `${API_URL}${blog.featuredImage}`,
          width: 1200,
          height: 630,
          alt: blog.title,
        }
      ] : undefined,
      publishedTime: blog.publishedAt,
      authors: [authorName],
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.subHeading || cleanContent,
      images: blog.featuredImage ? [
        blog.featuredImage.startsWith('http') 
          ? blog.featuredImage 
          : `${API_URL}${blog.featuredImage}`
      ] : undefined,
    },
  };
}

// Ads are fetched from backend via useAds hook in components - backend only

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();

  const blog = await getBlogBySlug(slug);
  const trendingBlogs = await getTrendingBlogs();
  const adsByPosition = await getAdsByPositions([
    'blog_top',
    'blog_bottom',
    'blog_sidebar',
    'blog_content_paragraph_4',
    'blog_content_paragraph_6',
    'blog_content_paragraph_8'
  ]);

  if (!blog) {
    notFound();
  }

  // Extract individual ads
  const topAd = adsByPosition['blog_top']?.[0] || null;
  const bottomAd = adsByPosition['blog_bottom']?.[0] || null;
  const sidebarAds = adsByPosition['blog_sidebar'] || [];

  const authorName = typeof blog.author === 'string' ? 'Unknown' : blog.author?.name || 'Unknown';
  
  // Handle featured image URL
  const featuredImageUrl = blog.featuredImage
    ? blog.featuredImage.startsWith('http') 
      ? blog.featuredImage 
      : `${API_URL}${blog.featuredImage}`
    : '/photos/everest-sunrise.jpg';

  // Generate share URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.href : `https://wondertravelers.com/blog/${blog.slug}`;
  const encodedTitle = encodeURIComponent(blog.title);
  const encodedUrl = encodeURIComponent(baseUrl);

  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;

  return (
    <main className="bg-white min-h-screen">
      {/* Top Banner Ad */}
      {topAd && (
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href={topAd.link || topAd.weblink || "#"}
              target={topAd.link || topAd.weblink ? "_blank" : undefined}
              rel={topAd.link || topAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-lg shadow-sm bg-slate-100" style={{ aspectRatio: '21/4' }}>
                <img
                  src={topAd.image.url}
                  alt={topAd.title || "Advertisement"}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full px-2 sm:px-3 lg:px-4 py-6 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-3 lg:gap-4">
            {/* Article Content */}
            <article className="lg:col-span-8 w-full">
              {/* ==================== TOP HEADER ==================== */}
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
                  {blog.title}
                </h1>

                {/* Meta - Compact Header */}
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  {/* Left: Views */}
               <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">

                  {/* Views */}
                    <Eye size={14} className="text-slate-500" />
                    <span className="font-semibold">{formatViews(blog.views)}</span>
                  </div>

                  {/* Divider */}
                  <span className="text-slate-300">•</span>

                  {/* Author */}
                  <Link
                    href={`/author?author=${encodeURIComponent(authorName)}`}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm flex items-center justify-center bg-linear-to-br from-blue-400 to-blue-600">
                      {typeof blog.author !== "string" && blog.author?.profileImage ? (
                        <img
                          src={
                            blog.author.profileImage.startsWith("http")
                              ? blog.author.profileImage
                              : `${API_URL}/${blog.author.profileImage}`
                          }
                          alt={authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                        {authorName}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={12} />
                        <time>{formatDate(blog.publishedAt)}</time>
                      </div>
                    </div>
                  </Link>

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* Share Buttons */}
                  <div className="flex items-center gap-2">

                    {/* Facebook */}
                    <a
                      href={facebookShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition"
                    >
                      <FaFacebookF size={14} className="text-blue-600" />
                    </a>

                    {/* X / Twitter */}
                    <a
                      href={twitterShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition"
                    >
                      <FaXTwitter size={14} className="text-black" />
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={linkedinShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition"
                    >
                      <FaLinkedinIn size={14} className="text-blue-700" />
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={whatsappShare}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-green-50 hover:bg-green-100 transition"
                    >
                      <FaWhatsapp size={14} className="text-green-600" />
                    </a>


                  </div>

                </div>
              </div>

              {/* ==================== FEATURED IMAGE - FULL WIDTH ==================== */}
              <div className="mb-6 rounded-lg overflow-hidden shadow-md bg-slate-100 w-full">
                <img
                  src={featuredImageUrl}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>

              {/* ==================== SUB-HEADING ==================== */}
              {blog.subHeading && (
                <p 
                  className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic border-l-4 border-blue-500 pl-3"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                >
                  {blog.subHeading}
                </p>
              )}

              {/* ==================== CONTENT - SIMPLE WORD BREAKING ==================== */}
              <article className="mb-8">
                <div
                  className="space-y-5 text-slate-700 leading-8"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: injectAdsIntoContent(
                      blog.content
                        // Clean up non-breaking spaces client-side as fallback
                        .replace(/&nbsp;/g, ' ')
                        .replace(/<img([^>]*?)>/g, '<img$1 style="max-width: 100%; height: auto; display: block; margin: 1.5rem 0; border-radius: 0.5rem;">')
                        .replace(/<a([^>]*?)>/g, '<a$1 style="color: #2563eb; text-decoration: underline;">')
                        .replace(/<h2/g, '<h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700; color: #1e293b;"')
                        .replace(/<h3/g, '<h3 style="margin-top: 1.25rem; margin-bottom: 0.75rem; font-size: 1.25rem; font-weight: 600; color: #1e293b;"')
                        .replace(/<ul/g, '<ul style="list-style: disc; list-style-position: inside; margin: 1rem 0 1rem 1.5rem;"')
                        .replace(/<ol/g, '<ol style="list-style: decimal; list-style-position: inside; margin: 1rem 0 1rem 1.5rem;"')
                        .replace(/<li/g, '<li style="margin-bottom: 0.5rem;"')
                        .replace(/<strong/g, '<strong style="font-weight: 700;"')
                        .replace(/<em/g, '<em style="font-style: italic;"')
                        .replace(/<blockquote/g, '<blockquote style="border-left: 4px solid #dbeafe; margin-left: 0; padding-left: 1rem; color: #475569;"'),
                      adsByPosition
                    )
                  }}
                />
              </article>

              {/* ==================== BOTTOM BANNER AD ==================== */}
              {bottomAd && (
                <div className="mb-8 rounded-lg shadow-md bg-slate-100">
                  <Link 
                    href={bottomAd.link || bottomAd.weblink || "#"}
                    target={bottomAd.link || bottomAd.weblink ? "_blank" : undefined}
                    rel={bottomAd.link || bottomAd.weblink ? "noopener noreferrer" : undefined}
                    className="block"
                  >
                    <img
                      src={bottomAd.image.url}
                      alt={bottomAd.title || "Advertisement"}
                      className="w-full h-auto object-contain"
                    />
                  </Link>
                </div>
              )}

              {/* ==================== TAGS SECTION ==================== */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-8 pt-6 border-t-2 border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Tag size={18} className="text-blue-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="px-4 py-2 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-full text-sm transition-colors font-medium"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== LIKES SECTION (CLIENT COMPONENT) ==================== */}
              <div className="my-8 pt-6 border-t-2 border-slate-200 flex items-center gap-4">
                <LikesSection 
                  blogId={blog._id}
                  initialLikes={blog.likesCount || 0}
                  initialIsLiked={false}
                />
              </div>

              {/* ==================== COMMENTS SECTION (CLIENT COMPONENT) ==================== */}
              <CommentsSection 
                blogId={blog._id}
                allowComments={blog.allowComments !== false}
              />

              {/* ==================== SHARE BUTTONS (CLIENT COMPONENT) ==================== */}
              <ShareButtons 
                title={blog.title}
                publishedDate={formatDate(blog.publishedAt)}
                readingTime={blog.readingTime || 1}
              />
            </article>

            <aside className="lg:col-span-4">
              {/* ==================== BLOGS SECTION ==================== */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-600">
                  📰 Trending Now
                </h2>
                
                {trendingBlogs.length > 0 ? (
                  <div className="space-y-4">
                    {trendingBlogs.map((trendBlog, index) => (
                      <Link
                        key={trendBlog._id}
                        href={`/blog/${trendBlog.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                          <img
                            src={trendBlog.featuredImage?.startsWith('http') 
                              ? trendBlog.featuredImage 
                              : `${API_URL}${trendBlog.featuredImage}`
                            }
                            alt={trendBlog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium mb-1">
                            #{index + 1}
                          </div>
                          <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 wrap-break-word mb-1">
                            {trendBlog.title}
                          </h4>
                          <span className="text-xs text-slate-500">{formatViews(trendBlog.views)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No trending blogs available</p>
                )}
              </div>

              {/* ==================== ADVERTISEMENT SECTION ==================== */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-red-500">
                  🎯 Advertisements
                </h2>
                
                <div className="space-y-6">
                  {/* Sidebar Ads */}
                  {sidebarAds && sidebarAds.length > 0 ? (
                    sidebarAds.map((ad) => (
                      <Link
                        key={ad._id}
                        href={ad.link || ad.weblink || "#"}
                        target={ad.link || ad.weblink ? "_blank" : undefined}
                        rel={ad.link || ad.weblink ? "noopener noreferrer" : undefined}
                        className="block group"
                      >
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                          <div className="relative w-full bg-slate-100" style={{ aspectRatio: '4/5' }}>
                            <img
                              src={ad.image.url}
                              alt={ad.title || "Advertisement"}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <span className="text-xs text-white/70 uppercase tracking-wider mb-1 block">
                                Sponsored
                              </span>
                              {ad.title && (
                                <h4 className="text-white font-semibold mb-1 wrap-break-word">{ad.title}</h4>
                              )}
                              {ad.description && (
                                <p className="text-white/80 text-xs mb-2 wrap-break-word">{ad.description}</p>
                              )}
                              <span className="text-white text-xs font-medium inline-flex items-center gap-1">
                                Learn More <ChevronRight size={12} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No advertisements available</p>
                  )}

                  {/* Newsletter */}
                  <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-md">
                    <h4 className="text-white font-bold text-lg mb-2">📬 Get Weekly Updates</h4>
                    <p className="text-white/90 text-sm mb-4 wrap-break-word">
                      Join 15,000+ travelers. No spam, only Himalayas.
                    </p>
                    <form className="space-y-3">
                      <input
                        type="email"
                        placeholder="Your email address"
                        className="w-full px-4 py-2.5 rounded-lg border-0 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 focus:ring-2 focus:ring-white outline-none text-sm"
                      />
                      <button className="w-full px-4 py-2.5 bg-white text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
                        Subscribe
                      </button>
                    </form>
                    <p className="text-xs text-white/60 mt-3 wrap-break-word">
                      Unsubscribe anytime. We respect your privacy.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
} 