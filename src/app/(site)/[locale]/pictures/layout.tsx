import { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata } from '@/utils/seoUtils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.pictures;
  return generateSEOMetadata({
    title: t.title,
    description: t.description,
    keywords: 'Nepal pictures, travel photography, high resolution images, landscape pictures, cultural photography, scenic views',
    slug: '/pictures',
    locale,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
