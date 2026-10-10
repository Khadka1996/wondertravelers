import type { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata } from '@/utils/seoUtils';
import HomePageClient from './HomePageClient';
import type { FeaturedImage } from '@/app/components/Herosection';
import { API_URL } from '@/lib/apiUrl';

// Hero pictures come with the HTML so the first one starts loading at once.
async function getHeroImages(): Promise<FeaturedImage[]> {
  try {
    const response = await fetch(`${API_URL}/api/featured-images/public?limit=4`, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const data = await response.json();
    return (data?.data || []).filter((image: FeaturedImage) => image?.imageUrl);
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.home;
  return generateSEOMetadata({
    title: t.title,
    description: t.description,
    keywords: 'Nepal travel, travel guide, destinations, tourism, hiking, trekking, photography, travel blog, travel documentaries',
    slug: '',
    locale,
  });
}

export default async function HomePage() {
  return <HomePageClient heroImages={await getHeroImages()} />;
}
