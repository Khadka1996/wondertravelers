'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Component that remembers user's location before redirecting to login
 * This is used to remember where user was trying to go
 */
export const LocationMemory = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip storing location for auth pages and public pages
    if (pathname?.startsWith('/auth')) {
      return;
    }

    if (typeof window !== 'undefined') {
      // Store the full path with search params
      const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      // Only store if it's not the home page or error page
      if (pathname !== '/' && !pathname?.startsWith('/error')) {
        sessionStorage.setItem('previousLocation', fullPath);
      }
    }
  }, [pathname, searchParams]);

  return null;
};
