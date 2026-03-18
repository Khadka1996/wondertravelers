'use client';

import { Facebook, Twitter, Linkedin, MessageCircle, Link2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ShareButtonsProps {
  title: string;
  publishedDate: string;
  readingTime: number;
}

export default function ShareButtons({ title, publishedDate, readingTime }: ShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    setIsMounted(true);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  // Don't render share buttons until client-side hydration is complete
  if (!isMounted) {
    return (
      <div className="pt-8 border-t-2 border-slate-200 mt-12">
        <div className="text-center mb-6">
          <p className="text-sm text-slate-600 font-medium">
            📅 Published: {publishedDate} | ⏱️ {readingTime} min read
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="text-sm font-bold text-slate-900 mr-2 w-full text-center mb-2">Share This Article:</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 border-t-2 border-slate-200 mt-12">
      {/* Published Info */}
      <div className="text-center mb-6">
        <p className="text-sm text-slate-600 font-medium">
          📅 Published: {publishedDate} | ⏱️ {readingTime} min read
        </p>
      </div>

      {/* Share Buttons - Large with Labels */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <span className="text-sm font-bold text-slate-900 mr-2 w-full text-center mb-2">Share This Article:</span>
        
        {/* Facebook */}
        <a 
          href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transition-all" 
          title="Share on Facebook"
        >
          <Facebook size={24} />
          <span className="text-xs font-bold mt-1">Share</span>
        </a>
        
        {/* Twitter */}
        <a 
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-sky-500 text-white hover:bg-sky-600 hover:shadow-lg transition-all" 
          title="Share on Twitter"
        >
          <Twitter size={24} />
          <span className="text-xs font-bold mt-1">Tweet</span>
        </a>
        
        {/* LinkedIn */}
        <a 
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-blue-700 text-white hover:bg-blue-800 hover:shadow-lg transition-all" 
          title="Share on LinkedIn"
        >
          <Linkedin size={24} />
          <span className="text-xs font-bold mt-1">Share</span>
        </a>
        
        {/* WhatsApp */}
        <a 
          href={`https://wa.me/?text=${encodeURIComponent(`${title} ${currentUrl}`)}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transition-all" 
          title="Share on WhatsApp"
        >
          <MessageCircle size={24} />
          <span className="text-xs font-bold mt-1">Send</span>
        </a>
        
        {/* Copy Link */}
        <button 
          onClick={handleCopyLink}
          className="inline-flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-slate-400 text-white hover:bg-slate-500 hover:shadow-lg transition-all cursor-pointer" 
          title="Copy Link"
        >
          <Link2 size={24} />
          <span className="text-xs font-bold mt-1">Copy</span>
        </button>
      </div>
    </div>
  );
}
