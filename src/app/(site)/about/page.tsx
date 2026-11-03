import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { leadership, site, verifiedFacts } from "@/content/site";

export const metadata: Metadata = {
  title: "About the Society",
  description:
    "The CBN Staff Multipurpose Cooperative Society Ltd: profile, vision, mission, core values, governance, leadership and milestones.",
  alternates: { canonical: "/about" },
};

const profile = [
  { label: "Legal form", value: "Cooperative society limited" },
  { label: "Membership", value: "CBN staff, retirees and staff on secondment" },
  { label: "Governance", value: "Management Committee & Annual General Meeting" },
  { label: "Secretariat", value: "Garki II, Abuja" },
  { label: "Established practice", value: "Thrift, credit, investment and property" },
];

const milestones = [
  {
    year: "2016",
    title: "Consumer operations begin",
    body: "The Society introduces the Annual Exhibition and Consumer Fair for members, later evolving into the online Coop E-Mall.",
  },
  {
    year: "2021",
    title: "Coop Investment Fund 2021–2025 Classic approved",
    body: "The Management Committee approves a new four-year series of the Coop Investment Fund for members.",
  },
  {
    year: "2024",
    title: "Series D closes; Classic Diamond opens",
    body: "Series D marked its fourth anniversary on 31 January 2024, and the Classic Diamond Series (2024–2028) was opened for existing investors.",
  },
  {
    year: "2025",
    title: "EDC partnership and the 44th AGM",
    body: "The Society signed a Memorandum of Understanding with the Enterprise Development Centre of Pan-Atlantic University and Pro-Serve Integrated Services Ltd, and held its 44th Annual General Meeting on 30 May 2025.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The cooperative"
        title="A member-owned institution, accountable to its members."
        intro="CBN Coop is a multipurpose cooperative society serving the Central Bank of Nigeria community. Its business is member welfare: savings discipline, affordable credit, investment series and property that members can actually own."
        crumbs={[{ label: "About" }]}
        image="/images/hero/p5.jpg"
        imageAlt="City skyline at dusk"
      />

      {/* Profile + narrative */}
      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Corporate profile</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.5rem]">
              Built by members, for members, across four decades of general meetings.
            </h2>

            <div className="prose-coop mt-8">
              <p>
                The CBN Staff Multipurpose Cooperative Society Limited exists to improve the
                well-being of its members. As a multipurpose society it holds members' savings,
                extends credit, runs investment series, negotiates property, and organises consumer
                access to goods and services.
              </p>
              <p>
                The Society held its 44th Annual General Meeting in May 2025, in a line of general
                meetings that runs back to its founding.
              </p>
              <p>
                Decisions sit with a Management Committee elected from the membership. The Committee
                administers the Society under its Bye-Laws, and answers to the Annual General Meeting
                where members approve reports and set direction.
              </p>
              <p>
                Over the past 15 years, more than 2,000 members have been supported into home
                ownership through schemes facilitated by the Cooperative.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about/leadership" className="btn btn-outline">
                Management Committee
              </Link>
              <a
                href={site.documents[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <FileText className="size-4" aria-hidden />
                Bye-Laws & policies
              </a>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-bone p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                At a glance
              </p>
              <dl className="mt-5 space-y-4">
                {profile.map((row) => (
                  <div key={row.label} className="border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-[11px] uppercase tracking-[0.1em] text-slate">{row.label}</dt>
                    <dd className="mt-1 text-sm font-medium text-navy">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 border border-line p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Explore
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  { label: "Organisational structure", href: "/about/structure" },
                  { label: "Management Committee", href: "/about/leadership" },
                  { label: "Membership & eligibility", href: "/membership" },
                  { label: "Frequently asked questions", href: "/faq" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between gap-2 text-slate transition-colors hover:text-navy"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3.5 text-gold-600" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Vision / mission */}
      <section className="bg-navy py-16 text-white md:py-20">
        <div className="shell grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="eyebrow eyebrow-invert">Our vision</p>
            <p className="mt-5 font-serif text-2xl leading-relaxed text-white md:text-[1.75rem]">
              {site.vision}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="eyebrow eyebrow-invert">Our mission</p>
            <p className="mt-5 font-serif text-2xl leading-relaxed text-white md:text-[1.75rem]">
              {site.mission}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Core values */}
      <section className="bg-white py-16 md:py-24">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">Core values</p>
            <h2 className="display mt-5 text-[2rem] leading-tight text-navy md:text-[2.5rem]">
              The five values the Society publishes.
            </h2>
          </div>

          <div className="mt-12 grid gap-px bg-line md:grid-cols-2">
            {site.values.map((value, index) => (
              <Reveal key={value.title} delay={index * 55} as="article">
                <div className="h-full bg-white p-7 md:p-9">
                  <span className="font-mono text-[11px] tracking-widest text-gold-600">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 font-serif text-xl text-navy">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{value.body}</p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={site.values.length * 55}>
              <div className="flex h-full flex-col justify-between bg-navy p-7 text-white md:p-9">
                <p className="eyebrow eyebrow-invert">Measured</p>
                <div className="mt-6">
                  {verifiedFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex items-baseline gap-4 border-b border-white/10 py-3 last:border-0"
                    >
                      <span className="w-20 font-serif text-xl text-gold-200">{fact.value}</span>
                      <span className="text-xs leading-relaxed text-white/60">{fact.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="border-y border-line bg-bone py-16 md:py-24">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">Milestones</p>
            <h2 className="display mt-5 text-[2rem] leading-tight text-navy md:text-[2.5rem]">
              Recent milestones.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate">
              Entries below are drawn from notices published to members. Earlier milestones will be
              added once the Society's archive is confirmed.
            </p>
          </div>

          <ol className="mt-12 border-t border-navy/15">
            {milestones.map((milestone, index) => (
              <Reveal key={milestone.year} delay={index * 60} as="li">
                <div className="grid gap-3 border-b border-navy/15 py-6 md:grid-cols-[8rem_1fr] md:gap-8">
                  <span className="font-serif text-2xl text-gold-600">{milestone.year}</span>
                  <div>
                    <h3 className="font-serif text-xl text-navy">{milestone.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
                      {milestone.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <p className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate">
            <ArrowRight className="size-3.5 text-gold-600" aria-hidden />
            Key: {leadership.length} Management Committee offices are published on this site.
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="Next step"
        title="Learn how the Society works."
        body="Read what members can use, or take a question straight to the Secretariat."
        primary={{ label: "Explore services", href: "/services" }}
        secondary={{ label: "Membership details", href: "/membership" }}
      />
    </>
  );
}
