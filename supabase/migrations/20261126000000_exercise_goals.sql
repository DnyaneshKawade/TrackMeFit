-- Exercise goals (spec T-119): a goal weight and the reps to lift it for,
-- kept with the person's exercise settings. Row-level security is unchanged,
-- and exercise_settings is already in "Download my data".

alter table public.exercise_settings
  add column goal_kg numeric check (goal_kg is null or goal_kg between 1 and 600),
  add column goal_reps smallint check (goal_reps is null or goal_reps between 1 and 30),
  add constraint exercise_settings_goal check ((goal_kg is null) = (goal_reps is null));

-- A row may now hold only a goal.
alter table public.exercise_settings drop constraint exercise_settings_check;
alter table public.exercise_settings
  add constraint exercise_settings_check check (step_kg is not null or rest_seconds is not null or note is not null or goal_kg is not null);
