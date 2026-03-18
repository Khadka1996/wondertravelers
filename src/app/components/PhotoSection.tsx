//src/app/components/PhotoSection.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Heart, Download, X, ShoppingBag, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMultipleAds } from "../../hooks/useAds";

// Types
interface Photo {
  _id?: string;
  id?: number;
  title: string;
  slug: string;
  category: string;
  description?: string;
  watermarkedImage?: {
    url?: string;
    size?: number;
    width?: number;
    height?: number;
  };
  image?: string;
  thumbnail?: {
    url?: string;
    size?: number;
  };
  engagement?: {
    likes?: number;
    downloads?: number;
    views?: number;
  };
  likes?: number;
  downloads?: number;
  featured?: boolean;
  isFeatured?: boolean;
  pricing?: {
    price: number;
    currency?: string;
    license?: string;
  };
  price?: number;
  location?: string;
  date?: string;
  camera?: string;
  metadata?: {
    camera?: string | null;
    lens?: string | null;
    iso?: number | null;
    aperture?: string | null;
    shutterSpeed?: string | null;
    date?: string | null;
    location?: string | null;
  };
}

interface PhotoSectionProps {
  photos?: Photo[];
}



export default function PhotoSection() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [contactInfo, setContactInfo] = useState<{ email?: string; whatsapp?: string } | null>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Fetch ads for photo_top and photo_bottom from backend
  const { adsByPosition } = useMultipleAds(['photo_top', 'photo_bottom']);
  const topAd = adsByPosition['photo_top']?.[0] || null;
  const bottomAd = adsByPosition['photo_bottom']?.[0] || null;

  // Fetch contact info from backend
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/settings/contact');
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data.contact);
        }
      } catch (error) {
        // Silently handle error
      }
    };
    fetchContactInfo();
  }, []);

  // Load liked photos from localStorage on mount
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('likedPhotos');
      if (savedLikes) {
        setLikedPhotos(new Set(JSON.parse(savedLikes)));
      }
    } catch (error) {
      console.error('Failed to load liked photos:', error);
    }
  }, []);

  // Save liked photos to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('likedPhotos', JSON.stringify(Array.from(likedPhotos)));
    } catch (error) {
      console.error('Failed to save liked photos:', error);
    }
  }, [likedPhotos]);

  // Fetch photos from backend - always fresh no cache
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        // Add timestamp to bust cache
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/photos/public?limit=8&t=${timestamp}`, {
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
        
        if (data.success && data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
          console.log(`📸 Fetched ${data.photos.length} photos from API`); // Debug log
          
          // Extract unique categories
          const uniqueCategories = new Set<string>(["All"]);
          data.photos.forEach((photo: Photo) => {
            if (photo.category) uniqueCategories.add(photo.category);
          });
          setCategories(Array.from(uniqueCategories));
        } else {
          console.log('No photos returned from API');
          setPhotos([]);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
    
    // Refetch every 30 seconds to stay updated
    const interval = setInterval(fetchPhotos, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter photos by category (always show maximum 8)
  const filteredPhotos: Photo[] = activeCategory === "All"
    ? photos.slice(0, 8)
    : photos.filter(p => p.category === activeCategory).slice(0, 8);

  // Handle like
  const handleLike = (id: string | number | undefined, e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) return;
    
    const photoId = String(id);
    setAnimatingLike(photoId);
    
    setLikedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
    
    // Record like to backend
    fetch(`/api/photos/public/${id}/like`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Not authenticated - redirect to login
          window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to like photo');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          console.log('Photo liked successfully:', data.likes);
          // Like state is already persisted to localStorage by the useEffect
        }
      })
      .catch(err => {
        console.error('Failed to record like:', err);
        // Revert the like state on error
        setLikedPhotos(prev => {
          const newSet = new Set(prev);
          newSet.delete(photoId);
          return newSet;
        });
      });
    
    setTimeout(() => {
      setAnimatingLike(null);
    }, 500);
  };

  // Format price
  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  // Handle contact admin
  const handleContactAdmin = (photo: Photo): void => {
    if (!contactInfo?.email) {
      alert('Contact email not configured. Please try WhatsApp instead.');
      return;
    }
    
    const recipientEmail = contactInfo.email;
    const photoPrice = formatPrice(getPrice(photo));
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const subject = `Photo Print Purchase Inquiry - ${photo.title}`;
    const emailBody = `Dear Nepal Pictures Team,

I hope this email finds you well. I am writing to express my interest in purchasing a photograph from your collection.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHOTO DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Photo Title:        ${photo.title}
Asking Price:       ${photoPrice}
Category:           ${photo.category || 'General'}
Location:           ${photo.location || 'Nepal'}
Date of Inquiry:    ${currentDate}

${photo.description ? `Description:        ${photo.description}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INQUIRY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I would like to inquire about the following:

1. PRICING & PAYMENT
   • Final selling price
   • Accepted payment methods (bank transfer, card, etc.)
   • Payment terms and conditions
   • Any discounts for bulk purchases

2. DELIVERY & FORMAT
   • Available file formats (JPEG, RAW, TIFF, PNG, etc.)
   • Image resolution and dimensions
   • Delivery timeline
   • Print options and sizes available (if applicable)

3. LICENSING
   • Personal use rights
   • Commercial use rights
   • Editorial use rights
   • Web/social media usage terms
   • Print licensing terms

4. ADDITIONAL INFORMATION
   • Technical specifications (camera, lens, settings)
   • Post-processing information
   • Usage restrictions
   • Watermark removal options

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please provide me with detailed information on the above points. I am very interested in your work and look forward to working with you.

Thank you for your time and attention. I await your response at your earliest convenience.

Best regards,
A Potential Client

---
This inquiry was sent from: Nepal Pictures Photography Store
Store URL: http://localhost:3000
Date & Time: ${new Date().toISOString()}`;

    const mailtoLink = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    setTimeout(() => setShowBuyModal(false), 500);
  };

  // Handle WhatsApp inquiry
  const handleWhatsApp = (photo: Photo): void => {
    if (!contactInfo?.whatsapp) {
      alert('WhatsApp not configured. Please use email instead.');
      return;
    }

    const whatsappNumber = contactInfo.whatsapp;
    const photoPrice = formatPrice(getPrice(photo));
    
    const message = `Hello 👋

I'm interested in purchasing a photo from Nepal Pictures.

*Photo Details:*
📸 Title: ${photo.title}
💰 Price: ${photoPrice}
📁 Category: ${photo.category || 'General'}
${photo.location ? `📍 Location: ${photo.location}` : ''}

*I would like to know about:*
✅ Available payment methods
✅ File formats & resolution
✅ Print options & sizes
✅ Delivery timeline
✅ Licensing terms
✅ Any discounts available

Could you please provide more details? Thank you! 🙏

Sent from Nepal Pictures Store - ${new Date().toLocaleDateString()}`;

    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
    setTimeout(() => setShowBuyModal(false), 500);
  };

  // Handle download watermarked photo
  const handleDownloadPhoto = async (photo: Photo): Promise<void> => {
    try {
      const response = await fetch(
        `/api/photos/${photo._id}/download-watermarked?format=jpeg`,
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 401 || response.status === 403) {
        // Not authenticated - redirect to login
        window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get download link');
      }

      const data = await response.json();

      if (data.success && data.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName || 'photo.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        console.log('Download started:', data.fileName);
      } else {
        throw new Error(data.message || 'Download unavailable');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to download photo. Please try again.');
    }
  };

  // Helper functions
  const getImageUrl = (photo: Photo): string => {
    // Use watermarked image if available, fallback to thumbnail, then fallback to image field
    return photo.watermarkedImage?.url || photo.thumbnail?.url || photo.image || '/photos/placeholder.jpg';
  };

  const getPrice = (photo: Photo): number => {
    return photo.pricing?.price || photo.price || 0;
  };

  const getLikes = (photo: Photo): number => {
    return photo.engagement?.likes || photo.likes || 0;
  };

  const getDownloads = (photo: Photo): number => {
    return photo.engagement?.downloads || photo.downloads || 0;
  };

  const isFeatured = (photo: Photo): boolean => {
    return photo.isFeatured || photo.featured || false;
  };

  return (
    <>
      <section className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {/* Top Advertisement - Only show if ad exists */}
          {topAd && (
            <div className="mb-6 sm:mb-8">
              <Link 
                href={topAd.link || topAd.weblink || "#"}
                target={topAd.link || topAd.weblink ? "_blank" : undefined}
                rel={topAd.link || topAd.weblink ? "noopener noreferrer" : undefined}
                className="block w-full"
              >
                <div className="relative w-full rounded-lg overflow-hidden shadow-sm aspect-[5/1] sm:aspect-[21/4]">
                  <Image
                    src={typeof topAd.image === 'string' ? topAd.image : topAd.image.url}
                    alt={typeof topAd.image === 'string' ? "Advertisement" : topAd.image.alt || "Advertisement"}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Camera size={24} className="text-slate-800 sm:w-7 sm:h-7" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-slate-900">
                Nepal in Pictures
              </h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-2">
              Curated photographs from the Himalayas. Limited edition prints.
            </p>
          </div>

          {/* Categories */}
          <div className="relative mb-6 sm:mb-8">
            <div className="flex items-center gap-1">
              <div
                ref={categoriesScrollRef}
                className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeCategory === category
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading state - Skeleton skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="relative aspect-square overflow-hidden bg-slate-200 rounded-lg sm:rounded-xl mb-3">
                    <div className="w-full h-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Photo Grid - 1 column on mobile, 3 on tablet, 4 on desktop */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3">
              {filteredPhotos.map((photo) => (
                <motion.div
                  key={photo._id || photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative block w-full cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 rounded-lg sm:rounded-xl">
                      <Image
                        src={getImageUrl(photo)}
                        alt={photo.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Price */}
                      <div className="absolute bottom-14 sm:bottom-14 left-2 sm:left-3">
                        <span className="px-2.5 sm:px-2.5 py-1.5 sm:py-1.5 bg-white text-sm sm:text-sm font-bold text-slate-900 rounded shadow-sm">
                          {formatPrice(getPrice(photo))}
                        </span>
                      </div>
                      
                      {/* Title and Likes */}
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm sm:text-sm font-medium text-white line-clamp-1 text-left">
                            {photo.title}
                          </h3>
                          
                          {/* Like button */}
                          <div
                            onClick={(e) => handleLike(photo._id || photo.id, e)}
                            role="button"
                            tabIndex={0}
                            className="flex items-center gap-1 px-2 py-1 sm:px-2 sm:py-1 bg-black/50 backdrop-blur-sm rounded-full relative cursor-pointer hover:bg-black/60 transition-colors"
                          >
                            <Heart 
                              size={13} 
                              className={likedPhotos.has(String(photo._id || photo.id)) ? "fill-red-500 text-red-500" : "text-white"} 
                            />
                            <span className="text-xs sm:text-xs font-medium text-white">
                              {likedPhotos.has(String(photo._id || photo.id)) ? getLikes(photo) + 1 : getLikes(photo)}
                            </span>
                            
                            {/* Like animation */}
                            <AnimatePresence>
                              {animatingLike === String(photo._id || photo.id) && (
                                <motion.div
                                  initial={{ scale: 0.5, opacity: 0.8 }}
                                  animate={{ scale: 1.8, opacity: 0 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.4 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <Heart size={18} className="fill-red-500 text-red-500" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Category tag */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <span className="px-2 py-1 sm:px-2 sm:py-1 bg-black/50 backdrop-blur-sm text-[10px] sm:text-[10px] font-medium text-white/90 rounded-full">
                          {photo.category}
                        </span>
                      </div>

                      {/* Featured tag */}
                      {isFeatured(photo) && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <span className="px-2 py-1 sm:px-2 sm:py-1 bg-amber-500/90 text-[10px] sm:text-[10px] font-medium text-white rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="mt-8 sm:mt-10 text-center">
            <Link
              href="/pictures"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-5 py-2.5 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-sm font-medium rounded-full transition-colors"
            >
              <Camera size={16} className="sm:w-4 sm:h-4" />
              View Full Collection
            </Link>
          </div>

          {/* Bottom Advertisement - Only show if ad exists */}
          {bottomAd && (
            <div className="mt-8 sm:mt-10">
              <Link 
                href={bottomAd.link || bottomAd.weblink || "#"}
                target={bottomAd.link || bottomAd.weblink ? "_blank" : undefined}
                rel={bottomAd.link || bottomAd.weblink ? "noopener noreferrer" : undefined}
                className="block w-full"
              >
                <div className="relative w-full rounded-lg overflow-hidden shadow-sm aspect-[5/1] sm:aspect-[21/4]">
                  <Image
                    src={typeof bottomAd.image === 'string' ? bottomAd.image : bottomAd.image.url}
                    alt={typeof bottomAd.image === 'string' ? "Advertisement" : bottomAd.image.alt || "Advertisement"}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4"
            onClick={() => {
              setSelectedPhoto(null);
              setShowBuyModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl bg-white rounded-lg sm:rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedPhoto(null);
                  setShowBuyModal(false);
                }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 hover:bg-white shadow-sm"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>

              <div className="flex flex-col md:grid md:grid-cols-2 max-h-[90vh] overflow-y-auto md:overflow-hidden">
                {/* Left - Image */}
                <div className="relative aspect-square md:aspect-auto md:h-full bg-slate-900">
                  <Image
                    src={getImageUrl(selectedPhoto)}
                    alt={selectedPhoto.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Right - Details */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col">
                  <div className="flex-1">
                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                      {selectedPhoto.title}
                    </h2>
                    
                    {/* Category and Featured */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                        {selectedPhoto.category}
                      </span>
                      {isFeatured(selectedPhoto) && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {formatPrice(getPrice(selectedPhoto))}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 ml-2">limited edition print</span>
                    </div>

                    {/* Description */}
                    {selectedPhoto.description && (
                      <div className="mb-4 sm:mb-5">
                        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                          Description
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedPhoto.description}
                        </p>
                      </div>
                    )}

                    {/* Photo details - Auto-detected from EXIF or user-provided */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                      {/* Location - from metadata or direct field */}
                      {(selectedPhoto.metadata?.location || selectedPhoto.location) && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Location</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {selectedPhoto.metadata?.location || selectedPhoto.location}
                          </p>
                        </div>
                      )}
                      
                      {/* Date - auto-detected from EXIF */}
                      {selectedPhoto.metadata?.date && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Date Taken</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {new Date(selectedPhoto.metadata.date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {/* Camera - auto-detected from EXIF */}
                      {selectedPhoto.metadata?.camera && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Camera</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.metadata.camera}</p>
                        </div>
                      )}
                      
                      {/* Lens - auto-detected from EXIF */}
                      {selectedPhoto.metadata?.lens && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Lens</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.metadata.lens}</p>
                        </div>
                      )}
                      
                      {/* ISO - auto-detected from EXIF */}
                      {selectedPhoto.metadata?.iso && (
                        <div>
                          <h4 className="text-xs text-slate-500 mb-0.5">ISO</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.metadata.iso}</p>
                        </div>
                      )}
                      
                      {/* Aperture - auto-detected from EXIF */}
                      {selectedPhoto.metadata?.aperture && (
                        <div>
                          <h4 className="text-xs text-slate-500 mb-0.5">Aperture</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.metadata.aperture}</p>
                        </div>
                      )}
                      
                      {/* Shutter Speed - auto-detected from EXIF */}
                      {selectedPhoto.metadata?.shutterSpeed && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Shutter Speed</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.metadata.shutterSpeed}</p>
                        </div>
                      )}

                      {/* Image Size - from watermarked image dimensions */}
                      {selectedPhoto.watermarkedImage?.width && selectedPhoto.watermarkedImage?.height && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Resolution</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {selectedPhoto.watermarkedImage.width} × {selectedPhoto.watermarkedImage.height}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-slate-200">
                      <button
                        onClick={(e) => handleLike(selectedPhoto._id || selectedPhoto.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors relative"
                      >
                        <Heart 
                          size={14} 
                          className={likedPhotos.has(String(selectedPhoto._id || selectedPhoto.id)) ? "fill-red-500 text-red-500" : "text-slate-700"} 
                        />
                        <span className="text-xs sm:text-sm font-medium">
                          {likedPhotos.has(String(selectedPhoto._id || selectedPhoto.id)) ? getLikes(selectedPhoto) + 1 : getLikes(selectedPhoto)}
                        </span>
                        
                        {/* Like animation in modal */}
                        <AnimatePresence>
                          {animatingLike === String(selectedPhoto._id || selectedPhoto.id) && (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0.8 }}
                              animate={{ scale: 1.8, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Heart size={20} className="fill-red-500 text-red-500" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                        <Download size={14} className="text-slate-700" />
                        <span className="text-xs sm:text-sm font-medium">{getDownloads(selectedPhoto)}</span>
                      </div>
                    </div>

                    {/* Download Watermarked Photo Button */}
                    {selectedPhoto._id && (
                      <button
                        onClick={() => handleDownloadPhoto(selectedPhoto)}
                        className="w-full py-2.5 sm:py-3 mb-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors border border-purple-200 text-xs sm:text-sm"
                      >
                        <Download size={14} className="sm:w-4 sm:h-4" />
                        Download Watermarked Photo
                      </button>
                    )}

                    {/* Buy Section */}
                    {!showBuyModal ? (
                      <button
                        onClick={() => setShowBuyModal(true)}
                        className="w-full py-3 sm:py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                      >
                        <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Buy This Print
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1.5">
                          Contact Admin to Purchase
                        </h3>
                        
                        <button
                          onClick={() => handleContactAdmin(selectedPhoto)}
                          className="w-full py-2.5 sm:py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors border border-blue-200 text-xs sm:text-sm"
                        >
                          <Mail size={14} className="sm:w-4 sm:h-4" />
                          Email Inquiry
                        </button>
                        
                        <button
                          onClick={() => handleWhatsApp(selectedPhoto)}
                          className="w-full py-2.5 sm:py-3 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors border border-green-200 text-xs sm:text-sm"
                        >
                          <Phone size={14} className="sm:w-4 sm:h-4" />
                          WhatsApp
                        </button>
                        
                        <button
                          onClick={() => setShowBuyModal(false)}
                          className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          ← Back
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}