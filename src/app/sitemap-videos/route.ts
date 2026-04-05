import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';

export async function GET(): Promise<Response> {
  try {
    // Fetch all videos from API
    const response = await fetch(`${API_URL}/api/videos?limit=10000`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    const data = await response.json();
    const videos = data.videos || [];

    const videoUrls = videos.map((video: any) => ({
      url: `${baseUrl}/videos/${video.slug}`,
      lastModified: new Date(video.updatedAt || video.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${videoUrls
    .map(
      (url: any) => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified.toISOString()}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

    return new Response(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating video sitemap:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
