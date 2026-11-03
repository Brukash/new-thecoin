import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import type { PolicyVersion } from "@/content/credit-policy";

/**
 * Publication state notice. While the extracted figures are still being
 * checked, the pages say so instead of implying that they are approved policy.
 */
export function PolicyBanner({ version }: { version: PolicyVersion }) {
  const approved = version.state === "approved";

  return (
    <section
      className={`border-b ${approved ? "border-line bg-bone" : "border-gold/40 bg-gold-50"}`}
      aria-label="Policy status"
    >
      <div className="shell flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex items-start gap-3">
          {approved ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
          )}
          <p className="max-w-3xl text-xs leading-relaxed text-slate">
            <strong className="font-semibold text-navy">
              {approved ? "Approved policy" : "Figures awaiting verification"}
            </strong>{" "}
            {approved
              ? `This page reflects the Credit Policy issued in ${version.issueDate} and approved by the ${version.approvedBy}. Figures are reproduced from the signed document, with the clause reference shown beside each item.`
              : "This page reproduces the 2026 Credit Policy for review. Every figure is being checked against the signed document and no figure has been approved for publication yet. Confirm any amount with the Secretariat before you rely on it."}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-4 text-[11px] text-slate">
          <span>
            Ref <span className="font-mono text-navy">{version.documentReference || "Not set"}</span>
          </span>
          {version.sourceFile && (
            <Link
              href={version.sourceFile}
              className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.08em] text-gold-600 underline underline-offset-4 hover:text-navy"
            >
              <FileText className="size-3.5" aria-hidden />
              Read the PDF
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
