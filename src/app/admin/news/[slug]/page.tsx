import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isSignedIn } from "@/lib/admin-auth";
import { readNews } from "@/lib/admin-content";
import { getArticle } from "@/lib/content";
import { saveArticle } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isSignedIn())) redirect("/admin");

  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const categories = readNews().categories;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">{article.title}</h1>
      <p className="mt-1 text-xs text-slate">
        /news/{article.slug} · {article.date}
      </p>

      <form action={saveArticle} className="mt-8 space-y-6 bg-white p-6 ring-1 ring-line">
        <input type="hidden" name="slug" value={article.slug} />

        <div>
          <label htmlFor="title" className="field-label">
            Title
          </label>
          <input id="title" name="title" defaultValue={article.title} required className="field mt-2" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="field-label">
              Category
            </label>
            <select id="category" name="category" defaultValue={article.category} className="field mt-2">
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="field-label">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={article.date}
              className="field mt-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className="field-label">
            Summary
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            defaultValue={article.excerpt}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="body" className="field-label">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={14}
            defaultValue={article.body.join("\n\n")}
            className="field mt-2 font-mono text-[13px] leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate">
            Separate paragraphs with a blank line. Facts only: no invented figures.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="image" className="field-label">
              Image path
            </label>
            <input
              id="image"
              name="image"
              defaultValue={article.image ?? ""}
              placeholder="/images/hero/p9.jpg"
              className="field mt-2"
            />
          </div>
          <div>
            <label htmlFor="imageAlt" className="field-label">
              Image description
            </label>
            <input
              id="imageAlt"
              name="imageAlt"
              defaultValue={article.imageAlt}
              className="field mt-2"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" name="featured" defaultChecked={article.featured} />
          Feature on the homepage
        </label>

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
