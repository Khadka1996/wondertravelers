// Languages live in the first URL segment: /en/... and /ne/...
// The address alone decides the language (no detection, no hidden state).

export const locales = ['en', 'ne'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Cookie the language switch sets, so `/` sends returning visitors to their language. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const isLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);

// Paths that are not translated pages: dashboards, sign-in, API proxy, files.
const UNLOCALIZED_PREFIXES = ['/admin', '/moderator', '/auth', '/profile', '/unauthorized', '/api', '/uploads', '/_next'];

export const isLocalizablePath = (path: string) =>
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !UNLOCALIZED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`));

/** Splits `/ne/blog/x` into `{ locale: 'ne', path: '/blog/x' }`. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const [, first, ...rest] = pathname.split('/');
  if (isLocale(first)) return { locale: first, path: `/${rest.join('/')}` };
  return { locale: null, path: pathname };
}

/** `/blog/x` -> `/ne/blog/x`. Leaves external, dashboard and already-prefixed paths alone. */
export function localizePath(href: string, locale: Locale): string {
  if (!isLocalizablePath(href) || splitLocale(href).locale) return href;
  if (href === '/') return `/${locale}`;
  if (href.startsWith('/?') || href.startsWith('/#')) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

/** Same page in another language: `/en/blog?page=2` -> `/ne/blog?page=2`. */
export function switchLocalePath(pathname: string, search: string, target: Locale): string {
  const { path } = splitLocale(pathname);
  return `${localizePath(path || '/', target)}${search}`;
}

export const localeNames: Record<Locale, string> = { en: 'English', ne: 'नेपाली' };
export const ogLocales: Record<Locale, string> = { en: 'en_US', ne: 'ne_NP' };

/** For route params: anything that is not a supported language falls back to English. */
export const resolveLocale = (value: string | undefined): Locale => (isLocale(value) ? value : defaultLocale);
