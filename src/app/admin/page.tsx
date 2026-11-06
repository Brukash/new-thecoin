import Link from "next/link";
import type { ReactNode } from "react";
import { getStaffUser } from "@/lib/cms/auth";
import { countUnhandledEnquiries, listEntries, listAudit } from "@/lib/cms/store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./LoginForm";
import { signOut, createArticle, createProject, deleteArticle, deleteProject } from "./actions";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { EditButton } from "./EditButton";

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  news: "Article published.",
  projects: "Project published.",
  services: "Service page published.",
  draft: "Saved as a draft. It is not visible on the public website yet.",
  newsDeleted: "Article deleted.",
  projectsDeleted: "Project deleted.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const staff = await getStaffUser();
  const params = await searchParams;

  if (!staff) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="font-serif text-3xl text-navy">Staff sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          The console publishes news, projects and Society contact details to the public website.
        </p>
        {isSupabaseConfigured() ? null : (
          <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-xs leading-relaxed text-slate">
            Supabase is not configured here, so the console is using the local staff password.
          </p>
        )}
        <LoginForm emailMode={isSupabaseConfigured()} />
      </div>
    );
  }

  const [news, projects, openEnquiries] = await Promise.all([
    listEntries<{ title: string; date: string; category: string }>("news", { includeDrafts: true }),
    listEntries<{ name: string; city: string; status: string }>("projects", { includeDrafts: true }),
    countUnhandledEnquiries(),
  ]);

  // The audit query uses the service role, which bypasses row level security,
  // so the admin-only rule from the database has to be enforced here too.
  const audit = staff.role === "admin" ? await listAudit(8) : [];

  const message =
    notices[params.saved ?? ""] ??
    (params.saved === "news" ? notices.news : undefined) ??
    (params.deleted === "news" ? notices.newsDeleted : undefined) ??
    (params.deleted === "projects" ? notices.projectsDeleted : undefined);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
            Content
          </p>
          <h1 className="mt-2 font-serif text-3xl text-navy">Console</h1>
          <p className="mt-1 text-xs text-slate">
            Signed in as {staff.name} ({staff.role})
            {isSupabaseConfigured() ? " · Supabase" : " · local preview"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/account"
            className="text-[11px] uppercase tracking-[0.1em] text-slate transition-colors hover:text-navy"
          >
            Account
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn btn-outline text-[11px]">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {message ? (
        <p className="border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">{message}</p>
      ) : null}
      {params.error === "forbidden" ? (
        <p className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          That action needs an administrator.
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/events"
          className="group border border-line bg-white p-5 transition-colors hover:border-navy"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">
            Programme
          </p>
          <h2 className="mt-2 font-serif text-xl text-navy">Events</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate">
            Create events, set the homepage promotion, manage galleries, registrations and
            enquiries.
          </p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.12em] text-navy">
            Open events →
          </span>
        </Link>

        <Link
          href="/admin/announcements"
          className="group border border-line bg-white p-5 transition-colors hover:border-navy"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">
            Notices
          </p>
          <h2 className="mt-2 font-serif text-xl text-navy">Announcements</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate">
            Publish official notices with expiry dates, attachments and the urgent banner.
          </p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.12em] text-navy">
            Open announcements →
          </span>
        </Link>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="font-serif text-xl text-navy">
            News <span className="text-slate">({news.length})</span>
          </h2>
          <form action={createArticle} className="flex items-center gap-2">
            <label htmlFor="new-article-title" className="sr-only">
              New article title
            </label>
            <input
              id="new-article-title"
              name="title"
              placeholder="New article title"
              className="field h-9 w-56 text-sm"
              required
            />
            <button type="submit" className="btn btn-primary h-9 px-4 text-[11px]">
              Add
            </button>
          </form>
        </div>

        <ul className="divide-y divide-line">
          {news.map((entry) => (
            <li key={entry.slug} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-24 shrink-0 text-[11px] tabular-nums text-slate">
                {entry.data.date}
              </span>
              <Link
                href={`/admin/news/${entry.slug}`}
                className="min-w-0 flex-1 truncate text-sm text-navy hover:text-gold-600"
              >
                {entry.data.title}
              </Link>
              <StatusTag status={entry.status} />
              <EditButton href={`/admin/news/${entry.slug}`} />
              <form action={deleteArticle}>
                <input type="hidden" name="slug" value={entry.slug} />
                <ConfirmSubmit>Delete</ConfirmSubmit>
              </form>
            </li>
          ))}
          {news.length === 0 ? (
            <li className="py-4 text-sm text-slate">No articles yet.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="font-serif text-xl text-navy">
            Projects <span className="text-slate">({projects.length})</span>
          </h2>
          <form action={createProject} className="flex items-center gap-2">
            <label htmlFor="new-project-name" className="sr-only">
              New project name
            </label>
            <input
              id="new-project-name"
              name="name"
              placeholder="New project name"
              className="field h-9 w-56 text-sm"
              required
            />
            <button type="submit" className="btn btn-primary h-9 px-4 text-[11px]">
              Add
            </button>
          </form>
        </div>

        <ul className="divide-y divide-line">
          {projects.map((entry) => (
            <li key={entry.slug} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-24 shrink-0 text-[11px] text-slate">
                {entry.data.city || "Not set"}
              </span>
              <Link
                href={`/admin/projects/${entry.slug}`}
                className="min-w-0 flex-1 truncate text-sm text-navy hover:text-gold-600"
              >
                {entry.data.name}
              </Link>
              <StatusTag status={entry.status} />
              <EditButton href={`/admin/projects/${entry.slug}`} />
              <form action={deleteProject}>
                <input type="hidden" name="slug" value={entry.slug} />
                <ConfirmSubmit>Delete</ConfirmSubmit>
              </form>
            </li>
          ))}
          {projects.length === 0 ? (
            <li className="py-4 text-sm text-slate">No projects yet.</li>
          ) : null}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/enquiries"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="flex items-center gap-2 font-serif text-lg text-navy">
            Enquiries
            {openEnquiries > 0 ? (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold tabular-nums text-navy">
                {openEnquiries}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            Messages sent from the website, with a handled marker.
          </p>
          <CardAction>Open inbox →</CardAction>
        </Link>
        <Link
          href="/admin/services"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="font-serif text-lg text-navy">Services</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            The seven service pages, their summaries, facts and linked rates.
          </p>
          <CardAction>Edit →</CardAction>
        </Link>
        <Link
          href="/admin/partners"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="font-serif text-lg text-navy">Partners</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            Organisations on the public directory, with their logos, links and display order.
          </p>
          <CardAction>Edit →</CardAction>
        </Link>
        <Link
          href="/admin/faq"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="font-serif text-lg text-navy">FAQ</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            Questions and answers grouped into sections.
          </p>
          <CardAction>Edit →</CardAction>
        </Link>
        <Link
          href="/admin/rates"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="font-serif text-lg text-navy">Published rates</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            Bond and loan rates from the latest approved notice.
          </p>
          <CardAction>Edit →</CardAction>
        </Link>
        <Link
          href="/admin/media"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="font-serif text-lg text-navy">Media</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            Upload and remove images used across the website.
          </p>
          <CardAction>Manage images →</CardAction>
        </Link>
        <Link
          href="/admin/settings"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="font-serif text-lg text-navy">Contact details</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            Telephone, email, office address, opening hours, portals and social channels.
          </p>
          <CardAction>Edit →</CardAction>
        </Link>
        <Link
          href="/admin/credit"
          className="border border-line bg-white p-5 transition-colors hover:border-gold/60"
        >
          <p className="font-serif text-lg text-navy">Credit policy</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">
            Facilities, limits, effective dates and the policy document.
          </p>
          <CardAction>Edit →</CardAction>
        </Link>
      </section>

      {staff.role === "admin" ? (
      <section>
        <h2 className="border-b border-line pb-3 font-serif text-xl text-navy">Recent activity</h2>
        <ul className="divide-y divide-line text-sm">
          {audit.map((row) => (
            <li key={String(row.id)} className="flex flex-wrap gap-2 py-2.5 text-slate">
              <span className="w-40 shrink-0 text-[11px] tabular-nums text-slate/70">
                {new Date(String(row.created_at)).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              <span className="text-navy">{String(row.action)}</span>
              <span className="text-slate/80">
                {String(row.collection)}/{String(row.slug)}
              </span>
              <span className="ml-auto text-[11px]">{String(row.actor_email)}</span>
            </li>
          ))}
          {audit.length === 0 ? (
            <li className="py-3 text-slate">No changes recorded yet.</li>
          ) : null}
        </ul>
      </section>
      ) : null}

      <aside className="border border-line bg-white p-5 text-xs leading-relaxed text-slate">
        <p className="font-semibold text-navy">How publishing works</p>
        <p className="mt-2">
          Saving with <strong>Publish</strong> makes the change live immediately and records who made
          it. <strong>Save draft</strong> keeps it out of the public website. Never publish figures,
          project details or testimonials the Society has not verified.
        </p>
      </aside>
    </div>
  );
}

function CardAction({ children }: { children: ReactNode }) {
  return (
    <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600">
      {children}
    </span>
  );
}

function StatusTag({ status }: { status: "draft" | "published" }) {
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.1em] ${
        status === "published" ? "text-gold-600" : "text-slate/70"
      }`}
    >
      {status}
    </span>
  );
}
