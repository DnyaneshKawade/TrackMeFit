-- Weekly progression: when the current training block started, and how each
-- trained muscle felt after a session (used to suggest next week's sets).

alter table public.workout_plans add column block_started_on date not null default current_date;

create table public.muscle_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  muscle text not null check (muscle in ('chest', 'back', 'quads', 'hamstrings', 'glutes', 'sideDelts',
                                         'rearDelts', 'biceps', 'triceps', 'calves', 'abs', 'traps')),
  -- "Was this muscle still sore or tired going in?"
  recovery text not null check (recovery in ('fresh', 'bitSore', 'verySore')),
  -- "Easy, just right, or too hard?"
  effort text not null check (effort in ('easy', 'right', 'hard')),
  pain boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, muscle)
);

alter table public.muscle_feedback enable row level security;

create policy "read" on public.muscle_feedback for select to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and public.can_see(s.user_id)));
create policy "write own" on public.muscle_feedback for all to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

grant select, insert, update, delete on public.muscle_feedback to authenticated;
