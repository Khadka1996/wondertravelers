//src/app/components/PhotoSection.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Heart, Download, X, ChevronLeft, ChevronRight, ShoppingBag, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Photo {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  likes: number;
  downloads: number;
  featured: boolean;
  price: number;
  location?: string;
  date?: string;
  camera?: string;
}

// Top Advertisement
const TOP_AD = {
  image: "/photos/two.gif",
  link: "https://www.photostorenepal.com",
  position: "photo_top"
};

// Bottom Advertisement
const BOTTOM_AD = {
  image: "/photos/two.gif",
  link: "https://www.photostorenepal.com",
  position: "photo_bottom"
};

// Your photo gallery data - only first 8 shown
const PHOTO_GALLERY: Photo[] = [
  {
    id: 1,
    title: "Everest Sunrise",
    slug: "everest-sunrise",
    category: "Mountains",
    description: "Golden light touches the world's highest peak. Captured from Kala Patthar at 5,545m.",
    image: "/photos/everest-sunrise.jpg",
    likes: 1245,
    downloads: 892,
    featured: true,
    price: 2999,
    location: "Kala Patthar, Everest Region",
    date: "November 2024",
    camera: "Sony A7R IV, 70-200mm"
  },
  {
    id: 2,
    title: "Pokhara Lakeside",
    slug: "pokhara-lakeside",
    category: "Lakes",
    description: "Annapurna reflected in calm morning waters at Phewa Lake.",
    image: "/photos/pokhara-lake.jpg",
    likes: 987,
    downloads: 654,
    featured: true,
    price: 2499,
    location: "Phewa Lake, Pokhara",
    date: "October 2024",
    camera: "Canon R5, 24-70mm"
  },
  {
    id: 3,
    title: "Kathmandu Durbar Square",
    slug: "kathmandu-durbar-square",
    category: "Heritage",
    description: "Ancient temples in the heart of Kathmandu. UNESCO World Heritage Site.",
    image: "/photos/durbar-square.jpg",
    likes: 876,
    downloads: 543,
    featured: true,
    price: 1999,
    location: "Durbar Square, Kathmandu",
    date: "September 2024",
    camera: "Fujifilm X-T4, 16-55mm"
  },
  {
    id: 4,
    title: "Annapurna Range",
    slug: "annapurna-range",
    category: "Mountains",
    description: "Panoramic view from Poon Hill at dawn. Annapurna South and Machhapuchhre.",
    image: "/photos/annapurna-range.jpg",
    likes: 1123,
    downloads: 789,
    featured: false,
    price: 2799,
    location: "Poon Hill, Annapurna Region",
    date: "October 2024",
    camera: "Nikon Z7, 14-24mm"
  },
  {
    id: 5,
    title: "Chitwan Rhino",
    slug: "chitwan-rhino",
    category: "Wildlife",
    description: "One-horned rhinoceros in tall grass. Chitwan National Park.",
    image: "/photos/chitwan-rhino.jpg",
    likes: 765,
    downloads: 432,
    featured: false,
    price: 2299,
    location: "Chitwan National Park",
    date: "March 2024",
    camera: "Sony A1, 200-600mm"
  },
  {
    id: 6,
    title: "Bhaktapur Temple",
    slug: "bhaktapur-temple",
    category: "Heritage",
    description: "Nyatapola, Nepal's tallest pagoda. Built in 1702.",
    image: "/photos/bhaktapur-temple.jpg",
    likes: 654,
    downloads: 321,
    featured: false,
    price: 1899,
    location: "Bhaktapur Durbar Square",
    date: "August 2024",
    camera: "Leica Q2"
  },
  {
    id: 7,
    title: "Rara Lake",
    slug: "rara-lake",
    category: "Lakes",
    description: "Nepal's largest lake in the far west. Pristine blue waters at 2,990m.",
    image: "/photos/rara-lake.jpg",
    likes: 543,
    downloads: 210,
    featured: false,
    price: 2199,
    location: "Rara National Park",
    date: "June 2024",
    camera: "Canon R6, 15-35mm"
  },
  {
    id: 8,
    title: "Langtang Valley",
    slug: "langtang-valley",
    category: "Mountains",
    description: "Serene valley near the Tibetan border. Langtang Lirung in background.",
    image: "/photos/langtang-valley.jpg",
    likes: 432,
    downloads: 198,
    featured: false,
    price: 2399,
    location: "Langtang National Park",
    date: "May 2024",
    camera: "Fujifilm GFX 50S"
  }
];

// All categories
const ALL_CATEGORIES: string[] = [
  "All", "Mountains", "Lakes", "Heritage", "Wildlife",
  "Culture", "Adventure", "Sunrise", "Trekking", "Festivals"
];

export default function PhotoSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [likedPhotos, setLikedPhotos] = useState<number[]>([]);
  const [animatingLike, setAnimatingLike] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Always show maximum 8 photos
  const displayedPhotos: Photo[] = PHOTO_GALLERY.slice(0, 8);
  
  const filteredPhotos: Photo[] = activeCategory === "All"
    ? displayedPhotos
    : displayedPhotos.filter(photo => photo.category === activeCategory);

  // Handle like
  const handleLike = (id: number, e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    setAnimatingLike(id);
    
    setLikedPhotos(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
    
    setTimeout(() => {
      setAnimatingLike(null);
    }, 500);
  };

  // Scroll categories
  const scrollLeft = (): void => {
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = (): void => {
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const needsScroll: boolean = ALL_CATEGORIES.length > 5;

  // Format price
  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString('en-US')}`;
  };

  // Handle contact admin
  const handleContactAdmin = (photo: Photo): void => {
    const message = `I'm interested in purchasing "${photo.title}" (${formatPrice(photo.price)}). Please provide payment details.`;
    window.location.href = `mailto:admin@nepalpictures.com?subject=Buy Print: ${photo.title}&body=${encodeURIComponent(message)}`;
    setShowBuyModal(false);
  };

  // Handle WhatsApp inquiry
  const handleWhatsApp = (photo: Photo): void => {
    const message = `Hello, I'm interested in purchasing "${photo.title}" (${formatPrice(photo.price)}). Please provide payment details.`;
    window.open(`https://wa.me/9779812345678?text=${encodeURIComponent(message)}`, '_blank');
    setShowBuyModal(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatingLike(null);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <section className="py-8 sm:py-10 px-3 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Top Advertisement */}
          <div className="mb-6 sm:mb-8">
            <Link 
              href={TOP_AD.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-sm aspect-[5/1] sm:aspect-[21/4]">
                <Image
                  src={TOP_AD.image}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>
          </div>

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
              {needsScroll && (
                <button
                  onClick={scrollLeft}
                  className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}

              <div
                ref={categoriesScrollRef}
                className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {ALL_CATEGORIES.map((category) => (
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

              {needsScroll && (
                <button
                  onClick={scrollRight}
                  className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ✅ Photo Grid - 1 column on mobile, 3 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3">
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative block w-full"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100 rounded-lg sm:rounded-xl">
                    <Image
                      src={photo.image}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Price */}
                    <div className="absolute bottom-14 sm:bottom-14 left-2 sm:left-3">
                      <span className="px-2.5 sm:px-2.5 py-1.5 sm:py-1.5 bg-white text-sm sm:text-sm font-bold text-slate-900 rounded shadow-sm">
                        {formatPrice(photo.price)}
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
                          onClick={(e) => handleLike(photo.id, e)}
                          role="button"
                          tabIndex={0}
                          className="flex items-center gap-1 px-2 py-1 sm:px-2 sm:py-1 bg-black/50 backdrop-blur-sm rounded-full relative cursor-pointer hover:bg-black/60 transition-colors"
                        >
                          <Heart 
                            size={13} 
                            className={likedPhotos.includes(photo.id) ? "fill-red-500 text-red-500" : "text-white"} 
                          />
                          <span className="text-xs sm:text-xs font-medium text-white">
                            {likedPhotos.includes(photo.id) ? photo.likes + 1 : photo.likes}
                          </span>
                          
                          {/* Like animation */}
                          <AnimatePresence>
                            {animatingLike === photo.id && (
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
                    {photo.featured && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <span className="px-2 py-1 sm:px-2 sm:py-1 bg-amber-500/90 text-[10px] sm:text-[10px] font-medium text-white rounded-full">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

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

          {/* ✅ Bottom Advertisement - Similar to top */}
          <div className="mt-8 sm:mt-10">
            <Link 
              href={BOTTOM_AD.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-sm aspect-[5/1] sm:aspect-[21/4]">
                <Image
                  src={BOTTOM_AD.image}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          </div>
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
                    src={selectedPhoto.image}
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
                      {selectedPhoto.featured && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {formatPrice(selectedPhoto.price)}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 ml-2">limited edition print</span>
                    </div>

                    {/* Description */}
                    <div className="mb-4 sm:mb-5">
                      <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                        Description
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {selectedPhoto.description}
                      </p>
                    </div>

                    {/* Photo details */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                      {selectedPhoto.location && (
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-xs text-slate-500 mb-0.5">Location</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.location}</p>
                        </div>
                      )}
                      {selectedPhoto.date && (
                        <div>
                          <h4 className="text-xs text-slate-500 mb-0.5">Date</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.date}</p>
                        </div>
                      )}
                      {selectedPhoto.camera && (
                        <div className="col-span-2">
                          <h4 className="text-xs text-slate-500 mb-0.5">Camera</h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">{selectedPhoto.camera}</p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-slate-200">
                      <button
                        onClick={(e) => handleLike(selectedPhoto.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors relative"
                      >
                        <Heart 
                          size={14} 
                          className={likedPhotos.includes(selectedPhoto.id) ? "fill-red-500 text-red-500" : "text-slate-700"} 
                        />
                        <span className="text-xs sm:text-sm font-medium">
                          {likedPhotos.includes(selectedPhoto.id) ? selectedPhoto.likes + 1 : selectedPhoto.likes}
                        </span>
                        
                        {/* Like animation in modal */}
                        <AnimatePresence>
                          {animatingLike === selectedPhoto.id && (
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
                        <span className="text-xs sm:text-sm font-medium">{selectedPhoto.downloads}</span>
                      </div>
                    </div>

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