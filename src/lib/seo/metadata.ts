import { site } from "@/content/site";

/**
 * Share-card defaults.
 *
 * A page-level `openGraph` object replaces the root layout's rather than merging
 * into it, so any route that sets its own title there loses the site card
 * unless it also names an image. These helpers keep that fallback in one place
 * instead of repeating the dimensions on every route.
 */

export const DEFAULT_OG_IMAGE = {
  url: "/images/og-default.jpg",
  width: 1200,
  height: 630,
  alt: site.name,
};

type ShareImage = string | { url: string; width: number; height: number; alt: string };

/** The record's own image, or the site card when it has none. */
export function shareImages(image?: string | null): ShareImage[] {
  return image ? [image] : [DEFAULT_OG_IMAGE];
}

/** A single URL, for the platforms that take one. */
export function shareImageUrl(image?: string | null): string {
  return image || DEFAULT_OG_IMAGE.url;
}
