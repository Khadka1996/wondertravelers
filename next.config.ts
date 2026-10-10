import type { NextConfig } from "next";

const backendBaseUrl = process.env.BACKEND_API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || 'https://api.wondertravelers.com';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.wondertravelers.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.wondertravelers.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'wondertravelers.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
    // Image optimization for better SEO and performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // WebP only: AVIF takes seconds per image to encode on a 2-CPU server.
    formats: ['image/webp'],
    // Uploads never change in place (new names on every upload), so resized
    // copies can be kept for a year.
    minimumCacheTTL: 31536000,
  },
  
  // Compression for better performance
  compress: true,
  
  // Generate ETags for better caching
  generateEtags: true,

  // Enable SWR (stale-while-revalidate) caching
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  async rewrites() {
    if (!backendBaseUrl) {
      return [];
    }

    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${backendBaseUrl}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${backendBaseUrl}/uploads/:path*`,
        },
      ],
    };
  },

  // SEO Headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
      // Cache static assets for better performance
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache fonts
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS in production
  async redirects() {
    // Pages without a language prefix are redirected in src/middleware.ts.
    const oldSitemaps = ['sitemap-index', 'sitemap-blogs', 'sitemap-destinations', 'sitemap-videos'];
    return [
      { source: '/old-blog/:slug', destination: '/en/blog/:slug', permanent: true },
      ...oldSitemaps.flatMap((name) => [
        { source: `/${name}.xml`, destination: '/sitemap.xml', permanent: true },
        { source: `/${name}`, destination: '/sitemap.xml', permanent: true },
      ]),
    ];
  },

  // Enable experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@mui/material'],
  },
};

export default nextConfig;
