import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listCategories } from "@/lib/cms/events";
import { deleteCategoryAction, saveCategoryAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EventCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  await requireStaff();
  const categories = await listCategories({ includeInactive: true });
  const query = await searchParams;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/events" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← All events
      </Link>

      <h1 className="mt-4 font-serif text-2xl text-navy">Event categories</h1>
      <p className="mt-1 text-xs leading-relaxed text-slate">
        Categories group events on the public centre. Renaming one updates every event in it; the
        slug is what appears in filter links.
      </p>

      {query.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">Category saved.</p>
      ) : null}
      {query.deleted ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Category deleted. Events that used it are now uncategorised.
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          Check the name and slug, then try again.
        </p>
      ) : null}

      <form action={saveCategoryAction} className="mt-6 grid gap-3 bg-white p-5 ring-1 ring-line sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <input id="name" name="name" className="field mt-1" required maxLength={120} />
        </div>
        <div>
          <label htmlFor="slug" className="field-label">
            Slug (optional)
          </label>
          <input id="slug" name="slug" placeholder="generated from the name" className="field mt-1" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="field-label">
            Description
          </label>
          <input id="description" name="description" className="field mt-1" maxLength={400} />
        </div>
        <div>
          <label htmlFor="displayOrder" className="field-label">
            Display order
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min={0}
            max={999}
            defaultValue={(categories.length + 1) * 10}
            className="field mt-1"
          />
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" name="active" defaultChecked className="size-4" />
          Show in public filters
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-primary h-9 px-5 text-[11px]">
            Save category
          </button>
        </div>
      </form>

      <ul className="mt-8 divide-y divide-line border-y border-line bg-white">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-navy">{category.name}</p>
              <p className="text-[11px] text-slate">
                /{category.slug} · order {category.displayOrder}
                {category.active ? "" : " · hidden"}
              </p>
            </div>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <button type="submit" className="text-[11px] uppercase tracking-[0.1em] text-red-700">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
