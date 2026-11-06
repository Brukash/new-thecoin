"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { primaryNav, site } from "@/content/site";
import { services } from "@/content/services";

const aboutLinks = [
  { label: "The Cooperative", href: "/about" },
  { label: "Leadership", href: "/about/leadership" },
  { label: "Organisational structure", href: "/about/structure" },
  { label: "Membership", href: "/membership" },
  { label: "Frequently asked questions", href: "/faq" },
];

const eventLinks = [
  { label: "Upcoming events", href: "/events" },
  { label: "Past events", href: "/events/past" },
  { label: "Announcements", href: "/events/announcements" },
  { label: "Event gallery", href: "/events/gallery" },
];

const creditLinks = [
  { label: "Credit overview", href: "/services/credit" },
  { label: "Types of loans", href: "/services/credit/loans" },
  { label: "Loan eligibility", href: "/services/credit/eligibility" },
  { label: "Repayment conditions", href: "/services/credit/repayment" },
  { label: "Global loan limits", href: "/services/credit/limits" },
  { label: "Credit FAQs", href: "/services/credit/faq" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSection(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const headerRef = useRef<HTMLElement | null>(null);
  const [panelTop, setPanelTop] = useState(0);

  useEffect(() => {
    if (!open) return;
    const el = headerRef.current;
    const measure = () => {
      if (el) setPanelTop(el.getBoundingClientRect().bottom);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  const toggleMenu = () => {
    if (!open) setPanelTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
    setOpen((v) => !v);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Utility bar — the portals members actually use */}
      <div className="bg-ink text-white/70">
        <div className="shell flex h-10 items-center justify-between gap-6 text-[11px] tracking-wide">
          <div className="flex items-center gap-5">
            <a
              className="hidden items-center gap-2 transition-colors hover:text-gold-200 sm:inline-flex"
              href={`tel:${site.contact.phones[0].value.replace(/\s/g, "")}`}
            >
              <Phone className="size-3" aria-hidden />
              <span>{site.contact.phones[0].value}</span>
            </a>
            <a
              className="hidden transition-colors hover:text-gold-200 md:inline"
              href={`mailto:${site.contact.emails[0].value}`}
            >
              {site.contact.emails[0].value}
            </a>
            <span className="sm:hidden">Member-owned. Member-focused.</span>
          </div>

          <nav aria-label="Member portals" className="flex items-center gap-5">
            {site.portals.map((portal) => (
              <a
                key={portal.href}
                href={portal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold-200"
              >
                {portal.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <header
        ref={headerRef}
        className={`sticky top-0 z-50 border-b bg-white transition-all duration-300 ${
          scrolled ? "border-line shadow-[0_10px_30px_-24px_rgba(8,16,31,0.5)]" : "border-line/70"
        }`}
      >
        <div className="shell flex items-center justify-between gap-8">
          <div
            className={`flex items-center transition-all duration-300 ${
              scrolled ? "py-3" : "py-4 md:py-5"
            }`}
          >
            <Link href="/" aria-label={`${site.shortName} home`} className="block">
              <Image
                src="/images/logo.png"
                alt="CBN Staff Multipurpose Cooperative Society Ltd"
                width={828}
                height={178}
                priority
                className="h-9 w-auto md:h-11"
              />
            </Link>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex xl:gap-5">
            {primaryNav.map((item) => {
              const hasMenu =
                item.label === "About" || item.label === "Services" || item.label === "Events";
              const menu =
                item.label === "About" ? aboutLinks : item.label === "Events" ? eventLinks : null;

              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1 py-2 text-[12.5px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                      isActive(item.href) ? "text-navy" : "text-slate hover:text-navy"
                    }`}
                  >
                    {item.label}
                    {hasMenu && (
                      <ChevronDown
                        className="size-3.5 opacity-50 transition-transform group-hover:rotate-180"
                        aria-hidden
                      />
                    )}
                  </Link>
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gold transition-transform duration-300 ${
                      isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />

                  {item.label === "Services" && (
                    <div className="invisible absolute left-0 top-full w-[30rem] translate-y-1 border border-line bg-white p-2 opacity-0 shadow-[0_30px_60px_-30px_rgba(8,16,31,0.45)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <ul className="grid grid-cols-2 gap-0.5">
                        {services.map((service) => (
                          <li key={service.slug}>
                            <Link
                              href={`/services/${service.slug}`}
                              className="block px-3 py-2.5 text-[13px] text-slate transition-colors hover:bg-bone hover:text-navy"
                            >
                              <span className="mr-2 font-mono text-[10px] text-gold-600">
                                {service.index}
                              </span>
                              {service.shortTitle}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-line p-2">
                        <p className="px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                          Credit policy
                        </p>
                        <ul className="grid grid-cols-2 gap-0.5">
                          {creditLinks.map((entry) => (
                            <li key={entry.href}>
                              <Link
                                href={entry.href}
                                className="block px-2 py-1.5 text-[12px] text-slate transition-colors hover:bg-bone hover:text-navy"
                              >
                                {entry.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {menu && (
                    <div className="invisible absolute left-0 top-full w-64 translate-y-1 border border-line bg-white p-2 opacity-0 shadow-[0_30px_60px_-30px_rgba(8,16,31,0.45)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <ul>
                        {menu.map((entry) => (
                          <li key={entry.href}>
                            <Link
                              href={entry.href}
                              className="block px-3 py-2.5 text-[13px] text-slate transition-colors hover:bg-bone hover:text-navy"
                            >
                              {entry.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.registration.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary hidden shrink-0 xl:inline-flex"
            >
              Become a member
              <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex size-11 items-center justify-center border border-line text-navy transition-colors hover:border-navy lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        hidden={!open}
        style={{ top: panelTop }}
        className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-white lg:hidden"
      >
        <div className="shell py-6">
          <ul className="divide-y divide-line">
            {primaryNav.map((item) => {
              const menu =
                item.label === "About"
                  ? aboutLinks
                  : item.label === "Events"
                    ? eventLinks
                    : item.label === "Services"
                      ? creditLinks
                      : null;
              const expanded = section === item.label;

              return (
                <li key={item.href} className="py-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className="flex-1 py-3 font-serif text-xl text-navy"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {menu && (
                      <button
                        type="button"
                        onClick={() => setSection(expanded ? null : item.label)}
                        aria-expanded={expanded}
                        aria-label={`Toggle ${item.label} submenu`}
                        className="p-2 text-slate"
                      >
                        <ChevronDown
                          className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  {menu && expanded && (
                    <ul className="pb-3 pl-4">
                      {menu.map((entry) => (
                        <li key={entry.href}>
                          <Link
                            href={entry.href}
                            className="block py-2 text-sm text-slate"
                            onClick={() => setOpen(false)}
                          >
                            {entry.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid gap-2">
            <a
              href={site.registration.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={() => setOpen(false)}
            >
              Become a member
              <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={site.portals[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Member portal (Coopman)
            </a>
          </div>

          <div className="mt-8 space-y-1 text-sm text-slate">
            <p className="font-semibold text-navy">Talk to us</p>
            {site.contact.phones.map((phone) => (
              <p key={phone.value}>
                {phone.label}: {phone.value}
              </p>
            ))}
            <p>{site.contact.emails[0].value}</p>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
