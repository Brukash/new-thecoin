import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { getEntry } from "@/lib/cms/store";
import { bondPlans, loanRates, rateNotice } from "@/content/rates";
import type { RatesDocument } from "@/lib/cms/schemas";
import { saveRates } from "../actions";

export const dynamic = "force-dynamic";

export default async function RatesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireStaff();

  const params = await searchParams;
  const entry = await getEntry<RatesDocument>("rates", "main", { includeDrafts: true });

  const rates: RatesDocument = entry?.data?.notice
    ? entry.data
    : { notice: { ...rateNotice }, bondPlans, loanRates };

  const planText = rates.bondPlans
    .map((plan) =>
      [`## ${plan.name}`, ...plan.rows.map((row) => `${row.label} | ${row.previous} | ${row.current}`)].join(
        "\n",
      ),
    )
    .join("\n\n");

  const loanText = rates.loanRates
    .map((row) => `${row.label} | ${row.previous} | ${row.current}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Published rates</h1>
      <p className="mt-1 text-xs text-slate">
        Reproduce the approved notice exactly. Every figure shown on the website comes from these
        fields.
      </p>

      {params.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Rates updated. The loans and investments pages now show these figures.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          That could not be saved. Check that every row has a label and a current rate.
        </p>
      ) : null}

      <form action={saveRates} className="mt-8 space-y-6 bg-white p-6 ring-1 ring-line">
        <div>
          <label htmlFor="noticeTitle" className="field-label">
            Notice title
          </label>
          <input
            id="noticeTitle"
            name="noticeTitle"
            defaultValue={rates.notice.title}
            required
            className="field mt-2"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="approvedOn" className="field-label">
              Approved on
            </label>
            <input
              id="approvedOn"
              name="approvedOn"
              defaultValue={rates.notice.approvedOn}
              required
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="effectiveFrom" className="field-label">
              Effective from
            </label>
            <input
              id="effectiveFrom"
              name="effectiveFrom"
              defaultValue={rates.notice.effectiveFrom}
              required
              className="field mt-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="field-label">
            Reason given in the notice
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={2}
            defaultValue={rates.notice.reason}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="bondPlans" className="field-label">
            Investment bond plans
          </label>
          <textarea
            id="bondPlans"
            name="bondPlans"
            rows={18}
            defaultValue={planText}
            className="field mt-2 font-sans text-[14px] leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate">
            Start each plan with <code>## Plan name</code>. Then one line per term:{" "}
            <code>label | previous | current</code>. Where both rates match, the site marks it
            unchanged.
          </p>
        </div>

        <div>
          <label htmlFor="loanRates" className="field-label">
            Loan rates
          </label>
          <textarea
            id="loanRates"
            name="loanRates"
            rows={12}
            defaultValue={loanText}
            className="field mt-2 font-sans text-[14px] leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate">One line per product: label | previous | current.</p>
        </div>

        <div className="flex gap-3 border-t border-line pt-5">
          <button type="submit" className="btn btn-primary">
            Publish rates
          </button>
          <Link href="/admin" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
