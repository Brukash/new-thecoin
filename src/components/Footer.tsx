import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone } from "lucide-react";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { NewsletterForm } from "./NewsletterForm";

/** Lucide ships no WhatsApp mark, so it is drawn here at the same optical weight. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const socialIcon = {
  Facebook: Facebook,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  WhatsApp: WhatsAppIcon,
} as const;

const quickLinks = [
  { label: "About the Society", href: "/about" },
  { label: "Leadership", href: "/about/leadership" },
  { label: "Membership", href: "/membership" },
  { label: "Projects", href: "/projects" },
  { label: "Project map", href: "/projects/map" },
  { label: "Document centre", href: "/documents" },
  { label: "Events & announcements", href: "/events" },
  { label: "News", href: "/news" },
  { label: "Partners", href: "/partners" },
  { label: "Frequently asked questions", href: "/faq" },
  { label: "Contact us", href: "/contact" },
  { label: "Track an enquiry", href: "/track" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="relative">
        {/* Newsletter */}
        <div className="border-b border-white/10">
          <div className="shell grid gap-6 py-10 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
            <div>
              <p className="eyebrow eyebrow-invert">Stay informed</p>
              <h2 className="mt-3 font-serif text-2xl text-white md:text-[1.75rem]">
                Society notices, delivered to your inbox.
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60">
                Monthly updates on announcements, investment series, project milestones and member
                services.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>              <Image
                src="/images/logo-reversed.png"
                alt={site.name}
                width={828}
                height={178}
                className="h-11 w-auto"
              />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              A member-owned cooperative serving CBN staff, retirees and staff on secondment with
              savings, credit, investment and home ownership services.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {site.social.map((channel) => {
                const Icon = socialIcon[channel.label as keyof typeof socialIcon] ?? WhatsAppIcon;
                return (
                  <a
                    key={channel.href}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={channel.label}
                    className="inline-flex size-9 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold-200"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <nav aria-label="Services">
            <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-200">
              Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {service.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Quick links">
            <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-200">
              The Society
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-200">
              Contact
            </h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span className="leading-relaxed">
                  {site.contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>
                  {site.contact.phones.map((phone) => (
                    <a
                      key={phone.value}
                      href={`tel:${phone.value.replace(/\s/g, "")}`}
                      className="block transition-colors hover:text-white"
                    >
                      {phone.value}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>
                  {site.contact.emails.map((email) => (
                    <a
                      key={email.value}
                      href={`mailto:${email.value}`}
                      className="block break-words py-1 text-[14px] leading-snug transition-colors hover:text-white"
                    >
                      {email.value}
                    </a>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="shell flex flex-col gap-3 py-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {site.portals.map((portal) => (
                <a
                  key={portal.href}
                  href={portal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {portal.name}
                </a>
              ))}
              <Link href="/admin" className="transition-colors hover:text-white">
                Staff console
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
