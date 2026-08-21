'use client';

import { trackAdvertisementClick, useMultipleAds } from '@/hooks/useAds';

export default function PremiumAdSection() {
  const { adsByPosition } = useMultipleAds(['premium']);
  const ads = adsByPosition.premium || [];

  if (ads.length === 0) return null;

  return (
    <section aria-label="Premium advertisements" className="w-full bg-white px-2 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto max-w-7xl space-y-3">
        {ads.map((ad, index) => (
          <a
            key={ad._id || `premium-ad-${index}`}
            onClick={() => trackAdvertisementClick(ad._id)}
            href={ad.link || ad.weblink || '#'}
            target={ad.link || ad.weblink ? '_blank' : undefined}
            rel={ad.link || ad.weblink ? 'noopener noreferrer' : undefined}
            className="block w-full"
          >
            <div className="relative aspect-[21/5] w-full sm:aspect-[21/4]">
              <img
                src={typeof ad.image === 'string' ? ad.image : ad.image.url}
                alt={typeof ad.image === 'string' ? 'Premium advertisement' : ad.image.alt || ad.title || 'Premium advertisement'}
                className="h-full w-full object-contain"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
