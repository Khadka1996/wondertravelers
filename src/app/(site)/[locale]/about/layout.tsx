import { Metadata } from 'next';
import { resolveLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { generateSEOMetadata, generateLocalBusinessSchema } from '@/utils/seoUtils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.about;
  return generateSEOMetadata({
    title: t.title,
    description: t.description,
    keywords: 'about WONDER Travelers, Nepal travel, tourism company, travel guides, professional photography, documentaries',
    slug: '/about',
    locale,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const organizationSchema = generateLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {children}
    </>
  );
}
