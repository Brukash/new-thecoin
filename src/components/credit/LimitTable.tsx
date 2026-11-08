import { formatNaira, type LimitRow } from "@/content/credit-policy";

/**
 * Schedule A. The printed values are reproduced as they appear in the policy,
 * so the table is a direct transcription rather than a recalculation.
 *
 * Below `sm` the same rows are laid out as stacked records. A four-column
 * table at phone width either overflows the screen or forces sideways
 * scrolling, which cuts the figures off at the edge.
 */
export function LimitTable({ rows, source }: { rows: LimitRow[]; source: string }) {
  return (
    <>
      <ul className="divide-y divide-line border border-line bg-white sm:hidden">
        {rows.map((row) => (
          <li key={row.sno} className="px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-navy">
              <span className="mr-2 text-slate">{row.sno}</span>
              {row.status}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-[11px] uppercase tracking-[0.06em] text-slate">Global limit</dt>
              <dd className="text-right tabular-nums text-navy">{formatNaira(row.globalLimit)}</dd>
              <dt className="text-[11px] uppercase tracking-[0.06em] text-slate">Max deductible</dt>
              <dd className="text-right tabular-nums text-navy">{formatNaira(row.maxDeductible)}</dd>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto border border-line sm:block">
        <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Global limit and maximum deductible limit by grade, reproduced from {source}
          </caption>
          <thead>
            <tr className="bg-ink text-white">
              <th scope="col" className="w-10 whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]">
                S/N
              </th>
              <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]">
                Grade
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                Global limit
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                Max deductible
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row, index) => (
              <tr key={row.sno} className={index % 2 === 1 ? "bg-bone/60" : "bg-white"}>
                <td className="px-3 py-2.5 text-xs tabular-nums text-slate">{row.sno}</td>
                <th scope="row" className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-navy">
                  {row.status}
                </th>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-navy">
                  {formatNaira(row.globalLimit)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-navy">
                  {formatNaira(row.maxDeductible)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
