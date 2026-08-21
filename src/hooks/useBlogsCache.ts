import { useState, useCallback, useEffect, useRef } from 'react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '');

// In-memory cache for blog data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface BlogCacheData {
  blogs: any[];
  pagination: {
    total: number;
    pages: number;
    current: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class BlogDataCache {
  private cache = new Map<string, CacheEntry<BlogCacheData>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(
    type: 'all' | 'news' | 'tag',
    page: number,
    limit: number,
    tag?: string,
    sortBy?: string
  ): string {
    return `${type}:${page}:${limit}:${tag || 'none'}:${sortBy || 'latest'}`;
  }

  get(
    type: 'all' | 'news' | 'tag',
    page: number,
    limit: number,
    tag?: string,
    sortBy?: string
  ): BlogCacheData | null {
    const key = this.getCacheKey(type, page, limit, tag, sortBy);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(
    data: BlogCacheData,
    type: 'all' | 'news' | 'tag',
    page: number,
    limit: number,
    tag?: string,
    sortBy?: string,
    ttl?: number
  ): void {
    const key = this.getCacheKey(type, page, limit, tag, sortBy);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  invalidateType(type: 'all' | 'news' | 'tag' | null = null): void {
    if (type === null) {
      this.cache.clear();
      return;
    }

    // Clear all entries of a specific type
    for (const [key] of this.cache) {
      if (key.startsWith(type)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const blogCache = new BlogDataCache();

interface UseBlogsOptions {
  type?: 'all' | 'news' | 'tag';
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export function useBlogsCache(options: UseBlogsOptions = {}) {
  const {
    type = 'all',
    tag = '',
    page: initialPage = 1,
    limit = 12,
    sortBy = 'latest'
  } = options;

  const [blogs, setBlogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1,
    hasNext: false,
    hasPrev: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchBlogs = useCallback(async (currentPage: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedData = blogCache.get(type, currentPage, limit, tag, sortBy);
      if (cachedData) {
        if (isMountedRef.current) {
          setBlogs(cachedData.blogs);
          setPagination(cachedData.pagination);
          setIsLoading(false);
        }
        return;
      }

      // Build API URL
      let url = '';
      if (type === 'tag' && tag) {
        url = `${API_URL}/api/blogs/tag/${encodeURIComponent(tag)}?page=${currentPage}&limit=${limit}`;
      } else if (type === 'news') {
        url = `${API_URL}/api/blogs?type=news&page=${currentPage}&limit=${limit}&sortBy=${sortBy}`;
      } else {
        url = `${API_URL}/api/blogs?page=${currentPage}&limit=${limit}&sortBy=${sortBy}`;
      }

      // Fetch with timing info
      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'max-age=300' // 5 minutes
        }
      });

      const fetchTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.statusText}`);
      }

      const result = await response.json();

      // Parse response based on type
      let fetchedBlogs = [];
      let total = 0;

      if (type === 'tag' && tag) {
        fetchedBlogs = result.data?.blogs || [];
        total = result.data?.total || 0;
      } else {
        fetchedBlogs = Array.isArray(result.data) ? result.data : [];
        total = result.pagination?.total || 0;
      }

      const paginationData = {
        total,
        pages: Math.ceil(total / limit),
        current: currentPage,
        hasNext: currentPage < Math.ceil(total / limit),
        hasPrev: currentPage > 1
      };

      // Cache the data
      blogCache.set(
        { blogs: fetchedBlogs, pagination: paginationData },
        type,
        currentPage,
        limit,
        tag,
        sortBy
      );

      // Log performance info
      console.log(`[BLOG CACHE] ${type} page ${currentPage}: ${fetchTime}ms (Cache: ${response.headers.get('X-Cache') || 'MISS'})`);

      if (isMountedRef.current) {
        setBlogs(fetchedBlogs);
        setPagination(paginationData);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      if (isMountedRef.current) {
        setBlogs([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [type, tag, limit, sortBy]);

  useEffect(() => {
    fetchBlogs(page);
  }, [page, fetchBlogs]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      setPage(page + 1);
    }
  }, [page, pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      setPage(page - 1);
    }
  }, [page, pagination.hasPrev]);

  const invalidateCache = useCallback(() => {
    blogCache.invalidateType(type);
    fetchBlogs(1);
    setPage(1);
  }, [type, fetchBlogs]);

  return {
    blogs,
    pagination,
    isLoading,
    error,
    currentPage: page,
    goToPage,
    nextPage,
    prevPage,
    invalidateCache,
    cacheSize: blogCache.size()
  };
}

export { blogCache };
