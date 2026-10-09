import { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata } from '@/utils/seoUtils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.gallery;
  return generateSEOMetadata({
    title: t.title,
    description: t.description,
    keywords: 'Wonder Travelers gallery, Nepal travel photos, Nepal photography, travel gallery, destination images',
    slug: '/gallery',
    locale,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
