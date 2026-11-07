import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listCategories } from "@/lib/cms/events";
import { createEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireStaff();
  const categories = await listCategories();
  const params = await searchParams;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/events" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← All events
      </Link>

      <h1 className="mt-4 font-serif text-2xl text-navy">Create an event</h1>
      <p className="mt-1 text-xs leading-relaxed text-slate">
        Start with the essentials. The event is created as a draft; the full editor then adds the
        programme, brochure, gallery, registration and SEO details.
      </p>

      {params.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          Check the title and dates, then try again.
        </p>
      ) : null}

      <form action={createEvent} className="mt-6 space-y-5 bg-white p-6 ring-1 ring-line">
        <div>
          <label htmlFor="title" className="field-label">
            Event title
          </label>
          <input id="title" name="title" className="field mt-2" required maxLength={200} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className="field-label">
              Category
            </label>
            <select id="categoryId" name="categoryId" className="field mt-2">
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edition" className="field-label">
              Edition
            </label>
            <input
              id="edition"
              name="edition"
              placeholder="e.g. 8th Edition"
              className="field mt-2"
              maxLength={40}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="field-label">
              Start date
            </label>
            <input id="startDate" name="startDate" type="date" className="field mt-2" required />
          </div>
          <div>
            <label htmlFor="endDate" className="field-label">
              End date
            </label>
            <input id="endDate" name="endDate" type="date" className="field mt-2" />
          </div>
        </div>

        <div>
          <label htmlFor="shortDescription" className="field-label">
            Short description
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={3}
            maxLength={400}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="publicationStatus" className="field-label">
            Publication status
          </label>
          <select id="publicationStatus" name="publicationStatus" defaultValue="draft" className="field mt-2">
            <option value="draft">Draft — staff only</option>
            <option value="published">Publish now</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary h-10 px-6">
            Create draft
          </button>
          <Link href="/admin/events" className="text-xs text-slate hover:text-navy">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
