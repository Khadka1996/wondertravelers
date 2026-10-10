import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { socialProfiles } from '@/lib/social';

export const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com').replace(/\/$/, '');

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
    sameAs: socialProfiles.map((profile) => profile.href),
    address: { '@type': 'PostalAddress', addressCountry: 'NP', addressRegion: 'Kathmandu' },
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'General', email: 'wondertravelsnepal@gmail.com' }],
  };

  // name/alternateName is what Google shows as the site name in results.
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: t.site.name,
    alternateName: ['Wonder Travelers', 'WonderTravelers', 'wondertravelers.com'],
    url: `${baseUrl}/`,
    inLanguage: locale,
    description: t.meta.home.description,
  };

  // The main menu, so search engines know which pages matter most
  // (the pages Google tends to show as sitelinks under the result).
  const menu = [
    { name: t.pages.news, path: '/news' },
    { name: t.pages.blog, path: '/blog' },
    { name: t.pages.explore, path: '/explore' },
    { name: t.pages.gallery, path: '/gallery' },
    { name: t.pages.videos, path: '/videos' },
    { name: t.pages.about, path: '/about' },
    { name: t.pages.contact, path: '/contact' },
  ];
  const navigation = {
    '@context': 'https://schema.org',
    '@graph': menu.map((item) => ({
      '@type': 'SiteNavigationElement',
      name: item.name,
      url: `${baseUrl}/${locale}${item.path}`,
    })),
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(navigation) }} />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </>
  );
}
