-- T-043a: set tags (warm-up, drop set, failure), set notes and workout notes.
-- is_warmup stays and is kept in step with the tag by the app.
-- Row-level security is unchanged.
alter table public.set_logs
  add column tag text check (tag in ('warmup', 'drop', 'failure')),
  add column note text check (note is null or length(note) <= 200);
alter table public.workout_sessions
  add column note text check (note is null or length(note) <= 500);
