import { formatNaira, type LimitRow } from "@/content/credit-policy";

/**
 * Schedule A. The printed values are reproduced as they appear in the policy,
 * so the table is a direct transcription rather than a recalculation.
 */
export function LimitTable({ rows, source }: { rows: LimitRow[]; source: string }) {
  return (
    <div className="overflow-x-auto border border-line">
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
  );
}
