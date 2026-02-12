// Server-side function to generate static params
import { BLOG_POSTS } from "./page";

export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({
    slug,
  }));
}