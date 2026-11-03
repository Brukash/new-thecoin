import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isSignedIn } from "@/lib/admin-auth";
import { getProject } from "@/lib/content";
import { saveProject } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isSignedIn())) redirect("/admin");

  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">{project.name}</h1>
      <p className="mt-1 text-xs text-slate">/projects/{project.slug}</p>

      <form action={saveProject} className="mt-8 space-y-6 bg-white p-6 ring-1 ring-line">
        <input type="hidden" name="slug" value={project.slug} />

        <div>
          <label htmlFor="name" className="field-label">
            Project name
          </label>
          <input id="name" name="name" defaultValue={project.name} required className="field mt-2" />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className="field-label">
              City
            </label>
            <input id="city" name="city" defaultValue={project.city} className="field mt-2" />
          </div>
          <div>
            <label htmlFor="state" className="field-label">
              State
            </label>
            <input id="state" name="state" defaultValue={project.state} className="field mt-2" />
          </div>
          <div>
            <label htmlFor="status" className="field-label">
              Status
            </label>
            <input id="status" name="status" defaultValue={project.status} className="field mt-2" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="field-label">
              Location line
            </label>
            <input
              id="location"
              name="location"
              defaultValue={project.location}
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="type" className="field-label">
              Type
            </label>
            <input id="type" name="type" defaultValue={project.type} className="field mt-2" />
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="field-label">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={2}
            defaultValue={project.summary}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="field-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={12}
            defaultValue={project.description.join("\n\n")}
            className="field mt-2 font-mono text-[13px] leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate">
            Separate paragraphs with a blank line. Prices, completion figures and unit counts must be
            confirmed by the Secretariat before publication.
          </p>
        </div>

        <div>
          <label htmlFor="image" className="field-label">
            Image path (leave blank to use the project placeholder)
          </label>
          <input
            id="image"
            name="image"
            defaultValue={project.image ?? ""}
            placeholder="/images/hero/p3.jpg"
            className="field mt-2"
          />
        </div>

        <div className="flex gap-3 border-t border-line pt-5">
          <button type="submit" className="btn btn-primary">
            Save and publish
          </button>
          <Link href="/admin" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
