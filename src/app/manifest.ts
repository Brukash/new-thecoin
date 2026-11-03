import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Web app manifest — served at /manifest.webmanifest.
 *
 * Icons are generated from the Cooperative seal by scripts/generate-favicons.mjs.
 * The 512px icon doubles as the maskable variant: the seal is inset to 80% of the
 * canvas so Android's mask never clips the ring of text.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.legalName,
    short_name: "CBN Coop",
    description: site.description,
    lang: "en-NG",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#0a1628",
    categories: ["finance", "business"],
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
