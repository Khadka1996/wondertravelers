"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import HeroSection from "./components/Herosection";
import VideoSection from "./components/VideoSection";
import FeaturedNewsSection from "./components/FeaturedNewsSection";
import NewsSection from "./components/NewsSection";
import PhotoSection from "./components/PhotoSection";
import BlogSection from "./components/BlogSection";
import ContactSection from "./components/ContactSection";
import DestinationSection from "./components/DestinationSection";
import { useMultipleAds } from "../hooks/useAds";
import Link from "next/link";
import { X } from "lucide-react";
import PremiumAdSection from "../components/PremiumAdSection";

export default function HomePage() {
  const [showBannerPopup, setShowBannerPopup] = useState(false);
  const [closeCountdown, setCloseCountdown] = useState(5);
  const { adsByPosition } = useMultipleAds(['homepage_banner', 'homepage_top', 'homepage_bottom']);
  const bannerAd = adsByPosition['homepage_banner']?.[0] || null;
  const topAd = adsByPosition['homepage_top']?.[0] || null;
  const bottomAd = adsByPosition['homepage_bottom']?.[0] || null;

  // Show the popup once per browser session.
  useEffect(() => {
    if (!bannerAd || sessionStorage.getItem("homepage-banner-seen")) return;

    sessionStorage.setItem("homepage-banner-seen", "true");
    setShowBannerPopup(true);
  }, [bannerAd]);

  // Auto-close countdown
  useEffect(() => {
    if (!showBannerPopup) return;

    const timer = setTimeout(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          setShowBannerPopup(false);
          setCloseCountdown(5);
          return 5;
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
    setCloseCountdown(5);
  };

  return (
    <div className="">
      {/* Homepage Banner Popup */}
      {bannerAd && showBannerPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Advertisement"
            className="relative w-full max-w-2xl"
          >
            <button
              onClick={handleClosePopup}
              aria-label="Close advertisement"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/75 text-white shadow-lg transition hover:bg-slate-950"
            >
              <X size={18} />
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
                className="max-h-[72vh] w-full object-contain"
              />
            </Link>
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-medium text-white">
              Ad closes in {closeCountdown}
            </p>
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
        <div className="w-full">
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

      <PremiumAdSection />
      
      {/* News Section */}
      <section id="news" className="">
        <div className="">
          <NewsSection />
        </div>
      </section>

      {/* Video/Media Section */}
      <section id="video" className="">
        <div className="">
          <VideoSection />
        </div>
      </section>

      {/* Featured Content Section */}
      <section id="featured" className="">
        <FeaturedNewsSection />
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
        <div className="w-full">
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