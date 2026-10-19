-- One age rule (spec T-086). Everyone gives a birth date. Under 13 can't
-- sign up. From 13 to 17 a parent says yes with their own adult account,
-- which India's DPDP Rules accept as a checked consent (Rule 10). Coaches
-- are 18 or older, and people under 18 can't have a coach.

alter table public.profiles
  add column parent_id uuid references auth.users (id) on delete set null,
  add column parent_ok_at timestamptz,
  add column parent_code text unique,
  add column parent_code_until timestamptz;

-- Under 18 on today's date. Null birth dates are asked for by the app.
create function public.is_minor(who uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select birth_date > current_date - interval '18 years' from public.profiles where id = who), false)
$$;

-- Under 18 and no parent has said yes yet.
create function public.needs_parent(who uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
    where id = who and birth_date > current_date - interval '18 years' and (parent_id is null or parent_ok_at is null))
$$;

-- The age rules on a profile, and only the functions below set a parent.
create function public.check_age_rule() returns trigger
language plpgsql as $$
begin
  if new.birth_date is distinct from old.birth_date and new.birth_date > current_date - interval '13 years' then
    raise exception 'under 13';
  end if;
  if new.role = 'coach' and new.birth_date > current_date - interval '18 years' then
    raise exception 'coaches must be 18 or older';
  end if;
  if current_user = 'authenticated' and (new.parent_id is distinct from old.parent_id or new.parent_ok_at is distinct from old.parent_ok_at
    or new.parent_code is distinct from old.parent_code or new.parent_code_until is distinct from old.parent_code_until) then
    raise exception 'only a parent can say yes';
  end if;
  return new;
end
$$;
create trigger profiles_age_rule before update on public.profiles
  for each row execute function public.check_age_rule();

-- People under 18 can't link to a coach, by code or by reopening a link.
create function public.no_coach_for_minors() returns trigger
language plpgsql as $$
begin
  if new.status <> 'ended' and public.is_minor(new.client_id) then
    raise exception 'under 18 cannot have a coach';
  end if;
  return new;
end
$$;
create trigger coach_clients_no_minors before insert or update of status on public.coach_clients
  for each row execute function public.no_coach_for_minors();

-- Until a parent says yes, a teen can't add or change their data. The app
-- shows the parent step instead; this keeps the rule on the server too.
do $$
declare
  t text;
begin
  foreach t in array array['food_logs', 'custom_foods', 'diet_targets', 'weigh_ins', 'measurements', 'custom_exercises',
    'workout_plans', 'plan_days', 'plan_exercises', 'workout_sessions', 'set_logs', 'muscle_feedback', 'meal_plans',
    'favourite_exercises', 'progress_photos', 'check_ins', 'chat_messages']
  loop
    execute format('create policy "parent says yes first" on public.%I as restrictive for insert to authenticated with check (not public.needs_parent(auth.uid()))', t);
    execute format('create policy "parent says yes first (change)" on public.%I as restrictive for update to authenticated using (not public.needs_parent(auth.uid()))', t);
  end loop;
end
$$;

-- The teen's code for a parent: 8 letters and numbers, for 7 days. A new
-- call makes a new code, so an old one stops working.
create function public.parent_code() returns table (code text, until timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  if not public.needs_parent(me) then
    raise exception 'no parent needed';
  end if;
  update public.profiles set parent_code = c, parent_code_until = now() + interval '7 days' where id = me;
  return query select c, now() + interval '7 days';
end
$$;

-- The child a code belongs to, for an adult. Checks the code, uses nothing up.
create function public.child_for_code(given text) returns table (child_id uuid, name text)
language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  if not exists (select 1 from public.profiles where id = me and birth_date <= current_date - interval '18 years') then
    raise exception 'parent must be 18 or older';
  end if;
  return query select p.id, coalesce(nullif(p.full_name, ''), 'your child')::text
    from public.profiles p
    where p.parent_code = upper(regexp_replace(given, '[^a-zA-Z0-9]', '', 'g')) and p.parent_code_until > now() and p.id <> me;
  if not found then
    raise exception 'code not found';
  end if;
end
$$;

-- An adult says yes for the child whose code this is. Returns the child's name.
create function public.parent_say_yes(given text) returns text
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  child uuid;
  child_name text;
begin
  select c.child_id, c.name into child, child_name from public.child_for_code(given) c;
  update public.profiles set parent_id = me, parent_ok_at = now(), parent_code = null, parent_code_until = null where id = child;
  return child_name;
end
$$;

-- A parent takes back their yes. The teen's account waits for a parent again.
create function public.parent_take_back(child uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set parent_id = null, parent_ok_at = null where id = child and parent_id = auth.uid();
  if not found then
    raise exception 'not your child';
  end if;
end
$$;

-- The children a parent said yes for.
create function public.my_children() returns table (child_id uuid, name text, since timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, coalesce(nullif(p.full_name, ''), 'Your child')::text, p.parent_ok_at
  from public.profiles p where p.parent_id = auth.uid() and p.parent_ok_at is not null
  order by p.parent_ok_at
$$;

-- The parent who said yes for the signed-in teen, if any.
create function public.my_parent() returns table (name text, since timestamptz)
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(pp.full_name, ''), 'Your parent')::text, p.parent_ok_at
  from public.profiles p join public.profiles pp on pp.id = p.parent_id
  where p.id = auth.uid() and p.parent_ok_at is not null
$$;

create index profiles_parent on public.profiles (parent_id) where parent_id is not null;

revoke execute on function public.is_minor(uuid), public.needs_parent(uuid), public.parent_code(), public.child_for_code(text),
  public.parent_say_yes(text), public.parent_take_back(uuid), public.my_children(), public.my_parent() from public, anon;
grant execute on function public.is_minor(uuid), public.needs_parent(uuid), public.parent_code(), public.child_for_code(text),
  public.parent_say_yes(text), public.parent_take_back(uuid), public.my_children(), public.my_parent() to authenticated;
