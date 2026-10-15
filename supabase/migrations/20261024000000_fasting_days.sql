-- Days the person marked as a fasting day in the food log (spec T-041c).
-- Only the person marks or unmarks a day; they and their active coach read it.
create table public.fasting_days (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  fasted_on date not null,
  primary key (user_id, fasted_on)
);

alter table public.fasting_days enable row level security;

create policy "read" on public.fasting_days for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.fasting_days for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Supabase grants this by default; stated so the schema is self-contained.
grant select, insert, delete on public.fasting_days to authenticated;
