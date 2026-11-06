import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Landmark,
  LineChart,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { ArticleCard } from "@/components/ArticleCard";
import { EnquiryForm } from "@/components/EnquiryForm";
import { site, verifiedFacts } from "@/content/site";
import { listArticles, listProjects, listServices } from "@/content/queries";
import { listPartners } from "@/lib/cms/partners";
import { PartnerMark } from "@/components/PartnerMark";
import { HomepageEvent } from "@/components/events/HomepageEvent";
import { listAnnouncements, listEvents } from "@/lib/cms/events";
import { featuredEventOf } from "@/lib/events/format";

export const revalidate = 60;

const pillars = [
  {
    icon: ShieldCheck,
    title: "Governed by the Bye-Laws",
    body: "A Management Committee elected by members administers the Society under its Bye-Laws, with an Annual General Meeting accountable to the membership.",
  },
  {
    icon: Wallet,
    title: "Funded by member savings",
    body: "Thrift contributions from serving and retired members form the pool that funds member credit and the Society's projects.",
  },
  {
    icon: Building2,
    title: "Assets members own",
    body: "Home ownership and asset acquisition schemes have supported more than 2,000 members over 15 years of facilitated projects.",
  },
  {
    icon: LineChart,
    title: "Investments with a term",
    body: "The Coop Investment Fund runs in defined series, approved by the Management Committee and reported to members.",
  },
];

const digital = [
  {
    ...site.portals[0],
    icon: Users,
  },
  {
    ...site.portals[1],
    icon: ShoppingBag,
  },
  {
    ...site.portals[2],
    icon: Landmark,
  },
];

export default async function HomePage() {
  const partners = await listPartners();
  const [events, notices] = await Promise.all([listEvents(), listAnnouncements({ limit: 6 })]);

  const featuredEvent = featuredEventOf(events);

  const urgentNotice = notices.find((notice) => notice.urgent) ?? null;

  const [services, articles, projects] = await Promise.all([
    listServices(),
    listArticles().then((entries) => entries.slice(0, 3)),
    listProjects().then((entries) => entries.slice(0, 3)),
  ]);
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <>
      {urgentNotice ? (
        <div className="border-b border-gold/40 bg-gold-50">
          <div className="shell flex flex-wrap items-center justify-between gap-3 py-3">
            <p className="text-[12px] leading-relaxed text-navy">
              <span className="mr-2 bg-red-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                Urgent
              </span>
              <Link href={`/events/announcements/${urgentNotice.slug}`} className="underline-offset-2 hover:underline">
                {urgentNotice.title}
                {urgentNotice.shortDescription ? ` — ${urgentNotice.shortDescription}` : ""}
              </Link>
            </p>
            <Link
              href={`/events/announcements/${urgentNotice.slug}`}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-navy"
            >
              Read the notice
            </Link>
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />

        <div className="relative grid lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 md:px-12 lg:py-20 xl:pl-[max(3rem,calc((100vw-78rem)/2+3rem))]">
            <div className="animate-[fadeIn_0.7s_ease-out]">
              <p className="eyebrow eyebrow-invert">Member-owned cooperative · Abuja</p>

              <h1 className="display mt-6 text-[2.5rem] leading-[1.02] text-white sm:text-[3.25rem] lg:text-[3.75rem]">
                A cooperative built
                <br />
                for the long term.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                The CBN Staff Multipurpose Cooperative Society serves serving staff, retirees and
                staff on secondment with disciplined savings, member credit, investment funds and
                home ownership.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={site.registration.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Become a member
                  <ArrowRight className="size-4" aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <Link href="/projects" className="btn btn-outline-invert">
                  Explore property projects
                </Link>
              </div>

              <ul className="mt-10 grid gap-2.5 text-sm text-white/60 sm:grid-cols-2">
                {[
                  "Savings, credit & investment",
                  "Home ownership schemes",
                  "Member portal & E-Mall",
                  "Governed by member Bye-Laws",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 shrink-0 text-gold" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative min-h-[300px] lg:min-h-[560px]">
            <Image
              src="/images/hero/head-office.jpg"
              alt="Sam Olabanji House, the CBN Staff Multipurpose Cooperative Society Secretariat"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-ink/20 lg:to-transparent"
              aria-hidden
            />
            <div className="absolute bottom-5 left-5 right-5 hidden border border-white/15 bg-ink/60 p-4 backdrop-blur-sm lg:block">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-200">Since inception</p>
              <p className="mt-1.5 font-serif text-lg text-white">
                Serving CBN staff and retirees through the cooperative model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- verified facts */}
      <section aria-label="The Society in figures" className="border-b border-line bg-white">
        <div className="shell grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4 md:py-12">
          {verifiedFacts.map((fact, index) => (
            <Reveal
              key={fact.label}
              delay={index * 70}
              className={`px-2 md:px-6 ${index !== 0 ? "md:border-l md:border-line" : ""}`}
            >
              <p className="font-serif text-3xl text-navy md:text-4xl">{fact.value}</p>
              <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-slate md:text-[13px]">
                {fact.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {featuredEvent ? <HomepageEvent event={featuredEvent} /> : null}

      {/* ------------------------------------------------------------ about */}
      <section className="bg-white py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow">The Society</p>
            <h2 className="display mt-5 text-[2rem] leading-tight text-navy md:text-[2.75rem]">
              Owned by the members it serves.
            </h2>
            <Link href="/about" className="link-underline mt-8">
              About the cooperative <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="lg:col-span-8">
            <p className="lede">
              CBN Coop improves the financial well-being of its members. It turns regular savings
              into member credit, opens investment series with defined tenors, and negotiates
              property that members could not access alone.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-slate md:text-base">
              A Management Committee elected from the membership administers the Society, and the
              Annual General Meeting holds it to account. The Bye-Laws are published, and members
              receive a report on the year's activity at each AGM.
            </p>

            <div className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Our vision
                </p>
                <p className="mt-3 font-serif text-lg leading-relaxed text-navy">{site.vision}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Our mission
                </p>
                <p className="mt-3 font-serif text-lg leading-relaxed text-navy">{site.mission}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- services */}
      <section className="bg-bone py-16 md:py-24">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">What we do</p>
              <h2 className="display mt-5 max-w-xl text-[2rem] leading-tight text-navy md:text-[2.75rem]">
                Seven services, one member relationship.
              </h2>
            </div>
            <Link href="/services" className="link-underline shrink-0">
              All services <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={index * 50} as="article">
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col bg-white p-7 transition-colors hover:bg-navy"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] tracking-widest text-gold-600 transition-colors group-hover:text-gold">
                      {service.index}
                    </span>
                    <ArrowUpRight
                      className="size-4 text-slate/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-6 font-serif text-xl leading-snug text-navy transition-colors group-hover:text-white">
                    {service.shortTitle}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate transition-colors group-hover:text-white/65">
                    {service.summary}
                  </p>
                </Link>
              </Reveal>
            ))}

            <Reveal as="article" delay={services.length * 50}>
              <Link
                href="/contact"
                className="group flex h-full flex-col justify-between bg-navy p-7 text-white"
              >
                <BadgeCheck className="size-5 text-gold" aria-hidden />
                <div className="mt-6">
                  <h3 className="font-serif text-xl leading-snug text-white">
                    Not sure which applies to you?
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    The Secretariat will walk you through the options available to your membership
                    category.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-200">
                    Talk to us <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- projects */}
      <section className="bg-white py-16 md:py-24">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Property & investment</p>
              <h2 className="display mt-5 max-w-xl text-[2rem] leading-tight text-navy md:text-[2.75rem]">
                Property offered to members through the home ownership scheme.
              </h2>
            </div>
            <Link href="/projects" className="link-underline shrink-0">
              All projects <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>

          <p className="mt-8 max-w-3xl border-l-2 border-gold/50 pl-4 text-xs leading-relaxed text-slate">
            Project pricing, unit availability and delivery schedules are confirmed by the
            Secretariat in writing. Photography is published once approved images are released by the
            Society.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- pillars */}
      <section className="border-y border-line bg-mist/60 py-16 md:py-24">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">Why CBN Coop</p>
            <h2 className="display mt-5 text-[2rem] leading-tight text-navy md:text-[2.75rem]">
              How the Society is run.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 70}>
                <div className="border-t border-navy/15 pt-6">
                  <pillar.icon className="size-5 text-gold-600" aria-hidden />
                  <h3 className="mt-5 font-serif text-lg text-navy">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{pillar.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- digital */}
      <section className="relative overflow-hidden bg-ink py-16 text-white md:py-24">
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="shell relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow eyebrow-invert">Digital transformation</p>
            <h2 className="display mt-5 text-[2rem] leading-tight text-white md:text-[2.75rem]">
              Member services, online.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/65 md:text-base">
              Member records, shopping and sales now run on dedicated platforms. This website is the
              public front door; the portals below are where members transact.
            </p>
            <p className="mt-6 max-w-lg border-l border-gold/40 pl-4 text-xs leading-relaxed text-white/45">
              Private member records and financial transactions are never handled on this public
              website.
            </p>
          </div>

          <div className="grid gap-px bg-white/10">
            {digital.map((portal) => (
              <a
                key={portal.href}
                href={portal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 bg-ink p-6 transition-colors hover:bg-navy-700"
              >
                <span className="flex size-11 shrink-0 items-center justify-center border border-gold/30 text-gold">
                  <portal.icon className="size-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {portal.label}
                  </span>
                  <span className="mt-1 block font-serif text-xl text-white">{portal.name}</span>
                  <span className="mt-1 block text-xs text-white/50">{portal.description}</span>
                </span>
                <ArrowUpRight
                  className="size-4 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                  aria-hidden
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- news */}
      <section className="bg-white py-16 md:py-24">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Notice board</p>
              <h2 className="display mt-5 max-w-xl text-[2rem] leading-tight text-navy md:text-[2.75rem]">
                Latest from the Society.
              </h2>
            </div>
            <Link href="/news" className="link-underline shrink-0">
              All news <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {featured && (
              <Reveal>
                <ArticleCard article={featured} featured />
              </Reveal>
            )}
            <div className="grid gap-6">
              {rest.map((article, index) => (
                <Reveal key={article.slug} delay={index * 60}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- partners */}
      <section className="border-t border-line bg-bone py-14">
        <div className="shell">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="eyebrow">Institutional partners</p>
              <h2 className="mt-4 font-serif text-2xl text-navy md:text-[1.75rem]">
                Institutions the Society works with.
              </h2>
            </div>
            <Link href="/partners" className="link-underline shrink-0">
              Our partners <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <ul className="mt-9 grid grid-cols-2 items-center gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
            {partners
              .filter((partner) => partner.logoUrl)
              .slice(0, 5)
              .map((partner) => (
                <li key={partner.slug} className="flex h-24 items-center justify-center bg-bone px-5">
                  <PartnerMark src={partner.logoUrl} alt={`${partner.organisationName} logo`} />
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------------- enquiry */}
      <section id="enquiry" className="bg-white py-16 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="eyebrow">Membership enquiry</p>
            <h2 className="display mt-5 text-[2rem] leading-tight text-navy md:text-[2.75rem]">
              Start a conversation with the Secretariat.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-slate md:text-base">
              Tell us what you are trying to do: join, save, borrow, invest or subscribe to a
              property. We will send your enquiry to the right desk.
            </p>

            <ul className="mt-8 space-y-4 border-t border-line pt-8">
              {[
                "Membership is open to CBN staff, retired CBN staff and CBN staff on secondment.",
                "Applications are made on the Society's membership form and confirmed before processing.",
                "Existing members can use the Coopman portal for records, statements and loan status.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 bg-bone p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Already a member?
              </p>
              <a
                href={site.portals[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-serif text-lg text-navy hover:text-gold-600"
              >
                Sign in to Coopman <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          <EnquiryForm defaultType="membership" />
        </div>
      </section>
    </>
  );
}
