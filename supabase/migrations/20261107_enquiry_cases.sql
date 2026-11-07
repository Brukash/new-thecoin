-- Enquiry CRM cases.
--
-- Case workflow (department, officer, status, SLA, notes, replies, feedback)
-- is stored as a document in public.content_entries, keyed by the enquiry
-- reference, so the message itself stays in public.enquiries.
--
-- The collection check was written for the original content types only; this
-- migration widens it. Purely additive: every existing row remains valid, and
-- the constraint can be narrowed again after removing any remaining cases.

alter table public.content_entries
  drop constraint if exists content_entries_collection_check;

alter table public.content_entries
  add constraint content_entries_collection_check
  check (
    collection = any (
      array[
        'settings',
        'news',
        'projects',
        'services',
        'faq',
        'rates',
        'credit-policy',
        'enquiry-cases'
      ]
    )
  );
