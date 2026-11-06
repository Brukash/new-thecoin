import type { ReactNode } from "react";
import type { EventCategory, SocietyEvent } from "@/lib/events/types";
import { EVENT_TIMEZONES } from "@/lib/events/format";
import { EVENT_CATEGORY_FALLBACK } from "@/lib/events/categories";

/**
 * The event editor fields, shared by the create and edit screens.
 *
 * Plain server-rendered inputs: the form posts to a server action, so the
 * console works without client-side state and cannot drift from validation.
 */

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return date.toISOString().slice(0, 16);
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h2 className="font-serif text-lg text-navy">{title}</h2>
      {hint ? <p className="mt-1 text-[11px] leading-relaxed text-slate">{hint}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] leading-relaxed text-slate">{hint}</p> : null}
    </div>
  );
}

function AssetField({
  label,
  name,
  current,
  accept,
  hint,
}: {
  label: string;
  name: string;
  current: string;
  accept: string;
  hint: string;
}) {
  return (
    <div className="border border-line bg-bone p-4">
      <p className="field-label">{label}</p>
      <input type="hidden" name={`${name}Url`} value={current} />
      {current ? (
        <p className="mt-2 break-all text-[11px] text-slate">{current}</p>
      ) : (
        <p className="mt-2 text-[11px] text-slate">Nothing uploaded yet.</p>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        className="field mt-3 py-2 text-sm"
      />
      <p className="mt-1 text-[11px] leading-relaxed text-slate">{hint}</p>
      {current ? (
        <label className="mt-2 flex items-center gap-2 text-[11px] text-slate">
          <input type="checkbox" name={`${name}Remove`} value="1" className="size-4" />
          Remove this file
        </label>
      ) : null}
    </div>
  );
}

export function EventForm({
  event,
  categories,
}: {
  event: SocietyEvent | null;
  categories: EventCategory[];
}) {
  const options = categories.length
    ? categories
    : EVENT_CATEGORY_FALLBACK.map((category, index) => ({
        id: category.slug,
        name: category.name,
        slug: category.slug,
        description: "",
        displayOrder: (index + 1) * 10,
        active: true,
      }));

  return (
    <div className="space-y-8 bg-white p-6 ring-1 ring-line">
      <Section title="Basic information">
        <Field label="Event title" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={event?.title ?? ""}
            className="field mt-2"
            required
            maxLength={200}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="URL slug" htmlFor="slug" hint="Set when the event is created; it is the address of the event page.">
            <input
              id="slug"
              name="slugDisplay"
              defaultValue={event?.slug ?? ""}
              className="field mt-2 bg-bone"
              readOnly
            />
          </Field>
          <Field label="Edition" htmlFor="edition" hint="For example: 8th Edition. Optional.">
            <input
              id="edition"
              name="edition"
              defaultValue={event?.edition ?? ""}
              className="field mt-2"
              maxLength={40}
            />
          </Field>
        </div>

        <Field label="Category" htmlFor="categoryId">
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={event?.categoryId ?? ""}
            className="field mt-2"
          >
            <option value="">No category</option>
            {options.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Short description"
          htmlFor="shortDescription"
          hint="One or two sentences, used on cards, the homepage promotion and search results."
        >
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={3}
            defaultValue={event?.shortDescription ?? ""}
            className="field mt-2"
            maxLength={400}
          />
        </Field>

        <Field label="Full description" htmlFor="fullDescription" hint="Separate paragraphs with a blank line.">
          <textarea
            id="fullDescription"
            name="fullDescription"
            rows={8}
            defaultValue={event?.fullDescription ?? ""}
            className="field mt-2"
          />
        </Field>

        <Field
          label="Objectives"
          htmlFor="objectives"
          hint="One objective per line. Leave empty until the Society has approved them."
        >
          <textarea
            id="objectives"
            name="objectives"
            rows={4}
            defaultValue={(event?.objectives ?? []).join("\n")}
            className="field mt-2"
          />
        </Field>

        <Field
          label="Participating organisations"
          htmlFor="exhibitors"
          hint="One exhibitor or participating organisation per line. Only add names the Society has confirmed."
        >
          <textarea
            id="exhibitors"
            name="exhibitors"
            rows={4}
            defaultValue={(event?.exhibitors ?? []).join("\n")}
            className="field mt-2"
          />
        </Field>
      </Section>

      <Section title="Scheduling" hint="Times are recorded in the selected time zone. Leave them blank if not yet confirmed.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="startDate">
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={event?.startDate ?? ""}
              className="field mt-2"
              required
            />
          </Field>
          <Field label="End date" htmlFor="endDate">
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={event?.endDate ?? ""}
              className="field mt-2"
            />
          </Field>
          <Field label="Start time" htmlFor="startTime">
            <input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={event?.startTime?.slice(0, 5) ?? ""}
              className="field mt-2"
            />
          </Field>
          <Field label="End time" htmlFor="endTime">
            <input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={event?.endTime?.slice(0, 5) ?? ""}
              className="field mt-2"
            />
          </Field>
        </div>

        <Field label="Time zone" htmlFor="timezone">
          <select
            id="timezone"
            name="timezone"
            defaultValue={event?.timezone ?? "Africa/Lagos"}
            className="field mt-2"
          >
            {EVENT_TIMEZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Location">
        <Field label="Venue name" htmlFor="venueName">
          <input
            id="venueName"
            name="venueName"
            defaultValue={event?.venueName ?? ""}
            className="field mt-2"
          />
        </Field>
        <Field label="Full address" htmlFor="venueAddress">
          <textarea
            id="venueAddress"
            name="venueAddress"
            rows={2}
            defaultValue={event?.venueAddress ?? ""}
            className="field mt-2"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Google Maps URL" htmlFor="mapsUrl" hint="Optional. Used for the directions link and map.">
            <input
              id="mapsUrl"
              name="mapsUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              defaultValue={event?.mapsUrl ?? ""}
              className="field mt-2"
            />
          </Field>
          <Field label="Online event URL" htmlFor="onlineEventUrl" hint="For hybrid or online events.">
            <input
              id="onlineEventUrl"
              name="onlineEventUrl"
              type="url"
              placeholder="https://"
              defaultValue={event?.onlineEventUrl ?? ""}
              className="field mt-2"
            />
          </Field>
        </div>
      </Section>

      <Section title="Media" hint="Images are optimised by the browser on upload limits; PDFs are capped at 10 MB.">
        <AssetField
          label="Featured banner"
          name="banner"
          current={event?.bannerUrl ?? ""}
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          hint="Landscape image used on the homepage and event hero. JPG, PNG, WebP, AVIF or SVG under 5 MB."
        />
        <AssetField
          label="Event poster"
          name="poster"
          current={event?.posterUrl ?? ""}
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          hint="Optional portrait poster, linked from the event page."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AssetField
            label="Brochure (PDF)"
            name="brochure"
            current={event?.brochureUrl ?? ""}
            accept="application/pdf"
            hint="Optional PDF under 10 MB."
          />
          <AssetField
            label="Programme (PDF)"
            name="programme"
            current={event?.programmeUrl ?? ""}
            accept="application/pdf"
            hint="Optional PDF under 10 MB."
          />
        </div>
      </Section>

      <Section title="Registration and enquiries">
        <label className="flex items-center gap-3 text-sm text-navy">
          <input
            type="checkbox"
            name="registrationRequired"
            defaultChecked={event?.registrationRequired ?? false}
            className="size-4"
          />
          Registration is required for this event
        </label>

        <Field
          label="External registration URL"
          htmlFor="registrationUrl"
          hint="Leave blank to collect registrations on this website instead."
        >
          <input
            id="registrationUrl"
            name="registrationUrl"
            type="url"
            placeholder="https://"
            defaultValue={event?.registrationUrl ?? ""}
            className="field mt-2"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registration deadline" htmlFor="registrationDeadline">
            <input
              id="registrationDeadline"
              name="registrationDeadline"
              type="date"
              defaultValue={event?.registrationDeadline ?? ""}
              className="field mt-2"
            />
          </Field>
          <Field label="Enquiry email" htmlFor="enquiryEmail">
            <input
              id="enquiryEmail"
              name="enquiryEmail"
              type="email"
              placeholder="info@cbncoopng.com"
              defaultValue={event?.enquiryEmail ?? ""}
              className="field mt-2"
            />
          </Field>
        </div>

        <Field label="Contact telephone" htmlFor="contactPhone">
          <input
            id="contactPhone"
            name="contactPhone"
            defaultValue={event?.contactPhone ?? ""}
            className="field mt-2"
          />
        </Field>
      </Section>

      <Section title="Publication">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Publication status" htmlFor="publicationStatus">
            <select
              id="publicationStatus"
              name="publicationStatus"
              defaultValue={event?.publicationStatus ?? "draft"}
              className="field mt-2"
            >
              <option value="draft">Draft — staff only</option>
              <option value="scheduled">Scheduled — publishes automatically</option>
              <option value="published">Published</option>
              <option value="archived">Archived — hidden, page kept</option>
            </select>
          </Field>
          <Field
            label="Publication date and time"
            htmlFor="publishedAt"
            hint="Used when the status is Scheduled. Leave blank to publish now."
          >
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={toLocalInput(event?.publishedAt ?? null)}
              className="field mt-2"
            />
          </Field>
          <Field
            label="Event status"
            htmlFor="organiserStatus"
            hint="Cancelled and postponed events are shown with a notice and never as ordinary upcoming events."
          >
            <select
              id="organiserStatus"
              name="organiserStatus"
              defaultValue={event?.organiserStatus ?? "scheduled"}
              className="field mt-2"
            >
              <option value="scheduled">Proceeding as scheduled</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Homepage promotion">
        <label className="flex items-center gap-3 text-sm text-navy">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={event?.featured ?? false}
            className="size-4"
          />
          Feature this event on the homepage
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Display priority" htmlFor="displayOrder" hint="Lower numbers come first.">
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min={0}
              max={999}
              defaultValue={event?.displayOrder ?? 0}
              className="field mt-2"
            />
          </Field>
          <Field label="Promotion starts" htmlFor="promotionStart">
            <input
              id="promotionStart"
              name="promotionStart"
              type="datetime-local"
              defaultValue={toLocalInput(event?.promotionStart ?? null)}
              className="field mt-2"
            />
          </Field>
          <Field label="Promotion ends" htmlFor="promotionEnd">
            <input
              id="promotionEnd"
              name="promotionEnd"
              type="datetime-local"
              defaultValue={toLocalInput(event?.promotionEnd ?? null)}
              className="field mt-2"
            />
          </Field>
        </div>
      </Section>

      <Section title="Search engine listing">
        <Field label="SEO title" htmlFor="seoTitle" hint="Defaults to the event title when left blank.">
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={event?.seoTitle ?? ""}
            className="field mt-2"
            maxLength={200}
          />
        </Field>
        <Field
          label="Meta description"
          htmlFor="seoDescription"
          hint="Aim for 150–160 characters. Defaults to the short description."
        >
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={3}
            defaultValue={event?.seoDescription ?? ""}
            className="field mt-2"
            maxLength={400}
          />
        </Field>
      </Section>
    </div>
  );
}
