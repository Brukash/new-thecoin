-- ===========================================================================
-- Events and announcements management module.
--
-- Adds event categories, events, galleries, registrations, enquiries,
-- announcements and an activity log, with row level security:
--   * anonymous visitors read published, unexpired content only;
--   * staff read everything and write everything;
--   * registrations and enquiries can be inserted by the public for published
--     events but are readable by staff only.
-- Also creates the public `event-media` storage bucket used by the console.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text not null default '',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_categories enable row level security;

drop policy if exists event_categories_public_read on public.event_categories;
create policy event_categories_public_read on public.event_categories
  for select using (is_active or public.is_staff());

drop policy if exists event_categories_staff_write on public.event_categories;
create policy event_categories_staff_write on public.event_categories
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Events
--
-- `starts_at` and `ends_at` are computed by the application from the local
-- date, time and time zone, so date arithmetic and countdowns do not depend on
-- the reader's clock settings. `event_status` records the organiser's decision
-- (cancelled, postponed); upcoming/ongoing/completed is derived from the dates.
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category_id uuid references public.event_categories (id) on delete set null,
  edition text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  objectives text[] not null default '{}',
  start_date date not null,
  end_date date,
  start_time time,
  end_time time,
  timezone text not null default 'Africa/Lagos',
  starts_at timestamptz,
  ends_at timestamptz,
  venue_name text not null default '',
  venue_address text not null default '',
  maps_url text not null default '',
  online_event_url text not null default '',
  banner_url text not null default '',
  poster_url text not null default '',
  brochure_url text not null default '',
  programme_url text not null default '',
  registration_required boolean not null default false,
  registration_url text not null default '',
  registration_deadline date,
  enquiry_email text not null default '',
  contact_phone text not null default '',
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'scheduled', 'published', 'archived')),
  event_status text not null default 'scheduled'
    check (event_status in ('scheduled', 'cancelled', 'postponed')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  promotion_start timestamptz,
  promotion_end timestamptz,
  seo_title text not null default '',
  seo_description text not null default '',
  created_by uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint events_dates_ordered check (end_date is null or end_date >= start_date)
);

create index if not exists events_public_idx
  on public.events (publication_status, start_date);
create index if not exists events_featured_idx
  on public.events (is_featured, display_order);
create index if not exists events_category_idx
  on public.events (category_id);

alter table public.events enable row level security;

-- Scheduled events become readable once their publication time passes.
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select using (
    publication_status = 'published'
    or (publication_status = 'scheduled' and published_at is not null and published_at <= now())
    or public.is_staff()
  );

drop policy if exists events_staff_write on public.events;
create policy events_staff_write on public.events
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
create table if not exists public.event_gallery (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  image_url text not null,
  caption text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_gallery_event_idx
  on public.event_gallery (event_id, display_order);

alter table public.event_gallery enable row level security;

drop policy if exists event_gallery_public_read on public.event_gallery;
create policy event_gallery_public_read on public.event_gallery
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (
          e.publication_status = 'published'
          or (e.publication_status = 'scheduled' and e.published_at <= now())
        )
    )
    or public.is_staff()
  );

drop policy if exists event_gallery_staff_write on public.event_gallery;
create policy event_gallery_staff_write on public.event_gallery
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Registrations
-- ---------------------------------------------------------------------------
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null default '',
  organisation text not null default '',
  attendee_count integer not null default 1 check (attendee_count between 1 and 50),
  additional_information text not null default '',
  consent_status boolean not null default false,
  registration_date timestamptz not null default now(),
  status text not null default 'received'
    check (status in ('received', 'approved', 'declined', 'attended')),
  constraint event_registrations_consent check (consent_status is true)
);

create index if not exists event_registrations_event_idx
  on public.event_registrations (event_id, registration_date desc);
create index if not exists event_registrations_email_idx
  on public.event_registrations (lower(email));

alter table public.event_registrations enable row level security;

drop policy if exists event_registrations_public_insert on public.event_registrations;
create policy event_registrations_public_insert on public.event_registrations
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and e.publication_status = 'published'
        and e.registration_required
        and e.registration_url = ''
    )
  );

drop policy if exists event_registrations_staff_read on public.event_registrations;
create policy event_registrations_staff_read on public.event_registrations
  for select using (public.is_staff());

drop policy if exists event_registrations_staff_write on public.event_registrations;
create policy event_registrations_staff_write on public.event_registrations
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists event_registrations_staff_delete on public.event_registrations;
create policy event_registrations_staff_delete on public.event_registrations
  for delete to authenticated using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------
create table if not exists public.event_enquiries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists event_enquiries_event_idx
  on public.event_enquiries (event_id, created_at desc);

alter table public.event_enquiries enable row level security;

drop policy if exists event_enquiries_public_insert on public.event_enquiries;
create policy event_enquiries_public_insert on public.event_enquiries
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.publication_status = 'published'
    )
  );

drop policy if exists event_enquiries_staff_read on public.event_enquiries;
create policy event_enquiries_staff_read on public.event_enquiries
  for select using (public.is_staff());

drop policy if exists event_enquiries_staff_update on public.event_enquiries;
create policy event_enquiries_staff_update on public.event_enquiries
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists event_enquiries_staff_delete on public.event_enquiries;
create policy event_enquiries_staff_delete on public.event_enquiries
  for delete to authenticated using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category text not null default 'General notice',
  short_description text not null default '',
  full_description text not null default '',
  featured_image text not null default '',
  attachment_url text not null default '',
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'scheduled', 'published', 'archived')),
  is_urgent boolean not null default false,
  is_featured boolean not null default false,
  published_at timestamptz,
  expiry_date date,
  created_by uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_public_idx
  on public.announcements (publication_status, published_at desc);

alter table public.announcements enable row level security;

drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements
  for select using (
    (
      (publication_status = 'published'
        or (publication_status = 'scheduled' and published_at <= now()))
      and (published_at is null or published_at <= now())
      and (expiry_date is null or expiry_date >= current_date)
    )
    or public.is_staff()
  );

drop policy if exists announcements_staff_write on public.announcements;
create policy announcements_staff_write on public.announcements
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Activity log. Written by the server (service role) on event changes.
-- ---------------------------------------------------------------------------
create table if not exists public.event_activity_logs (
  id bigint generated always as identity primary key,
  event_id uuid references public.events (id) on delete set null,
  administrator_id uuid references public.staff (id) on delete set null,
  administrator_email text not null default '',
  action text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists event_activity_logs_created_idx
  on public.event_activity_logs (created_at desc);

alter table public.event_activity_logs enable row level security;

drop policy if exists event_activity_logs_admin_read on public.event_activity_logs;
create policy event_activity_logs_admin_read on public.event_activity_logs
  for select using (public.is_admin());

-- No insert policy: only the server writes activity records.

-- ---------------------------------------------------------------------------
-- Touch updated_at
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

drop trigger if exists event_categories_touch on public.event_categories;
create trigger event_categories_touch before update on public.event_categories
  for each row execute function public.touch_updated_at();

drop trigger if exists announcements_touch on public.announcements;
create trigger announcements_touch before update on public.announcements
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: public read, staff write.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;

drop policy if exists "event media public read" on storage.objects;
create policy "event media public read" on storage.objects
  for select using (bucket_id = 'event-media');

drop policy if exists "event media staff insert" on storage.objects;
create policy "event media staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'event-media' and public.is_staff());

drop policy if exists "event media staff update" on storage.objects;
create policy "event media staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'event-media' and public.is_staff());

drop policy if exists "event media staff delete" on storage.objects;
create policy "event media staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'event-media' and public.is_staff());

-- ---------------------------------------------------------------------------
-- Default categories
-- ---------------------------------------------------------------------------
insert into public.event_categories (name, slug, display_order)
values
  ('Annual General Meetings', 'annual-general-meetings', 10),
  ('Sales and Exhibitions', 'sales-and-exhibitions', 20),
  ('International Day of Cooperatives', 'international-day-of-cooperatives', 30),
  ('Property Project Launches', 'property-project-launches', 40),
  ('Investment Seminars', 'investment-seminars', 50),
  ('Members'' Engagement Meetings', 'members-engagement-meetings', 60),
  ('Training Programmes', 'training-programmes', 70),
  ('Cooperative Conferences', 'cooperative-conferences', 80),
  ('Other Events', 'other-events', 90)
on conflict (slug) do nothing;
