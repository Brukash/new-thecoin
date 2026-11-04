-- ===========================================================================
-- CBN Staff Multipurpose Cooperative Society Ltd
-- Supabase schema for the staff content management system.
--
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- It creates the content store, staff records, media index, audit trail and
-- enquiry inbox, enables row level security on every table, and creates the
-- public media bucket used by the CMS uploader.
--
-- Security model:
--   * Anonymous visitors may read published content and public media only.
--   * Signed-in staff may read drafts and write content.
--   * Only admins may manage staff accounts or read the audit trail.
--   * The Next.js server uses the service role key, which is never exposed to
--     the browser; row level security still applies to every browser client.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'editor' check (role in ('editor', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists staff_admin_write on public.staff;
create policy staff_admin_write on public.staff
  for all using (public.is_admin()) with check (public.is_admin());

-- A staff row is created by an administrator after the account exists in
-- Authentication > Users. Promote a user with:
--   insert into public.staff (id, email, full_name, role)
--   select id, email, 'Name', 'admin' from auth.users where email = '...';

-- ---------------------------------------------------------------------------
-- Content entries
--
-- One row per editable item. `data` holds the document in the shape the
-- public pages expect, validated on write by the application. Settings are a
-- singleton stored with slug 'main'.
-- ---------------------------------------------------------------------------
create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (
    collection in ('settings', 'news', 'projects', 'services', 'faq', 'rates', 'credit-policy')
  ),
  slug text not null,
  data jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff (id) on delete set null,
  unique (collection, slug)
);

create index if not exists content_entries_collection_idx
  on public.content_entries (collection, status);

alter table public.content_entries enable row level security;

drop policy if exists content_public_read on public.content_entries;
create policy content_public_read on public.content_entries
  for select using (status = 'published' or public.is_staff());

drop policy if exists content_staff_write on public.content_entries;
create policy content_staff_write on public.content_entries
  for insert to authenticated with check (public.is_staff());

drop policy if exists content_staff_update on public.content_entries;
create policy content_staff_update on public.content_entries
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists content_staff_delete on public.content_entries;
create policy content_staff_delete on public.content_entries
  for delete to authenticated using (public.is_staff());

create or replace function public.touch_content_entry()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_entries_touch on public.content_entries;
create trigger content_entries_touch
  before update on public.content_entries
  for each row execute function public.touch_content_entry();

-- ---------------------------------------------------------------------------
-- Media index (files themselves live in the `media` storage bucket)
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null unique,
  alt text not null default '',
  mime text not null default '',
  size_bytes bigint not null default 0,
  created_by uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (true);

drop policy if exists media_staff_write on public.media;
create policy media_staff_write on public.media
  for insert to authenticated with check (public.is_staff());

drop policy if exists media_staff_update on public.media;
create policy media_staff_update on public.media
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists media_staff_delete on public.media;
create policy media_staff_delete on public.media
  for delete to authenticated using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Audit trail. Written by the server on every save, publish and delete.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references public.staff (id) on delete set null,
  actor_email text not null default '',
  action text not null,
  collection text not null default '',
  slug text not null default '',
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log
  for select using (public.is_admin());

-- No insert policy: only the server (service role) writes audit records.

-- ---------------------------------------------------------------------------
-- Enquiry inbox, replacing the local JSON lines file in production.
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  subject text not null default '',
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Added after the first draft of the schema; safe to run on either version.
alter table public.enquiries add column if not exists reference text not null default '';
alter table public.enquiries add column if not exists staff_id text not null default '';

alter table public.enquiries enable row level security;

drop policy if exists enquiries_staff_read on public.enquiries;
create policy enquiries_staff_read on public.enquiries
  for select using (public.is_staff());

drop policy if exists enquiries_staff_update on public.enquiries;
create policy enquiries_staff_update on public.enquiries
  for update using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage: public read, staff write. Used for article images, project
-- photography and replacement policy documents.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media staff insert" on storage.objects;
create policy "media staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media staff update" on storage.objects;
create policy "media staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff());

drop policy if exists "media staff delete" on storage.objects;
create policy "media staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
