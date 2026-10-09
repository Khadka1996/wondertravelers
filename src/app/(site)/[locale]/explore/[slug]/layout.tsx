import type { Metadata } from 'next';
import { API_URL } from '@/lib/apiUrl';
import { baseUrl } from '@/components/SiteHead';
import { resolveLocale } from '@/i18n/config';
import { generateSEOMetadata } from '@/utils/seoUtils';
import BreadcrumbJsonLd from '@/components/Breadcrumbs';
import { getDictionary } from '@/i18n/dictionaries';

type Props = { params: Promise<{ locale: string; slug: string }> };

interface Destination {
  name: string;
  slug: string;
  shortDesc?: string;
  category?: string;
  image?: { url?: string };
  location?: { region?: string };
  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
}

async function getDestination(slug: string): Promise<Destination | null> {
  try {
    const response = await fetch(`${API_URL}/api/destinations/public/${encodeURIComponent(slug)}`, {
      next: { revalidate: 900 },
    });
    if (!response.ok) return null;
    return (await response.json()).destination || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const destination = await getDestination(slug);
  if (!destination) return { title: 'Not found', robots: { index: false, follow: true } };

  const image = destination.image?.url;
  return generateSEOMetadata({
    title: destination.seo?.metaTitle || `${destination.name} - Nepal Travel Guide | WONDER Travelers`,
    description:
      destination.seo?.metaDescription ||
      destination.shortDesc ||
      `${destination.name}, ${destination.location?.region || 'Nepal'}: travel guide, best time to visit and tips.`,
    keywords: destination.seo?.keywords?.join(', '),
    slug: `/explore/${destination.slug}`,
    locale,
    // Inline (base64) images cannot be share images; fall back to the site card.
    ogImage: image && !image.startsWith('data:') ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : undefined,
  });
}

export default async function Layout({ children, params }: { children: React.ReactNode } & Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const destination = await getDestination(slug);
  return (
    <>
      {destination && (
        <BreadcrumbJsonLd
          locale={locale}
          trail={[
            { name: getDictionary(locale).pages.explore, path: '/explore' },
            { name: destination.name, path: `/explore/${destination.slug}` },
          ]}
        />
      )}
      {children}
    </>
  );
}
