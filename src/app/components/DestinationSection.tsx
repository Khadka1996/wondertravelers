"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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

// Advertisement data - only 2 ads for sidebar
const ADVERTISEMENTS = [
  {
    _id: "6862205b90dca6d27bd07b27",
    websiteLink: "https://www.wondertravelers.com/",
    imagePath: "/uploads/advertisement/advertisement-1751261275289-42103049.gif",
    position: "destination_sidebar_1",
  },
  {
    _id: "6862205b90dca6d27bd07b28",
    websiteLink: "https://www.himalayaair.com/",
    imagePath: "/uploads/advertisement/advertisement-1751261275289-42103050.gif",
    position: "destination_sidebar_2",
  }
];

export default function DestinationSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [backgroundImage, setBackgroundImage] = useState(DESTINATIONS[0].image);

  // Change background based on featured destinations
  useEffect(() => {
    const featured = DESTINATIONS.filter(d => d.featured === true);
    let index = 0;
    
    const interval = setInterval(() => {
      if (featured.length > 0) {
        setBackgroundImage(featured[index % featured.length].image);
        index++;
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const filtered = activeCategory === "All"
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.category === activeCategory);

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Dynamic background - cycles through featured destinations only */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/80 z-10" />
        {DESTINATIONS.filter(d => d.featured === true).map((dest, index) => (
          <div
            key={dest.id}
            className="absolute inset-0"
            style={{
              opacity: backgroundImage === dest.image ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
          >
            <Image
              src={dest.image}
              alt=""
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto">
        {/* Simple header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Explore Nepal&apos;s Top Destinations
          </h2>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            From Everest&apos;s majesty to Chitwan&apos;s jungles — discover the best of Nepal.
          </p>
        </div>

        {/* Simple category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-white text-slate-900 shadow-md"
                  : "bg-white/10 text-white/90 hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Destinations - 9 columns */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <Link
                    href={`/destinations/${dest.slug}`}
                    className="group block h-full"
                  >
                    <div className="relative h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/5 transition-all duration-200">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={dest.image}
                          alt={dest.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        
                        {dest.featured && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded shadow-lg z-10">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-[#38BDF8] transition-colors line-clamp-2">
                          {dest.name}
                        </h3>
                        <p className="text-white/70 text-xs line-clamp-2 mb-3 min-h-[32px]">
                          {dest.shortDesc}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-amber-400">
                            <Star size={14} className="fill-current" />
                            <span className="text-white text-sm">{dest.rating}</span>
                            <span className="text-white/50 text-xs">({dest.reviewCount})</span>
                          </div>
                          <span className="text-[#38BDF8] text-sm flex items-center gap-1">
                            Explore <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar - Square advertisements - only 2 */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-4">
                  Advertisement
                </h3>
                
                <div className="space-y-4">
                  {ADVERTISEMENTS.map((ad, index) => (
                    <motion.div
                      key={ad._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                    >
                      <a
                        href={ad.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="relative w-full aspect-square bg-white/5 rounded-lg overflow-hidden">
                          <Image
                            src={ad.imagePath}
                            alt="Advertisement"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 300px"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200" />
                        </div>
                      </a>
                    </motion.div>
                  ))}
                </div>

                {/* Position indicator - for development */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-white/30 text-[10px] text-center">
                    positions: destination_sidebar_1,2
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Simple CTA button */}
        <div className="mt-12 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            View All Destinations
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}