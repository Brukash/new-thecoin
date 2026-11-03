import { formatNaira, type LimitRow } from "@/content/credit-policy";

/**
 * Schedule A. The printed values are reproduced as they appear in the policy,
 * so the table is a direct transcription rather than a recalculation.
 */
export function LimitTable({ rows, source }: { rows: LimitRow[]; source: string }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Global limit and maximum deductible limit by grade, reproduced from {source}
        </caption>
        <thead>
          <tr className="bg-ink text-white">
            <th scope="col" className="w-10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em]">
              S/N
            </th>
            <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em]">
              Grade
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em]"
            >
              Global limit
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em]"
            >
              Max deductible
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={row.sno} className={index % 2 === 1 ? "bg-bone/60" : "bg-white"}>
              <td className="px-4 py-3 text-xs tabular-nums text-slate">{row.sno}</td>
              <th scope="row" className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-navy">
                {row.status}
              </th>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-navy">
                {formatNaira(row.globalLimit)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-navy">
                {formatNaira(row.maxDeductible)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
