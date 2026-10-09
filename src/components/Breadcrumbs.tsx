import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { breadcrumbSchema } from '@/utils/seoUtils';

/** Breadcrumb structured data (no visible markup) for a page under Home. */
export default function BreadcrumbJsonLd({ locale, trail }: { locale: Locale; trail: { name: string; path: string }[] }) {
  const schema = breadcrumbSchema(locale, getDictionary(locale).pages.home, trail);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
