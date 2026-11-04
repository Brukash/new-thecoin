# Content management system

The staff console lives at `/admin`. Content is stored in Supabase (Postgres,
Auth and Storage) and published to the public site. When Supabase is not
configured the site serves the verified files in `content/`, so preview builds
and local development never depend on the database.

## One-time setup

1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`. This creates the content
   tables, row level security policies, the audit trail, the enquiry inbox and
   the public `media` bucket.
3. In Authentication, create a user for each staff member (email + password).
   Then authorise the account:

   ```sql
   insert into public.staff (id, email, full_name, role)
   select id, email, 'Staff name', 'editor'
   from auth.users where email = 'staff@cbn.gov.ng';
   ```

   Use `role = 'admin'` for officers who should also manage accounts and read
   the audit trail. Creating a login alone does not grant publishing rights:
   the `staff` row is the authorisation.
4. Add the three keys to `.env.local` (see `.env.example`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`. The service role key is server-only; never
   prefix it with `NEXT_PUBLIC_`.
5. Seed the existing verified content into the database:

   ```bash
   npm run cms:seed
   ```

6. Restart the server and sign in at `/admin/login`.

## What staff can edit

| Collection | Console | Notes |
| --- | --- | --- |
| News | `/admin` → News | Create, edit, draft or publish, delete. |
| Projects | `/admin` → Projects | Same workflow. |
| Contact details | `/admin/settings` | Phone, email, address, hours; used by the contact page. |
| Services | `/admin/services` | The seven service pages: summary, opening paragraph, body, at-a-glance facts and related links. |
| FAQ | `/admin/faq` | Questions and answers, grouped into sections. |
| Rates | `/admin/rates` | Bond and loan rates, reproduced from the latest approved notice. |
| Media | `/admin/media` | Upload and remove images in the Supabase storage bucket. |
| Credit policy | `/admin/credit` | Existing approval workflow, including the typed `APPROVE` confirmation. |

Every public page that reads a collection uses the database when it is seeded
and falls back to the verified files in `content/` otherwise. The header and
footer navigation still read the service list from `content/services.ts` so the
menu cannot break if a document is unfinished.

## Publishing rules

- A document is either `draft` or `published`. The public queries read only
  `published`, and fall back to the bundled files when a collection is empty.
- Every save, publish, delete, upload and staff change writes an `audit_log`
  row with the actor. Only admins can read it.
- Credit policy edits never publish themselves: the record drops to
  `pending-verification` and stays `noindex` until an officer approves it.
- Do not publish unverified figures, testimonials, project prices or partner
  claims. The console is an editing tool, not a source of facts.

## Security model

- Row level security is enabled on every table. Anonymous readers see published
  content and public media only; staff write through policies that call
  `is_staff()`; the audit trail is admin-only.
- The browser only holds the anon key and the session cookies. All writes go
  through server actions using the service role, so validation (zod), audit
  logging and cache revalidation cannot be skipped.
- `/admin` is `noindex, nofollow, no-store` via `next.config.ts` and is gated by
  `middleware.ts`, which refreshes the Supabase session and redirects signed-out
  visitors to `/admin/login`.
- Local fallback: without Supabase, the console uses `ADMIN_PASSWORD` and
  `SESSION_SECRET`. That path is for development only.

## Operational notes

- Saving calls `revalidatePath("/", "layout")`, so changes appear without a
  rebuild.
- The audit trail records who published what; it is the record to check when a
  figure is questioned.
- Backups, point-in-time recovery and database access are managed in Supabase.
- The credit policy editor still writes to the repository filesystem. That works
  on a Node server but not on a serverless host; moving it to the
  `credit-policy` collection is the remaining backend task.
- The console shows the bundled copy in the editors until a collection is
  saved for the first time, so staff always start from the verified text.
