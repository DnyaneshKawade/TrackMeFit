-- Who last changed a workout plan, and when (T-026d). A coach may edit a
-- client's plan, so both sides see where a change came from.

alter table public.workout_plans
  add column updated_by uuid references public.profiles (id),
  add column updated_at timestamptz not null default now();

update public.workout_plans set updated_by = created_by, updated_at = created_at;

-- Fills the columns from the signed-in person, so nobody records someone
-- else. Saving a plan always writes its name; starting a block does not.
create or replace function public.stamp_plan_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
  else
    new.created_by := old.created_by;
  end if;
  new.updated_by := coalesce(auth.uid(), new.updated_by, new.created_by);
  new.updated_at := now();
  return new;
end;
$$;

create trigger stamp_plan_change
  before insert or update of name on public.workout_plans
  for each row execute function public.stamp_plan_change();
