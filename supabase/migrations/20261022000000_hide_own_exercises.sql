-- T-043c: removing an own exercise only hides it, so past sets, records and
-- plans keep their name. Editing and hiding are updates by the person; the
-- "write own" policy already allows them and refuses anyone else.

alter table public.custom_exercises add column hidden boolean not null default false;
