'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Dashboards and sign-in pages are not visitor traffic.
const UNTRACKED_PREFIXES = ['/admin', '/moderator', '/auth', '/profile'];

/** Reports one page view to the API each time a visitor lands on a page. */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || UNTRACKED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return;

    const body = JSON.stringify({ path: pathname, referrer: document.referrer || null });
    const blob = new Blob([body], { type: 'application/json' });
    if (!navigator.sendBeacon?.('/api/analytics/page-view', blob)) {
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
