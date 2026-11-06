import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { requireStaff } from "@/lib/cms/auth";
import { readPolicyStore } from "@/lib/credit-admin";
import { formatNaira } from "@/content/credit-policy";
import { EditButton } from "../EditButton";
import {
  publishPolicy,
  saveDetails,
  saveLimitTable,
  uploadPolicyDocument,
  withdrawPolicy,
} from "./actions";

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  details: "Policy details saved. The record is now awaiting approval.",
  limits: "Limit table saved. The record is now awaiting approval.",
  published: "Policy approved and published to the website.",
  archived: "Policy archived. The website now marks it as superseded.",
  document: "Replacement document uploaded. Approve the policy to publish it.",
};

const errors: Record<string, string> = {
  confirm: "Type APPROVE in the confirmation box to publish.",
  approver: "Name the person approving the policy.",
  file: "Choose a PDF file to upload.",
  type: "The replacement document must be a PDF.",
  size: "That file is larger than 15 MB.",
};

export default async function AdminCreditPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; previous?: string }>;
}) {
  await requireStaff();

  const params = await searchParams;
  const store = readPolicyStore();
  const version = store.version;
  const approved = version.state === "approved";

  const notice = params.saved ? notices[params.saved] : undefined;
  const error = params.error ? errors[params.error] : undefined;

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Back to console
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
              Credit policy
            </p>
            <h1 className="mt-2 font-serif text-3xl text-navy">
              {store.version.title} {store.version.issueDate}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/services/credit"
              className="text-[11px] uppercase tracking-[0.1em] text-slate hover:text-navy"
            >
              View public section
            </Link>
            <Link href="/admin" className="btn btn-outline h-9 px-4 text-[11px]">
              Sign out
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`flex items-start gap-3 border px-4 py-3 text-sm ${
          approved ? "border-line bg-white text-navy" : "border-gold/50 bg-gold-50 text-navy"
        }`}
      >
        {approved ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
        )}
        <div>
          <p className="font-semibold">
            {approved
              ? "Approved and visible as current policy."
              : "Awaiting verification. The public pages show a notice and stay out of search results."}
          </p>
          <p className="mt-1 text-xs text-slate">
            Reference {version.documentReference || "not set"} · Issue {version.issueDate || "not set"}{" "}
            · Effective {version.effectiveFrom || "not set"} · Last saved{" "}
            {store.updatedAt ? new Date(store.updatedAt).toLocaleString("en-GB") : "never"}
          </p>
        </div>
      </div>

      {notice && (
        <p className="border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">{notice}</p>
      )}
      {error && (
        <p className="border-l-2 border-red-500 bg-white px-4 py-3 text-sm text-navy">{error}</p>
      )}
      {params.previous && params.saved === "document" && (
        <p className="text-xs text-slate">
          The previous document is retained at{" "}
          <span className="font-mono">{decodeURIComponent(params.previous)}</span>.
        </p>
      )}

      <section className="bg-white p-6 ring-1 ring-line">
        <h2 className="font-serif text-xl text-navy">Document details</h2>
        <p className="mt-1 text-xs text-slate">
          Editing any policy detail withdraws approval until the record is approved again.
        </p>

        <form action={saveDetails} className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="field-label">
              Policy title
            </label>
            <input id="title" name="title" defaultValue={version.title} className="field mt-2" />
          </div>
          <div>
            <label htmlFor="documentReference" className="field-label">
              Document reference
            </label>
            <input
              id="documentReference"
              name="documentReference"
              defaultValue={version.documentReference}
              className="field mt-2 font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="issueDate" className="field-label">
              Issue date (as printed)
            </label>
            <input id="issueDate" name="issueDate" defaultValue={version.issueDate} className="field mt-2" />
          </div>
          <div>
            <label htmlFor="effectiveFrom" className="field-label">
              Effective from
            </label>
            <input
              id="effectiveFrom"
              name="effectiveFrom"
              defaultValue={version.effectiveFrom}
              className="field mt-2"
              placeholder="e.g. 2026-08-10"
            />
            <p className="mt-1 text-[11px] text-slate">
              Leave as the printed month unless the commencement date is confirmed in writing.
            </p>
          </div>
          <div>
            <label htmlFor="approvedBy" className="field-label">
              Approved by
            </label>
            <input
              id="approvedBy"
              name="approvedBy"
              defaultValue={version.approvedBy}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="reviewCycle" className="field-label">
              Review cycle
            </label>
            <input
              id="reviewCycle"
              name="reviewCycle"
              defaultValue={version.reviewCycle}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="sourceFile" className="field-label">
              Public PDF path
            </label>
            <input
              id="sourceFile"
              name="sourceFile"
              defaultValue={version.sourceFile}
              className="field mt-2 font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">
              Save details
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white p-6 ring-1 ring-line">
        <h2 className="font-serif text-xl text-navy">Approve and publish</h2>
        <p className="mt-1 text-xs text-slate">
          Only an authorised officer approves policy wording. Approval makes the figures public and
          indexable, so check every number against the signed document first.
        </p>

        <form action={publishPolicy} className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="approver" className="field-label">
              Approved by (name and office)
            </label>
            <input id="approver" name="approver" className="field mt-2" required />
          </div>
          <div>
            <label htmlFor="publishEffective" className="field-label">
              Effective from
            </label>
            <input
              id="publishEffective"
              name="effectiveFrom"
              type="date"
              defaultValue=""
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="field-label">
              Type APPROVE to confirm
            </label>
            <input id="confirm" name="confirm" className="field mt-2 font-mono" required />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="btn btn-primary">
              Approve and publish
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white p-6 ring-1 ring-line">
        <h2 className="font-serif text-xl text-navy">Replacement document</h2>
        <p className="mt-1 text-xs text-slate">
          Upload the signed PDF for a revised policy. The previous file is left in place so that
          archived versions still open.
        </p>

        <form action={uploadPolicyDocument} className="mt-5 flex flex-wrap items-end gap-4">
          <div className="min-w-[16rem] flex-1">
            <label htmlFor="document" className="field-label">
              Signed PDF (max 15 MB)
            </label>
            <input
              id="document"
              name="document"
              type="file"
              accept="application/pdf"
              className="field mt-2 file:mr-3 file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-[11px] file:text-white"
              required
            />
          </div>
          <button type="submit" className="btn btn-outline">
            Upload document
          </button>
        </form>
      </section>

      <section className="bg-white p-6 ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-navy">Schedule A limits</h2>
          <p className="text-[11px] uppercase tracking-[0.1em] text-slate">
            Values as printed, two decimal places
          </p>
        </div>

        <form action={saveLimitTable} className="mt-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-slate">
                  <th scope="col" className="w-10 py-2 pr-2">
                    S/N
                  </th>
                  <th scope="col" className="py-2 pr-2">
                    Grade
                  </th>
                  <th scope="col" className="py-2 pr-2">
                    Global limit
                  </th>
                  <th scope="col" className="py-2">
                    Max deductible
                  </th>
                </tr>
              </thead>
              <tbody>
                {store.globalLimits.rows.map((row, index) => (
                  <tr key={row.sno} className="border-b border-line/60">
                    <td className="py-2 pr-2 text-xs tabular-nums text-slate">{row.sno}</td>
                    <td className="py-2 pr-2">
                      <label className="sr-only" htmlFor={`grade-${index}`}>
                        Grade for row {row.sno}
                      </label>
                      <input
                        id={`grade-${index}`}
                        name={`grade-${index}`}
                        defaultValue={row.status}
                        className="field h-9 w-full text-xs"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <label className="sr-only" htmlFor={`global-${index}`}>
                        Global limit for row {row.sno}
                      </label>
                      <input
                        id={`global-${index}`}
                        name={`global-${index}`}
                        defaultValue={row.globalLimit}
                        inputMode="decimal"
                        className="field h-9 w-full font-mono text-xs tabular-nums"
                      />
                    </td>
                    <td className="py-2">
                      <label className="sr-only" htmlFor={`deductible-${index}`}>
                        Maximum deductible for row {row.sno}
                      </label>
                      <input
                        id={`deductible-${index}`}
                        name={`deductible-${index}`}
                        defaultValue={row.maxDeductible}
                        inputMode="decimal"
                        className="field h-9 w-full font-mono text-xs tabular-nums"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate">
            Example of the largest approved facility: {formatNaira(store.globalLimits.rows[0]?.globalLimit ?? "")}.
            Do not round or reformat the printed values.
          </p>

          <button type="submit" className="btn btn-primary mt-4">
            Save limit table
          </button>
        </form>
      </section>

      <section>
        <h2 className="border-b border-line pb-3 font-serif text-xl text-navy">
          Facilities{" "}
          <span className="text-slate">({store.facilities.length})</span>
        </h2>
        <ul className="divide-y divide-line bg-white px-4">
          {store.facilities.map((facility) => (
            <li key={facility.slug} className="flex flex-wrap items-center gap-3 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate">
                {facility.clause}
              </span>
              <Link
                href={`/admin/credit/${facility.slug}`}
                className="min-w-0 flex-1 truncate text-sm text-navy hover:text-gold-600"
              >
                {facility.name}
              </Link>
              <span className="text-[10px] uppercase tracking-[0.1em] text-slate">{facility.kind}</span>
              <EditButton href={`/admin/credit/${facility.slug}`} />
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white p-6 ring-1 ring-line">
        <h2 className="font-serif text-xl text-navy">Open points for verification</h2>
        <p className="mt-1 text-xs text-slate">
          Differences found while extracting the policy. They are published as a note, never resolved
          silently.
        </p>
        <ul className="mt-4 space-y-3">
          {store.flags.map((flag) => (
            <li key={flag.id} className="border-l-2 border-gold/60 pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gold-600">
                {flag.id} · {flag.area}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate">{flag.issue}</p>
              <p className="mt-1 font-mono text-[10px] text-slate/80">{flag.refs}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white p-6 ring-1 ring-line">
        <h2 className="font-serif text-xl text-navy">Archive the current version</h2>
        <p className="mt-1 text-xs text-slate">
          Archiving keeps the version in history and marks the public pages as superseded. Upload and
          approve the replacement before members are directed to it.
        </p>

        <form action={withdrawPolicy} className="mt-5 grid gap-4 sm:grid-cols-[2fr_1fr_auto]">
          <div>
            <label htmlFor="note" className="field-label">
              Reason
            </label>
            <input id="note" name="note" className="field mt-2" placeholder="Replaced by the 2028 revision" />
          </div>
          <div>
            <label htmlFor="archiveConfirm" className="field-label">
              Type ARCHIVE
            </label>
            <input id="archiveConfirm" name="confirm" className="field mt-2 font-mono" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn btn-outline">
              Archive
            </button>
          </div>
        </form>

        {store.versions.length > 0 && (
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {store.versions.map((entry) => (
              <li key={`${entry.code}-${entry.archivedOn}`} className="flex flex-wrap gap-3 py-3 text-xs">
                <span className="font-mono text-slate">{entry.code || "unversioned"}</span>
                <span className="text-navy">{entry.issueDate}</span>
                <span className="text-slate">Archived {entry.archivedOn}</span>
                <span className="min-w-0 flex-1 truncate text-slate">{entry.note}</span>
                {entry.sourceFile && (
                  <a href={entry.sourceFile} className="inline-flex items-center gap-1 text-gold-600">
                    <FileText className="size-3" aria-hidden /> PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
