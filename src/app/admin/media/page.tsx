import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { listMedia } from "@/lib/cms/store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { uploadMediaAction, deleteMediaAction, updateMediaAltAction } from "../actions";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  file: "Choose an image to upload.",
  upload: "The upload failed. Check the file type (JPG, PNG, WebP, AVIF, SVG) and that it is under 5 MB.",
};

export default async function MediaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  await requireStaff();

  const params = await searchParams;
  const media = await listMedia();

  return (
    <div>
      <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Media</h1>
      <p className="mt-1 text-xs text-slate">
        Images used in news articles and projects. Files are stored in the Supabase media bucket.
      </p>

      {params.saved ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          {params.saved === "alt"
            ? "Description saved."
            : "Image uploaded. Use its address in an article or project."}
        </p>
      ) : null}
      {params.deleted ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Image deleted.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors[params.error] ?? "That could not be completed."}
        </p>
      ) : null}

      {isSupabaseConfigured() ? (
        <form
          action={uploadMediaAction}
          className="mt-8 grid gap-4 bg-white p-6 ring-1 ring-line sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div>
            <label htmlFor="file" className="field-label">
              Image
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              required
              className="field mt-2 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="alt" className="field-label">
              Description
            </label>
            <input
              id="alt"
              name="alt"
              placeholder="What the image shows"
              className="field mt-2"
            />
          </div>
          <button type="submit" className="btn btn-primary h-10">
            Upload
          </button>
        </form>
      ) : (
        <p className="mt-8 border-l-2 border-gold bg-white px-4 py-3 text-xs leading-relaxed text-slate">
          Connect Supabase to upload images. Until then, articles and projects use the photographs
          shipped with the site.
        </p>
      )}

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <li key={item.id} className="border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt} className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-2 p-3">
              <p className="truncate text-[12px] text-slate" title={item.path}>
                {item.path}
              </p>
              <form action={updateMediaAltAction} className="flex items-center gap-2">
                <input type="hidden" name="path" value={item.path} />
                <label htmlFor={`alt-${item.id}`} className="sr-only">
                  Description for {item.path}
                </label>
                <input
                  id={`alt-${item.id}`}
                  name="alt"
                  defaultValue={item.alt}
                  placeholder="Description"
                  className="field h-8 min-w-0 flex-1 text-[12px]"
                />
                <button type="submit" className="btn btn-outline h-8 px-3 text-[11px]">
                  Save
                </button>
              </form>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-[0.1em] text-slate/70">
                  {Math.max(1, Math.round(item.sizeBytes / 1024))} KB
                </span>
                <form action={deleteMediaAction}>
                  <input type="hidden" name="path" value={item.path} />
                  <button type="submit" className="text-[12px] text-red-700 hover:underline">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {media.length === 0 ? (
        <p className="mt-8 text-sm text-slate">No images uploaded yet.</p>
      ) : null}
    </div>
  );
}
