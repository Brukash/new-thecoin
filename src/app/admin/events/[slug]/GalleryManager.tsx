import Image from "next/image";
import type { GalleryImage } from "@/lib/events/types";
import { addGalleryAction, deleteGalleryAction } from "../actions";

/** Photograph manager for one event. Uploads land in the event-media bucket. */
export function GalleryManager({ slug, images }: { slug: string; images: GalleryImage[] }) {
  return (
    <section className="mt-10 border-t border-line pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-navy">Event gallery</h2>
          <p className="mt-1 text-xs text-slate">
            {images.length} photograph{images.length === 1 ? "" : "s"}. Images appear on the public
            event page and in the gallery centre.
          </p>
        </div>
        <form action={addGalleryAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="slug" value={slug} />
          <div>
            <label htmlFor="gallery-image" className="field-label">
              Photograph
            </label>
            <input
              id="gallery-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              className="field mt-1 w-56 py-2 text-xs"
            />
          </div>
          <div>
            <label htmlFor="gallery-caption" className="field-label">
              Caption
            </label>
            <input id="gallery-caption" name="caption" className="field mt-1 h-9 w-48 text-sm" />
          </div>
          <button type="submit" className="btn btn-primary h-9 px-4 text-[12px]">
            Add
          </button>
        </form>
      </div>

      {images.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <li key={image.id} className="border border-line bg-white">
              <div className="relative aspect-[4/3] bg-bone">
                <Image
                  src={image.imageUrl}
                  alt={image.caption || "Event photograph"}
                  fill
                  sizes="(max-width: 640px) 45vw, 22vw"
                  className="object-cover"
                />
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-[12px] text-slate">{image.caption || "No caption"}</p>
                <form action={deleteGalleryAction} className="mt-1">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <button type="submit" className="text-[11px] uppercase tracking-[0.1em] text-red-700">
                    Remove
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate">No photographs yet.</p>
      )}
    </section>
  );
}
