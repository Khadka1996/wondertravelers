"use client";

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useMultipleAds } from "../../hooks/useAds";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  subHeading?: string;
  content?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt?: string;
  type?: "blog" | "news";
  category?: string;
}

interface NewsApiItem {
  _id: string;
  title: string;
  slug: string;
  subHeading?: string;
  content?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt?: string;
  type?: "blog" | "news";
  category?: { name?: string };
}

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const resolveImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "/photos/everest-sunrise.jpg";
  if (imagePath.startsWith("http")) return imagePath;

  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  if (normalizedPath.startsWith("/uploads")) return normalizedPath;

  return `/uploads/${normalizedPath.replace(/^\/+/, "")}`;
};

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { adsByPosition } = useMultipleAds(['news_top', 'news_bottom', 'news_sidebar']);
  const topBannerAd = adsByPosition['news_top']?.[0] || null;
  const bottomBannerAd = adsByPosition['news_bottom']?.[0] || null;
  const sidebarAds = [adsByPosition['news_sidebar']?.[0]].filter(Boolean);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/blogs/news?page=1&limit=6`, {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          setNews([]);
          return;
        }

        const result = await response.json();
        const newsArray = Array.isArray(result?.data) ? result.data : [];

        const transformedNews = newsArray.map((item: NewsApiItem) => ({
          _id: item._id,
          title: item.title,
          slug: item.slug,
          subHeading: item.subHeading || item.content?.replace(/<[^>]*>/g, "").trim().slice(0, 100) || "",
          featuredImage: resolveImageUrl(item.featuredImage),
          publishedAt: formatDate(item.publishedAt || item.createdAt),
          category: item.category?.name || "News",
        }));

        setNews(transformedNews.slice(0, 6));
      } catch {
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {topBannerAd && topBannerAd.image && (
          <div className="mb-8">
            <Link
              href={topBannerAd.link || topBannerAd.weblink || "#"}
              target={topBannerAd.link || topBannerAd.weblink ? "_blank" : undefined}
              rel={topBannerAd.link || topBannerAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-3xl shadow-lg aspect-[21/6] overflow-hidden bg-slate-100">
                <img
                  src={typeof topBannerAd.image === 'string' ? topBannerAd.image : topBannerAd.image.url}
                  alt={typeof topBannerAd.image === 'string' ? 'Advertisement' : topBannerAd.image.alt || 'Advertisement'}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Latest Wonder News
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            Fresh updates, destination alerts, and Nepal tourism stories from the field.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={`news-skeleton-${i}`} className="animate-pulse rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="relative h-44 md:h-48 w-full bg-slate-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-20 bg-slate-200 rounded" />
                      <div className="h-4 bg-slate-200 rounded w-11/12" />
                      <div className="h-4 bg-slate-100 rounded w-4/5" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  {news.map((item) => (
                    <Link key={item._id} href={`/blog/${item.slug}`} className="group block h-full">
                      <div className="relative h-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="relative h-44 md:h-48 w-full overflow-hidden bg-slate-100">
                          <img
                            src={item.featuredImage}
                            alt={`Image for ${item.title}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <Calendar size={12} />
                            <span>{item.publishedAt}</span>
                          </div>

                          <div className="mb-2 inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                            {item.category}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
                            {item.title}
                          </h3>

                          <p className="text-slate-600 text-xs line-clamp-2 mb-3">
                            {item.subHeading}
                          </p>

                          <div className="flex items-center text-[#0284C7] text-xs font-medium group-hover:gap-1.5 transition-all">
                            Read More <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Browse All News
                    <ChevronRight size={18} />
                  </Link>
                </div>

                {bottomBannerAd && bottomBannerAd.image && (
                  <div className="mt-8">
                    <Link
                      href={bottomBannerAd.link || bottomBannerAd.weblink || "#"}
                      target={bottomBannerAd.link || bottomBannerAd.weblink ? "_blank" : undefined}
                      rel={bottomBannerAd.link || bottomBannerAd.weblink ? "noopener noreferrer" : undefined}
                      className="block w-full"
                    >
                      <div className="relative w-full rounded-xl shadow-md aspect-21/4 overflow-hidden bg-slate-100">
                        <img
                          src={typeof bottomBannerAd.image === 'string' ? bottomBannerAd.image : bottomBannerAd.image.url}
                          alt={typeof bottomBannerAd.image === 'string' ? 'Advertisement' : bottomBannerAd.image.alt || 'Advertisement'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Advertisement
                  </h3>
                </div>

                <div className="space-y-2">
                  {sidebarAds.map((ad, idx) => (
                    <Link
                      key={ad._id || `ad-${idx}`}
                      href={ad.link || ad.weblink || "#"}
                      target={ad.link || ad.weblink ? "_blank" : undefined}
                      rel={ad.link || ad.weblink ? "noopener noreferrer" : undefined}
                      className="block w-full"
                    >
                      <div className="relative w-full rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                        <div className="relative w-full aspect-4/5 flex items-center justify-center">
                          <img
                            src={typeof ad.image === 'string' ? ad.image : ad.image.url}
                            alt={typeof ad.image === 'string' ? 'Advertisement' : ad.image.alt || 'Advertisement'}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
