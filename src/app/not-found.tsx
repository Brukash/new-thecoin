import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="shell relative max-w-2xl">
        <p className="eyebrow eyebrow-invert">Error 404</p>
        <h1 className="display mt-5 text-[2.5rem] leading-tight text-white md:text-[3.5rem]">
          This page could not be found.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/65">
          It may have moved when the site was rebuilt. These links will take you back to the main
          sections.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to home <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/contact" className="btn btn-outline-invert">
            Contact the Secretariat
          </Link>
        </div>

        <nav aria-label="Useful links" className="mt-12 border-t border-white/10 pt-6">
          <ul className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              { label: "Services", href: "/services" },
              { label: "Projects", href: "/projects" },
              { label: "Membership", href: "/membership" },
              { label: "News & announcements", href: "/news" },
              { label: "About the Society", href: "/about" },
              { label: "FAQ", href: "/faq" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-gold-200"
                >
                  {link.label}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
