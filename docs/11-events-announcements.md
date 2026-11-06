# Events and announcements module

The module lets the Secretariat run the Society's events and notices from the
staff console, without a developer. It is part of the existing website: same
design system, same Supabase project, same authentication.

## What members and visitors see

| Address | Purpose |
| --- | --- |
| `/events` | Upcoming and ongoing events, with search and category filters |
| `/events/past` | Archive of completed events, searchable and filterable |
| `/events/announcements` | Official notices, urgents first |
| `/events/announcements/[slug]` | One notice, with attachment and sharing |
| `/events/gallery` | Photographs grouped by event |
| `/events/[slug]` | Event landing page |
| `/events/[slug]/calendar.ics` | Calendar download |
| Homepage | Featured event with live countdown, plus an urgent-notice banner |

The event page carries: banner, title, edition and category, date and time
(West Africa Time), venue with a map link and embedded map, introduction,
objectives, participating organisations, programme and poster downloads,
gallery, registration or enquiry options, contact details, sharing and related
events. Cancelled and postponed events show a notice instead of an ordinary
upcoming listing.

## Status model

Two independent facts are stored:

* `publication_status` — `draft`, `scheduled`, `published`, `archived`.
* `event_status` — `scheduled`, `cancelled`, `postponed`.

`upcoming`, `ongoing` and `completed` are **derived from the dates at read
time** (Africa/Lagos, UTC+01:00), so a page can never claim an event is upcoming
after it has finished. `starts_at` and `ends_at` are stored as instants when the
organiser saves the event, which also makes the countdown, ICS file and calendar
link independent of the reader's clock.

Past events are never deleted automatically. When an event ends it drops out of
the upcoming list and appears in the archive, keeping its page, photographs,
downloads and SEO metadata.

Scheduled publication is handled twice over: the database shows a scheduled row
once `published_at` passes, and `GET /api/cron/events` (guarded by
`CRON_SECRET`) refreshes the cached pages. Deriving state at render time means
nothing goes stale even if the scheduler is not wired up yet.

## Database

Migration: `supabase/migrations/20261105_events_announcements.sql`
(applied as `events_announcements_module`, plus `events_exhibitors`).

| Table | Contents |
| --- | --- |
| `event_categories` | Nine seeded categories; administrators can add more |
| `events` | One row per event, all scheduling, venue, media, registration, publication and SEO fields |
| `event_gallery` | Event photographs with captions and order |
| `event_registrations` | Internal registrations, consent recorded, private |
| `event_enquiries` | Event enquiries with an open/resolved status |
| `announcements` | Notices with category, urgency, feature flag, publication and expiry |
| `event_activity_logs` | Admin-only audit trail written by the server |

Row level security is enabled on every table:

* anonymous visitors read published events, active categories, gallery images of
  published events, and unexpired published announcements;
* registrations and enquiries can be **inserted** for published events only —
  never read back by the public;
* staff roles (`public.is_staff()`) manage content; only admins read the
  activity log;
* a database check requires consent on every registration row.

Storage: the public `event-media` bucket holds banners, posters, galleries and
PDFs; writes are restricted to staff.

## Console

* `/admin/events` — all events, with status, homepage flag, publish/unpublish,
  feature toggle, preview, delete and links to categories and announcements.
* `/admin/events/new` — create a draft.
* `/admin/events/[slug]` — the full editor, gallery manager and publication bar.
* `/admin/events/[slug]/registrations` — registrations, statuses and CSV export.
* `/admin/events/[slug]/enquiries` — messages, resolve and reopen.
* `/admin/events/categories` — categories (name, slug, order, visibility).
* `/admin/announcements` and `/admin/announcements/[slug]` — notices, with image
  and PDF upload, expiry and the urgent banner.

Every action runs through a server action behind `requireStaff()`, validates
with Zod and revalidates the affected public pages.

## Registration and enquiries

Two participation methods are supported per event:

* **External** — set a registration URL; the event page links to it.
* **Internal** — leave the URL blank with "registration required" on; the site
  shows its own form (name, email, telephone, organisation, attendees, notes,
  consent). Five submissions per hour per address are accepted, with a hidden
  honeypot field. Registrations are stored privately and can be exported to CSV
  by staff.

Enquiries are stored on the event and answered from the console. Neither
records personal data anywhere public.

## Notifications

`src/lib/events/notifications.ts` defines the hooks for event publication,
registration confirmation, approaching dates, postponement, cancellation and
updates. No provider is connected: the module intentionally sends nothing until
the Society approves an email service or WhatsApp integration and sets
`EVENT_NOTIFICATION_CHANNEL`. Consent rules are documented in that file.

## Daily use: running an event

1. **Create** — Events → Create event. Enter the title, category, dates and a short
description, then create the draft.
2. **Complete the editor** — add times (leave blank until confirmed), venue and
address, objectives (one per line), participating organisations (one per line),
the banner and optional poster, and the brochure/programme PDFs.
3. **Registration** — tick "registration is required", then either paste an
external registration URL or leave it blank to use the website's own form.
Set a deadline, enquiry email and telephone.
4. **Preview** — use *Preview page* at the top. A draft is only visible to signed-in
staff; the public link returns 404 until it is published.
5. **Publish** — set the publication status to Published, or Scheduled with a
publication date and time, and save. Add the homepage flag if it should lead
the site, with an optional promotion window.
6. **During the event** — the countdown stops at the start and the page shows
"Event in progress". To cancel or postpone, change *Event status* and save; the
page shows a notice and the event leaves the upcoming list.
7. **Afterwards** — do nothing. The event moves to the archive automatically,
keeping its page, photographs and downloads. Archive it only to hide it.
8. **Registrations and enquiries** — open the event's Registrations and Enquiries
pages. Approve, decline or mark attendance; export CSV only for the organising
team. Mark enquiries resolved as they are answered.
9. **Notices** — Announcements → add. Set a category, expiry date, attachment and
"urgent" if it should appear as a banner on the homepage.

Deleting an event removes its registrations and gallery with it, and asks for
confirmation first. Archive rather than delete when the record should remain.

## Published event: 2026 Nationwide Food Distribution Exercise

> 2026 CBN Cooperative Nationwide Food Distribution Exercise — begins Monday,
> 9 November 2026.

This is the Society's first published event and currently leads the homepage.
Only the title and the commencement date have been announced, so the record
carries no venue, time, registration or programme details. The page says
"Time to be announced", the calendar download is an all-day entry
(`DTSTART;VALUE=DATE`), and the countdown is withheld until a start time is
confirmed. An administrator can complete the record from the console.

Records with a date but no time are treated as all-day events throughout the
module — in the ICS file, the Google Calendar link and the event lifecycle —
so no opening hour is ever invented.

## Seeded events

`npm run cms:seed:events` seeds the nine categories and two published events:

> 2026 CBN Cooperative Nationwide Food Distribution Exercise — begins Monday,
> 9 November 2026.

> 2026 End of Year Sales and Exhibition, 8th Edition — Monday, 30 November to
> Saturday, 5 December 2026, National Ecumenical Centre Car Park, Sani Abacha
> Way, Central Business District, Abuja. Featured while it is the next event.

Only supplied facts were written. Opening hours, registration conditions,
exhibitors, objectives and programme details are empty on purpose, so they
cannot be published by accident.

Where a date has been announced but no opening time, the page reads "Time to be
announced", the calendar download is an all-day entry, and the stored instant is
used only to order events and drive the countdown. A time appears on the page as
soon as an administrator enters one in the console.

## Which event is featured

The featured slot is not maintained by hand. Whenever the events hub or the
homepage renders, `featuredEventOf()` takes the published event that is still
upcoming or running, earliest start first, so the slot moves to the next date by
itself as soon as one finishes. Nothing is pinned by hand: the Featured flag in
the console no longer decides the slot, and the promotion window (when set) can
hold an event back until the Secretariat is ready to announce it.

The events hub shows that event as a panel above the diary and leaves it out of
the card grid, so the same event never appears twice. Searching or filtering
disables the panel for that request and lists matches normally.

## Tests performed

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| Draft event hidden from the public (`/events/[slug]`) | 404 |
| Published event page | 200, title, venue, JSON-LD `Event`, countdown, registration form present |
| `/events`, `/events/past`, `/events/announcements`, `/events/gallery` | 200 |
| Homepage featured event with countdown | Present for the next upcoming event, without a manual flag |
| Urgent announcement banner | Present when an urgent published notice exists |
| ICS download | `text/calendar`, one `VEVENT`, correct UTC start/end, venue and title |
| Anonymous read of a published event | Allowed (1 row) |
| Anonymous read of registrations | 0 rows |
| Anonymous registration insert on a published event | Accepted; not readable back |
| Registration without consent | Rejected (23514) |
| Draft announcements | Not visible to anonymous visitors |
| Console routes | 307 to sign-in without a session |

Not verified here: signing in to the console and clicking through the editors
(the stored test password is rejected), so the upload and save paths are
covered by typecheck/build and the database tests rather than a live session.

## Operational notes

* Set `CRON_SECRET` and schedule the refresh endpoint daily (or hourly) if the
  host offers a scheduler.
* Adding a new category never needs a developer; removing one leaves its events
  uncategorised rather than deleting them.
* Deletes are permanent and ask for confirmation; archive instead when the
  record should stay online.
