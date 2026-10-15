-- A date to be ready for, like a wedding or trip (spec T-041b). Optional.
-- The profile's existing row-level security covers it: only the person
-- reads and writes it, and their active coach reads it.
alter table public.profiles add column event_date date;
