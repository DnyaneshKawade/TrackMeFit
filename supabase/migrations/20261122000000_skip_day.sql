-- Skip a workout day (spec T-110): a skipped plan day is a workout row with no
-- sets, so the plan moves on to the next day. The reason is optional.

alter table public.workout_sessions
  add column skipped boolean not null default false,
  add column skip_reason text
    constraint workout_sessions_skip_reason check (skip_reason is null or (skipped and char_length(skip_reason) <= 100));
