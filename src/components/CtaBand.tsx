import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/content/site";

/** Closing call-to-action band used across the site. */
export function CtaBand({
  eyebrow = "Membership",
  title = "Speak with the Secretariat.",
  body = "Ask about savings, credit, investment or a property subscription. We will tell you what is available and what it requires.",
  primary = { label: "Start a membership enquiry", href: "/membership" },
  secondary = { label: "Contact the Secretariat", href: "/contact" },
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 hidden size-[420px] -translate-y-1/2 rounded-full border border-gold/20 md:block"
        aria-hidden
      />

      <div className="shell relative grid gap-8 py-16 md:grid-cols-[1.4fr_1fr] md:items-center md:py-20">
        <div>
          <p className="eyebrow eyebrow-invert">{eyebrow}</p>
          <h2 className="mt-4 max-w-xl text-[1.75rem] leading-tight text-white md:text-[2.5rem]">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">{body}</p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <Link href={primary.href} className="btn btn-primary w-full md:w-auto">
            {primary.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href={secondary.href} className="btn btn-outline-invert w-full md:w-auto">
            {secondary.label}
          </Link>
          <a
            href={`tel:${site.contact.phones[0].value.replace(/\s/g, "")}`}
            className="mt-1 inline-flex items-center gap-2 text-xs tracking-wide text-white/60 transition-colors hover:text-white"
          >
            <Phone className="size-3.5" aria-hidden />
            {site.contact.phones[0].value}
          </a>
        </div>
      </div>
    </section>
  );
}
