import type { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import BreadcrumbJsonLd from '@/components/Breadcrumbs';
import { generateSEOMetadata } from '@/utils/seoUtils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.author;
  return generateSEOMetadata({ title: t.title, description: t.description, slug: '/author', locale });
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const crumb = <BreadcrumbJsonLd locale={locale} trail={[{ name: getDictionary(locale).pages.author, path: '/author' }]} />;
  return (
    <>
      {crumb}
      {children}
    </>
  );
}
