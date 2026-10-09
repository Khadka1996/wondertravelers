import type { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { format, getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata } from '@/utils/seoUtils';

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

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
