import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com').replace(/\/$/, '');

const socialProfiles = [
  'https://www.facebook.com/share/17gYmw6MMW/',
  'https://www.youtube.com/@WonderTravelers',
  'https://www.instagram.com/wond_ertravelers?igsh=MXFsaTg2bGdqZDh0Ng==',
];

/** Analytics plus the Organization and WebSite structured data, in every page head. */
export default function SiteHead({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: t.site.name,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/logos.png`,
    description: t.meta.home.description,
    sameAs: socialProfiles,
    address: { '@type': 'PostalAddress', addressCountry: 'NP', addressRegion: 'Kathmandu' },
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'General', email: 'wondertravelsnepal@gmail.com' }],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t.site.name,
    url: `${baseUrl}/${locale}`,
    inLanguage: locale,
    description: t.meta.home.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/${locale}/explore?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
            }}
          />
        </>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </>
  );
}
