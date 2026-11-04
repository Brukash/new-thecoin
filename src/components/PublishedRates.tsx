import { getRates } from "@/content/queries";
import type { RateRow } from "@/content/rates";

function RateTable({ caption, rows, effectiveFrom }: { caption: string; rows: RateRow[]; effectiveFrom: string }) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-navy/20">
          <th
            scope="col"
            className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate"
          >
            Term
          </th>
          <th
            scope="col"
            className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-navy"
          >
            From {effectiveFrom}
          </th>
          <th
            scope="col"
            className="py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate"
          >
            Previous
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" className="py-2.5 pr-4 text-sm font-normal text-slate">
              {row.label}
            </th>
            <td className="py-2.5 pr-4 font-mono text-sm tabular-nums text-navy">
              {row.current}
              {row.unchanged && (
                <span className="ml-2 align-middle text-[10px] uppercase tracking-[0.08em] text-gold-600">
                  Unchanged
                </span>
              )}
            </td>
            <td className="py-2.5 font-mono text-sm tabular-nums text-slate/70">{row.previous}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The published rate schedule, read from the console so staff can publish a
 * new approved notice without a code change. Figures are never calculated
 * here: what the notice states is what the page shows.
 */
export async function PublishedRates({ kind }: { kind: "bond" | "loans" }) {
  const { bondPlans, loanRates, notice } = await getRates();

  return (
    <section className="mt-12 border-t border-line pt-10">
      <p className="eyebrow">Published rates</p>
      <h2 className="mt-4 font-serif text-2xl leading-snug text-navy md:text-[1.75rem]">
        {kind === "bond" ? "Investment bond rates" : "Loan rates"} from {notice.effectiveFrom}.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">
        The Management Committee reviewed the Society&apos;s rates on {notice.approvedOn}, following{" "}
        {notice.reason}, and approved a moderate downward adjustment. The figures below are
        reproduced from that notice, with the previous rate shown for comparison.
      </p>

      <div className="mt-7 space-y-8">
        {kind === "bond" ? (
          bondPlans.map((plan) => (
            <div key={plan.name} className="border border-line bg-white p-5 md:p-6">
              <h3 className="font-serif text-lg text-navy">{plan.name}</h3>
              <div className="mt-3">
                <RateTable
                  caption={`Investment bond rates, ${plan.name}`}
                  rows={plan.rows}
                  effectiveFrom={notice.effectiveFrom}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="border border-line bg-white p-5 md:p-6">
            <div className="mt-1">
              <RateTable
                caption="Coop loan and project rates"
                rows={loanRates}
                effectiveFrom={notice.effectiveFrom}
              />
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-slate">
        Source: {notice.title}, CBN Staff Multipurpose Cooperative Society Ltd, approved{" "}
        {notice.approvedOn} and effective {notice.effectiveFrom}. The Secretariat confirms the rate
        that applies to your request in writing before you commit funds.
      </p>
    </section>
  );
}
