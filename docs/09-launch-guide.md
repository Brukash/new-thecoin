# Supabase launch guide

A step-by-step path from the current repository state to a working,
database-backed CMS. It follows the five phases in the handover list:

1. Provision Supabase (blocking)
2. Test the CMS against the real instance (blocking)
3. Finish the remaining code
4. Quality and maintenance
5. Ship

Nothing here deploys anything. Commands run from the project root on Windows
(Git Bash, PowerShell or the VS Code terminal all work).

---

## Before you start

- One person owns the Supabase project (the "project owner"). That account
  controls billing, database access and backups.
- Decide who is `admin` and who is `editor`:

  | Role | Can publish content | Can manage staff | Can read the audit trail |
  | --- | --- | --- | --- |
  | `editor` | Yes | No | No (see 3.6) |
  | `admin` | Yes | Yes | Yes |

- Never paste the service role key into chat, email, a ticket or a commit.
  `.env.local` is already ignored by git (`.gitignore` lists `.env.local`).
- The production host must run Node 20 or newer and allow outbound HTTPS to
  Supabase. The credit policy editor still needs a writable filesystem until
  phase 3.1 is done.

---

## Phase 1 — Provision Supabase (blocking)

### 1.1 Create the project

1. Sign in at <https://supabase.com/dashboard>.
2. **New project**. Use the organisation that should own the site.
3. Name it something recognisable, for example `cbn-coop-cms`.
4. Choose the region closest to the users. For Abuja, a European region such as
   `eu-west-2` or `eu-central-1` is usually the lowest-latency option available
   in the picker.
5. Generate a strong database password and store it in the Society's password
   manager. It is not needed by the website, but it is needed for direct
   database access and restoration.
6. Create the project and wait for provisioning to finish (usually 2–3 minutes).

> The free plan pauses inactive projects and has no point-in-time recovery.
> Use a paid plan for the production site.

### 1.2 Run the schema

1. Open the project → **SQL Editor** → **New query**.
2. Copy the entire contents of [`supabase/schema.sql`](../supabase/schema.sql)
   and paste it in.
3. Press **Run**. It should finish without errors.

The script creates:

- `public.staff` — the allow-list that authorises a login to publish
- `public.content_entries` — every editable document, as validated JSON
- `public.media` — the index of uploaded files
- `public.audit_log` — who saved, published or deleted what
- `public.enquiries` — the enquiry inbox
- the public `media` storage bucket and its policies
- row level security on every table, plus `is_staff()` and `is_admin()`

It is safe to run again: tables use `if not exists` and policies are dropped and
recreated.

Verify in the SQL editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by 1;

select id, public from storage.buckets where id = 'media';

select tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Expected: the five tables above, the `media` bucket with `public = true`, and
the content, staff, media, audit and enquiry policies.

### 1.3 Create staff accounts

Creating a login does **not** grant publishing rights. Each person needs both an
Authentication user and a matching `public.staff` row.

1. Go to **Authentication → Users → Add user**.
2. Enter the person's work email and a strong temporary password.
3. Tick **Auto Confirm User** (or send an invite, depending on the project's
   email settings).
4. Repeat for each staff member.

Then authorise each account in the SQL editor, replacing the email, name and
role:

```sql
insert into public.staff (id, email, full_name, role)
select id, email, 'Full name', 'editor'   -- or 'admin'
from auth.users
where email = 'staff@example.com'
on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role;
```

Make the first person an `admin`, then let them authorise the rest.

Verify:

```sql
select s.email, s.full_name, s.role, u.email_confirmed_at is not null as confirmed
from public.staff s
join auth.users u on u.id = s.id
order by s.role, s.email;
```

An account that can sign in but has no row here is refused by the console with
"This account is not authorised to publish content." That is intentional.

### 1.4 Put the keys in `.env.local`

In the Supabase dashboard: **Project Settings → API**. Copy three values:

| Supabase field | Environment variable | Exposure |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `service_role` / secret key | `SUPABASE_SERVICE_ROLE_KEY` | **Server only** |

Open `.env.local` in the project root and add them:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
```

Rules:

- The service role key must never carry a `NEXT_PUBLIC_` prefix.
- Do not commit `.env.local`; do not paste these values into chat.
- Restart the dev server after editing the file: environment changes are only
  read at startup.

Check the configuration loaded:

```bash
node --env-file=.env.local -e "console.log(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY))"
```

Both should print `true`.

### 1.5 Seed the verified content

The seed copies the content already in the repository into Supabase and marks
it published. It is idempotent: running it again overwrites the same documents
and deletes nothing.

```bash
npm run cms:seed
```

Expected output: one line per document (`services/savings`, `faq/main`,
`rates/main`, …) and a final `Done. N documents written.`

Verify the counts:

```sql
select collection, status, count(*) as documents
from public.content_entries
group by collection, status
order by collection;
```

Expected, roughly:

| Collection | Documents |
| --- | --- |
| `settings` | 1 (`main`) |
| `services` | 7 |
| `faq` | 1 (`main`) |
| `rates` | 1 (`main`) |
| `credit-policy` | 1 (`main`) |
| `news` | one per article in `content/news.json` |
| `projects` | one per project in `content/projects.json` |

Then open the site and confirm the pages still read correctly with the database
behind them: `/`, `/services`, `/services/savings`, `/faq`, `/news`,
`/projects`, `/contact`.

At this point the public site would look identical if Supabase were removed —
that is the fallback working. To prove the database is actually being used, edit
one summary in the console, publish, and see the change on the page (phase 2.2).

### 1.6 Retire the local password

The local password (`ADMIN_PASSWORD` + `SESSION_SECRET`) exists only so the
console works before Supabase is configured. Once step 1.4 is done it is
ignored, but it should not stay as a usable default.

- Set `ADMIN_PASSWORD` to a long random value (or delete the line).
- Set `SESSION_SECRET` to at least 32 random bytes:

  ```bash
  openssl rand -base64 32
  ```

- Restart the server.

Phase 3.5 hardens this further so production cannot silently fall back.

---

## Phase 2 — Test against the real instance (blocking)

Run the site with the keys in place (`npm run dev`, or `npm run build` then
`npm start`). Use a normal window and a private window for the two-account
tests.

### 2.1 Sign-in, session and sign-out

- [ ] Signed out, `/admin` shows the email + password form (not the local
      password field).
- [ ] Signed out, `/admin/services` redirects to
      `/admin/login?next=%2Fadmin%2Fservices`.
- [ ] A wrong password shows "Those credentials were not accepted." and does not
      sign you in.
- [ ] A valid account with no `staff` row shows "This account is not authorised
      to publish content." and is signed back out.
- [ ] Signing in lands on `/admin` and shows your name and role.
- [ ] Reloading `/admin` keeps you signed in (the middleware refreshes the
      session cookies).
- [ ] Visiting `/admin/login` while signed in redirects to `/admin`.
- [ ] **Sign out** returns to `/admin/login`; pressing Back does not restore the
      console.
- [ ] In DevTools → Application, no service role key appears in local storage,
      session storage or any response body.

### 2.2 Draft, publish and delete

1. `/admin` → add a news article title → **Add**. You land in the editor.
2. Fill the summary and body, then **Save draft**.
3. Check the public site:
   - [ ] The article is absent from `/news`.
   - [ ] `/news/<slug>` returns the 404 page.
   - [ ] The dashboard marks it `draft`.
4. Back in the editor, press **Publish**.
   - [ ] It appears on `/news` and at its detail URL immediately, without a
         rebuild or restart.
   - [ ] The dashboard marks it `published`.
5. Confirm in SQL:

   ```sql
   select slug, status, updated_at
   from public.content_entries
   where collection = 'news'
   order by updated_at desc
   limit 5;

   select actor_email, action, collection, slug, created_at
   from public.audit_log
   order by created_at desc
   limit 10;
   ```

   You should see `save-draft` then `publish`, with your email.
6. **Delete** the article. Confirm it 404s and that `delete` is recorded.

Repeat the publish step once for projects, services, the FAQ and the rates
editor, since each writes a different document shape.

### 2.3 Two accounts and row level security

Create a second account as in 1.3 (one `editor`, one `admin`) and sign in to
each in a separate browser profile.

- [ ] The editor can publish content.
- [ ] The editor cannot reach staff management or audit-only screens (see 3.6
      for the one remaining leak).
- [ ] The admin sees the audit trail on the dashboard.

Test the anonymous rules directly. Replace the two placeholders with your anon
key and URL (the anon key is public, so this is safe to run):

```bash
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
ANON="YOUR-ANON-KEY"

# Published content only — drafts must not appear.
curl -s "$SUPABASE_URL/rest/v1/content_entries?select=collection,slug,status" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON"

# Publishing as an anonymous visitor must be refused.
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "$SUPABASE_URL/rest/v1/content_entries" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" \
  -d '{"collection":"news","slug":"rls-test","data":{},"status":"published"}'
```

Expected: only `published` rows in the first response; `401` or `403` from the
second, and no `rls-test` row created.

Finally confirm the secret never reaches a browser bundle:

```bash
grep -rl "SUPABASE_SERVICE_ROLE_KEY" .next/static 2>/dev/null || echo "not in client bundle"
```

### 2.4 Media uploads

- [ ] `/admin/media` accepts a JPG or PNG under 5 MB and shows a thumbnail.
- [ ] The file appears in **Storage → media** and in `select * from public.media`.
- [ ] The public URL opens in a new tab without a signed-in session.
- [ ] A wrong type (for example a PDF) and a file over 5 MB are refused.
- [ ] **Delete** removes both the object and the row, and writes `media-delete`
      to the audit trail.
- [ ] Pasting the uploaded URL into an article's **Image path** field and
      publishing shows the image on the article page.

### 2.5 Enquiry submission

- [ ] `/contact` accepts a valid enquiry and shows the reference number.
- [ ] An invalid email or a short message is rejected with a field message.
- [ ] Six submissions in quick succession return the rate-limit message.

The route stores submissions in `public.enquiries` through `saveEnquiry()`, and
falls back to `data/submissions/enquiries.jsonl` only in preview builds without
credentials. Confirm the row:

```sql
select reference, name, email, subject, created_at
from public.enquiries
order by created_at desc;
```

### 2.6 Console screens

Open each screen signed in and confirm it renders, saves and reports success:

- [ ] `/admin` (dashboard, counts, activity)
- [ ] `/admin/news/[slug]` and `/admin/projects/[slug]`
- [ ] `/admin/services` and `/admin/services/[slug]`
- [ ] `/admin/faq`
- [ ] `/admin/rates`
- [ ] `/admin/media`
- [ ] `/admin/settings`
- [ ] `/admin/credit`

Watch the browser console and the server log for errors during saves.

---

## Phase 3 — Finish the remaining code

Each item below names the files and the acceptance test. Do them in order.

### 3.1 Move the credit policy onto Supabase

**Why:** `src/lib/credit-admin.ts` and `src/app/admin/credit/actions.ts` use
`fs.readFileSync` / `fs.writeFileSync` on `content/credit-policy.json` and write
uploaded PDFs into `public/documents`. That fails on serverless hosting and is
lost on redeploy.

**Approach**

1. Read and write the store through `content_entries` with collection
   `credit-policy`, slug `main` (the schema and seed already support it).
2. Upload policy documents to the `media` bucket under `policies/` using the
   same pattern as `uploadMedia()` in `src/lib/cms/store.ts`, and store the
   public URL in `version.sourceFile`.
3. Make `getCreditPolicy()` async at every call site (credit pages, sitemap,
   metadata). `src/content/queries.ts` already has the async version; the
   credit pages still import the synchronous file-backed one.
4. Keep the approval rule: any edit demotes the document to
   `pending-verification`, and the pages stay `noindex` until approved.

**Acceptance**

- `grep -rn "node:fs" src/lib/credit-admin.ts src/app/admin/credit` returns
  nothing.
- Editing the policy, uploading a document, approving it, then redeploying keeps
  the change and the file.
- An unapproved edit is not indexed and is not listed in the sitemap.

### 3.2 Media picker in the article and project editors

Add a small client component that lists `listMedia()` results in a modal and
writes the chosen URL into the image field. Do not accept arbitrary uploads from
the browser: the upload stays a server action.

**Acceptance:** a staff member can publish an article with an uploaded image
without typing a URL.

### 3.3 Header and footer navigation from the database

`src/components/Header.tsx` and `src/components/Footer.tsx` import
`services` from `content/services.ts` directly, so renamed or added services do
not reach the menu.

**Approach:** fetch the list once in the `(site)` layout (server component) and
pass it down, or make the header a server component that renders a client menu
with the list as props.

**Acceptance:** renaming a service title in the console updates the menu after a
reload without a code change.

### 3.4 Add an enquiry inbox (storage is wired)

The route now stores submissions in `public.enquiries` through `saveEnquiry()`
and uses the JSON line file only when Supabase is unconfigured. What remains:

1. Add `/admin/enquiries` listing `public.enquiries`, with a "handled" toggle
   that updates the row (the RLS policy already allows staff updates).
2. Decide on notifications. If email is required, choose a transactional email
   provider, verify the domain, and call it from the route with the key in the
   server environment. Do not put the key in client code.

**Acceptance:** a submitted enquiry appears in the console, can be marked
handled, and survives a restart.

### 3.5 Fail closed on the local password

Today, if Supabase keys are missing in production, the console silently uses
`ADMIN_PASSWORD`. Change `getStaffUser()` / `signIn()` so the local path is only
available when `NODE_ENV !== "production"` or an explicit
`ALLOW_LOCAL_ADMIN=true` is set.

**Acceptance:** a production build with no Supabase keys shows a configuration
error instead of a password form.

### 3.6 Restrict the audit trail to admins (done — verify)

`src/app/admin/page.tsx` now fetches and renders recent activity only when
`staff.role === "admin"`, so editors receive neither the rows nor the section.
The service-role query is gated in the page because it bypasses the admin-only
RLS policy. Optionally add a full `/admin/audit` page behind `requireAdmin()`.

**Acceptance:** an `editor` account never receives audit rows in the HTML or in
the server response.

### 3.7 Console error boundary (done — verify)

`src/app/admin/error.tsx` is a client component with a retry button and a short
message, so a failed save or a dropped connection does not produce a blank page.

**Acceptance:** forcing an error in an editor renders the boundary, not the
default Next.js error screen.

---

## Phase 4 — Quality and maintenance

### 4.1 Automated tests

There is no test runner yet. Add one (Vitest is the least friction for this
stack) and cover:

- the zod contracts in `src/lib/cms/schemas.ts` (valid and invalid documents);
- slug generation and uniqueness;
- the rate and body text parsers in `src/app/admin/actions.ts`;
- publish/draft transitions with a mocked Supabase client;
- the enquiry route: validation, honeypot, rate limit, storage failure.

Add `npm test` and run it in CI or before each deploy.

### 4.2 Dependencies and static checks

```bash
npm audit
npm run typecheck
npm run build
```

Review the two Supabase packages (`@supabase/supabase-js`, `@supabase/ssr`) and
keep them current; auth and storage fixes ship there.

### 4.3 Staff guide

Write a one-page guide for editors covering: signing in, drafts versus publish,
the "never publish unverified figures" rule, the credit-policy approval step,
uploading images, and who to call. Keep this file and `docs/08-cms.md` as the
technical reference.

---

## Phase 5 — Ship

1. **Review and commit.** Nothing from the CMS work is committed yet.

   ```bash
   git status
   git diff --stat
   git grep -n "eyJ" -- . ':!package-lock.json' || echo "no keys staged"
   ```

   Confirm `.env.local` is untracked, then commit the CMS work.

2. **Configure the host.** Add the same three Supabase variables in the hosting
   dashboard (never in the repository). Set `NEXT_PUBLIC_SITE_URL` to the
   canonical origin.

3. **Build and start.**

   ```bash
   npm ci
   npm run build
   npm start
   ```

   On a serverless platform, finish 3.1 first — the credit policy editor needs a
   writable filesystem.

4. **Check the deployed origin.**
   - `/`, `/services`, `/faq`, `/news`, `/projects`, `/contact` render.
   - `/admin` redirects to `/admin/login`, and the response carries
     `X-Robots-Tag: noindex` (configured in `next.config.ts`).
     - An uploaded image displays on an article page, with no Content-Security-
       Policy error in the browser console. `next.config.ts` adds the Supabase
       host to `img-src` and `connect-src` and to `images.remotePatterns` from
       `NEXT_PUBLIC_SUPABASE_URL`, so that variable must be present at **build**
       time as well as runtime.
     - `/admin` redirects to `/admin/login`, and the response carries
       `X-Robots-Tag: noindex` (configured in `next.config.ts`).
   - `sitemap.xml` contains the published routes and no credit pages while the
     policy is unapproved.
   - `robots.txt` disallows `/admin`.
   - A complete sign-in, publish and sign-out cycle works on the real domain,
     including the email confirmation link if invitations are used.

5. **Backups and access.** Enable the plan's backups or point-in-time recovery,
   record who holds database and dashboard access, and store the database
   password in the password manager.

### Rollback

- **Code:** redeploy the previous commit.
- **Content:** Supabase keeps the published documents; restore from a backup if
  a bad edit was published. The audit trail shows who published it.
- **Return to fallback:** remove the three Supabase variables and redeploy. The
  public site serves `content/` again, but console edits made in the database
  will not appear until the variables are restored.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Console still shows the password field | Env not loaded | Restart the server; check the two `Boolean(...)` values in 1.4 |
| "This account is not authorised to publish content." | No `staff` row | Run the insert in 1.3 |
| Seed exits with "Missing …" | `.env.local` not read | Confirm the file is in the project root and the variables are spelled exactly |
| `permission denied for table` during seed | Wrong key | Use the service role key, not the anon key |
| Upload fails | Bucket or policy missing | Re-run the storage section of `supabase/schema.sql` |
| Admin redirect loop | Middleware and a stale session | Clear cookies for the origin; check the project URL matches the key's project |
| Public page shows old copy after publishing | Cache | `revalidatePath("/", "layout")` runs on save; hard-reload once, then check the audit row |

---

## What "done" means

- Every public page reads from Supabase when seeded, with the file fallback
  intact.
- A staff member with no programming knowledge can publish a news item, edit a
  service, change the FAQ, update rates and upload an image.
- Drafts never appear publicly; every change is attributable in the audit trail.
- No page writes to the filesystem; the service role key exists only in server
  environment variables.
- A production build, sign-in and publish cycle have been verified on the
  deployed origin.
