import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { EnquiryForm } from "@/components/EnquiryForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact the CBN Staff Multipurpose Cooperative Society Ltd at No. 9 Zaria Street, Garki II, Abuja. Telephone, email, office hours and enquiry form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    site.contact.mapQuery,
  )}&output=embed`;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the Secretariat."
        intro="The Secretariat handles membership, records, loans, investment enquiries and project subscriptions. If you are not sure who to ask, start here."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <div className="grid gap-px bg-line sm:grid-cols-2">
              <div className="bg-white p-6">
                <MapPin className="size-5 text-gold-600" aria-hidden />
                <h2 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
                  Office
                </h2>
                <address className="mt-3 text-sm not-italic leading-relaxed text-slate">
                  {site.contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>

              <div className="bg-white p-6">
                <Phone className="size-5 text-gold-600" aria-hidden />
                <h2 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
                  Telephone
                </h2>
                <div className="mt-3 space-y-1.5 text-sm text-slate">
                  {site.contact.phones.map((phone) => (
                    <a
                      key={phone.value}
                      href={`tel:${phone.value.replace(/\s/g, "")}`}
                      className="block transition-colors hover:text-navy"
                    >
                      <span className="text-[11px] uppercase tracking-[0.08em] text-slate/70">
                        {phone.label}:
                      </span>{" "}
                      {phone.value}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6">
                <Mail className="size-5 text-gold-600" aria-hidden />
                <h2 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
                  Email
                </h2>
                <div className="mt-3 space-y-1.5 text-sm">
                  {site.contact.emails.map((email) => (
                    <a
                      key={email.value}
                      href={`mailto:${email.value}`}
                      className="block break-all text-slate transition-colors hover:text-navy"
                    >
                      {email.value}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6">
                <Clock className="size-5 text-gold-600" aria-hidden />
                <h2 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
                  Office hours
                </h2>
                <dl className="mt-3 space-y-1 text-sm text-slate">
                  {site.contact.hours.map((entry) => (
                    <div key={entry.days}>
                      <dt className="text-[11px] uppercase tracking-[0.08em] text-slate/70">
                        {entry.days}
                      </dt>
                      <dd>{entry.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="mt-6 border border-line p-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
                Follow the Society
              </h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {site.social.map((channel) => (
                  <li key={channel.href}>
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate transition-colors hover:text-navy"
                    >
                      {channel.label}
                      <ArrowUpRight className="size-3.5 text-gold-600" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border border-line bg-bone p-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
                Member services
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                For statements, records and loan status, use the member portal. The public website
                never displays private member or financial information.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {site.portals.map((portal) => (
                  <a
                    key={portal.href}
                    href={portal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline text-[11px]"
                  >
                    {portal.name}
                  </a>
                ))}
              </div>
              <Link href="/faq" className="link-underline mt-5">
                Read the FAQ
              </Link>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-navy md:text-3xl">Send an enquiry</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Every enquiry is recorded and routed to the appropriate desk. We respond during office
              hours.
            </p>
            <div className="mt-6">
              <EnquiryForm defaultType="general" />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Office location" className="border-t border-line bg-bone">
        <div className="shell py-10">
          <div className="flex flex-col justify-between gap-4 pb-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Find us</p>
              <h2 className="mt-3 font-serif text-2xl text-navy">Garki II, Abuja</h2>
              <p className="mt-1 text-sm text-slate">{site.contact.address}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.contact.mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              Open in Google Maps <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </div>

          <div className="aspect-[16/9] w-full overflow-hidden border border-line bg-mist md:aspect-[21/9]">
            <iframe
              src={mapSrc}
              title="Map showing the CBN Staff Multipurpose Cooperative Society office in Garki II, Abuja"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
