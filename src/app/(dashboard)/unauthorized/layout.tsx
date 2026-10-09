import SiteChrome from '@/components/SiteChrome';

/** Visitor-facing page outside the language tree: keep the site header and footer. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
