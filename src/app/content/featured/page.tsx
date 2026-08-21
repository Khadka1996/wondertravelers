import type { Metadata } from "next";
import FeaturedContentClient from "./FeaturedContentPage";

export const metadata: Metadata = {
  title: "Featured Content | WonderTravelers",
  description: "Explore featured travel stories and news from WonderTravelers.",
};

export default function FeaturedContentPage() {
  return <FeaturedContentClient />;
}
