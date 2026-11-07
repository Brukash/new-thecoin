import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { listAnnouncements } from "@/lib/cms/events";
import { formatAnnouncementDate } from "@/lib/events/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Document centre",
  description:
    "Publications, circulars and official notices issued by the Society, with the files attached to each notice.",
  alternates: { canonical: "/documents" },
  openGraph: {
    title: "Document centre | CBN Coop",
    description: "Official publications and circulars from the CBN Staff Multipurpose Cooperative Society.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "CBN Coop document centre" }],
  },
};

/**
 * Every file here is an attachment the Secretariat uploaded against a notice in
 * the console. Nothing is listed that the Society has not published, so the
 * repository cannot drift from the notices themselves.
 */
export default async function DocumentsPage() {
  const announcements = await listAnnouncements({ limit: 100 });

  const documents = announcements
    .filter((announcement) => announcement.attachmentUrl)
    .map((announcement) => ({
      title: announcement.title,
      href: announcement.attachmentUrl,
      category: announcement.category,
      date: formatAnnouncementDate(announcement.publishedAt),
      noticeHref: `/events/announcements/${announcement.slug}`,
      summary: announcement.shortDescription,
    }));

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Document centre"
        intro="Official publications, circulars and notices. Files are published with the notice they belong to, so the notice and the document always match."
        crumbs={[{ label: "Document centre" }]}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          {documents.length === 0 ? (
            <div className="max-w-2xl border border-line bg-bone p-6">
              <p className="font-serif text-xl text-navy">No documents are published yet.</p>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Circulars and publications appear here once the Secretariat attaches them to an
                announcement. Notices are published under{" "}
                <Link href="/events/announcements" className="underline underline-offset-4 hover:text-navy">
                  announcements
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="max-w-3xl divide-y divide-line border-y border-line">
              {documents.map((document) => (
                <li key={document.href} className="flex flex-wrap items-start gap-4 py-5">
                  <FileText className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate">
                      {document.category} · {document.date}
                    </p>
                    <p className="mt-1 font-serif text-lg text-navy">{document.title}</p>
                    {document.summary ? (
                      <p className="mt-1 text-sm leading-relaxed text-slate">{document.summary}</p>
                    ) : null}
                    <Link
                      href={document.noticeHref}
                      className="mt-1 inline-block text-[12px] text-navy underline underline-offset-4"
                    >
                      Read the notice
                    </Link>
                  </div>
                  <a
                    href={document.href}
                    download
                    className="btn btn-outline h-10 shrink-0 px-4 text-[12px]"
                  >
                    <Download className="size-3.5" aria-hidden />
                    Download
                    <span className="sr-only"> {document.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CtaBand
        title="Need a document you cannot find?"
        body="The Secretariat can confirm which publications are approved for release."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Browse announcements", href: "/events/announcements" }}
      />
    </>
  );
}
