'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { trackAdvertisementClick } from '@/hooks/useAds';

interface PopupAdvertisement {
  _id: string;
  title?: string;
  image: { url: string; alt?: string };
  link?: string;
  weblink?: string;
}

const POPUP_DURATION_SECONDS = 5;

export default function AdPopup({ ad, articleId }: { ad: PopupAdvertisement | null; articleId: string }) {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(POPUP_DURATION_SECONDS);

  useEffect(() => {
    if (!ad || !articleId) {
      setOpen(false);
      return;
    }

    const storageKey = `blog-popup-seen:${articleId}`;
    let alreadySeen = false;

    try {
      alreadySeen = localStorage.getItem(storageKey) === 'true';
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      setOpen(false);
      return;
    }

    setSecondsLeft(POPUP_DURATION_SECONDS);
    setOpen(true);

    const countdown = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          try {
            localStorage.setItem(storageKey, 'true');
          } catch {
            // Continue closing even when browser storage is unavailable.
          }
          setOpen(false);
          window.clearInterval(countdown);
          return 0;
        }
        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [ad, articleId]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !ad) return null;

  const imageUrl = ad.image.url;
  const href = ad.link || ad.weblink || '#';
  const closePopup = () => {
    try {
      localStorage.setItem(`blog-popup-seen:${articleId}`, 'true');
    } catch {
      // The popup can still be closed when browser storage is unavailable.
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close advertisement"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
        >
          <X size={18} />
        </button>
        <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
          Closes in {secondsLeft}
        </div>
        <a onClick={() => trackAdvertisementClick(ad._id)} href={href} target={href !== '#' ? '_blank' : undefined} rel={href !== '#' ? 'noopener noreferrer' : undefined} className="block">
          <img src={imageUrl} alt={ad.image.alt || ad.title || 'Advertisement'} className="max-h-[80vh] w-full object-contain" />
        </a>
      </div>
    </div>
  );
}
