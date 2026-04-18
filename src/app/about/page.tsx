'use client';

import React from 'react';
import Image from 'next/image';
import { Camera, Globe, Heart, MapPin, Film, Zap, Check, BarChart3, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function AboutPage() {
  const stats = [
    { label: 'Destinations', value: '50+' },
    { label: 'Photos', value: '200+' },
    { label: 'Documentaries', value: '20+' },
    { label: 'Blog Posts', value: '100+' }
  ];

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Professional Photography',
      description: 'Browse 200+ high-quality images showcasing Nepal\'s stunning landscapes, culture, and hidden gems'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Explore 50+ Destinations',
      description: 'Discover detailed guides, travel tips, and local insights for 50+ amazing destinations across Nepal'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Travel Blogs & Stories',
      description: 'Read authentic travel experiences and comprehensive guides about exploring Nepal responsibly'
    },
    {
      icon: <Film className="w-6 h-6" />,
      title: '20+ Documentaries',
      description: 'Watch professional documentaries about tourism, culture, nature, and videography in Nepal'
    }
  ];

  const values = [
    {
      title: 'Authenticity',
      description: 'Genuine travel experiences and real stories from Nepal'
    },
    {
      title: 'Quality',
      description: 'Professional photography and high-quality content'
    },
    {
      title: 'Sustainability',
      description: 'Promoting responsible tourism and community support'
    },
    {
      title: 'Accessibility',
      description: 'Making travel information available to everyone'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb items={[{ label: 'About', current: true }]} />

      {/* Hero Section with Background Image */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/photos/bg-image.jpg"
            alt="Nepal landscape background"
            fill
            className="object-cover"
            priority
            quality={75}
            sizes="100vw"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Discover Nepal&apos;s Beauty Through Our Lens
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Your ultimate platform for professional photography, travel guides, documentaries, and news about Nepal's most stunning destinations and tourism experiences.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-6 sm:py-8 bg-slate-50 mt-8 sm:mt-12 md:mt-16"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center p-4 sm:p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-2xl sm:text-3xl font-bold text-cyan-600 mb-1">{stat.value}</div>
                <div className="text-slate-600 font-medium text-xs sm:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Mission & Vision Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Our Mission & Vision
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Dedicated to showcasing Nepal&apos;s natural beauty and promoting sustainable tourism
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 gap-6 sm:gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="p-6 sm:p-7 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Mission</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                To inspire travelers and photography enthusiasts by providing professional photography, authentic travel guides, documentaries, and news about Nepal's most beautiful destinations. We empower tourists to explore responsibly while supporting local communities and sustainable tourism growth.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 sm:p-7 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Vision</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                To be Nepal&apos;s leading platform for travel inspiration and tourism information. We envision empowering countless travelers to discover Nepal&apos;s incredible destinations through stunning photography, engaging documentaries, and comprehensive travel content.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              What We Offer
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Everything you need to explore and understand Nepal&apos;s incredible destinations
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-5 sm:p-6 bg-white rounded-lg shadow-sm hover:shadow-lg hover:border-cyan-200 transition-all border border-slate-200"
              >
                <div className="inline-flex p-2.5 bg-cyan-100 rounded-lg text-cyan-600 mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Our Core Values
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              What drives everything we do
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 gap-5"
          >
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex gap-3 p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg hover:from-slate-100 hover:to-slate-150 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-cyan-600 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">{value.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CEO Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Meet Our Founder
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="mb-5 relative w-32 h-32 mx-auto">
              <Image
                src="/subash_thapa.jpg"
                alt="Subash Thapa"
                fill
                className="rounded-full object-cover shadow-lg"
                quality={80}
                sizes="128px"
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Subash Thapa</h3>
            <p className="text-cyan-600 font-medium mb-4 text-base">Founder & CEO</p>
            <p className="text-slate-700 leading-relaxed mb-6 text-sm">
              Digital entrepreneur and photography enthusiast passionate about showcasing Nepal's natural beauty and cultural heritage to the world.
            </p>
            
            <div className="flex justify-center gap-3 items-center">
              <a
                href="https://www.facebook.com/share/17gYmw6MMW/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/wond_ertravelers?igsh=MXFsaTg2bGdqZDh0Ng=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-pink-100 rounded-lg text-pink-600 hover:bg-pink-200 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@wonder.travelers?_r=1&_t=ZS-94nNvCFf8St"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-100 rounded-lg text-slate-900 hover:bg-slate-200 transition-colors"
                title="TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.4 2.4 0 1 1-2.4-2.4c.34 0 .67.04 1 .11V9.41a6.75 6.75 0 1 0 5.85 6.59V8.07a8.55 8.55 0 0 0 5.78 2.25v-3.6a4.83 4.83 0 0 1-.78-.07z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@WonderTravelers"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Advertising Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-8 sm:py-12 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Advertising Opportunities
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Partner with us to reach travelers and photography enthusiasts
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="p-6 sm:p-7 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-cyan-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Why Advertise With Us</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Reach engaged travelers and photography enthusiasts</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Strategic ad placements across photos, destinations, and blogs</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Promote tourism services, hospitality, and travel products</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span>Transparent analytics and growth tracking</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 sm:p-7 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-amber-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Our Ad Placements</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Photo Gallery Sidebars & Top/Bottom positions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Destination Explore page sidebars</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Blog post integrations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Custom partnership opportunities</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            className="text-center mt-8"
          >
            <p className="text-slate-600 text-sm sm:text-base mb-4">
              Interested in advertising with Nepal Pictures?
            </p>
            <a
              href="mailto:admin@nepalpictures.com?subject=Advertising Partnership Inquiry"
              className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Us for Advertising
            </a>
          </motion.div>
        </div>
      </motion.section>

    </div>
  );
}
