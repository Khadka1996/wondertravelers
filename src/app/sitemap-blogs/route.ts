const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com';
const API_URL = 'https://wonder.shirijanga.com';

export async function GET(): Promise<Response> {
  try {
    // Fetch both blog articles and news posts that resolve to /blog/:slug pages
    const [blogsResponse, newsResponse] = await Promise.all([
      fetch(`${API_URL}/api/blogs?limit=10000`, {
        next: { revalidate: 86400 },
      }),
      fetch(`${API_URL}/api/blogs/news?limit=10000`, {
        next: { revalidate: 86400 },
      }),
    ]);

    if (!blogsResponse.ok && !newsResponse.ok) {
      throw new Error('Failed to fetch blogs and news for sitemap');
    }

    const blogsData = blogsResponse.ok ? await blogsResponse.json() : { data: [] };
    const newsData = newsResponse.ok ? await newsResponse.json() : { data: [] };

    const allPosts = [...(blogsData?.data || []), ...(newsData?.data || [])];

    const blogUrls = allPosts
      .filter((post: any) => Boolean(post?.slug))
      .map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        imageUrl: post?.featuredImage
          ? (post.featuredImage.startsWith('http') ? post.featuredImage : `${API_URL}${post.featuredImage.startsWith('/') ? post.featuredImage : `/${post.featuredImage}`}`)
          : null,
        lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt || new Date().toISOString()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
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
    ${url.imageUrl ? `<image:image><image:loc>${url.imageUrl}</image:loc></image:image>` : ''}
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
