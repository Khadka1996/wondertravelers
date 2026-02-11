"use client";

import React from "react";
import HeroSection from "./components/Herosection";
import VideoSection from "./components/VideoSection";
import PhotoSection from "./components/PhotoSection";
import BlogSection from "./components/BlogSection";
import ContactSection from "./components/ContactSection";
import DestinationSection from "./components/DestinationSection";

export default function HomePage() {
  return (
    <div className="">
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
      
      {/* Contact Section */}
      <section id="contact" className="">
        <div className="">
          <ContactSection />
        </div>
      </section>
    </div>
  );
}