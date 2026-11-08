import { getRates } from "@/content/queries";
import type { RateRow } from "@/content/rates";

function RateTable({ caption, rows, effectiveFrom }: { caption: string; rows: RateRow[]; effectiveFrom: string }) {
  return (
    <>
      {/* Phones: one record per row so the term and both rates stay on screen. */}
      <ul aria-label={caption} className="divide-y divide-line sm:hidden">
        {rows.map((row) => (
          <li key={row.label} className="py-3">
            <p className="text-sm text-slate">{row.label}</p>
            {row.note && (
              <p className="mt-1 text-xs leading-relaxed text-slate/70">{row.note}</p>
            )}
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-sans text-sm tabular-nums text-navy">{row.current}</span>
              {row.unchanged && (
                <span className="text-[11px] uppercase tracking-[0.08em] text-gold-600">
                  Unchanged
                </span>
              )}
              <span className="ml-auto font-sans text-xs tabular-nums text-slate/70">
                <span className="sr-only">Previous: </span>
                {row.previous}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
      <table className="w-full min-w-[22rem] border-collapse text-left">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-navy/20">
          <th
            scope="col"
            className="whitespace-nowrap py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate"
          >
            Term
          </th>
          <th
            scope="col"
            className="whitespace-nowrap py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-navy"
          >
            From {effectiveFrom}
          </th>
          <th
            scope="col"
            className="whitespace-nowrap py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate"
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
              {row.note && (
                <span className="mt-1 block max-w-md text-xs leading-relaxed text-slate/70">
                  {row.note}
                </span>
              )}
            </th>
            <td className="whitespace-nowrap py-2.5 pr-4 font-sans text-sm tabular-nums text-navy">
              {row.current}
              {row.unchanged && (
                <span className="ml-2 align-middle text-[11px] uppercase tracking-[0.08em] text-gold-600">
                  Unchanged
                </span>
              )}
            </td>
            <td className="whitespace-nowrap py-2.5 font-sans text-sm tabular-nums text-slate/70">{row.previous}</td>
          </tr>
        ))}
      </tbody>
      </table>
      </div>
    </>
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
        {kind === "bond"
          ? "Each series pays its own schedule. The figures below are reproduced from the current series documents, and where the review of 24 September 2026 changed a rate the previous rate is shown alongside it."
          : `The Management Committee reviewed the Society's rates on ${notice.approvedOn}, following ${notice.reason}, and approved a moderate downward adjustment. The figures below are reproduced from that notice, with the previous rate shown for comparison.`}
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
        {kind === "bond"
          ? `Sources: ${notice.title} (approved ${notice.approvedOn}, effective ${notice.effectiveFrom}) and the series documents dated 1 October 2026.`
          : `Source: ${notice.title}, CBN Staff Multipurpose Cooperative Society Ltd, approved ${notice.approvedOn} and effective ${notice.effectiveFrom}.`}{" "}
        The Secretariat confirms the rate that applies to your request in writing before you commit
        funds.
      </p>
    </section>
  );
}
