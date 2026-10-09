import type { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { format, getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata } from '@/utils/seoUtils';
import BreadcrumbJsonLd from '@/components/Breadcrumbs';

type Props = { params: Promise<{ locale: string; tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, tag: rawTag } = await params;
  const locale = resolveLocale(rawLocale);
  const tag = decodeURIComponent(rawTag);
  const t = getDictionary(locale).meta.tag;
  return generateSEOMetadata({
    title: format(t.title, { tag }),
    description: format(t.description, { tag }),
    slug: `/tag/${encodeURIComponent(tag)}`,
    locale,
  });
}

export default async function Layout({ children, params }: { children: React.ReactNode } & Props) {
  const { locale: rawLocale, tag: rawTag } = await params;
  const locale = resolveLocale(rawLocale);
  const tag = decodeURIComponent(rawTag);
  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        trail={[
          { name: getDictionary(locale).pages.blog, path: '/blog' },
          { name: `#${tag}`, path: `/tag/${encodeURIComponent(tag)}` },
        ]}
      />
      {children}
    </>
  );
}
