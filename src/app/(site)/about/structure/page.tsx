import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Organisational structure",
  description:
    "How the CBN Staff Multipurpose Cooperative Society is structured: the Annual General Meeting, the Management Committee, statutory officers and the Secretariat.",
  alternates: { canonical: "/about/structure" },
};

const tiers = [
  {
    level: "01",
    title: "Annual General Meeting",
    who: "The membership",
    body:
      "The AGM is the supreme authority of the Society. Members receive reports, approve accounts and direction, and elect the officers who will administer the Society. The 45th AGM was held in 2026.",
  },
  {
    level: "02",
    title: "Management Committee",
    who: "Elected officers",
    body:
      "The Committee administers the Society's business between general meetings, approves products and series, and is accountable to members. It is led by the President, with two Vice Presidents.",
  },
  {
    level: "03",
    title: "Statutory offices",
    who: "Financial Secretary · Treasurer · Compliance",
    body:
      "Financial oversight and compliance sit with dedicated offices: the Financial Secretary, the Treasurer and Assistant Treasurer, and the Compliance Officer, alongside the General Secretary and Public Relations Officer.",
  },
  {
    level: "04",
    title: "The Secretariat",
    who: "General Manager and staff",
    body:
      "Day-to-day administration (membership processing, records, loan administration and member correspondence) is handled by the Secretariat under the General Manager.",
  },
];

export default function StructurePage() {
  return (
    <>
      <PageHero
        eyebrow="Governance"
        title="How the Society is organised."
        intro="Members set direction at the Annual General Meeting, elected officers administer the Society, and the Secretariat runs it from day to day."
        crumbs={[{ label: "About", href: "/about" }, { label: "Structure" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <ol className="relative border-l border-line pl-6 md:pl-8">
              {tiers.map((tier, index) => (
                <Reveal key={tier.level} delay={index * 60} as="li">
                  <div className="relative pb-10 last:pb-0">
                    <span className="absolute -left-[1.85rem] top-1.5 size-2.5 rotate-45 bg-gold md:-left-[2.35rem]" />
                    <p className="font-sans text-[12px] tracking-widest text-gold-600">
                      {tier.level}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl leading-snug text-navy">{tier.title}</h2>
                    <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate">
                      {tier.who}
                    </p>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">{tier.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>

          <aside className="space-y-6">
            <div className="border border-line bg-bone p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Governing documents
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                The Society's Bye-Laws and policies define membership, contributions, borrowing,
                meetings and the powers of each office. Members should read them alongside this page.
              </p>
              <a
                href={site.documents[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline mt-5 w-full"
              >
                <FileText className="size-4" aria-hidden />
                Download the Bye-Laws
              </a>
            </div>

            <div className="border border-line p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Related
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/about/leadership" className="link-underline text-[12px]">
                    Management Committee
                  </Link>
                </li>
                <li>
                  <Link href="/membership" className="link-underline text-[12px]">
                    Membership & eligibility
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="link-underline text-[12px]">
                    Frequently asked questions
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand
        eyebrow="Membership"
        title="Every member has a vote."
        body="Attendance at the Annual General Meeting is the right and the responsibility of every member in good standing."
        primary={{ label: "Membership details", href: "/membership" }}
        secondary={{ label: "Contact the Secretariat", href: "/contact" }}
      />
    </>
  );
}
