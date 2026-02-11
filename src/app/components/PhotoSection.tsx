"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, ZoomIn, Download, Heart, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Your photo gallery data - only first 8 will be shown
const PHOTO_GALLERY = [
  {
    id: 1,
    title: "Everest Sunrise",
    category: "Mountains",
    description: "Sunrise over Mount Everest with golden light touching the peak.",
    image: "/photos/everest-sunrise.jpg",
    likes: 1245,
    downloads: 892,
    featured: true
  },
  {
    id: 2,
    title: "Pokhara Lakeside",
    category: "Lakes",
    description: "Calm waters of Phewa Lake reflecting Annapurna range at dawn.",
    image: "/photos/pokhara-lake.jpg",
    likes: 987,
    downloads: 654,
    featured: true
  },
  {
    id: 3,
    title: "Kathmandu Durbar Square",
    category: "Heritage",
    description: "Historic Durbar Square with ancient temples and palaces.",
    image: "/photos/durbar-square.jpg",
    likes: 876,
    downloads: 543,
    featured: true
  },
  {
    id: 4,
    title: "Annapurna Range",
    category: "Mountains",
    description: "Panoramic view of Annapurna massif from Poon Hill.",
    image: "/photos/annapurna-range.jpg",
    likes: 1123,
    downloads: 789,
    featured: false
  },
  {
    id: 5,
    title: "Chitwan Wildlife",
    category: "Wildlife",
    description: "One-horned rhinoceros in Chitwan National Park.",
    image: "/photos/chitwan-rhino.jpg",
    likes: 765,
    downloads: 432,
    featured: false
  },
  {
    id: 6,
    title: "Bhaktapur Temples",
    category: "Heritage",
    description: "Nyatapola Temple in ancient Bhaktapur city.",
    image: "/photos/bhaktapur-temple.jpg",
    likes: 654,
    downloads: 321,
    featured: false
  },
  {
    id: 7,
    title: "Rara Lake",
    category: "Lakes",
    description: "Pristine blue waters of Rara Lake surrounded by forests.",
    image: "/photos/rara-lake.jpg",
    likes: 543,
    downloads: 210,
    featured: false
  },
  {
    id: 8,
    title: "Langtang Valley",
    category: "Mountains",
    description: "Serene trekking views in Langtang National Park.",
    image: "/photos/langtang-valley.jpg",
    likes: 432,
    downloads: 198,
    featured: false
  },
  // more photos can be added here, but only first 8 are used
];

// Categories - show only first 5 visible, rest scrollable
const ALL_CATEGORIES = [
  "All", "Mountains", "Lakes", "Heritage", "Wildlife",
  "Culture", "Adventure", "Sunrise", "Trekking", "Festivals", "Villages"
];

const VISIBLE_CATEGORIES = ALL_CATEGORIES.slice(0, 5);
const SCROLLABLE_CATEGORIES = ALL_CATEGORIES.slice(5);

export default function PhotoSection() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedPhotos, setLikedPhotos] = useState<number[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Always show maximum 8 photos
  const displayedPhotos = PHOTO_GALLERY.slice(0, 8);

  const filteredPhotos = activeCategory === "All"
    ? displayedPhotos
    : displayedPhotos.filter(photo => photo.category === activeCategory);

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleDownload = (photoId: number, photoUrl: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(photoId);
    setDownloadSuccess(null);

    // Short delay for nice animation feel
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = photoUrl;
      link.download = photoUrl.split("/").pop() || `nepal-photo-${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadingId(null);
      setDownloadSuccess(photoId);

      // Success message disappears after 2.5 seconds
      setTimeout(() => setDownloadSuccess(null), 2500);
    }, 900);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhoto(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -140, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 140, behavior: "smooth" });
  };

  const needsScroll = SCROLLABLE_CATEGORIES.length > 0;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center shadow-lg">
              <Camera size={32} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--primary)] dark:text-[var(--secondary)] tracking-tight">
              Nepal in Pictures
            </h2>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-900 max-w-3xl mx-auto">
            Professional captures from the heart of the Himalayas.
          </p>
        </div>

        {/* Category Slider - only 5 visible + scroll for more */}
        <div className="relative mb-12">
          <div className="flex items-center gap-3 md:gap-4">
            {needsScroll && (
              <button
                onClick={scrollLeft}
                className="hidden sm:flex p-3 rounded-full bg-slate-100 dark:bg-[#0E4A6D] hover:bg-slate-200 dark:hover:bg-[#1F9EDD] transition-colors shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div
              ref={scrollRef}
              className={`flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide ${
                needsScroll ? "max-w-[calc(100%-100px)]" : "justify-center mx-auto"
              }`}
            >
              {VISIBLE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 snap-start border ${
                    activeCategory === category
                      ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md"
                      : "bg-slate-100 dark:bg-[#0E4A6D] text-[#1F9EDD] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1F9EDD] border-slate-200 dark:border-[#1F9EDD]"
                  }`}
                >
                  {category}
                </button>
              ))}

              {SCROLLABLE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 snap-start border ${
                    activeCategory === category
                      ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md"
                      : "bg-slate-100 dark:bg-[#0E4A6D] text-[#1F9EDD] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1F9EDD] border-slate-200 dark:border-[#1F9EDD]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {needsScroll && (
              <button
                onClick={scrollRight}
                className="hidden sm:flex p-3 rounded-full bg-slate-100 dark:bg-[#0E4A6D] hover:bg-slate-200 dark:hover:bg-[#1F9EDD] transition-colors shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Photo Grid - max 8 photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredPhotos.map((photo, i) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden bg-white dark:bg-[#0D2B45] border border-slate-200 dark:border-[#0E4A6D] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedPhoto(photo.id)}
            >
              <div className="aspect-[4/3.2] relative">
                <Image
                  src={photo.image}
                  alt={photo.title}
                  fill
                  className="object-cover transition-all duration-200 group-hover:scale-[1.02] group-hover:brightness-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ZoomIn size={40} className="text-white drop-shadow-lg" />
                </div>

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-3 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                    {photo.category}
                  </span>
                  {photo.featured && (
                    <span className="px-3 py-1 bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)] text-white text-xs rounded-full backdrop-blur-sm">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                  <button
                    onClick={(e) => handleLike(photo.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-red-400 transition-colors"
                  >
                    <Heart
                      size={18}
                      className={likedPhotos.includes(photo.id) ? "fill-red-500 text-red-500" : ""}
                    />
                    <span className="text-sm">
                      {likedPhotos.includes(photo.id) ? photo.likes + 1 : photo.likes}
                    </span>
                  </button>

                  <button
                    onClick={(e) => handleDownload(photo.id, photo.image, e)}
                    disabled={downloadingId !== null}
                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors ${
                      downloadingId === photo.id ? "cursor-wait" : "hover:text-cyan-300"
                    }`}
                  >
                    {downloadingId === photo.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : downloadSuccess === photo.id ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <Download size={18} />
                    )}
                    <span className="text-sm">
                      {downloadSuccess === photo.id ? "Done" : photo.downloads}
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">
                  {photo.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {photo.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Explore More */}
        <div className="mt-16 text-center">
          <Link
            href="/photos"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Camera size={20} />
            Explore Full Gallery
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-hidden">
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 rounded-2xl">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="sticky top-4 right-4 z-10 ml-auto block p-3 bg-slate-900/80 hover:bg-[#0E4A6D] text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-6 pt-2">
                <h3 className="text-3xl font-bold text-white mb-3 text-center">
                  {PHOTO_GALLERY.find(p => p.id === selectedPhoto)?.title}
                </h3>
                <p className="text-slate-300 text-center mb-6">
                  {PHOTO_GALLERY.find(p => p.id === selectedPhoto)?.description}
                </p>

                <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] mb-8">
                  <Image
                    src={PHOTO_GALLERY.find(p => p.id === selectedPhoto)?.image || ""}
                    alt={PHOTO_GALLERY.find(p => p.id === selectedPhoto)?.title || ""}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/photos"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-xl hover:brightness-110 transition-all"
                  >
                    <Camera size={20} />
                    Browse Full Gallery
                  </Link>

                  <button
                    onClick={() => {
                      const photo = PHOTO_GALLERY.find(p => p.id === selectedPhoto);
                      if (photo) handleDownload(photo.id, photo.image);
                    }}
                    disabled={downloadingId !== null}
                    className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all ${
                      downloadingId
                        ? "bg-[#1F9EDD] text-slate-400 cursor-wait"
                        : downloadSuccess === selectedPhoto
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-transparent border-2 border-[var(--secondary)] text-white hover:bg-[var(--secondary)/15]"
                    }`}
                  >
                    {downloadingId ? (
                      <>
                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : downloadSuccess === selectedPhoto ? (
                      <>✓ Downloaded!</>
                    ) : (
                      <>
                        <Download size={20} />
                        Download This Photo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Styles */}
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </section>
  );
}