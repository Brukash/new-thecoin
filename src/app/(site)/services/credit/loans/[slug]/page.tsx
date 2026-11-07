import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { PolicyBanner } from "@/components/credit/PolicyBanner";
import { CreditNav } from "@/components/credit/CreditNav";
import { PolicyDownload } from "@/components/credit/PolicyDownload";
import { getCreditPolicy, getFacility, policyRobots } from "@/content/credit-policy";

export function generateStaticParams() {
  return getCreditPolicy().facilities.map((facility) => ({ slug: facility.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const facility = getFacility(slug);
  if (!facility) return { title: "Facility not found" };

  return {
    title: facility.name,
    description: facility.summary,
    alternates: { canonical: `/services/credit/loans/${facility.slug}` },
    openGraph: { title: facility.name, description: facility.summary },
    robots: policyRobots(),
  };
}

export default async function FacilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const facility = getFacility(slug);
  if (!facility) notFound();

  const policy = getCreditPolicy();
  const related = policy.facilities.filter((entry) => entry.slug !== facility.slug).slice(0, 3);

  const rows: { label: string; value: string }[] = [
    { label: "Amount", value: facility.amountBasis },
    { label: "Tenor", value: facility.tenor },
    { label: "Interest", value: facility.interest },
    { label: "Security", value: facility.security },
    { label: "Guarantor", value: facility.guarantor },
    { label: "Approval", value: facility.approval },
  ];

  return (
    <>
      <PageHero
        eyebrow={facility.kind}
        title={facility.name}
        intro={facility.summary}
        crumbs={[
          { label: "Services", href: "/services" },
          { label: "Credit and loans", href: "/services/credit" },
          { label: "Types of loans", href: "/services/credit/loans" },
          { label: facility.name },
        ]}
      />

      <PolicyBanner version={policy.version} />
      <CreditNav />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <article>
            <p className="font-serif text-xl leading-relaxed text-navy md:text-2xl">
              {facility.description}
            </p>

            <h2 className="mt-10 font-serif text-2xl text-navy">Who can apply</h2>
            <ul className="mt-4 space-y-3 border-t border-line pt-5">
              {facility.eligibility.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate">
                  <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-serif text-2xl text-navy">Terms at a glance</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {rows.map((row) => (
                <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate">
                    {row.label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-navy">{row.value}</dd>
                </div>
              ))}
            </dl>

            {facility.conditions.length > 0 && (
              <>
                <h2 className="mt-10 font-serif text-2xl text-navy">Conditions that apply</h2>
                <ul className="mt-4 space-y-3">
                  {facility.conditions.map((condition) => (
                    <li key={condition} className="flex gap-2.5 text-sm leading-relaxed text-slate">
                      <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                      {condition}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="mt-8 border-l-2 border-gold pl-4 text-xs leading-relaxed text-slate">
              <strong className="text-navy">Source.</strong> {facility.ref}. The wording above is
              taken from the 2026 Credit Policy. Where the policy is silent on a term, this page says
              so rather than filling the gap.
            </p>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-bone p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Policy reference
              </p>
              <p className="mt-3 font-sans text-sm text-navy">{facility.clause}</p>
              <p className="mt-1 text-xs text-slate">{facility.ref}</p>
              <Link href={policy.version.sourceFile} className="link-underline mt-5 text-[12px]">
                Open the policy
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            <div className="border border-line p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Other facilities
              </p>
              <ul className="mt-4 space-y-3">
                {related.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/services/credit/loans/${entry.slug}`}
                      className="group flex items-start justify-between gap-2 text-sm text-slate transition-colors hover:text-navy"
                    >
                      {entry.name}
                      <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-gold-600" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-ink p-6 text-white">
              <p className="font-serif text-xl text-white">Applying for this facility?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Confirm the current rate, your limit and the documents required before you commit.
              </p>
              <Link href="/contact" className="btn btn-primary mt-5 w-full">
                Contact the Secretariat
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-bone py-12">
        <div className="shell">
          <PolicyDownload version={policy.version} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
