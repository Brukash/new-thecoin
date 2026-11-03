import Link from "next/link";
import { isAdminConfigured, isSignedIn } from "@/lib/admin-auth";
import { readNews, readProjects } from "@/lib/admin-content";
import { LoginForm } from "./LoginForm";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { createArticle, createProject, deleteArticle, deleteProject, logout } from "./actions";

export const dynamic = "force-dynamic";

function Notice({ kind }: { kind: string | undefined }) {
  if (!kind) return null;
  const messages: Record<string, string> = {
    "news-saved": "Article saved and published.",
    "projects-saved": "Project saved and published.",
    "news-deleted": "Article deleted.",
    "projects-deleted": "Project deleted.",
  };
  const message = messages[kind];
  if (!message) return null;
  return (
    <p className="mb-6 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">{message}</p>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="font-serif text-3xl text-navy">Staff sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          The console publishes news and project updates to the public website.
        </p>
        {isAdminConfigured() ? null : (
          <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-xs leading-relaxed text-slate">
            This environment has no staff credentials set. Add <code>ADMIN_PASSWORD</code> (8+
            characters) and <code>SESSION_SECRET</code> (16+ characters) to <code>.env.local</code>
            , then restart the server.
          </p>
        )}
        <LoginForm />
      </div>
    );
  }

  const params = await searchParams;
  const news = readNews();
  const projects = readProjects();

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
            Content
          </p>
          <h1 className="mt-2 font-serif text-3xl text-navy">Console</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="btn btn-outline text-[11px]">
            Sign out
          </button>
        </form>
      </div>

      <Notice kind={params.saved ? `${params.saved}-saved` : undefined} />
      <Notice kind={params.deleted ? `${params.deleted}-deleted` : undefined} />

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="font-serif text-xl text-navy">
            News <span className="text-slate">({news.articles.length})</span>
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
          {news.articles.map((article) => (
            <li key={article.slug} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-24 shrink-0 text-[11px] tabular-nums text-slate">
                {article.date}
              </span>
              <Link
                href={`/admin/news/${article.slug}`}
                className="min-w-0 flex-1 truncate text-sm text-navy hover:text-gold-600"
              >
                {article.title}
              </Link>
              <span className="text-[10px] uppercase tracking-[0.1em] text-slate">
                {article.category}
              </span>
              <form action={deleteArticle}>
                <input type="hidden" name="slug" value={article.slug} />
                <ConfirmSubmit>Delete</ConfirmSubmit>
              </form>
            </li>
          ))}
          {news.articles.length === 0 ? (
            <li className="py-4 text-sm text-slate">No articles yet.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-3">
          <h2 className="font-serif text-xl text-navy">
            Projects <span className="text-slate">({projects.projects.length})</span>
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
          {projects.projects.map((project) => (
            <li key={project.slug} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-24 shrink-0 text-[11px] text-slate">{project.city || "Not set"}</span>
              <Link
                href={`/admin/projects/${project.slug}`}
                className="min-w-0 flex-1 truncate text-sm text-navy hover:text-gold-600"
              >
                {project.name}
              </Link>
              <span className="text-[10px] uppercase tracking-[0.1em] text-slate">
                {project.status}
              </span>
              <form action={deleteProject}>
                <input type="hidden" name="slug" value={project.slug} />
                <ConfirmSubmit>Delete</ConfirmSubmit>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="border-b border-line pb-3 font-serif text-xl text-navy">Credit policy</h2>
        <Link
          href="/admin/credit"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-line bg-white p-4 transition-colors hover:border-gold/60"
        >
          <span className="text-sm text-navy">
            Facilities, limits, effective dates and the policy document
            <span className="mt-1 block text-xs text-slate">
              Figures stay out of search results until an officer approves them.
            </span>
          </span>
          <span className="text-[11px] uppercase tracking-[0.1em] text-gold-600">Open editor</span>
        </Link>
      </section>

      <aside className="border border-line bg-white p-5 text-xs leading-relaxed text-slate">
        <p className="font-semibold text-navy">How publishing works</p>
        <p className="mt-2">
          Saving an item writes it to the content store and revalidates the affected public pages,
          so changes appear immediately. Only publish figures and project details the Society has
          verified; do not add testimonials, statistics or partners that have not been approved.
        </p>
      </aside>
    </div>
  );
}
