import en from './dictionaries/en.json';
import ne from './dictionaries/ne.json';
import type { Locale } from './config';

export type Dictionary = typeof en;

// Both files are small, so they are bundled; ne must have the same keys as en.
const dictionaries: Record<Locale, Dictionary> = { en, ne };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Fills `{name}` placeholders: format('Hi {name}', { name: 'Ram' }). */
export const format = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
