import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Thrift and credit, savings, loans, investment funds, financial advisory, home ownership and consumer operations offered to members by the CBN Staff Multipurpose Cooperative Society.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Member services"
        title="Services available to members."
        intro="A member can start with a monthly thrift contribution and work towards a home. Each service below is open to members, and the Secretariat confirms the terms before you commit."
        crumbs={[{ label: "Services" }]}
        image="/images/hero/p6.jpg"
        imageAlt="Institutional office interior"
      />

      <section className="bg-white py-16 md:py-20">
        <div className="shell">
          <div className="mb-8 flex flex-col gap-4 border border-line bg-bone p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Credit and loans
              </p>
              <p className="mt-2 max-w-2xl font-serif text-xl leading-snug text-navy">
                The 2026 Credit Policy in full: facilities, eligibility, repayment and limits by
                grade.
              </p>
            </div>
            <Link href="/services/credit" className="btn btn-outline shrink-0">
              Open the credit section
            </Link>
          </div>

          <div className="grid gap-px bg-line md:grid-cols-2">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={index * 45} as="article">
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col bg-white p-7 transition-colors hover:bg-bone md:p-9"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] tracking-widest text-gold-600">
                      {service.index}
                    </span>
                    <ArrowUpRight
                      className="size-4 text-slate/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-600"
                      aria-hidden
                    />
                  </div>

                  <h2 className="mt-6 font-serif text-2xl leading-snug text-navy">
                    {service.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">{service.summary}</p>

                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4">
                    {service.facts?.slice(0, 2).map((fact) => (
                      <span key={fact.label} className="text-[11px] uppercase tracking-[0.1em] text-slate">
                        <span className="block text-navy">{fact.value}</span>
                        {fact.label}
                      </span>
                    ))}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-slate">
            Interest rates, eligibility thresholds and project pricing are not published on this
            website. They are confirmed in writing by the Secretariat so that members rely on
            approved terms rather than assumptions.
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="Guidance"
        title="Speak to someone before you decide."
        body="The Secretariat can explain which service fits your membership category, what it requires, and what documentation you will need."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Read the FAQ", href: "/faq" }}
      />
    </>
  );
}
