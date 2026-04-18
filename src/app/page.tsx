"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import HeroSection from "./components/Herosection";
import VideoSection from "./components/VideoSection";
import PhotoSection from "./components/PhotoSection";
import BlogSection from "./components/BlogSection";
import ContactSection from "./components/ContactSection";
import DestinationSection from "./components/DestinationSection";
import { useMultipleAds } from "../hooks/useAds";
import Link from "next/link";
import { X } from "lucide-react";

export default function HomePage() {
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const [closeCountdown, setCloseCountdown] = useState(3);
  const { adsByPosition } = useMultipleAds(['homepage_banner', 'homepage_top', 'homepage_bottom']);
  const bannerAd = adsByPosition['homepage_banner']?.[0] || null;
  const topAd = adsByPosition['homepage_top']?.[0] || null;
  const bottomAd = adsByPosition['homepage_bottom']?.[0] || null;

  // Show popup immediately on page load
  useEffect(() => {
    if (bannerAd) {
      setShowBannerPopup(true);
    }
  }, [bannerAd]);

  // Auto-close countdown
  useEffect(() => {
    if (!showBannerPopup) return;

    const timer = setTimeout(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          setShowBannerPopup(false);
          setCloseCountdown(3);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [showBannerPopup, closeCountdown]);

  // Prevent scroll when popup is shown
  useEffect(() => {
    if (showBannerPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showBannerPopup]);

  const handleClosePopup = () => {
    setShowBannerPopup(false);
    setCloseCountdown(3);
  };

  return (
    <div className="">
      {/* Homepage Banner Popup */}
      {bannerAd && showBannerPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white max-w-3xl w-full relative shadow-2xl">
            {/* Close Button with Countdown */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg z-10 flex items-center gap-2 font-semibold transition-all"
            >
              <X size={20} />
              <span className="text-lg">{closeCountdown}s</span>
            </button>
            <Link
              href={bannerAd.link || bannerAd.weblink || "#"}
              target={bannerAd.link || bannerAd.weblink ? "_blank" : undefined}
              rel={bannerAd.link || bannerAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <Image
                src={bannerAd.image.url}
                alt={bannerAd.title || "Advertisement"}
                width={1200}
                height={600}
                unoptimized
                className="w-full h-auto object-contain"
              />
            </Link>
          </div>
        </div>
      )}

      {/* Style for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Homepage Top Banner Ad */}
      {topAd && (
        <div className="w-full bg-slate-100 py-2">
          <Link
            href={topAd.link || topAd.weblink || "#"}
            target={topAd.link || topAd.weblink ? "_blank" : undefined}
            rel={topAd.link || topAd.weblink ? "noopener noreferrer" : undefined}
            className="block w-full"
          >
            <div className="relative w-full aspect-20/3">
              <Image
                src={topAd.image.url}
                alt={topAd.title || "Advertisement"}
                fill
                unoptimized
                loading="lazy"
                sizes="100vw"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* Video/Media Section */}
      <section id="video" className="">
        <div className="">
          <VideoSection />
        </div>
      </section>
      
      {/* Photo Gallery Section */}
      <section id="photos" className="">
        <div className="">
          <PhotoSection />
        </div>
      </section>
      
      {/* Destinations Section */}
      <section id="destinations" className="">
        <div className="">
          <DestinationSection />
        </div>
      </section>
      
      {/* Blog Section */}
      <section id="blog" className="">
        <div className="">
          <BlogSection />
        </div>
      </section>

      {/* Homepage Bottom Banner Ad */}
      {bottomAd && (
        <div className="w-full bg-slate-100 py-2">
          <Link
            href={bottomAd.link || bottomAd.weblink || "#"}
            target={bottomAd.link || bottomAd.weblink ? "_blank" : undefined}
            rel={bottomAd.link || bottomAd.weblink ? "noopener noreferrer" : undefined}
            className="block w-full"
          >
            <div className="relative w-full aspect-20/3">
              <Image
                src={bottomAd.image.url}
                alt={bottomAd.title || "Advertisement"}
                fill
                unoptimized
                loading="lazy"
                sizes="100vw"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        </div>
      )}
      
      {/* Contact Section */}
      <section id="contact" className="">
        <div className="">
          <ContactSection />
        </div>
      </section>
    </div>
  );
}