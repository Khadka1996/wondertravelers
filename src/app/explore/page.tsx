'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronRight, ChevronLeft, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultipleAds } from '../../hooks/useAds';

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

const FALLBACK_CATEGORIES = ['All', 'Mountains', 'Lakes & Adventure', 'Cultural Heritage', 'Trekking', 'Wildlife & Jungle'];
const ITEMS_PER_PAGE = 12;

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch ads using hook
  const { adsByPosition } = useMultipleAds(['explore_top', 'explore_bottom', 'destination_sidebar_1', 'destination_sidebar_2']);
  const topAd = adsByPosition['explore_top']?.[0] || null;
  const bottomAd = adsByPosition['explore_bottom']?.[0] || null;
  const sidebarAds = [
    adsByPosition['destination_sidebar_1']?.[0],
    adsByPosition['destination_sidebar_2']?.[0]
  ].filter(Boolean);

  const totalPages = Math.ceil(totalDestinations / ITEMS_PER_PAGE);

  // Fetch destinations from backend
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;

        let url = `/api/destinations/public?limit=${ITEMS_PER_PAGE}&skip=${skip}&t=${timestamp}`;

        if (activeCategory !== 'All') {
          url += `&category=${encodeURIComponent(activeCategory)}`;
        }

        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        });

        const data: ApiResponse = await res.json();

        if (data.success && data.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations);
          setTotalDestinations(data.total);
          console.log(`🎯 Fetched ${data.destinations.length} destinations out of ${data.total}`);
        } else {
          setDestinations([]);
          setTotalDestinations(0);
        }
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [activeCategory, currentPage, searchQuery]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/destinations/categories', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        });

        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(['All', ...data.categories]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    console.log(`🔍 Searching for: "${query}"`);
  };

  return (
    <div className="min-h-screen bg-white pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Explore Destinations
          </h1>
          <p className="text-gray-600 text-lg">
            Discover Nepal&apos;s most breathtaking destinations
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Top Advertisement */}
        {topAd && (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Ads.</p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
            <Link
              href={topAd.link || topAd.weblink || "#"}
              target={topAd.link || topAd.weblink ? "_blank" : undefined}
              rel={topAd.link || topAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-md aspect-[5/1] sm:aspect-[21/4]">
                <Image
                  src={typeof topAd.image === 'string' ? topAd.image : topAd.image.url}
                  alt={typeof topAd.image === 'string' ? "Advertisement" : topAd.image.alt || "Advertisement"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
          </motion.div>
          </>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
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
                              src={dest.image?.url || '/photos/placeholder.jpg'}
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
                  <div className="col-span-full text-center py-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-dashed border-cyan-300">
                    <MapPin className="mx-auto mb-3 text-cyan-500" size={40} />
                    <p className="text-gray-700 font-semibold text-lg">No destinations found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && destinations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 flex items-center justify-between bg-gray-100 border border-gray-300 rounded-lg p-4"
              >
                <div className="text-gray-700 text-sm">
                  Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalDestinations)}</span> of{' '}
                  <span className="font-semibold text-gray-900">{totalDestinations}</span> destinations
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white border border-cyan-700 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                            currentPage === pageNumber
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-gray-500">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                            currentPage === totalPages
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white border border-cyan-700 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bottom Advertisement */}
            {bottomAd && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <Link
                  href={bottomAd.link || bottomAd.weblink || "#"}
                  target={bottomAd.link || bottomAd.weblink ? "_blank" : undefined}
                  rel={bottomAd.link || bottomAd.weblink ? "noopener noreferrer" : undefined}
                  className="block w-full"
                >
                  <div className="relative w-full rounded-lg overflow-hidden shadow-md aspect-[5/1] sm:aspect-[21/4]">
                    <Image
                      src={typeof bottomAd.image === 'string' ? bottomAd.image : bottomAd.image.url}
                      alt={typeof bottomAd.image === 'string' ? "Advertisement" : bottomAd.image.alt || "Advertisement"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Advertisement */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Advertisements from Backend */}
              {sidebarAds.length > 0 ? (
                sidebarAds.map((ad, index) => (
                  <motion.div
                    key={ad._id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white border-2 border-cyan-500 rounded-lg p-4 shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    <a
                      href={ad.link || ad.weblink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                        <Image
                          src={typeof ad.image === 'string' ? ad.image : ad.image?.url || '/hero-background.jpg'}
                          alt={typeof ad.image === 'string' ? 'Advertisement' : ad.image?.alt || 'Advertisement'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="300px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-3 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-full">
                            Sponsored
                          </span>
                        </div>

                      </div>
                    </a>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                >
                  <h3 className="text-gray-900 font-bold mb-2 flex items-center gap-2">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    Featured Destinations
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Discover Nepal&apos;s most visited and highly-rated destinations. Each offers unique experiences and breathtaking landscapes.
                  </p>
                </motion.div>
              )}

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: sidebarAds.length > 0 ? 0.2 : 0.1 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <h3 className="text-gray-900 font-bold mb-2">📍 Travel Tips</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Each destination has detailed information, visitor ratings, and reviews to help you plan your perfect Nepal adventure.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: sidebarAds.length > 0 ? 0.3 : 0.2 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <p className="text-gray-700 text-sm mb-3">
                  <span className="font-bold text-green-600 text-lg">{totalDestinations}</span> destinations available
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>✓ Verified ratings & reviews</p>
                  <p>✓ Traveler feedback</p>
                  <p>✓ Travel guidance</p>
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
