//src/app/components/Herosection.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Camera, MapPin, Globe, ChevronDown } from "lucide-react";

const SKY_THEME = {
  primary: "#0284C7",
  secondary: "#38BDF8",
  tertiary: "#7DD3FC",
  light: "#F0F9FF",
  veryLight: "#E0F2FE",
};

const HERO_CONTENT = {
  title: "Discover Nepal's Wonders",
  subtitle: "Stunning travel blogs, professional photos for sale, and insider guides to promote sustainable tourism in the heart of the Himalayas.",
  buttons: [
    {
      id: 1,
      text: "Explore Destinations",
      href: "/explore",
      icon: ArrowRight,
      variant: "primary",
    },
    {
      id: 2,
      text: "Buy Photos",
      href: "/photos",
      icon: Camera,
      variant: "secondary",
    },
    {
      id: 3,
      text: "Read Blogs",
      href: "/blog",
      icon: MapPin,
      variant: "outline",
    }
  ],
  promo: {
    text: "Promoting Nepal Tourism Since 2023",
    icon: Globe,
  },
};

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden px-6 py-20 text-center"
      style={{
        backgroundImage: "url('/hero-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Simple Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/50"></div>

      {/* Minimal Clouds */}
      <div className="absolute top-10 left-5 w-48 h-24 bg-cyan-200/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-5 w-64 h-32 bg-blue-200/10 rounded-full blur-3xl"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <div
          className={`transition-all duration-700 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {HERO_CONTENT.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
            {HERO_CONTENT.subtitle}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {HERO_CONTENT.buttons.map((button) => (
              <Link
                key={button.id}
                href={button.href}
                className={`
                  group flex items-center justify-center gap-2 
                  px-8 py-4 rounded-full font-semibold 
                  transition-all duration-300
                  ${button.variant === 'primary'
                    ? 'text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                    : button.variant === 'secondary'
                    ? 'text-blue-800 bg-white/90 hover:bg-white shadow-md hover:shadow-lg'
                    : 'text-cyan-300 bg-transparent border-2 border-cyan-300 hover:bg-cyan-300/10'
                  }
                `}
              >
                {button.text}
                <button.icon
                  size={20}
                  className={`
                    transition-transform duration-300
                    ${button.variant === 'primary' && 'group-hover:translate-x-1'}
                    ${button.variant === 'secondary' && 'group-hover:rotate-12'}
                    ${button.variant === 'outline' && 'group-hover:scale-110'}
                  `}
                />
              </Link>
            ))}
          </div>

          {/* Simple Promo */}
          <div className="mt-12 flex items-center justify-center gap-2 text-white/80">
            <Globe size={18} />
            <span className="text-sm">{HERO_CONTENT.promo.text}</span>
          </div>
        </div>
      </div>

      {/* Clean Scroll Down */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white hover:text-cyan-300 transition-colors duration-300"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} className="animate-bounce" />
      </button>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
    </section>
  );
}