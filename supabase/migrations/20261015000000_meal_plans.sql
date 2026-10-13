-- Suggested meal plans the person accepted (T-058b). The plan is stored as
-- shown (meals, items in raw grams, reasons), with the protein foods picked.
-- Only saved after "Use this plan"; the person or their active coach can read
-- and write it, like diet targets.
create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan jsonb not null,
  picks text[] not null default '{}',
  created_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

-- The latest plan for a person is the common read.
create index meal_plans_user_created on public.meal_plans (user_id, created_at desc);

alter table public.meal_plans enable row level security;
create policy "read" on public.meal_plans for select to authenticated using (public.can_see(user_id));
create policy "person or coach saves" on public.meal_plans for all to authenticated
  using (public.can_see(user_id)) with check (public.can_see(user_id) and created_by = auth.uid());
grant select, insert, update, delete on public.meal_plans to authenticated;
