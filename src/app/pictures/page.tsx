"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMultipleAds } from "../../hooks/useAds";
import { 
  Heart, 
  Download, 
  ShoppingBag, 
  Mail, 
  Phone, 
  X, 
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Photo {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  watermarkedImage?: { url: string; width?: number; height?: number };
  thumbnail?: { url: string };
  image?: string;
  pricing?: { price: number };
  price?: number;
  likes?: number;
  downloads?: number;
  views?: number;
  engagement?: { likes: number; downloads: number; views: number };
  isFeatured?: boolean;
  featured?: boolean;
  metadata?: Record<string, any>;
  location?: string;
}

interface ApiResponse {
  success: boolean;
  photos: Photo[];
  total: number;
  count: number;
  hasMore: boolean;
}

const PHOTOS_PER_PAGE = 16;

export default function PicturesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [contactInfo, setContactInfo] = useState<{ email?: string; whatsapp?: string } | null>(null);

  // Fetch ads for pictures page
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

  // Load likes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("likedPhotos");
    try {
      const parsed = saved ? JSON.parse(saved) : {};
      setLikedPhotos(new Set(parsed));
    } catch {
      setLikedPhotos(new Set());
    }
  }, []);

  // Save likes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("likedPhotos", JSON.stringify(Array.from(likedPhotos)));
  }, [likedPhotos]);

  // Fetch photos from backend
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const skip = (currentPage - 1) * PHOTOS_PER_PAGE;
        
        let url = `/api/photos/public?limit=${PHOTOS_PER_PAGE}&skip=${skip}&t=${timestamp}`;
        if (activeCategory !== "All") {
          url += `&category=${encodeURIComponent(activeCategory)}`;
        }

        const res = await fetch(url, {
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

        const data: ApiResponse = await res.json();

        if (data.success && data.photos) {
          setPhotos(data.photos);
          setTotalPhotos(data.total);
          console.log(`📸 Fetched ${data.photos.length} pictures from API`);

          // Extract unique categories
          if (currentPage === 1) {
            const uniqueCategories = new Set<string>(["All"]);
            data.photos.forEach((photo: Photo) => {
              if (photo.category) uniqueCategories.add(photo.category);
            });
            setCategories(Array.from(uniqueCategories));
          }
        } else {
          setPhotos([]);
          setTotalPhotos(0);
        }
      } catch (error) {
        console.error('Failed to fetch pictures:', error);
        setPhotos([]);
        setTotalPhotos(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [currentPage, activeCategory]);

  // Helper functions
  const getImageUrl = (photo: Photo): string => {
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

  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

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
          window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        if (!res.ok) throw new Error('Failed to like photo');
        return res.json();
      })
      .catch(err => {
        console.error('Failed to record like:', err);
        setLikedPhotos(prev => {
          const newSet = new Set(prev);
          newSet.delete(photoId);
          return newSet;
        });
      });

    setTimeout(() => setAnimatingLike(null), 500);
  };

  // Handle download
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
        window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get download link');
      }

      const data = await response.json();

      if (data.success && data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName || 'photo.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Download started:', data.fileName);
      } else {
        throw new Error(data.message || 'Download unavailable');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to download photo. Please try again.');
    }
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

  // Handle WhatsApp
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

  const totalPages = Math.ceil(totalPhotos / PHOTOS_PER_PAGE);

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPhoto(null);
        setShowBuyModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <section className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-sm">
              <Camera size={28} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Picture Collection
            </h1>
          </div>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our complete collection of stunning photographs from the Himalayas. 
            Limited edition prints available.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Top Advertisement - Only show if ad exists */}
        {topAd && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Link
              href={topAd.link || topAd.weblink || "#"}
              target={topAd.link || topAd.weblink ? "_blank" : undefined}
              rel={topAd.link || topAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-md aspect-[5/1] sm:aspect-[21/4]">
                <Image
                  src={typeof topAd.image === 'string' ? topAd.image : topAd.image.url}
                  alt={typeof topAd.image === 'string' ? "Advertisement" : topAd.image.alt || "Advertisement"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
          </motion.div>
        )}

        {/* Loading - Skeleton Loader */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {[...Array(16)].map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="relative aspect-square overflow-hidden bg-slate-200 rounded-lg mb-3">
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

        {/* Photo Grid - 4 columns */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <motion.div
                  key={photo._id || photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative block w-full cursor-pointer rounded-lg overflow-hidden"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 rounded-lg">
                      <Image
                        src={getImageUrl(photo)}
                        alt={photo.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Price */}
                      <div className="absolute bottom-14 left-3">
                        <span className="px-3 py-2 bg-white text-sm font-bold text-slate-900 rounded shadow-sm">
                          {formatPrice(getPrice(photo))}
                        </span>
                      </div>

                      {/* Title and Likes */}
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-white line-clamp-1 flex-1">
                          {photo.title}
                        </h3>

                        {/* Like button */}
                        <div
                          onClick={(e) => handleLike(photo._id || photo.id, e)}
                          role="button"
                          tabIndex={0}
                          className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full cursor-pointer hover:bg-black/60 transition-colors relative flex-shrink-0"
                        >
                          <Heart
                            size={13}
                            className={likedPhotos.has(String(photo._id || photo.id)) ? "fill-red-500 text-red-500" : "text-white"}
                          />
                          <span className="text-xs font-medium text-white">
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

                      {/* Category tag */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/90 rounded-full">
                          {photo.category}
                        </span>
                      </div>

                      {/* Featured tag */}
                      {isFeatured(photo) && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-amber-500/90 text-[10px] font-medium text-white rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                    <Camera size={28} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">No pictures available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && photos.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage && i > 0 && i < totalPages - 1) {
                  if (i === 1 || i === totalPages - 2) {
                    return (
                      <span key={`ellipsis-${i}`} className="px-2 text-slate-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-10 h-10 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-slate-900 text-white font-medium"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Bottom Advertisement - Only show if ad exists */}
        {bottomAd && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Link
              href={bottomAd.link || bottomAd.weblink || "#"}
              target={bottomAd.link || bottomAd.weblink ? "_blank" : undefined}
              rel={bottomAd.link || bottomAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-md aspect-[5/1] sm:aspect-[21/4]">
                <Image
                  src={typeof bottomAd.image === 'string' ? bottomAd.image : bottomAd.image.url}
                  alt={typeof bottomAd.image === 'string' ? "Advertisement" : bottomAd.image.alt || "Advertisement"}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          </motion.div>
        )}

      </div>

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

                    {/* Photo Details */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                      {(selectedPhoto.metadata?.location || selectedPhoto.location) && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Location</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {selectedPhoto.metadata?.location || selectedPhoto.location}
                          </p>
                        </div>
                      )}
                      {selectedPhoto.metadata?.date && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Date Taken</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {new Date(selectedPhoto.metadata.date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {selectedPhoto.metadata?.camera && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Camera</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.metadata.camera}</p>
                        </div>
                      )}
                      {selectedPhoto.metadata?.lens && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Lens</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.metadata.lens}</p>
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

                    {/* Download Button */}
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
    </section>
  );
}
