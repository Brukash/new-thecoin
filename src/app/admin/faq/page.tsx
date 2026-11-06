import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { getEntry } from "@/lib/cms/store";
import { faqGroups as fallbackGroups } from "@/content/faq";
import type { FaqDocument } from "@/lib/cms/schemas";
import { saveFaq } from "../actions";

export const dynamic = "force-dynamic";

const GROUP_SLOTS = 9;

export default async function FaqAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireStaff();

  const params = await searchParams;
  const entry = await getEntry<FaqDocument>("faq", "main", { includeDrafts: true });
  const groups = entry?.data.groups?.length ? entry.data.groups : fallbackGroups;

  const slots = Array.from({ length: GROUP_SLOTS }, (_, index) => groups[index] ?? null);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Frequently asked questions</h1>
      <p className="mt-1 text-xs text-slate">
        {entry ? `${entry.status} · updated ${new Date(entry.updatedAt).toLocaleDateString("en-GB")}` : "Showing the verified default copy until you save."}
      </p>

      {params.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          FAQ updated on the public website.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          That could not be saved. Check that each question has an answer.
        </p>
      ) : null}

      <form action={saveFaq} className="mt-8 space-y-6 bg-white p-6 ring-1 ring-line">
        {slots.map((group, index) => (
          <fieldset key={index} className="border border-line p-4">
            <legend className="px-1 text-[11px] uppercase tracking-[0.12em] text-slate">
              Section {index + 1}
            </legend>

            <label htmlFor={`title-${index}`} className="field-label">
              Heading
            </label>
            <input
              id={`title-${index}`}
              name={`title-${index}`}
              defaultValue={group?.title ?? ""}
              placeholder={index === groups.length ? "Add another section…" : ""}
              className="field mt-2"
            />

            <label htmlFor={`items-${index}`} className="field-label mt-4">
              Questions
            </label>
            <textarea
              id={`items-${index}`}
              name={`items-${index}`}
              rows={Math.max(4, (group?.items.length ?? 0) * 2)}
              defaultValue={(group?.items ?? []).map((item) => `${item.q} | ${item.a}`).join("\n")}
              className="field mt-2 font-mono text-[13px] leading-relaxed"
            />
            <p className="mt-2 text-xs text-slate">
              One question per line: <code>question | answer</code>. Empty sections are removed on
              save. Start a new line inside an answer with <code>\n</code>, and a bullet with{" "}
              <code>• </code>.
            </p>
          </fieldset>
        ))}

        <div className="flex gap-3 border-t border-line pt-5">
          <button type="submit" className="btn btn-primary">
            Publish FAQ
          </button>
          <Link href="/admin" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
