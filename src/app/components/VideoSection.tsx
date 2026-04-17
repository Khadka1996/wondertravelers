"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, ChevronRight, Youtube, X } from "lucide-react";
import { useMultipleAds } from "../../hooks/useAds";

interface Video {
  _id: string;
  videoUrl: string;
  title: string;
  description: string;
  embedUrl?: string;
}

// Extract YouTube ID from URL
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
  return match ? match[1] : null;
};

export default function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { adsByPosition } = useMultipleAds(['video_top', 'video_bottom', 'video_sidebar']);

  // Use fetched ads from backend
  const topAd = adsByPosition['video_top']?.[0] || null;
  const bottomAd = adsByPosition['video_bottom']?.[0] || null;
  const sidebarAd = adsByPosition['video_sidebar']?.[0] || null;

  // Fetch videos from backend
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Add timestamp to bust cache
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/videos/public?limit=4&t=${timestamp}`, {
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
        
        if (data.success && data.data && data.data.length > 0) {
          setVideos(data.data);
        } else {
          setVideos([]);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    
    // Refetch every 30 seconds to stay updated
    const interval = setInterval(fetchVideos, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Top Advertisement - Only show if ad exists */}
        {topAd && (
          <div className="mb-12">
            <Link 
              href={topAd.link || topAd.weblink || "#"}
              target={topAd.link || topAd.weblink ? "_blank" : undefined}
              rel={topAd.link || topAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-sm aspect-[5/1] sm:aspect-[21/4] bg-slate-100">
                <Image
                  src={typeof topAd.image === 'string' ? topAd.image : topAd.image.url}
                  alt={typeof topAd.image === 'string' ? "Advertisement" : topAd.image.alt || "Advertisement"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>
        )}

        {/* Header - with YouTube red */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <Youtube size={28} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Explore Nepal Through Videos
            </h2>
          </div>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Discover breathtaking landscapes, rich culture, and epic adventures.
          </p>
        </div>

        {/* Video Grid - reduced gap, taller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            // Skeleton loading cards
            [...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="relative aspect-video overflow-hidden bg-slate-200 rounded-xl mb-3">
                  <div className="w-full h-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
                </div>
                <div className="space-y-2 p-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))
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
                  {/* Thumbnail - taller aspect ratio */}
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

                    {/* Gradient overlay - darker */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Play button - YouTube red */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-700">
                        <Play size={28} className="text-white fill-white ml-1" />
                      </div>
                    </div>

                    {/* Title - more padding for taller card */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent">
                      <h3 className="font-semibold text-base sm:text-lg text-white line-clamp-1">
                        {video.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description - more content for taller card */}
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

        {/* Explore More Button */}
        <div className="mt-14 text-center">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm"
          >
            Explore More Videos
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Sidebar Advertisement - Show below videos */}
        {sidebarAd && (
          <div className="mt-14">
            <Link 
              href={sidebarAd.link || sidebarAd.weblink || "#"}
              target={sidebarAd.link || sidebarAd.weblink ? "_blank" : undefined}
              rel={sidebarAd.link || sidebarAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full md:w-80 mx-auto"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-sm bg-slate-100" style={{ aspectRatio: '4/5' }}>
                <Image
                  src={typeof sidebarAd.image === 'string' ? sidebarAd.image : sidebarAd.image.url}
                  alt={typeof sidebarAd.image === 'string' ? "Advertisement" : sidebarAd.image.alt || "Advertisement"}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        )}

        {/* Fullscreen Modal - EXACT design from reference */}
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

        {/* Bottom Advertisement - Only show if ad exists */}
        {bottomAd && (
          <div className="mt-12">
            <Link 
              href={bottomAd.link || bottomAd.weblink || "#"}
              target={bottomAd.link || bottomAd.weblink ? "_blank" : undefined}
              rel={bottomAd.link || bottomAd.weblink ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <div className="relative w-full rounded-lg overflow-hidden shadow-sm aspect-[5/1] sm:aspect-[21/4] bg-slate-100">
                <Image
                  src={typeof bottomAd.image === 'string' ? bottomAd.image : bottomAd.image.url}
                  alt={typeof bottomAd.image === 'string' ? "Advertisement" : bottomAd.image.alt || "Advertisement"}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
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