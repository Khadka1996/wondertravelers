"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play,ChevronRight, Youtube, X } from "lucide-react";

// YouTube video data (you can expand this array later)
const YOUTUBE_VIDEOS = [
  {
    id: 1,
    title: "Everest Base Camp Trek",
    youtubeUrl: "https://www.youtube.com/watch?v=2XYZ5Hy8EXs",
    description: "Complete journey to Everest Base Camp with stunning Himalayan views.",
  },
  {
    id: 2,
    title: "Pokhara Lakeside Tour",
    youtubeUrl: "https://www.youtube.com/watch?v=YfK6tXXpgSw",
    description: "Serene lakes, paragliding & breathtaking mountain panoramas.",
  },
  {
    id: 3,
    title: "Kathmandu Heritage Walk",
    youtubeUrl: "https://www.youtube.com/watch?v=BetpKCMLYVI",
    description: "Explore ancient temples, bustling streets & rich culture.",
  },
  {
    id: 4,
    title: "Annapurna Circuit Trek",
    youtubeUrl: "https://www.youtube.com/watch?v=TDhGwklj9yk",
    description: "One of the world's classic treks – diverse landscapes & epic views.",
  },
];

// Extract YouTube ID from URL
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
  return match ? match[1] : null;
};

export default function VideoSection() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--very-light)] dark:bg-[var(--bg-dark)]">
      <div className="max-w-7xl mx-auto">
        {/* Header - matches navbar style */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center shadow-[var(--shadow-soft)] ring-1 ring-[var(--border)]">
              <Youtube size={32} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--primary)] dark:text-[var(--secondary)] tracking-tight">
              Explore Nepal Through Videos
            </h2>
          </div>
          <p className="text-xl text-[var(--text-secondary)] dark:text-slate-300 max-w-3xl mx-auto font-light">
            Discover breathtaking landscapes, rich culture, and epic adventures — click any card to watch.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {YOUTUBE_VIDEOS.map((video) => {
            const videoId = extractYouTubeId(video.youtubeUrl);
            const thumbnail = getVideoThumbnail(video.youtubeUrl);

            return (
              <div
                key={video.id}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-[var(--border)] shadow-[var(--shadow-soft)] transition-all duration-400 cursor-pointer animate-fade-in-up"
                onClick={() => handleVideoPlay(video.youtubeUrl)}
              >
                {/* Taller thumbnail container */}
                <div className="relative aspect-[4/3.4] overflow-hidden">
                  <img
                    src={thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      const id = extractYouTubeId(video.youtubeUrl);
                      if (id) e.currentTarget.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                    }}
                  />

                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent/20" />

                  {/* Large centered play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center shadow-xl ring-4 ring-[var(--secondary)/30] transition-transform duration-300 group-hover:scale-105">
                      <Play size={36} className="text-white fill-white ml-1.5" />
                    </div>
                  </div>

                  {/* Title at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent">
                    <h3 className="font-bold text-xl text-white line-clamp-2 drop-shadow-md">
                      {video.title}
                    </h3>
                  </div>
                </div>

                {/* Footer info */}
                <div className="p-5">
                  <p className="text-[var(--text-secondary)] dark:text-slate-300 text-sm leading-relaxed line-clamp-2 mb-4">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] dark:text-slate-400">
                      <Youtube size={18} className="text-[var(--secondary)]" />
                      <span>Watch on YouTube</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--primary)] dark:text-[var(--secondary)] font-medium">
                      <Play size={16} />
                      <span>Play</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore More Button */}
        <div className="mt-16 text-center animate-fade-in">
          <Link
            href="/videos"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold text-lg rounded-2xl shadow-[var(--shadow-soft)] hover:shadow-[var(--glow)] transition-all duration-300 border border-[var(--secondary)/40] hover:border-[var(--secondary)/60]"
          >
            Explore More Videos
            <ChevronRight size={24} />
          </Link>
        </div>

        {/* Fullscreen Modal */}
        {playingVideo && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <button
              onClick={closeVideo}
              className="absolute top-6 right-6 z-50 p-4 bg-slate-900/70 hover:bg-slate-800 text-white rounded-full transition-all duration-300 border border-[var(--border)] shadow-xl"
              aria-label="Close video"
            >
              <X size={28} />
            </button>

            <div className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[var(--border)]">
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
                {YOUTUBE_VIDEOS.find((v) => v.youtubeUrl === playingVideo)?.title}
              </h3>
              <p className="text-lg text-slate-300">
                {YOUTUBE_VIDEOS.find((v) => v.youtubeUrl === playingVideo)?.description}
              </p>
            </div>

            <a
              href={playingVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:brightness-110 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Youtube size={24} />
              Watch on YouTube
            </a>
          </div>
        )}
      </div>

      {/* Page Load Animations - add to global or component */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        /* Stagger children slightly */
        .grid > div:nth-child(1) { animation-delay: 0.1s; }
        .grid > div:nth-child(2) { animation-delay: 0.2s; }
        .grid > div:nth-child(3) { animation-delay: 0.3s; }
        .grid > div:nth-child(4) { animation-delay: 0.4s; }
      `}</style>
    </section>
  );
}