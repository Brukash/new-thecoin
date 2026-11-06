import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone } from "lucide-react";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { NewsletterForm } from "./NewsletterForm";

const socialIcon = {
  Facebook: Facebook,
  Instagram: Instagram,
  LinkedIn: Linkedin,
} as const;

const quickLinks = [
  { label: "About the Society", href: "/about" },
  { label: "Leadership", href: "/about/leadership" },
  { label: "Membership", href: "/membership" },
  { label: "Projects", href: "/projects" },
  { label: "Events & announcements", href: "/events" },
  { label: "News", href: "/news" },
  { label: "Partners", href: "/partners" },
  { label: "Frequently asked questions", href: "/faq" },
  { label: "Contact us", href: "/contact" },
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
          <div>
            <Image
              src="/images/logo.png"
              alt={site.name}
              width={828}
              height={178}
              className="h-11 w-auto brightness-0 invert"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              A member-owned cooperative serving CBN staff, retirees and staff on secondment with
              savings, credit, investment and home ownership services.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {site.social.map((channel) => {
                const Icon = socialIcon[channel.label as keyof typeof socialIcon];
                return (
                  <a
                    key={channel.href}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={channel.label}
                    className="inline-flex size-9 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold-200"
                  >
                    {Icon ? <Icon className="size-4" /> : <span className="text-xs">WA</span>}
                  </a>
                );
              })}
            </div>
          </div>

          <nav aria-label="Services">
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-200">
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
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-200">
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
            <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-200">
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
                      className="block break-all transition-colors hover:text-white"
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
