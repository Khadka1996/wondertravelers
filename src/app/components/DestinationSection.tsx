"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAds } from "../../hooks/useAds";

interface Destination {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  category: string;
  shortDesc: string;
  image: {
    url: string;
    width?: number;
    height?: number;
  };
  rating: number;
  reviewCount: number;
  featured: boolean;
}

interface Advertisement {
  _id: string;
  title: string;
  image: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  weblink: string;
  position: string;
  clicks: number;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  destinations: Destination[];
  total: number;
  count: number;
}

interface AdsResponse {
  success: boolean;
  position: string;
  count: number;
  advertisements: Advertisement[];
}

const FALLBACK_CATEGORIES = ["All", "Mountains", "Lakes & Adventure", "Cultural Heritage", "Trekking", "Wildlife & Jungle"];

export default function DestinationSection() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Destination | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [backgroundImage, setBackgroundImage] = useState<string>("/hero-background.jpg");
  const [loading, setLoading] = useState(true);
  const [sidebarAds, setSidebarAds] = useState<Advertisement[]>([]);

  // Fetch top ad from backend
  const { ads: topAds } = useAds('destination_top');
  const topAd = topAds.length > 0 ? topAds[0] : null;

  // Fetch sidebar advertisements from backend
  useEffect(() => {
    const fetchSidebarAds = async () => {
      try {
        const timestamp = new Date().getTime();
        
        // Fetch both sidebar positions
        const [ad1Response, ad2Response] = await Promise.all([
          fetch(`/api/advertisements/position/destination_sidebar_1?t=${timestamp}`, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }),
          fetch(`/api/advertisements/position/destination_sidebar_2?t=${timestamp}`, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          })
        ]);

        const ads: Advertisement[] = [];
        
        if (ad1Response.ok) {
          const data: AdsResponse = await ad1Response.json();
          if (data.success && data.advertisements.length > 0) {
            ads.push(...data.advertisements);
          }
        }
        
        if (ad2Response.ok) {
          const data: AdsResponse = await ad2Response.json();
          if (data.success && data.advertisements.length > 0) {
            ads.push(...data.advertisements);
          }
        }
        
        setSidebarAds(ads);
        console.log(`📢 Fetched ${ads.length} advertisements`);
      } catch (error) {
        console.error('Failed to fetch advertisements:', error);
      }
    };

    fetchSidebarAds();
  }, []);

  // Fetch destinations from backend
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        let url = `/api/destinations/public?limit=12&skip=0&t=${timestamp}`;
        
        if (activeCategory !== "All") {
          url += `&category=${encodeURIComponent(activeCategory)}`;
        }

        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        const data: ApiResponse = await res.json();

        if (data.success && data.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations);
          console.log(`🎯 Fetched ${data.destinations.length} destinations`);
          
          // Set first image as background
          if (data.destinations[0]?.image?.url) {
            setBackgroundImage(data.destinations[0].image.url);
          }
        } else {
          setDestinations([]);
        }
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [activeCategory]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/destinations/categories', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(["All", ...data.categories]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Change background image
  useEffect(() => {
    if (destinations.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      const dest = destinations[index % destinations.length];
      if (dest?.image?.url) {
        setBackgroundImage(dest.image.url);
      }
      index++;
    }, 5000);

    return () => clearInterval(interval);
  }, [destinations]);

  return (
    <section className="relative py-12 px-2 sm:px-4 lg:px-6 bg-slate-950">
      {/* Dynamic background - cycles through destinations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/85 z-10" />
        {destinations.map((dest, index) => (
          <div
            key={dest._id || dest.id}
            className="absolute inset-0"
            style={{
              opacity: backgroundImage === dest.image?.url ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
          >
            <Image
              src={dest.image?.url || "/hero-background.jpg"}
              alt=""
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <MapPin className="text-cyan-400" size={28} />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Explore Top Destinations
            </h2>
          </div>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            From Everest&apos;s majesty to Chitwan&apos;s wildlife — discover Nepal&apos;s most breathtaking destinations
          </p>
        </div>

        {/* Top Advertisement - Only show if ad exists */}
        {topAd && (
          <div className="mb-8">
            <Link 
              href={topAd.link || topAd.weblink || "#"}
              target={topAd.link || topAd.weblink ? "_blank" : undefined}
              rel={topAd.link || topAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-lg aspect-[5/1] sm:aspect-[21/4] bg-slate-100">
                <Image
                  src={typeof topAd.image === 'string' ? topAd.image : topAd.image.url}
                  alt={typeof topAd.image === 'string' ? "Advertisement" : topAd.image.alt || "Advertisement"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
                  : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Destinations - 9 columns */}
          <div className="lg:col-span-9">
            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="animate-pulse">
                    <div className="relative h-64 w-full bg-slate-700 rounded-lg mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded animate-pulse" />
                      <div className="h-3 bg-slate-600 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Destinations Grid */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.length > 0 ? (
                  destinations.map((dest, index) => (
                    <motion.div
                      key={dest._id || dest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="h-full"
                    >
                      <Link href={`/explore/${dest.slug}`} className="group block h-full">
                        <div className="relative h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg overflow-hidden hover:border-cyan-500/60 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20">
                          {/* Image */}
                          <div className="relative h-48 w-full overflow-hidden">
                            <Image
                              src={dest.image?.url || "/photos/placeholder.jpg"}
                              alt={dest.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
                            
                            {/* Featured Badge */}
                            {dest.featured && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 left-3 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg z-10 flex items-center gap-1"
                              >
                                ⭐ Featured
                              </motion.span>
                            )}

                            {/* Category Badge */}
                            <span className="absolute top-3 right-3 px-2.5 py-1 bg-cyan-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                              {dest.category}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="p-4 flex flex-col h-32">
                            <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-400 transition-colors line-clamp-2">
                              {dest.name}
                            </h3>
                            <p className="text-white/70 text-xs line-clamp-2 mb-3 flex-1">
                              {dest.shortDesc}
                            </p>

                            {/* Rating and CTA */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <div className="flex items-center gap-1.5 text-amber-400">
                                <Star size={14} className="fill-current" />
                                <span className="text-white text-sm font-medium">{dest.rating}</span>
                                <span className="text-white/50 text-xs">({dest.reviewCount})</span>
                              </div>
                              <span className="text-cyan-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Explore <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>

                          {/* Hover Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none" />
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="mx-auto mb-3 text-slate-500" size={32} />
                    <p className="text-white/60">No destinations found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Advertisement */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 space-y-2">
              {/* Advertisements from Backend */}
              {sidebarAds.length > 0 ? (
                sidebarAds.map((ad, index) => (
                  <motion.div
                    key={ad._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-2 shadow-xl"
                  >
                    <a
                      href={ad.weblink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="relative w-full aspect-square bg-slate-700 rounded-lg overflow-hidden">
                        <Image
                          src={ad.image?.url || "/hero-background.jpg"}
                          alt={ad.image?.alt || ad.title}
                          fill
                          className="object-cover"
                          sizes="300px"
                        />
                        <div className="absolute inset-0 bg-black/0" />
                      </div>
                    </a>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-cyan-500/10 to-slate-900/50 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-sm"
                >
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    Featured Destinations
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Discover Nepal&apos;s most visited and highly-rated destinations. Each offers unique experiences and breathtaking landscapes.
                  </p>
                </motion.div>
              )}

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: sidebarAds.length > 0 ? 0.2 : 0.1 }}
                className="bg-gradient-to-br from-cyan-500/10 to-slate-900/50 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-sm"
              >
                <h3 className="text-white font-bold mb-1">📍 Explore More</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Browse our complete collection of Nepal&apos;s top destinations with detailed guides, ratings, and travel tips.
                </p>
              </motion.div>
            </div>
          </aside>
        </div>

        {/* Explore All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-1"
          >
            <MapPin size={18} />
            Explore All Destinations
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}