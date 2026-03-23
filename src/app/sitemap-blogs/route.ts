import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wonder.shirijanga.com/';

export async function GET(): Promise<Response> {
  try {
    // Fetch all blogs from API
    const response = await fetch(`${API_URL}/api/blogs?limit=10000`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }

    const data = await response.json();
    const blogs = data.blogs || [];

    const blogUrls = blogs.map((blog: any) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.updatedAt || blog.publishedAt || blog.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${blogUrls
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
    console.error('Error generating blog sitemap:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
