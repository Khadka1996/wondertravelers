import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { generateSEOMetadata } from "@/utils/seoUtils";
import FeaturedContentClient from "./FeaturedContentPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = getDictionary(locale).meta.featured;
  return generateSEOMetadata({ title: t.title, description: t.description, slug: "/content/featured", locale });
}

export default function FeaturedContentPage() {
  return <FeaturedContentClient />;
}
