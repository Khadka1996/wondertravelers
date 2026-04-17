//src/app/components/Herosection.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, ChevronDown } from "lucide-react";

interface FeaturedImage {
  _id: string;
  imageUrl: string;
}

export default function HeroSection() {
  const [images, setImages] = useState<FeaturedImage[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageReady, setImageReady] = useState(false);

  // Fetch featured images from FeaturedImage collection (admin-managed)
  useEffect(() => {
    const fetchFeaturedImages = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/featured-images/public?limit=4&t=${timestamp}`, {
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
        
        if (data.success && data.data && data.data.length > 0) {
          // Featured images from admin panel - imageUrl is already set
          setImages(data.data);
        }
        // If no data, images remain empty
      } catch (error) {
        // If fetch fails, images remain empty
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedImages();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchFeaturedImages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
      setImageReady(false); // Reset ready state for smooth transition
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Preload next image
  useEffect(() => {
    if (images.length > 0) {
      const nextIndex = (currentImage + 1) % images.length;
      const nextImage = new window.Image();
      nextImage.src = images[nextIndex].imageUrl;
    }
  }, [currentImage, images]);

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  const currentImageData = images[currentImage];
  const nextImageData = images[(currentImage + 1) % images.length];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image Slider - Ultra Fast */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          {currentImageData && (
            <motion.div
              key={currentImage}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: imageReady ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Image
                src={currentImageData.imageUrl}
                alt={`Slide ${currentImage + 1}`}
                fill
                priority={currentImage === 0}
                loading="eager"
                sizes="100vw"
                quality={85}
                onLoad={() => setImageReady(true)}
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Crect fill='%23333' width='1280' height='720'/%3E%3C/svg%3E"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preload next image silently */}
        {images.length > 0 && (
          <Image
            src={nextImageData.imageUrl}
            alt="Next slide"
            fill
            sizes="100vw"
            quality={85}
            className="hidden"
            onLoad={() => {}}
          />
        )}
      </div>
      
      {/* Clean overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Discover Nepal's Wonders
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Stunning travel blogs, professional photos for sale, and insider guides 
            for sustainable tourism in the Himalayas.
          </p>
        </motion.div>

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