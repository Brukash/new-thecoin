import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

/**
 * Interior page masthead. Uses a navy panel with an optional supporting image,
 * carrying the breadcrumb trail and the page's own headline.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      {image && (
        <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block" aria-hidden>
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="46vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        </div>
      )}

      <div className="shell relative py-14 md:py-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-white/50">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-200">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3 text-white/30" aria-hidden />
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-gold-200">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-gold-200">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <p className="eyebrow eyebrow-invert">{eyebrow}</p>
        <h1 className="display mt-5 max-w-3xl text-[2.25rem] text-white md:text-[3.25rem]">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
