import { useState, useEffect } from 'react';

export interface Advertisement {
  _id: string;
  title: string;
  image: {
    url: string;
    alt?: string;
  };
  weblink: string;
  link?: string;
  position: string;
  isActive?: boolean;
}

export interface AdsResponse {
  success: boolean;
  position: string;
  count: number;
  advertisements: Advertisement[];
}

const AD_CACHE_TTL_MS = 5 * 60 * 1000;
const adsCache = new Map<string, { ads: Advertisement[]; fetchedAt: number }>();

const getCachedAds = (position: string) => {
  const cached = adsCache.get(position);
  if (!cached) return null;

  if (Date.now() - cached.fetchedAt > AD_CACHE_TTL_MS) {
    adsCache.delete(position);
    return null;
  }

  return cached.ads;
};

const setCachedAds = (position: string, ads: Advertisement[]) => {
  adsCache.set(position, { ads, fetchedAt: Date.now() });
};

/**
 * Custom hook to fetch advertisements by position from the backend
 * @param position - Ad position identifier (e.g., 'video_top', 'photo_sidebar', 'blog_top')
 * @returns { ads, loading, error }
 */
export const useAds = (position: string) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedAds = getCachedAds(position);
        if (cachedAds) {
          setAds(cachedAds);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/advertisements/position/${position}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          // If response is not OK, silently set ads to empty instead of throwing error
          setAds([]);
          setLoading(false);
          return;
        }

        const data: AdsResponse = await response.json();

        if (data.success && data.advertisements.length > 0) {
          setCachedAds(position, data.advertisements);
          setAds(data.advertisements);
        } else {
          setCachedAds(position, []);
          setAds([]);
        }
      } catch (err) {
        // Silently fail - don't log as error, just set ads to empty
        // This handles JSON parse errors, network errors, etc.
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    if (position) {
      fetchAds();
    }
  }, [position]);

  return { ads, loading, error };
};

/**
 * Custom hook to fetch multiple ad positions at once
 * @param positions - Array of ad position identifiers
 * @returns { adsByPosition, loading }
 */
export const useMultipleAds = (positions: string[]) => {
  const [adsByPosition, setAdsByPosition] = useState<Record<string, Advertisement[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAds = async () => {
      try {
        setLoading(true);

        const nextAdsByPosition: Record<string, Advertisement[]> = {};
        const positionsToFetch: string[] = [];

        for (const position of positions) {
          const cachedAds = getCachedAds(position);
          if (cachedAds) {
            nextAdsByPosition[position] = cachedAds;
          } else {
            positionsToFetch.push(position);
          }
        }

        if (positionsToFetch.length === 0) {
          setAdsByPosition(nextAdsByPosition);
          setLoading(false);
          return;
        }

        const promises = positionsToFetch.map(async (position) => {
          try {
            const response = await fetch(`/api/advertisements/position/${position}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                Accept: 'application/json'
              }
            });

            if (response.ok) {
              try {
                const data: AdsResponse = await response.json();
                setCachedAds(position, data.advertisements || []);
                return [position, data.advertisements || []] as const;
              } catch (jsonError) {
                // If JSON parsing fails, silently return empty array
                setCachedAds(position, []);
                return [position, []] as const;
              }
            }
            setCachedAds(position, []);
            return [position, []] as const;
          } catch (error) {
            // Silently handle any fetch errors
            setCachedAds(position, []);
            return [position, []] as const;
          }
        });

        const results = await Promise.all(promises);
        const adsMap = Object.fromEntries([...Object.entries(nextAdsByPosition), ...results]);
        setAdsByPosition(adsMap);
      } finally {
        setLoading(false);
      }
    };

    if (positions.length > 0) {
      fetchAllAds();
    }
  }, [positions.join(',')]);

  return { adsByPosition, loading };
};
