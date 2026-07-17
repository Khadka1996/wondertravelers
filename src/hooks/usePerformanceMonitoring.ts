import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  dataFetchTime: number;
  renderTime: number;
  totalTime: number;
  cacheHitRate: number;
}

export function usePerformanceMonitoring(pageName: string) {
  const recordMetric = useCallback((metricName: string, value: number) => {
    // Use Web Vitals API if available
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // Mark custom metric
        performance.mark(`${pageName}-${metricName}-end`, { startTime: value });
      } catch (e) {
        // Ignore if not supported
      }
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${pageName}: ${metricName} = ${value}ms`);
    }

    // Send to analytics if needed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_performance', {
        page: pageName,
        metric: metricName,
        value: value
      });
    }
  }, [pageName]);

  useEffect(() => {
    // Measure page load time
    const handlePageLoad = () => {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
          recordMetric('pageLoad', pageLoadTime);
        }
      }
    };

    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
      return () => window.removeEventListener('load', handlePageLoad);
    }
  }, [recordMetric]);

  return { recordMetric };
}

export function measureDataFetchTime(
  url: string,
  startTime: number
): { fetchTime: number; isCached: boolean } {
  const fetchTime = Date.now() - startTime;
  const isCached = fetchTime < 50; // Assume cached if very fast

  if (process.env.NODE_ENV === 'development') {
    console.log(`[FETCH] ${url}: ${fetchTime}ms ${isCached ? '(CACHED)' : '(FRESH)'}`);
  }

  return { fetchTime, isCached };
}

export function getPerformanceScore(
  pageLoadTime: number,
  dataFetchTime: number,
  renderTime: number
): {
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
} {
  const totalTime = pageLoadTime + dataFetchTime + renderTime;

  let score = 100;
  let rating: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (totalTime > 3000) {
    score -= 30;
    rating = 'poor';
  } else if (totalTime > 2000) {
    score -= 20;
    rating = 'fair';
  } else if (totalTime > 1000) {
    score -= 10;
    rating = 'good';
  }

  return { score: Math.max(0, score), rating };
}
