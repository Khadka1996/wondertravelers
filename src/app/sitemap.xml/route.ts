const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com';

export async function GET(): Promise<Response> {
  const now = new Date().toISOString();
  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/news`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/explore`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/videos`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/photos`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/pictures`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/author`, priority: '0.6', changefreq: 'weekly' },
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
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
}
