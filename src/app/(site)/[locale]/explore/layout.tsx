import { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata } from '@/utils/seoUtils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.explore;
  return generateSEOMetadata({
    title: t.title,
    description: t.description,
    keywords: 'Nepal destinations, travel guide, places to visit, tourist attractions, trekking, hiking, cultural sites, adventure, Nepal tourism',
    slug: '/explore',
    locale,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
