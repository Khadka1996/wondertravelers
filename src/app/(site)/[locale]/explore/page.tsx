import BreadcrumbJsonLd from '@/components/Breadcrumbs';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import ListClient from './ListClient';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  return (
    <>
      <BreadcrumbJsonLd locale={locale} trail={[{ name: getDictionary(locale).pages.explore, path: '/explore' }]} />
      <ListClient />
    </>
  );
}
