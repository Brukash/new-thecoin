import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { PolicyBanner } from "@/components/credit/PolicyBanner";
import { CreditNav } from "@/components/credit/CreditNav";
import { LimitTable } from "@/components/credit/LimitTable";
import { PolicyDownload } from "@/components/credit/PolicyDownload";
import { getCreditPolicy, policyRobots } from "@/content/credit-policy";

export const metadata: Metadata = {
  title: "Global loan limits",
  description:
    "The Global Limit and Maximum Deductible Limit for each grade, reproduced from Schedule A of the 2026 Credit Policy.",
  alternates: { canonical: "/services/credit/limits" },
  robots: policyRobots(),
};

export default function LimitsPage() {
  const policy = getCreditPolicy();
  const { globalLimits, version } = policy;

  return (
    <>
      <PageHero
        eyebrow="Credit and loans"
        title="Global loan limits."
        intro="Two ceilings apply to every facility: the Global Limit, which caps the total a grade may hold, and the Maximum Deductible Limit, which caps what can be recovered from a member's pay."
        crumbs={[
          { label: "Services", href: "/services" },
          { label: "Credit and loans", href: "/services/credit" },
          { label: "Global limits" },
        ]}
      />

      <PolicyBanner version={version} />
      <CreditNav />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-serif text-2xl text-navy md:text-3xl">{globalLimits.title}</h2>
            <p className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate">
              {globalLimits.source}
            </p>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate">{globalLimits.intro}</p>

          <div className="mt-8">
            <LimitTable rows={globalLimits.rows} source={globalLimits.source} />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate">{globalLimits.summary}</p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            <div>
              <h3 className="font-serif text-xl text-navy">How the limits are set and changed</h3>
              <ul className="mt-4 space-y-3 border-t border-line pt-5">
                {policy.overview.limitPrinciples.map((item) => (
                  <li key={item.ref} className="text-sm leading-relaxed text-slate">
                    {item.text}{" "}
                    <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                      {item.ref}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="border border-line bg-bone p-6">
              <h3 className="font-serif text-xl text-navy">Read the table carefully</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                These figures are reproduced exactly as printed in Schedule A of the signed policy.
                They are not recalculated, rounded or adjusted. If your payslip grade is not listed,
                or a figure looks wrong, ask the Secretariat before you apply.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-slate">
                The policy does not define the final row,{" "}
                <span className="uppercase">Others</span>. The Secretariat can confirm which staff
                fall into it.
              </p>
              <Link href="/contact" className="link-underline mt-5 text-[12px]">
                Query a figure
              </Link>
            </aside>
          </div>

          <div className="mt-12">
            <PolicyDownload version={version} />
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Before you apply"
        title="Check your grade and your savings."
        body="Your limit depends on both. The Secretariat can confirm the figures that apply to you before any application is made."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Check eligibility", href: "/services/credit/eligibility" }}
      />
    </>
  );
}
