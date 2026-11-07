import Link from "next/link";
import { Download, FileText } from "lucide-react";
import type { PolicyVersion } from "@/content/credit-policy";

/** The official document, offered as a download rather than summarised. */
export function PolicyDownload({ version }: { version: PolicyVersion }) {
  return (
    <div className="border border-line bg-bone p-6 md:p-8">
      <div className="flex items-start gap-4">
        <FileText className="mt-1 size-8 shrink-0 text-gold-600" aria-hidden />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
            Official document
          </p>
          <h2 className="mt-2 font-serif text-2xl leading-snug text-navy">
            {version.title}, {version.issueDate}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            The signed policy as approved by the {version.approvedBy}, including Schedule A. This is
            the only version the Society relies on. Where a page here and the PDF differ, the PDF
            prevails.
          </p>

          <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="uppercase tracking-[0.08em] text-slate">Reference</dt>
              <dd className="mt-1 font-sans text-navy">{version.documentReference}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.08em] text-slate">Pages</dt>
              <dd className="mt-1 text-navy">{version.sourcePages}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.08em] text-slate">Approved by</dt>
              <dd className="mt-1 text-navy">{version.approvedBy}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.08em] text-slate">Review cycle</dt>
              <dd className="mt-1 text-navy">{version.reviewCycle}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={version.sourceFile}
              download
              className="btn btn-ink"
              aria-label={`Download the ${version.title} PDF, ${version.sourcePages} pages`}
            >
              <Download className="size-4" aria-hidden />
              Download the PDF
            </a>
            <Link href="/contact" className="btn btn-outline">
              Ask a question
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
