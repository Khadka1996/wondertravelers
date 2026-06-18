'use client';

import { useEffect } from 'react';

interface ViewCounterProps {
  blogId: string;
  type: 'blog' | 'news';
  onViewIncremented?: (updatedViews: number) => void;
}

/**
 * Client component to increment view count when blog/news page is viewed
 * Should be placed at the top level of blog/news detail pages
 */
export default function ViewCounter({ blogId, type, onViewIncremented }: ViewCounterProps) {
  useEffect(() => {
    const incrementView = async () => {
      if (!blogId) return;

      try {
        // Call backend API to increment view count
        const endpoint = type === 'blog' ? `/api/blogs/${blogId}/view` : `/api/news/${blogId}/view`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ View count incremented for ${type}:`, data);
          
          // Notify parent component of updated views
          if (onViewIncremented && data?.views) {
            onViewIncremented(data.views);
          }

          // Force revalidate the page data cache by refetching blog details
          if (type === 'blog') {
            try {
              const revalidateResponse = await fetch(`/api/revalidate?type=blog&id=${blogId}`, {
                method: 'POST',
                cache: 'no-store'
              });
              if (revalidateResponse.ok) {
                console.log('✅ Page cache revalidated');
              }
            } catch (error) {
              console.warn('Cache revalidation request failed (non-critical):', error);
            }
          }
        } else {
          console.warn(`⚠️  Failed to increment view for ${type}:`, response.status);
        }
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error(`Error incrementing ${type} view:`, error);
      }
    };

    // Call once on component mount
    incrementView();
  }, [blogId, type, onViewIncremented]);

  return null;
}
