"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ChevronRight } from "lucide-react";

// Only these 6 destinations are shown
const DESTINATIONS = [
  {
    id: 1,
    name: "Mount Everest & Everest Region",
    slug: "everest-region",
    category: "Mountains",
    shortDesc: "Home to the world's highest peak – iconic treks & Himalayan views",
    image: "/photos/everest-sunrise.jpg",
    rating: 4.9,
    reviewCount: 1245,
    featured: true,
  },
  {
    id: 2,
    name: "Pokhara",
    slug: "pokhara",
    category: "Lakes & Adventure",
    shortDesc: "Lakeside city with paragliding, boating & Annapurna views",
    image: "/photos/pokhara-lake.jpg",
    rating: 4.8,
    reviewCount: 987,
    featured: true,
  },
  {
    id: 3,
    name: "Kathmandu Valley",
    slug: "kathmandu-valley",
    category: "Cultural Heritage",
    shortDesc: "Living heritage – ancient temples, stupas & vibrant markets",
    image: "/photos/durbar-square.jpg",
    rating: 4.7,
    reviewCount: 1120,
    featured: true,
  },
  {
    id: 4,
    name: "Annapurna Circuit",
    slug: "annapurna",
    category: "Trekking",
    shortDesc: "World-famous trek – diverse landscapes & Thorong La Pass",
    image: "/photos/annapurna-range.jpg",
    rating: 4.9,
    reviewCount: 1450,
    featured: false,
  },
  {
    id: 5,
    name: "Chitwan National Park",
    slug: "chitwan",
    category: "Wildlife & Jungle",
    shortDesc: "Safari adventures – rhinos, tigers, elephants & Tharu culture",
    image: "/photos/chitwan-rhino.jpg",
    rating: 4.6,
    reviewCount: 820,
    featured: false,
  },
  {
    id: 6,
    name: "Langtang Valley",
    slug: "langtang",
    category: "Mountains",
    shortDesc: "Serene alpine valley trek near Tibetan border",
    image: "/photos/langtang-valley.jpg",
    rating: 4.7,
    reviewCount: 620,
    featured: false,
  },
];

const CATEGORIES = ["All", "Mountains", "Lakes & Adventure", "Cultural Heritage", "Trekking", "Wildlife & Jungle"];

export default function DestinationSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.category === activeCategory);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 min-h-[90vh] overflow-hidden bg-black">
      {/* Blurred rotating background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90 z-10" />
        
        <div className="slideshow">
          {DESTINATIONS.map((dest, i) => (
            <div
              key={dest.id}
              className="slide"
              style={{ animationDelay: `${i * 8}s` }}
            >
              <Image
                src={dest.image}
                alt=""
                fill
                className="object-cover blur-[8px] brightness-[0.35] scale-110"
                sizes="100vw"
                priority={i < 2}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl mb-5">
            Explore Nepal's Top Destinations
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
            From Everest's majesty to Chitwan's jungles — discover the best of Nepal.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md border border-white/20 shadow-sm ${
                activeCategory === cat
                  ? "bg-white/25 text-white shadow-lg"
                  : "bg-white/10 text-white/90 hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid + Sidebar with 3 tightly packed ads */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Destinations */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map(dest => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/15 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative h-64">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                  {dest.featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-md">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#38BDF8] transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2 mb-4">
                    {dest.shortDesc}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Star size={16} className="fill-current" />
                      <span>{dest.rating} • {dest.reviewCount}</span>
                    </div>
                    <span className="text-[#38BDF8] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Explore <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Sidebar – only 3 ads, placed closer together */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-4"> {/* ← reduced from 8 to 4 */}
              {/* Ad 1 */}
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-lg shadow-xl">
                <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 px-5 py-3">
                  <h4 className="font-semibold text-white text-sm">Featured Tour</h4>
                </div>
                <div className="h-56 flex items-center justify-center text-white/40 text-xs">
                  Ad Space 1 – Vertical Banner
                </div>
              </div>

              {/* Ad 2 */}
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-lg shadow-xl">
                <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 px-5 py-3">
                  <h4 className="font-semibold text-white text-sm">Hotel Deals</h4>
                </div>
                <div className="h-56 flex items-center justify-center text-white/40 text-xs">
                  Ad Space 2 – 300×250
                </div>
              </div>

              {/* Ad 3 – now fits comfortably */}
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-lg shadow-xl">
                <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 px-5 py-3">
                  <h4 className="font-semibold text-white text-sm">Travel Insurance</h4>
                </div>
                <div className="h-56 flex items-center justify-center text-white/40 text-xs">
                  Ad Space 3 – Vertical / Medium Rectangle
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* All destinations link */}
        <div className="mt-16 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:brightness-110 transition-all duration-300 backdrop-blur-sm"
          >
            View All Destinations
            <ChevronRight size={24} />
          </Link>
        </div>
      </div>

      {/* Slideshow animation */}
      <style jsx global>{`
        .slideshow {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          animation: slideShow 48s infinite;
        }
        @keyframes slideShow {
          0%   { opacity: 0; }
          4%   { opacity: 1; }
          16%  { opacity: 1; }
          20%  { opacity: 0; }
          100% { opacity: 0; }
        }
        .slide:nth-child(1) { animation-delay: 0s; }
        .slide:nth-child(2) { animation-delay: 8s; }
        .slide:nth-child(3) { animation-delay: 16s; }
        .slide:nth-child(4) { animation-delay: 24s; }
        .slide:nth-child(5) { animation-delay: 32s; }
        .slide:nth-child(6) { animation-delay: 40s; }
      `}</style>
    </section>
  );
}