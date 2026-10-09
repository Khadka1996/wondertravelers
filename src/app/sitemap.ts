import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/apiUrl';
import { locales, type Locale } from '@/i18n/config';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com').replace(/\/$/, '');

// Rebuilt at most once an hour.
export const revalidate = 3600;

interface SitemapData {
  posts: { slug: string; featuredImage?: string; publishedAt?: string; updatedAt?: string }[];
  destinations: { slug: string; image?: string | null; updatedAt?: string }[];
}

const STATIC_PAGES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/news', priority: 0.9, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
  { path: '/explore', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/videos', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/photos', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/pictures', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/author', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'monthly' },
];

const absolute = (url: string) => (url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`);

/** One entry per language, each listing its en / ne / x-default twins. */
function entries(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>,
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}${path}`]));
  languages['x-default'] = `${baseUrl}/en${path}`;
  return locales.map((locale: Locale) => ({
    url: `${baseUrl}/${locale}${path}`,
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let data: SitemapData = { posts: [], destinations: [] };
  try {
    const response = await fetch(`${API_URL}/api/sitemap`, { next: { revalidate } });
    if (response.ok) data = await response.json();
  } catch (error) {
    console.error('[sitemap] Could not load posts and destinations:', error);
  }

  return [
    ...STATIC_PAGES.flatMap(({ path, ...extra }) => entries(path, { ...extra, lastModified: new Date() })),
    ...data.posts.flatMap((post) =>
      entries(`/blog/${post.slug}`, {
        lastModified: new Date(post.updatedAt || post.publishedAt || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
        images: post.featuredImage ? [absolute(post.featuredImage)] : undefined,
      }),
    ),
    ...data.destinations.flatMap((destination) =>
      entries(`/explore/${destination.slug}`, {
        lastModified: new Date(destination.updatedAt || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.7,
        images: destination.image ? [absolute(destination.image)] : undefined,
      }),
    ),
  ];
}
