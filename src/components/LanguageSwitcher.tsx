'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LOCALE_COOKIE, localeNames, locales, switchLocalePath } from '@/i18n/config';
import { useDictionary, useLocale } from '@/i18n/LocaleProvider';

/**
 * Opens the same page (filters and page number kept) in the other language.
 * A full page load, not a client transition: the Nepali page runs Google's
 * translator, which rewrites the DOM, so React must start fresh.
 */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  // Static pages render without query params; the links fill them in once hydrated.
  return (
    <Suspense fallback={<Switcher className={className} search="" />}>
      <SwitcherWithQuery className={className} />
    </Suspense>
  );
}

function SwitcherWithQuery({ className }: { className: string }) {
  return <Switcher className={className} search={useSearchParams().toString()} />;
}

function Switcher({ className, search }: { className: string; search: string }) {
  const locale = useLocale();
  const t = useDictionary();
  const pathname = usePathname();

  return (
    <div role="group" aria-label={t.nav.language} className={`inline-flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-semibold ${className}`} translate="no">
      {locales.map((code) => {
        const active = code === locale;
        return (
          <a
            key={code}
            href={switchLocalePath(pathname, search ? `?${search}` : '', code)}
            hrefLang={code}
            lang={code}
            aria-current={active ? 'true' : undefined}
            onClick={() => {
              document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={`px-2.5 py-1.5 transition-colors ${
              active
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {code === 'en' ? 'EN' : localeNames.ne}
          </a>
        );
      })}
    </div>
  );
}
