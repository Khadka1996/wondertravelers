'use client';

import Link from '@/components/LocaleLink';
import { useDictionary } from '@/i18n/LocaleProvider';

export default function NotFound() {
  const t = useDictionary();
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-bold text-sky-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">{t.common.notFoundTitle}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t.common.notFoundText}</p>
      <Link href="/" className="inline-block mt-8 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700">
        {t.common.goHome}
      </Link>
    </section>
  );
}
