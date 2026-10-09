import type { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/moderator', '/auth', '/profile', '/unauthorized'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
