import type { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata } from '@/utils/seoUtils';
import HomePageClient from './HomePageClient';

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

export default function HomePage() {
  return <HomePageClient />;
}
