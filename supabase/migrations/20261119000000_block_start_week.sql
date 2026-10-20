-- T-107: the block week counts workouts done, not days. A coach can still
-- start a client at a later week, so the plan keeps the week it started at.
alter table public.workout_plans
  add column block_start_week smallint not null default 1 check (block_start_week between 1 and 12);
