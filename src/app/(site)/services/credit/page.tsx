import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { PolicyBanner } from "@/components/credit/PolicyBanner";
import { CreditNav } from "@/components/credit/CreditNav";
import { FacilityCard } from "@/components/credit/FacilityCard";
import { PolicyDownload } from "@/components/credit/PolicyDownload";
import { formatNaira, getCreditPolicy, policyRobots } from "@/content/credit-policy";

export const metadata: Metadata = {
  title: "Credit and loan services",
  description:
    "How the CBN Staff Multipurpose Cooperative Society lends to members: the facilities available, the policy that governs them, the limits by grade and the repayment rules.",
  alternates: { canonical: "/services/credit" },
  robots: policyRobots(),
};

export default function CreditOverviewPage() {
  const policy = getCreditPolicy();
  const { version, overview, facilities, administration, internalCredits, review, globalLimits } =
    policy;

  const lowest = globalLimits.rows[globalLimits.rows.length - 1];
  const highest = globalLimits.rows[0];

  return (
    <>
      <PageHero
        eyebrow="Credit and loan services"
        title="Lending that follows a written policy."
        intro="The Society lends to members under a Credit Policy approved by the Management Committee. This section sets out the facilities, who qualifies, how repayment works and the limits that apply to each grade."
        crumbs={[{ label: "Services", href: "/services" }, { label: "Credit and loans" }]}
      />

      <PolicyBanner version={version} />
      <CreditNav />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="eyebrow">Purpose</p>
            <h2 className="mt-5 font-serif text-2xl leading-snug text-navy md:text-3xl">
              A single standard for every lending decision.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate">{overview.purpose}</p>
            <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
              Cl. 1.1.1, p. 3
            </p>
          </div>

          <div>
            <p className="eyebrow">Objectives</p>
            <p className="mt-5 text-sm leading-relaxed text-slate">{overview.objectivesIntro}</p>
            <ol className="mt-5 divide-y divide-line border-y border-line">
              {overview.objectives.map((objective, index) => (
                <li key={objective} className="flex gap-4 py-4">
                  <span className="font-sans text-[12px] text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-slate">{objective}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
              Cl. 1.1.1 (I) to (V), p. 3
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-bone py-14 md:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Facilities</p>
              <h2 className="mt-5 font-serif text-2xl text-navy md:text-3xl">
                Nine facilities in the policy.
              </h2>
            </div>
            <Link href="/services/credit/loans" className="link-underline text-[12px]">
              Compare every facility
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <ul className="mt-8 grid gap-px bg-line md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => (
              <li key={facility.slug} className="bg-white">
                <FacilityCard facility={facility} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Assessment</p>
            <h2 className="mt-5 font-serif text-2xl text-navy md:text-3xl">
              What the Society looks at.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate">{overview.criteriaIntro}</p>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {overview.criteria.map((criterion) => (
                <li key={criterion} className="flex gap-2.5 text-sm text-slate">
                  <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                  {criterion}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
              {overview.criteriaRef}
            </p>
            <p className="mt-6 border-l-2 border-gold pl-4 text-sm leading-relaxed text-slate">
              {overview.rejection}{" "}
              <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                {overview.rejectionRef}
              </span>
            </p>
          </div>

          <aside className="border border-line p-6">
            <ShieldCheck className="size-6 text-gold-600" aria-hidden />
            <h2 className="mt-4 font-serif text-xl text-navy">Limits by grade</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Every facility is also held within the Global Limit and Maximum Deductible Limit for
              the member's grade.
            </p>
            <dl className="mt-5 space-y-4 border-t border-line pt-5 text-sm">
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-slate">
                  Highest global limit, {highest?.status}
                </dt>
                <dd className="mt-1 font-serif text-xl text-navy">
                  {highest ? formatNaira(highest.globalLimit) : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-slate">
                  Lowest global limit, {lowest?.status}
                </dt>
                <dd className="mt-1 font-serif text-xl text-navy">
                  {lowest ? formatNaira(lowest.globalLimit) : "Not set"}
                </dd>
              </div>
            </dl>
            <Link href="/services/credit/limits" className="link-underline mt-6 text-[12px]">
              See the full table
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-bone py-14 md:py-20">
        <div className="shell">
          <p className="eyebrow">Administration</p>
          <h2 className="mt-5 max-w-2xl font-serif text-2xl text-navy md:text-3xl">
            Who decides what.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate">
            {administration.intro}
          </p>

          <div className="mt-8 divide-y divide-line border-y border-line bg-white">
            {administration.roles.map((role) => (
              <details key={role.role} className="group px-0 py-5 md:px-6">
                <summary className="flex cursor-pointer items-start justify-between gap-6 marker:content-none">
                  <span>
                    <span className="block font-serif text-lg text-navy">{role.role}</span>
                    <span className="mt-0.5 block font-sans text-[11px] uppercase tracking-[0.08em] text-slate">
                      Section {role.clause}
                    </span>
                  </span>
                  <span
                    className="mt-1 shrink-0 font-serif text-lg leading-none text-gold-600 transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="mt-4 max-w-3xl">
                  {role.composition && (
                    <p className="text-sm leading-relaxed text-slate">
                      <strong className="text-navy">Composition. </strong>
                      {role.composition}
                    </p>
                  )}
                  <ul className="mt-3 space-y-2">
                    {role.items.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate">
                        <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="border border-line bg-white p-6">
              <h3 className="font-serif text-lg text-navy">{internalCredits.title}</h3>
              <ul className="mt-4 space-y-3">
                {internalCredits.items.map((item) => (
                  <li key={item.ref} className="text-sm leading-relaxed text-slate">
                    {item.text}{" "}
                    <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                      {item.ref}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-line bg-white p-6">
              <h3 className="font-serif text-lg text-navy">Review of the policy</h3>
              <ul className="mt-4 space-y-3">
                {review.items.map((item) => (
                  <li key={item.ref} className="text-sm leading-relaxed text-slate">
                    {item.text}{" "}
                    <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                      {item.ref}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <PolicyDownload version={version} />
        </div>
      </section>

      <CtaBand
        eyebrow="Next step"
        title="Ask before you borrow."
        body="The Secretariat will confirm the facility that fits your purpose, the limit for your grade and the documents you need."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Read the repayment rules", href: "/services/credit/repayment" }}
      />
    </>
  );
}
