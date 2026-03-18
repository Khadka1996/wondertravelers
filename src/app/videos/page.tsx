"use client";

import { useState, useEffect } from "react";
import { Play, Youtube, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Video {
  _id: string;
  videoUrl: string;
  title: string;
  description: string;
  embedUrl?: string;
}

interface ApiResponse {
  success: boolean;
  data: Video[];
  total?: number;
  page?: number;
}

const VIDEOS_PER_PAGE = 12;

// Extract YouTube ID from URL
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
  return match ? match[1] : null;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  // Fetch videos from backend
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const skip = (currentPage - 1) * VIDEOS_PER_PAGE;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/videos/public?limit=${VIDEOS_PER_PAGE}&skip=${skip}`,
          { next: { revalidate: 3600 } }
        );
        const data: ApiResponse = await res.json();
        
        if (data.success && data.data) {
          setVideos(data.data);
          setTotalVideos(data.total || 0);
        } else {
          setVideos([]);
          setTotalVideos(0);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideos([]);
        setTotalVideos(0);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage]);

  const getVideoThumbnail = (url: string, quality = "maxresdefault"): string => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : "";
  };

  const handleVideoPlay = (url: string) => {
    setPlayingVideo(url);
  };

  const closeVideo = () => {
    setPlayingVideo(null);
  };

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideo();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE);

  return (
    <section className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header - with YouTube red */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <Youtube size={28} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              All Nepal Videos
            </h1>
          </div>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Discover breathtaking landscapes, rich culture, and epic adventures.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <Play size={28} className="text-red-600 animate-spin" />
                </div>
                <p className="text-slate-600 font-medium">Loading videos...</p>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <Youtube size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No videos available</p>
              </div>
            </div>
          ) : (
            videos.map((video) => {
              const thumbnail = getVideoThumbnail(video.videoUrl);

              return (
                <div
                  key={video._id}
                  className="group relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                  onClick={() => handleVideoPlay(video.videoUrl)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const id = extractYouTubeId(video.videoUrl);
                        if (id) e.currentTarget.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                      }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Play button - YouTube red */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-700">
                        <Play size={28} className="text-white fill-white ml-1" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent">
                      <h3 className="font-semibold text-base sm:text-lg text-white line-clamp-1">
                        {video.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Youtube size={16} className="text-red-600" />
                        <span className="text-xs text-slate-500">YouTube</span>
                      </div>
                      <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                        <Play size={12} />
                        Play
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && videos.length > 0 && totalPages > 1 && (
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
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage && i > 0 && i < totalPages - 1) {
                  // Show ellipsis only once between gaps
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
                        ? "bg-red-600 text-white font-medium"
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

        {/* Fullscreen Modal */}
        {playingVideo && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <button
              onClick={closeVideo}
              className="absolute top-6 right-6 z-50 p-4 bg-slate-900/70 hover:bg-slate-800 text-white rounded-full transition-all duration-300 border border-white/20 shadow-xl"
              aria-label="Close video"
            >
              <X size={28} />
            </button>

            <div className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(playingVideo)}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1`}
                title="YouTube video player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="mt-8 text-center text-white max-w-3xl">
              <h3 className="text-3xl font-bold mb-3">
                {videos.find((v) => v.videoUrl === playingVideo)?.title}
              </h3>
              <p className="text-lg text-slate-300">
                {videos.find((v) => v.videoUrl === playingVideo)?.description}
              </p>
            </div>

            <a
              href={playingVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Youtube size={24} />
              Watch on YouTube
            </a>
          </div>
        )}

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </section>
  );
}
