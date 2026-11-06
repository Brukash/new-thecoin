import Image from "next/image";

/**
 * A partner logo inside a fixed-height tile.
 *
 * SVG is served as a plain image because the Next.js optimiser refuses SVG by
 * default, and partner artwork is often vector. Raster logos go through the
 * optimiser. Both keep their intrinsic aspect ratio (`object-contain`), and the
 * tile has a fixed minimum height, so the grid does not shift while loading.
 *
 * No filters are applied: official brand colours stay exactly as supplied.
 */
export function PartnerMark({ src, alt }: { src: string; alt: string }) {
  const className = "max-h-14 w-auto max-w-full object-contain";

  if (/\.svg(\?|$)/i.test(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={320} height={96} className={className} loading="lazy" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={320}
      height={120}
      className={className}
      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 28vw, 18vw"
    />
  );
}
