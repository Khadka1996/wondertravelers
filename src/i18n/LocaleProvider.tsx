'use client';

import { createContext, useContext } from 'react';
import { defaultLocale, localizePath, type Locale } from './config';
import { getDictionary, type Dictionary } from './dictionaries';

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = (): Locale => useContext(LocaleContext);

export const useDictionary = (): Dictionary => getDictionary(useLocale());

/** Returns a function that adds the current language to internal paths. */
export function useLocalizePath() {
  const locale = useLocale();
  return (href: string) => localizePath(href, locale);
}
