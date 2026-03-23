import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
    // Image optimization for better SEO and performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
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
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://wonder.shirijanga.com'}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://wonder.shirijanga.com'}/uploads/:path*`,
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
    return [
      // Redirect old URLs to new ones if needed
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true, // 301 redirect for SEO
      },
    ];
  },

  // Enable experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@mui/material'],
  },
};

export default nextConfig;
