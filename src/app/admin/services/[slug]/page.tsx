import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import { getEntry, listEntries } from "@/lib/cms/store";
import type { ServiceDocument } from "@/lib/cms/schemas";
import { saveService } from "../../actions";

export const dynamic = "force-dynamic";

function serialiseBody(body: ServiceDocument["body"]): string {
  return body
    .map((block) =>
      [block.heading ? `## ${block.heading}` : null, ...block.paragraphs, ...(block.bullets ?? [])]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
}

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff();

  const { slug } = await params;
  const entry = await getEntry<ServiceDocument>("services", slug, { includeDrafts: true });
  if (!entry) notFound();
  const service = entry.data;

  const others = (await listEntries<ServiceDocument>("services", { includeDrafts: true })).filter(
    (item) => item.slug !== service.slug,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/services"
        className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy"
      >
        ← All services
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">{service.title}</h1>
      <p className="mt-1 text-xs text-slate">
        /services/{service.slug} · {entry.status}
      </p>

      <form action={saveService} className="mt-8 space-y-6 bg-white p-6 ring-1 ring-line">
        <input type="hidden" name="slug" value={service.slug} />

        <div className="grid gap-6 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label htmlFor="title" className="field-label">
              Title
            </label>
            <input id="title" name="title" defaultValue={service.title} required className="field mt-2" />
          </div>
          <div>
            <label htmlFor="shortTitle" className="field-label">
              Short title
            </label>
            <input
              id="shortTitle"
              name="shortTitle"
              defaultValue={service.shortTitle}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="index" className="field-label">
              Number
            </label>
            <input id="index" name="index" defaultValue={service.index} className="field mt-2" />
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="field-label">
            Summary
          </label>
          <textarea id="summary" name="summary" rows={2} defaultValue={service.summary} className="field mt-2" />
          <p className="mt-2 text-xs text-slate">Used on the services list and in search results.</p>
        </div>

        <div>
          <label htmlFor="intro" className="field-label">
            Opening paragraph
          </label>
          <textarea id="intro" name="intro" rows={3} defaultValue={service.intro} className="field mt-2" />
        </div>

        <div>
          <label htmlFor="body" className="field-label">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={18}
            defaultValue={serialiseBody(service.body)}
            className="field mt-2 font-sans text-[14px] leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate">
            One paragraph per line. Start a new section with <code>## Heading</code>. Publish only
            wording the Society has approved.
          </p>
        </div>

        <div>
          <label htmlFor="facts" className="field-label">
            At a glance
          </label>
          <textarea
            id="facts"
            name="facts"
            rows={4}
            defaultValue={(service.facts ?? []).map((fact) => `${fact.label} | ${fact.value}`).join("\n")}
            className="field mt-2 font-sans text-[14px]"
          />
          <p className="mt-2 text-xs text-slate">One per line: label | value. Leave blank to hide.</p>
        </div>

        <div>
          <label htmlFor="reviewNote" className="field-label">
            Review note
          </label>
          <textarea
            id="reviewNote"
            name="reviewNote"
            rows={2}
            defaultValue={service.reviewNote ?? ""}
            className="field mt-2"
          />
          <p className="mt-2 text-xs text-slate">
            Shown in a highlighted box. Use it where a term still needs written confirmation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="rates" className="field-label">
              Published rates
            </label>
            <select id="rates" name="rates" defaultValue={service.rates ?? ""} className="field mt-2">
              <option value="">None</option>
              <option value="bond">Investment bond rates</option>
              <option value="loans">Loan rates</option>
            </select>
          </div>
          <div>
            <label htmlFor="related" className="field-label">
              Related services
            </label>
            <textarea
              id="related"
              name="related"
              rows={3}
              defaultValue={service.related.join("\n")}
              className="field mt-2 font-sans text-[14px]"
            />
            <p className="mt-2 text-xs text-slate">
              One slug per line. Available: {others.map((item) => item.slug).join(", ") || "none"}.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="ctaLabel" className="field-label">
              Button label
            </label>
            <input id="ctaLabel" name="ctaLabel" defaultValue={service.cta.label} className="field mt-2" />
          </div>
          <div>
            <label htmlFor="ctaHref" className="field-label">
              Button link
            </label>
            <input id="ctaHref" name="ctaHref" defaultValue={service.cta.href} className="field mt-2" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          <button type="submit" name="intent" value="publish" className="btn btn-primary">
            Publish
          </button>
          <button type="submit" name="intent" value="draft" className="btn btn-outline">
            Save draft
          </button>
          <Link href="/admin/services" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
