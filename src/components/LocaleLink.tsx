'use client';

import NextLink from 'next/link';
import { forwardRef, type ComponentProps } from 'react';
import { localizePath } from '@/i18n/config';
import { useLocale } from '@/i18n/LocaleProvider';

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for next/link on public pages: `/blog/x` becomes
 * `/en/blog/x` or `/ne/blog/x` for the language being viewed. Dashboard,
 * sign-in and external links pass through unchanged.
 */
const LocaleLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocaleLink({ href, ...props }, ref) {
  const locale = useLocale();
  const localized =
    typeof href === 'string'
      ? localizePath(href, locale)
      : href.pathname
        ? { ...href, pathname: localizePath(href.pathname, locale) }
        : href;
  return <NextLink ref={ref} href={localized} {...props} />;
});

export default LocaleLink;
