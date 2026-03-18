'use client';

import { useEffect, useState } from 'react';
import { useParams} from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaChevronLeft, FaShare, FaHeart, FaMapMarkerAlt, FaTrash, FaCopy, FaFacebookF, FaFacebookMessenger, FaTwitter, FaTimes,  FaWhatsapp } from 'react-icons/fa';
import { FaMagnifyingGlass } from "react-icons/fa6";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDesc: string;
  longDesc?: string;
  image: { url: string; width?: number; height?: number };
  gallery?: { url: string }[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestTimeToVisit?: string;
  altitude?: { min: number; max: number };
  difficulty?: string;
  duration?: { min: number; max: number };
}

interface Rating {
  _id: string;
  rating: number;
  review?: string;
  user: { _id: string; name: string; avatar?: string };
  createdAt: string;
}

interface Advertisement {
  _id: string;
  title: string;
  image: { url: string; alt?: string; width?: number; height?: number };
  weblink: string;
  position: string;
  clicks: number;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  destination?: Destination;
  message?: string;
}

export default function DestinationDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const slug = params.slug as string;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ email?: string; whatsapp?: string } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [topAds, setTopAds] = useState<Advertisement[]>([]);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/destinations/public/${slug}?t=${timestamp}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('Destination not found');
          } else {
            throw new Error('Failed to fetch destination');
          }
          setLoading(false);
          return;
        }

        const data: ApiResponse = await response.json();
        if (data.success && data.destination) {
          setDestination(data.destination);
          setSelectedImage(data.destination.image?.url || null);
          console.log(`📍 Loaded destination: ${data.destination.name}`);
        } else {
          setError('Failed to load destination');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDestination();
    }
  }, [slug]);

  // Update Open Graph meta tags for social sharing
  useEffect(() => {
    if (!destination) return;

    // Set OG Meta Tags
    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Open Graph Tags
    setMetaTag('og:title', destination.name);
    setMetaTag('og:description', destination.shortDesc || 'Check out this amazing destination');
    setMetaTag('og:image', destination.image?.url || '');
    setMetaTag('og:url', typeof window !== 'undefined' ? window.location.href : '');
    setMetaTag('og:type', 'website');
    
    // Twitter Card Tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', destination.name);
    setMeta('twitter:description', destination.shortDesc || 'Check out this amazing destination');
    setMeta('twitter:image', destination.image?.url || '');
    
    // Basic Meta Tags
    setMeta('description', destination.shortDesc || 'Check out this amazing destination');
    
    // Update Page Title
    if (typeof window !== 'undefined') {
      document.title = `${destination.name} | Wonder Travelers`;
    }
  }, [destination]);

  // Fetch all ratings
  useEffect(() => {
    const fetchRatings = async () => {
      if (!destination?._id) {
        console.log('⏳ Waiting for destination _id...');
        return;
      }
      try {
        const timestamp = new Date().getTime();
        console.log('🔄 Fetching ratings for destination:', destination._id);
        const response = await fetch(
          `/api/destinations/${destination._id}/ratings?limit=10&t=${timestamp}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Ratings response:', data);
          if (data.success) {
            console.log(`✅ Fetched ${data.ratings?.length || 0} ratings. Total: ${data.total}`);
            setAllRatings(data.ratings || []);
          } else {
            console.warn('⚠️ Ratings fetch returned success: false');
          }
        } else {
          console.error('❌ Ratings fetch failed with status:', response.status);
        }
      } catch (err) {
        console.error('💥 Fetch ratings error:', err);
      }
    };

    fetchRatings();
  }, [destination?._id]);

  // Fetch user's rating if authenticated
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!destination?._id || !isAuthenticated) return;
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/destinations/${destination._id}/my-rating?t=${timestamp}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.rating) {
            setUserRating(data.rating);
            setHoverRating(data.rating.rating);
            setReview(data.rating.review || '');
          }
        }
      } catch (err) {
        console.error('Fetch user rating error:', err);
      }
    };

    fetchUserRating();
  }, [destination?._id, isAuthenticated]);

  // Fetch contact info
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/settings/contact', {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setContactInfo(data.contact);
          }
        }
      } catch (err) {
        console.error('Fetch contact info error:', err);
      }
    };

    fetchContactInfo();
  }, []);

  // Fetch top ads
  useEffect(() => {
    const fetchTopAds = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/advertisements/position/destination_inside?t=${timestamp}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.advertisements) {
            setTopAds(data.advertisements);
            console.log(`📢 Fetched ${data.advertisements.length} top ads`);
          }
        }
      } catch (err) {
        console.error('Fetch top ads error:', err);
      }
    };

    fetchTopAds();
  }, []);

  const handleStarClick = async (starValue: number) => {
    if (!destination?._id || !isAuthenticated || starValue === 0) return;

    setSubmittingRating(true);
    try {
      // Step 1: Submit rating
      const response = await fetch(
        `/api/destinations/${destination._id}/ratings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rating: starValue,
            review: review || undefined
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Rating submission failed:', errorData);
        alert(`Error: ${errorData.message || 'Failed to submit rating'}`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log('✅ Rating submitted:', data.rating);
        setUserRating(data.rating);
        setHoverRating(0);
        setReview(''); // Clear review field after submission
        
        // Step 2: Refresh destination data to get updated reviewCount
        console.log('🔄 Fetching updated destination...');
        const destResponse = await fetch(`/api/destinations/public/${slug}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
        if (destResponse.ok) {
          const destData = await destResponse.json();
          if (destData.success) {
            console.log('✅ Destination updated - New count:', destData.destination.reviewCount, 'Rating:', destData.destination.rating);
            setDestination(destData.destination);
          } else {
            console.error('Destination data returned success: false');
          }
        } else {
          console.error('Destination fetch failed:', destResponse.status);
        }
        
        // Step 3: Refresh all ratings
        console.log('🔄 Fetching all ratings...');
        const ratingsResponse = await fetch(
          `/api/destinations/${destination._id}/ratings?limit=10`,
          { cache: 'no-store' }
        );
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          console.log('✅ All ratings fetched:', ratingsData.ratings?.length || 0, 'Rating count:', ratingsData.total);
          setAllRatings(ratingsData.ratings || []);
        } else {
          console.error('Ratings fetch failed:', ratingsResponse.status);
        }
        
        // Show success message
        alert('🎉 Your rating has been saved! Thank you for your feedback.');
      } else {
        console.error('Rating API returned success: false', data);
        alert('Rating failed: ' + data.message);
      }
    } catch (err) {
      console.error('💥 Star click rating error:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!destination?._id || !userRating?._id) return;

    if (!confirm('Are you sure you want to delete your rating?')) return;

    try {
      const response = await fetch(
        `/api/destinations/${destination._id}/ratings/${userRating._id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setUserRating(null);
        setHoverRating(0);
        setReview('');
        // Refresh destination
        const destResponse = await fetch(`/api/destinations/public/${slug}`);
        if (destResponse.ok) {
          const data = await destResponse.json();
          if (data.success) setDestination(data.destination);
        }
        // Refresh all ratings
        const ratingsResponse = await fetch(
          `/api/destinations/${destination._id}/ratings?limit=10`
        );
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setAllRatings(ratingsData.ratings || []);
        }
        alert('Rating deleted successfully!');
      }
    } catch (err) {
      console.error('Delete rating error:', err);
      alert('Error deleting rating');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/explore/${slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleInquiry = (type: 'email' | 'whatsapp') => {
    if (type === 'email' && contactInfo?.email) {
      window.location.href = `mailto:${contactInfo.email}?subject=Inquiry about ${destination?.name}`;
    } else if (type === 'whatsapp' && contactInfo?.whatsapp) {
      const message = `Hi! I'm interested in ${destination?.name}. Can you provide more information?`;
      window.location.href = `https://wa.me/${contactInfo.whatsapp.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(message)}`;
    }
    setShowInquiryModal(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Image Skeleton */}
            <div className="space-y-4">
              <div className="relative h-96 bg-slate-800 rounded-lg animate-pulse" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
            {/* Right - Content Skeleton */}
            <div className="space-y-4">
              <div className="h-10 bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-slate-800 rounded animate-pulse w-1/2" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{error || 'Destination not found'}</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <FaChevronLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = destination.gallery ? destination.gallery.map(g => g.url) : [];
  const allImages = [destination.image?.url, ...galleryImages].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-sm"
          >
            <FaChevronLeft size={14} />
            Back to Destinations
          </Link>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Images with Zoom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image with Zoom */}
            <div 
              className="relative h-96 bg-linear-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-500/20 group cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomImage(selectedImage)}
              onMouseLeave={() => setZoomImage(null)}
            >
              {selectedImage && (
                <>
                  <Image
                    src={selectedImage}
                    alt={destination.name}
                    fill
                    className={`object-cover transition-transform duration-300 ${
                      zoomImage ? 'scale-150' : 'scale-100'
                    }`}
                    style={
                      zoomImage
                        ? {
                            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                          }
                        : undefined
                    }
                    priority
                  />
                  {zoomImage && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                      <FaMagnifyingGlass size={16} />
                    </div>
                  )}
                </>
              )}
              {destination.featured && (
                <div className="absolute top-4 left-4 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg z-10 flex items-center gap-1">
                  ⭐ Featured
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-cyan-500' : 'border-cyan-500/20 hover:border-cyan-500/40'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${idx}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right - Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/40">
                  {destination.category}
                </span>
                {destination.featured && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/40">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {destination.name}
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                {destination.shortDesc}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <FaStar size={16} className="text-amber-400" />
                  <span className="text-lg font-bold text-white">
                    {destination.rating}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {destination.reviewCount} {destination.reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                  <p className="text-white/60 text-xs">Based on visitor feedback</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  liked
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-slate-800 text-white/80 border border-cyan-500/20 hover:bg-slate-700'
                }`}
              >
                <FaHeart size={14} className={liked ? 'text-current' : ''} />
                {liked ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-white/80 border border-cyan-500/20 hover:bg-slate-700 text-sm font-medium transition-all"
              >
                <FaShare size={14} />
                Share
              </button>
              <button 
                onClick={() => setShowInquiryModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 text-sm font-medium transition-all"
              >
                <FaMapMarkerAlt size={14} />
                Inquiry
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              {destination.bestTimeToVisit && (
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Best Time</p>
                  <p className="text-white text-sm font-medium">{destination.bestTimeToVisit}</p>
                </div>
              )}
              {destination.altitude && (
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Altitude</p>
                  <p className="text-white text-sm font-medium">
                    {destination.altitude.min?.toLocaleString()} - {destination.altitude.max?.toLocaleString()} m
                  </p>
                </div>
              )}
              {destination.difficulty && (
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Difficulty</p>
                  <p className="text-white text-sm font-medium">{destination.difficulty}</p>
                </div>
              )}
              {destination.duration && (
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Duration</p>
                  <p className="text-white text-sm font-medium">
                    {destination.duration.min} - {destination.duration.max} days
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {destination.longDesc && (
              <div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {destination.longDesc}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Advertisements */}
        {topAds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 pb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topAds.map((ad) => (
                <a
                  key={ad._id}
                  href={ad.weblink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-32 rounded-lg overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 transition-all group shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
                >
                  <Image
                    src={ad.image?.url || '/hero-background.jpg'}
                    alt={ad.image?.alt || ad.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent group-hover:from-black/40" />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-cyan-500/90 text-white text-xs font-bold rounded">
                    Sponsored
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h4 className="text-sm font-semibold">{ad.title}</h4>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-linear-to-br from-slate-800 via-slate-800/80 to-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Reviews & Ratings</h3>
                <p className="text-cyan-400/80 text-xs">Help other travelers with your feedback</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-400">
                  {destination.rating}
                </div>
                <div className="text-white/60 text-xs mt-0.5">
                  {destination.reviewCount} {destination.reviewCount === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User Rating Form */}
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-linear-to-br from-slate-700/40 to-slate-800/40 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
              >
                <p className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  {userRating ? '✏️ Update rating' : '⭐ Rate'}
                </p>

                {/* Star Rating */}
                <div className="flex gap-2 mb-3 bg-linear-to-r from-amber-500/10 to-blue-500/10 w-fit px-3 py-2 rounded-lg border border-amber-500/20">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(userRating?.rating || 0)}
                      disabled={submittingRating}
                      className="transition-all hover:scale-110 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Click to rate ${star} stars`}
                    >
                      <FaStar
                        size={28}
                        className={`transition-all ${
                          star <= hoverRating
                            ? 'text-amber-400 drop-shadow-lg'
                            : 'text-white/20 hover:text-white/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Rating Label */}
                {!userRating && hoverRating > 0 && (
                  <p className="text-cyan-300 text-xs mb-2">
                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating - 1]}
                  </p>
                )}

                {/* Review Text Field - Optional */}
                {hoverRating > 0 && (
                  <div className="mb-3">
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience (optional)..."
                      className="w-full px-3 py-2 bg-slate-900/50 border border-cyan-500/20 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
                      rows={2}
                    />
                  </div>
                )}

                {/* Delete Button - Only show if user has rated */}
                {userRating && (
                  <>
                    <div className="mb-2">
                      <p className="text-white/70 text-xs mb-1">Your rating:</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={12}
                            className={`${
                              star <= userRating.rating
                                ? 'text-amber-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteRating}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-xs font-semibold w-full justify-center hover:bg-red-500/30"
                    >
                      <FaTrash size={10} />
                      Delete
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-linear-to-r from-cyan-500/10 to-blue-600/10 rounded-xl border border-cyan-500/30 backdrop-blur-sm"
              >
                <p className="text-white/90 text-sm text-center">
                  <Link href={`/auth/login?redirect=/explore/${slug}`} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Log in
                  </Link>
                  {' '}<span className="text-white/70">to share your experience and rate this destination</span>
                </p>
              </motion.div>
            )}

            {/* All Ratings */}
            <div className="border-t border-cyan-500/20 pt-5">
              <div className="mb-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={16}
                            className={`${
                              star <= Math.round(destination.rating)
                                ? 'text-amber-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-amber-300">{destination.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs mb-1">Based on</p>
                    <p className="text-lg font-bold text-white">{destination.reviewCount} {destination.reviewCount === 1 ? 'review' : 'reviews'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRatings(!showRatings)}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 font-semibold text-sm transition-colors group w-full"
              >
                <span className="text-base group-hover:translate-x-1 transition-transform">
                  {showRatings ? '▼' : '▶'}
                </span>
                <span>
                  All Reviews <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
                    {destination.reviewCount}
                  </span>
                </span>
              </button>

              <AnimatePresence>
                {showRatings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {allRatings.length > 0 ? (
                      allRatings.map((rating, idx) => (
                        <motion.div
                          key={rating._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 bg-linear-to-r from-slate-700/30 to-slate-800/30 border border-white/10 hover:border-cyan-500/20 rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/10 group"
                        >
                          <div className="flex items-start justify-between mb-2 gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-semibold text-sm">{rating.user.name}</p>
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full">
                                  {rating.rating} ⭐
                                </span>
                              </div>
                              <div className="flex gap-0.5 items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    size={10}
                                    className={`${
                                      i < rating.rating
                                        ? 'text-amber-400'
                                        : 'text-white/15'
                                    }`}
                                  />
                                ))}
                                <span className="text-white/50 text-[10px] ml-1">
                                  {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating.rating - 1]}
                                </span>
                              </div>
                            </div>
                            <p className="text-white/40 text-[10px] whitespace-nowrap">
                              {new Date(rating.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {rating.review && (
                            <p className="text-white/70 text-xs leading-relaxed bg-slate-900/30 p-2 rounded-lg border-l-2 border-cyan-500/40 italic">
                              &quot;{rating.review}&quot;
                            </p>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6"
                      >
                        <p className="text-white/60 text-sm">⭐ No reviews yet. Be the first to share your experience!</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Full Description Section */}
        {destination.longDesc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 p-5 bg-linear-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-lg"
          >
            <h3 className="text-xl font-bold text-white mb-3">About {destination.name}</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {destination.longDesc}
            </p>
          </motion.div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-cyan-500/20 rounded-lg p-5 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Share Destination</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-white/60 hover:text-white/90 transition-colors"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
                <p className="text-white/70 text-sm mb-4">Share &quot;<span className="font-semibold">{destination?.name}</span>&quot; with others</p>
                
                {/* Share Options Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                {/* Copy Link */}
                  <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1.5 p-4 bg-linear-to-br from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 rounded-xl border border-cyan-500/40 hover:border-cyan-500/60 transition-all group shadow-lg shadow-cyan-500/10"
                  >
                    <FaCopy size={24} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white text-center">{shareCopied ? '✓ Copied!' : 'Copy Link'}</span>
                  </button>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-4 bg-linear-to-br from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 rounded-xl border border-blue-500/40 hover:border-blue-500/60 transition-all group shadow-lg shadow-blue-500/10"
                  >
                    <FaFacebookF size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white">Facebook</span>
                  </a>

                  {/* Messenger */}
                  <a
                    href={`https://www.facebook.com/dialog/send?app_id=YOUR_APP_ID&link=${typeof window !== 'undefined' ? window.location.href : ''}&redirect_uri=${typeof window !== 'undefined' ? window.location.href : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-4 bg-linear-to-br from-indigo-500/20 to-indigo-600/20 hover:from-indigo-500/30 hover:to-indigo-600/30 rounded-xl border border-indigo-500/40 hover:border-indigo-500/60 transition-all group shadow-lg shadow-indigo-500/10"
                  >
                    <FaFacebookMessenger size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white">Messenger</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this amazing destination: ${destination?.name} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-4 bg-linear-to-br from-green-600/20 to-green-700/20 hover:from-green-600/30 hover:to-green-700/30 rounded-xl border border-green-500/40 hover:border-green-500/60 transition-all group shadow-lg shadow-green-500/10"
                  >
                    <FaWhatsapp size={24} className="text-green-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white">WhatsApp</span>
                  </a>

                  {/* Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}&text=${encodeURIComponent(`Check out ${destination?.name}!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-4 bg-linear-to-br from-sky-500/20 to-sky-600/20 hover:from-sky-500/30 hover:to-sky-600/30 rounded-xl border border-sky-500/40 hover:border-sky-500/60 transition-all group shadow-lg shadow-sky-500/10"
                  >
                    <FaTwitter size={24} className="text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white">Twitter</span>
                  </a>
                </div>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Inquiry Modal */}
        <AnimatePresence>
          {showInquiryModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-cyan-500/20 rounded-lg p-5 max-w-sm w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Send Inquiry</h3>
                  <button
                    onClick={() => setShowInquiryModal(false)}
                    className="text-white/60 hover:text-white/90 transition-colors"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>
                <p className="text-white/70 text-sm mb-4">Get in touch with us about {destination?.name}</p>
                
                <div className="space-y-2">
                  {/* WhatsApp */}
                  {contactInfo?.whatsapp && (
                    <button
                      onClick={() => handleInquiry('whatsapp')}
                      className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <span>💬</span> WhatsApp Us
                    </button>
                  )}

                  {/* Email */}
                  {contactInfo?.email && (
                    <button
                      onClick={() => handleInquiry('email')}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <span>✉️</span> Email Us
                    </button>
                  )}

                  {!contactInfo?.email && !contactInfo?.whatsapp && (
                    <p className="text-white/60 text-sm text-center py-3">Contact information not available</p>
                  )}
                </div>

                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="w-full mt-3 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-medium"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}