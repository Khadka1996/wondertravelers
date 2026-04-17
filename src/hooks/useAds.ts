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

        const response = await fetch(`/api/advertisements/position/${position}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
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
          setAds(data.advertisements);
        } else {
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

        const promises = positions.map(async (position) => {
          try {
            const response = await fetch(`/api/advertisements/position/${position}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            });

            if (response.ok) {
              try {
                const data: AdsResponse = await response.json();
                return [position, data.advertisements || []];
              } catch (jsonError) {
                // If JSON parsing fails, silently return empty array
                return [position, []];
              }
            }
            return [position, []];
          } catch (error) {
            // Silently handle any fetch errors
            return [position, []];
          }
        });

        const results = await Promise.all(promises);
        const adsMap = Object.fromEntries(results);
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
