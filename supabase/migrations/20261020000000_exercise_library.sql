-- T-043b: your own exercises, favourite exercises and supersets in plans.
-- Own exercises and favourites are written by the person; their active coach
-- can read them, like the rest of the training log.

alter table public.custom_exercises
  add column equipment text not null default 'machine'
    check (equipment in ('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'smith', 'kettlebell')),
  add column isolation boolean not null default false,
  add column created_at timestamptz not null default now(),
  add constraint custom_exercises_muscle check (primary_muscle in
    ('chest', 'back', 'quads', 'hamstrings', 'glutes', 'sideDelts', 'rearDelts', 'biceps', 'triceps', 'calves', 'abs', 'traps'));
create index custom_exercises_owner on public.custom_exercises (owner_id);

create table public.favourite_exercises (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Built-in library id or "custom:<uuid>"
  exercise_id text not null check (length(exercise_id) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);
alter table public.favourite_exercises enable row level security;
create policy "read" on public.favourite_exercises for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.favourite_exercises for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.favourite_exercises to authenticated;

-- Done as a superset with the next exercise of the day.
alter table public.plan_exercises add column superset_next boolean not null default false;
