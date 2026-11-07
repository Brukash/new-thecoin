import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listEntries } from "@/lib/cms/store";
import { createService } from "../actions";
import { ConfirmSubmit } from "../ConfirmSubmit";
import { EditButton } from "../EditButton";
import { deleteService } from "../actions";

export const dynamic = "force-dynamic";

export default async function ServicesAdminPage() {
  await requireStaff();

  const services = await listEntries<{ title: string; summary: string; index: string }>("services", {
    includeDrafts: true,
  });

  return (
    <div>
      <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-serif text-2xl text-navy">Services</h1>
          <p className="mt-1 text-xs text-slate">
            The seven service pages, their summaries and the copy on each detail page.
          </p>
        </div>

        <form action={createService} className="flex items-center gap-2">
          <label htmlFor="new-service-title" className="sr-only">
            New service title
          </label>
          <input
            id="new-service-title"
            name="title"
            placeholder="New service title"
            className="field h-9 w-56 text-sm"
            required
          />
          <button type="submit" className="btn btn-primary h-9 px-4 text-[12px]">
            Add
          </button>
        </form>
      </div>

      <ul className="mt-2 divide-y divide-line">
        {services.map((entry) => (
          <li key={entry.slug} className="flex flex-wrap items-center gap-3 py-3">
            <span className="w-10 shrink-0 font-sans text-[12px] text-gold-600">
              {entry.data.index}
            </span>
            <Link
              href={`/admin/services/${entry.slug}`}
              className="min-w-0 flex-1 truncate text-sm text-navy hover:text-gold-600"
            >
              {entry.data.title}
            </Link>
            <span className="text-[11px] uppercase tracking-[0.1em] text-slate/70">
              {entry.status}
            </span>
            <EditButton href={`/admin/services/${entry.slug}`} />
            <form action={deleteService}>
              <input type="hidden" name="slug" value={entry.slug} />
              <ConfirmSubmit>Delete</ConfirmSubmit>
            </form>
          </li>
        ))}
        {services.length === 0 ? (
          <li className="py-4 text-sm text-slate">
            No services in the database yet. The public pages show the verified copy from{" "}
            <code className="text-navy">content/services.ts</code> until you add one.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
