-- Block controls (spec T-109): a block has 3 to 7 hard weeks before its light
-- week. The app now saves this number, so the database keeps it in range.

update public.workout_plans set hard_weeks = least(7, greatest(3, hard_weeks));

alter table public.workout_plans drop constraint workout_plans_hard_weeks_check;
alter table public.workout_plans add constraint workout_plans_hard_weeks_check check (hard_weeks between 3 and 7);
