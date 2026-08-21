"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from "lucide-react";

interface FeaturedItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  subHeading?: string;
  featuredImage?: string;
  type?: "blog" | "news";
}

const resolveImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "/photos/everest-sunrise.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;
  return `/uploads/${imagePath}`;
};

interface FeaturedNewsSectionProps {
  display?: "carousel" | "grid";
}

export default function FeaturedNewsSection({ display = "carousel" }: FeaturedNewsSectionProps) {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch("/api/blogs/featured?limit=8", {
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

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (display !== "carousel" || items.length <= 1) return;

    const timer = window.setInterval(() => {
      const carousel = carouselRef.current;
      if (!carousel) return;

      const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8;
      carousel.scrollTo({ left: atEnd ? 0 : carousel.scrollLeft + carousel.clientWidth, behavior: "smooth" });
    }, 10000);

    return () => window.clearInterval(timer);
  }, [display, items.length]);

  const moveCarousel = (direction: "next" | "previous") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const atStart = carousel.scrollLeft <= 8;
    const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8;
    if (direction === "previous" && atStart) {
      carousel.scrollTo({ left: carousel.scrollWidth, behavior: "smooth" });
      return;
    }
    if (direction === "next" && atEnd) {
      carousel.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    carousel.scrollBy({ left: direction === "next" ? carousel.clientWidth : -carousel.clientWidth, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="bg-[#171624] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 h-10 w-48 animate-pulse rounded bg-white/10" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[1.55] rounded bg-white/10" />
                <div className="mt-4 h-6 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="bg-[#171624] py-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="text-amber-400" size={28} fill="currentColor" />
            <h2 className="text-3xl font-bold tracking-tight">Featured</h2>
          </div>
          <Link
            href="/content/featured"
            aria-label="Explore all featured content"
            className="group inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-amber-400 px-4 py-2 text-sm font-bold text-[#171624] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-[#171624]"
          >
            <span>Explore featured</span>
            <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {display === "carousel" ? (
          <div className="relative">
            <button
              type="button"
              aria-label="Previous featured content"
              onClick={() => moveCarousel("previous")}
              className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-red-600 shadow-lg transition hover:scale-105 sm:flex"
            >
              <ChevronLeft size={22} />
            </button>

            <div ref={carouselRef} className="overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex -mx-2">
                {items.map((item) => (
                  <div key={item._id} className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/4">
                    <FeaturedCard item={item} />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Next featured content"
              onClick={() => moveCarousel("next")}
              className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-red-600 shadow-lg transition hover:scale-105 sm:flex"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => <FeaturedCard key={item._id} item={item} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCard({ item }: { item: FeaturedItem }) {
  return (
    <Link href={`/blog/${item.slug}`} className="group block">
      <article>
        <div className="relative aspect-[1.55] overflow-hidden rounded-sm bg-slate-800">
          <Image
            src={resolveImageUrl(item.featuredImage)}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <h3 className="mt-5 line-clamp-2 text-lg font-semibold leading-snug text-white transition group-hover:text-amber-300">
          {item.title}
        </h3>
      </article>
    </Link>
  );
}
