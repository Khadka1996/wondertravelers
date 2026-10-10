//src/app/components/Herosection.tsx
"use client";

import { useState, useEffect } from "react";
import Link from '@/components/LocaleLink';
import Image from "next/image";
import { Globe, ChevronDown } from "lucide-react";

export interface FeaturedImage {
  _id: string;
  imageUrl: string;
}

const SLIDE_MS = 5000;

/**
 * Slides arrive with the page HTML (fetched on the server), so the first
 * picture starts loading immediately. All slides are stacked and cross-fade
 * with CSS: no slide is ever hidden waiting for an onLoad event.
 */
export default function HeroSection({ initialImages = [] }: { initialImages?: FeaturedImage[] }) {
  const images = initialImages;
  const [currentImage, setCurrentImage] = useState(0);
  // Slides after the first load once the page is up, not with the first paint.
  const [loadRest, setLoadRest] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadRest(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => setCurrentImage((prev) => (prev + 1) % images.length), SLIDE_MS);
    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        {images.map((image, index) =>
          index === 0 || loadRest ? (
            <div
              key={image._id}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: index === currentImage ? 1 : 0 }}
              aria-hidden={index !== currentImage}
            >
              <Image
                src={image.imageUrl}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                quality={75}
                className="object-cover"
              />
            </div>
          ) : null,
        )}
      </div>
      
      {/* Clean overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Discover Nepal's Wonders
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Stunning travel blogs, professional photos for sale, and insider guides 
            for sustainable tourism in the Himalayas.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/explore"
            className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            Explore Destinations
          </Link>
          <Link
            href="/photos"
            className="px-6 py-3 bg-white text-blue-600 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Buy Photos
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white/10 transition-colors"
          >
            Read Blogs
          </Link>
        </div>

        {/* Promo */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/80 text-sm">
          <Globe size={16} />
          <span>Promoting Nepal Tourism Since 2023</span>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`transition-all duration-300 ${
              index === currentImage 
                ? "w-8 h-2 bg-white" 
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition-colors z-20"
        aria-label="Scroll down"
      >
        <ChevronDown size={24} />
      </button>
    </section>
  );
}