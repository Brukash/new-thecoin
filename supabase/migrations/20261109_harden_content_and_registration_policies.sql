-- Harden two row level security policies found during the security audit.
--
-- 1. Enquiry case documents were written with status = 'published', and
--    content_public_read treats any published row as public website content.
--    The result was that the public anon key could read internal CRM documents
--    (officer, department, internal notes, reply bodies, satisfaction scores).
--    Cases are internal records: they become drafts, and the public read policy
--    excludes the collection outright so future writes cannot expose them again.
--
-- 2. event_registrations_public_insert let any anonymous client insert rows
--    straight through PostgREST, bypassing the server action's validation, the
--    honeypot and the per-address rate limit. The application inserts with the
--    service role, so the policy is not needed.

-- 1. Case documents -----------------------------------------------------------------

update public.content_entries
   set status = 'draft'
 where collection = 'enquiry-cases'
   and status <> 'draft';

drop policy if exists content_public_read on public.content_entries;
create policy content_public_read on public.content_entries
  for select using (
    (status = 'published' and collection <> 'enquiry-cases')
    or public.is_staff()
  );

-- 2. Event registrations ------------------------------------------------------------

drop policy if exists event_registrations_public_insert on public.event_registrations;
