import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { PolicyBanner } from "@/components/credit/PolicyBanner";
import { CreditNav } from "@/components/credit/CreditNav";
import { getCreditPolicy, policyRobots } from "@/content/credit-policy";

export const metadata: Metadata = {
  title: "Loan eligibility",
  description:
    "Membership, savings, contribution history, guarantor and security requirements for borrowing from the CBN Staff Multipurpose Cooperative Society.",
  alternates: { canonical: "/services/credit/eligibility" },
  robots: policyRobots(),
};

export default function EligibilityPage() {
  const policy = getCreditPolicy();
  const { application, overview } = policy;

  return (
    <>
      <PageHero
        eyebrow="Credit and loans"
        title="Loan eligibility."
        intro="Membership, savings history, ability to repay and security decide whether a request can be approved. These are the requirements the policy sets, in the policy's own terms."
        crumbs={[
          { label: "Services", href: "/services" },
          { label: "Credit and loans", href: "/services/credit" },
          { label: "Eligibility" },
        ]}
      />

      <PolicyBanner version={policy.version} />
      <CreditNav />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <p className="max-w-3xl font-serif text-xl leading-relaxed text-navy md:text-2xl">
            {application.intro}
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-x-12">
            {application.groups.map((group) => (
              <section key={group.title} className="border-t border-line pt-6">
                <h2 className="font-serif text-2xl text-navy">{group.title}</h2>
                <dl className="mt-5 space-y-5">
                  {group.items.map((item) => (
                    <div key={item.label}>
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-600">
                        {item.label}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-slate">{item.text}</dd>
                      <dd className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                        {item.ref}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>

          <div className="mt-14 border border-line bg-bone p-6 md:p-8">
            <h2 className="font-serif text-2xl text-navy">The full assessment criteria</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">{overview.criteriaIntro}</p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
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
            <p className="mt-6 max-w-3xl border-t border-line pt-5 text-sm leading-relaxed text-slate">
              {overview.rejection}{" "}
              <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                {overview.rejectionRef}
              </span>
            </p>
          </div>

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-slate">
            Meeting these requirements does not guarantee approval. Every request is assessed on its
            own facts and within the limits for your grade.{" "}
            <Link
              href="/services/credit/limits"
              className="text-gold-600 underline underline-offset-2"
            >
              See the limits table
            </Link>
            .
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="Documentation"
        title="Check your documents before you apply."
        body="The Secretariat can confirm the forms and supporting documents for the facility you have in mind."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Read the repayment rules", href: "/services/credit/repayment" }}
      />
    </>
  );
}
