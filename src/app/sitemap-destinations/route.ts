import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';

export async function GET(): Promise<Response> {
  try {
    // Fetch all destinations from API
    const response = await fetch(`${API_URL}/api/destinations?limit=10000`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error('Failed to fetch destinations');
    }

    const data = await response.json();
    const destinations = data.destinations || [];

    const destinationUrls = destinations.map((destination: any) => ({
      url: `${baseUrl}/explore/${destination.slug}`,
      lastModified: new Date(destination.updatedAt || destination.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${destinationUrls
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
    console.error('Error generating destination sitemap:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
