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

export default function AdPopup({ ad }: { ad: PopupAdvertisement | null }) {
  const [open, setOpen] = useState(Boolean(ad));

  useEffect(() => {
    setOpen(Boolean(ad));
  }, [ad]);

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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close advertisement"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
        >
          <X size={18} />
        </button>
        <a onClick={() => trackAdvertisementClick(ad._id)} href={href} target={href !== '#' ? '_blank' : undefined} rel={href !== '#' ? 'noopener noreferrer' : undefined} className="block">
          <img src={imageUrl} alt={ad.image.alt || ad.title || 'Advertisement'} className="max-h-[80vh] w-full object-contain" />
        </a>
      </div>
    </div>
  );
}
