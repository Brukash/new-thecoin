import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { PartnerMark } from "@/components/PartnerMark";
import { listPartners, type Partner } from "@/lib/cms/partners";
import { PARTNER_CATEGORIES } from "@/content/partners";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fund managers and financial partners",
  description:
    "The banks, fund managers and financial institutions listed in the CBN Staff Multipurpose Cooperative Society's partner directory.",
  alternates: { canonical: "/partners" },
};

const institutional = [
  {
    name: "Enterprise Development Centre, Pan-Atlantic University",
    role: "Enterprise development partner",
    body: "A Memorandum of Understanding was signed to strengthen the cooperative as an economic tool for national development.",
  },
  {
    name: "Pro-Serve Integrated Services Limited",
    role: "Partnership delivery",
    body: "Signatory to the same Memorandum of Understanding, supporting delivery of the enterprise development programme.",
  },
  {
    name: "Houses for Africa Nigeria Limited",
    role: "Project developer",
    body: "Project agreement for the River Park II project (terraces and blocks of flats, Abuja), partly financed through the National Housing Fund.",
  },
];

const CATEGORY_ORDER: string[] = [...PARTNER_CATEGORIES];

function PartnerTile({ partner }: { partner: Partner }) {
  const darkTile = partner.logoBackground === "dark";

  const frame = `flex h-full min-h-[6.5rem] w-full items-center justify-center border border-line px-4 py-5 transition duration-300 hover:border-gold/70 hover:shadow-[0_1px_0_0_rgba(0,0,0,0.04)] sm:min-h-[7.5rem] ${
    darkTile ? "bg-navy" : "bg-white"
  }`;

  const mark = partner.logoUrl ? (
    <PartnerMark src={partner.logoUrl} alt={`${partner.organisationName} logo`} />
  ) : (
    <span className="flex flex-col items-center gap-1 text-center">
      <span className={`font-serif text-sm leading-tight ${darkTile ? "text-white" : "text-navy"}`}>
        {partner.organisationName}
      </span>
      <span
        className={`text-[9px] uppercase tracking-[0.12em] ${
          darkTile ? "text-white/60" : "text-slate/60"
        }`}
      >
        Logo pending
      </span>
    </span>
  );

  const title = partner.description
    ? `${partner.organisationName} — ${partner.description}`
    : partner.organisationName;

  return (
    <li className="h-full">
      {partner.websiteUrl ? (
        <a
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          className={frame}
        >
          {mark}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <div className={frame} title={title}>
          {mark}
        </div>
      )}
    </li>
  );
}

export default async function PartnersPage() {
  const partners = await listPartners();

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: partners.filter((partner) => partner.category === category),
  })).filter((group) => group.items.length > 0);

  const other = partners.filter((partner) => !CATEGORY_ORDER.includes(partner.category));
  if (other.length) groups.push({ category: "Other institutions", items: other });

  return (
    <>
      <PageHero
        eyebrow="Institutional relationships"
        title="Our Fund Managers and Financial Partners"
        intro="We work with established financial institutions and investment management organisations to support responsible financial management, investment opportunities and sustainable wealth creation."
        crumbs={[{ label: "Partners" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">The directory</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              The institutions on our panel.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate md:text-base">
              Organisations are grouped by the role they play. Select a logo to open the
              institution&rsquo;s own website.
            </p>
          </div>

          {groups.length === 0 ? (
            <p className="mt-10 border border-line bg-bone px-5 py-6 text-sm text-slate">
              The directory is being updated. Please check back shortly.
            </p>
          ) : null}

          {groups.map((group) => (
            <div key={group.category} className="mt-12">
              <h3 className="border-b border-line pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                {group.category}
              </h3>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {group.items.map((partner) => (
                  <PartnerTile key={partner.slug} partner={partner} />
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-14 max-w-2xl">
            <p className="eyebrow">Institutional &amp; delivery</p>
            <h2 className="display mt-5 text-[1.9rem] leading-tight text-navy md:text-[2.4rem]">
              Institutions and developers.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {institutional.map((partner, index) => (
              <Reveal key={partner.name} delay={index * 60} as="article">
                <div className="card h-full p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                    {partner.role}
                  </p>
                  <h3 className="mt-4 font-serif text-xl leading-snug text-navy">{partner.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{partner.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex gap-3 border border-line bg-bone p-5">
            <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <p className="text-xs leading-relaxed text-slate">
              Each logo is the trademark of its owner and is reproduced here for identification
              only. The directory lists institutions supplied by the Society; inclusion does not by
              itself imply an endorsement or an active partnership beyond those the Society has
              announced. Contact the Secretariat to confirm the current status of any relationship.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Partnership"
        title="Interested in working with the Society?"
        body="Institutions with an offer relevant to members in housing, finance, enterprise or consumer services should contact the Secretariat."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "About the Society", href: "/about" }}
      />
    </>
  );
}
