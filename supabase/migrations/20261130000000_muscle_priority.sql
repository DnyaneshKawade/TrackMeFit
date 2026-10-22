-- Muscle priority (spec T-082h): each plan keeps the muscles set to
-- "Grow more" or "Keep", as {"biceps": "more", "calves": "keep"}. Any muscle
-- not listed is "Grow". The engine uses it for next week's sets.

alter table public.workout_plans
  add column muscle_priority jsonb not null default '{}'::jsonb
  constraint workout_plans_muscle_priority_check check (
    jsonb_typeof(muscle_priority) = 'object'
    and not jsonb_path_exists(muscle_priority, '$.* ? (@.type() != "string" || (@ != "more" && @ != "keep"))')
  );
