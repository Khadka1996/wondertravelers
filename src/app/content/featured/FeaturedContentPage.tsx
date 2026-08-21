"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, ChevronLeft, ChevronRight, Home, Newspaper, Star } from "lucide-react";

interface FeaturedItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  subHeading?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt?: string;
  type?: "blog" | "news";
  category?: { name?: string };
}

const resolveImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "/photos/everest-sunrise.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;
  return `/uploads/${imagePath}`;
};

const formatDate = (date?: string): string => {
  if (!date) return "Featured selection";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Featured selection";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function FeaturedContentPage() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const response = await fetch("/api/blogs/featured?limit=50", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const result = await response.json();
        setItems(Array.isArray(result?.data) ? result.data : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const visibleItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <main className="min-h-screen bg-[#171624] pb-20 pt-16 text-white sm:pt-20 md:pt-24">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-white/55">
          <Link href="/" className="inline-flex items-center gap-1 transition hover:text-amber-300">
            <Home size={14} /> Home
          </Link>
          <span>/</span>
          <span className="font-medium text-white">Featured</span>
        </nav>

        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-amber-400">
            <Star size={24} fill="currentColor" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Editor's selection</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Featured</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/65 sm:text-lg">
            Stories, ideas, and news selected by the WonderTravelers team.
          </p>
        </header>

        {loading ? <LoadingState /> : items.length === 0 ? <EmptyState /> : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map((item) => <FeaturedGridCard key={item._id} item={item} />)}
          </div>
        )}

        {!loading && items.length > 0 && totalPages > 1 && (
          <nav aria-label="Featured content pagination" className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  type="button"
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${currentPage === page ? "bg-amber-400 text-[#171624]" : "border border-white/15 text-white hover:border-amber-400 hover:text-amber-300"}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}

function FeaturedGridCard({ item }: { item: FeaturedItem }) {
  return (
    <Link href={`/blog/${item.slug}`} className="group block overflow-hidden rounded-lg border border-white/10 bg-[#211f31] shadow-lg transition duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-xl">
      <div className="relative aspect-[1.45] overflow-hidden bg-slate-800">
        <Image
          src={resolveImageUrl(item.featuredImage)}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#171624] shadow-sm">
          {item.type === "news" ? <Newspaper size={12} /> : <BookOpen size={12} />}
          <span>{item.type === "news" ? "News" : "Story"}</span>
        </span>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-white/55">
          <Calendar size={13} /> {formatDate(item.publishedAt || item.createdAt)}
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white transition group-hover:text-amber-300">{item.title}</h3>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-amber-300">
          <ArrowRight size={17} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-lg border border-white/10 bg-[#211f31]">
          <div className="aspect-[1.45] bg-white/10" />
          <div className="space-y-3 p-5"><div className="h-3 w-24 rounded bg-white/10" /><div className="h-5 rounded bg-white/10" /><div className="h-4 w-2/3 rounded bg-white/5" /></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/20 bg-[#211f31] px-6 py-20 text-center">
      <Star className="mx-auto text-amber-400" size={36} />
      <h2 className="mt-4 text-2xl font-bold text-white">No featured stories yet</h2>
      <p className="mx-auto mt-2 max-w-md text-white/60">Our editors are preparing the next collection. Check back soon.</p>
      <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-[#171624] transition hover:bg-amber-300">Back home <ArrowRight size={17} /></Link>
    </div>
  );
}
