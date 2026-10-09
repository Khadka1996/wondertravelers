import { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import BreadcrumbJsonLd from '@/components/Breadcrumbs';
import { generateSEOMetadata } from '@/utils/seoUtils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.videos;
  return generateSEOMetadata({
    title: t.title,
    description: t.description,
    keywords: 'Nepal videos, documentaries, travel documentaries, video guides, Nepal tourism videos, travel vblogs, videography',
    slug: '/videos',
    locale,
  });
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const crumb = <BreadcrumbJsonLd locale={locale} trail={[{ name: getDictionary(locale).pages.videos, path: '/videos' }]} />;
  return (
    <>
      {crumb}
      {children}
    </>
  );
}
