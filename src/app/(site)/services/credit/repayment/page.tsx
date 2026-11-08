import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { PolicyBanner } from "@/components/credit/PolicyBanner";
import { CreditNav } from "@/components/credit/CreditNav";
import { getCreditPolicy, policyRobots, type RefBlock } from "@/content/credit-policy";

export const metadata: Metadata = {
  title: "Loan repayment",
  description:
    "Repayment periods, accepted repayment sources, default and recovery steps, and the separate rules for retirees and pensioners under the 2026 Credit Policy.",
  alternates: { canonical: "/services/credit/repayment" },
  robots: policyRobots(),
};

function RefList({ items }: { items: RefBlock[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item.ref} className="text-sm leading-relaxed text-slate">
          {item.text}{" "}
          <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
            {item.ref}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function RepaymentPage() {
  const policy = getCreditPolicy();
  const { repayment, overview } = policy;

  return (
    <>
      <PageHero
        eyebrow="Credit and loans"
        title="Repayment conditions."
        intro="How long you have, where the money is taken from, and what happens if a repayment is missed. The policy sets each of these out in clause order."
        crumbs={[
          { label: "Services", href: "/services" },
          { label: "Credit and loans", href: "/services/credit" },
          { label: "Repayment" },
        ]}
      />

      <PolicyBanner version={policy.version} />
      <CreditNav />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <h2 className="font-serif text-2xl text-navy md:text-3xl">Repayment periods</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate">
            {repayment.periodsNote}
          </p>

          {/* Phones: stacked records, so the facility, period and clause all fit. */}
          <ul className="mt-6 divide-y divide-line border border-line bg-white sm:hidden">
            {repayment.periods.map((row) => (
              <li key={row.label} className="px-4 py-3">
                <p className="text-sm font-medium text-navy">{row.label}</p>
                <p className="mt-1 text-sm text-slate">{row.value}</p>
                <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.06em] text-slate/80">
                  {row.ref}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto border border-line sm:block">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <caption className="sr-only">Repayment periods by facility</caption>
              <thead>
                <tr className="bg-ink text-white">
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em]">
                    Facility
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em]">
                    Repayment period
                  </th>
                  <th scope="col" className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.1em]">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {repayment.periods.map((row) => (
                  <tr key={row.label} className="bg-white">
                    <th scope="row" className="px-4 py-3 text-sm font-medium text-navy">
                      {row.label}
                    </th>
                    <td className="px-4 py-3 text-slate">{row.value}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-sans text-[11px] uppercase tracking-[0.06em] text-slate/80">
                      {row.ref}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <section>
              <h2 className="font-serif text-2xl text-navy">Where repayment comes from</h2>
              <ul className="mt-4 space-y-3">
                {repayment.sources.map((source) => (
                  <li key={source} className="flex gap-2.5 text-sm leading-relaxed text-slate">
                    <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                    {source}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                {repayment.sourcesRef}
              </p>
              <p className="mt-5 border-l-2 border-gold pl-4 text-sm leading-relaxed text-slate">
                {repayment.setOff}
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-navy">When a loan is recalled</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Outstanding loan balances are liquidated where:
              </p>
              <ul className="mt-3 space-y-3">
                {repayment.recall.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate">
                    <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                {repayment.recallRef}
              </p>
            </section>
          </div>

          <section className="mt-14 border border-line bg-bone p-6 md:p-8">
            <h2 className="font-serif text-2xl text-navy">If a repayment is missed</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate">{repayment.penalty}</p>
            <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
              Cl. 4.5.1, p. 15
            </p>

            <h3 className="mt-8 font-serif text-xl text-navy">Recovery, in order</h3>
            <ol className="mt-4 space-y-4">
              {repayment.recovery.map((step, index) => (
                <li key={step.ref} className="flex gap-4">
                  <span className="font-sans text-[12px] text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-slate">
                    {step.text}{" "}
                    <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                      {step.ref}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <section className="border-t border-line pt-6">
              <h2 className="font-serif text-2xl text-navy">Retirees</h2>
              <RefList items={repayment.retirees} />
            </section>

            <section className="border-t border-line pt-6">
              <h2 className="font-serif text-2xl text-navy">Pensioners</h2>
              <RefList items={repayment.pensioners} />
            </section>
          </div>

          <section className="mt-14 border-t border-line pt-6">
            <h2 className="font-serif text-2xl text-navy">Portfolio discipline</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate">
              These are the Society's own targets for managing credit risk, not promises to members.
            </p>
            <RefList items={repayment.portfolio} />
          </section>

          <section className="mt-14 border border-line p-6 md:p-8">
            <h2 className="font-serif text-2xl text-navy">What decides the amount you can carry</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Repayment is assessed against the Maximum Deductible Limit for your grade, and every
              facility must stay within the Global Limit as well.
            </p>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {overview.limitPrinciples.map((item) => (
                <li key={item.ref} className="text-sm leading-relaxed text-slate">
                  {item.text}{" "}
                  <span className="font-sans text-[11px] uppercase tracking-[0.08em] text-slate/80">
                    {item.ref}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <CtaBand
        eyebrow="Questions"
        title="Need your repayment schedule explained?"
        body="The Secretariat can confirm the deduction that applies to your facility and grade."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Read the FAQs", href: "/services/credit/faq" }}
      />
    </>
  );
}
