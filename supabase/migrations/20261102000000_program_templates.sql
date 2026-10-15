-- Program templates (T-026g): a coach keeps plans as templates and copies
-- one into a client's plans. Templates belong to the coach and never show on
-- their own Training tab. Reading and writing follow the plan rules already
-- in place ("person or coach plans").

alter table public.workout_plans add column is_template boolean not null default false;

-- Only coaches keep templates.
create function public.templates_for_coaches() returns trigger
language plpgsql as $$
begin
  if new.is_template and not exists (select 1 from public.profiles where id = new.user_id and role = 'coach') then
    raise exception 'only coaches keep templates';
  end if;
  return new;
end
$$;

create trigger workout_plans_templates before insert or update of is_template on public.workout_plans
  for each row execute function public.templates_for_coaches();

-- The Training tab and the template list each read one kind.
create index workout_plans_user_kind on public.workout_plans (user_id, is_template) where is_active;
