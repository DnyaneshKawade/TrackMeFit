-- Admin access (T-042a1). Admins live in their own table that sign-up can
-- never write. Every admin check also needs the second factor (an
-- authenticator app code) used in this sign-in, so a stolen password alone
-- does nothing. Every admin action writes one row to an audit log that
-- nobody can change or delete.
--
-- The first owner is added once by DK in the Supabase SQL editor:
--   insert into public.user_roles (user_id, level) select id, 'owner' from auth.users where email = '<DK''s email>';

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- content: foods, exercises, review queue, banners (later pages).
  -- owner: people, roles, data requests, and everything a content admin does.
  level text not null check (level in ('content', 'owner')),
  added_by uuid references auth.users (id) on delete set null,
  added_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;
-- Each person can see their own row, so the app knows to ask for the second
-- factor. Writes only go through the functions below.
grant select on public.user_roles to authenticated;
create policy "own admin row" on public.user_roles for select using (user_id = auth.uid());

-- The second factor was used in this sign-in.
create function public.used_second_factor() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- True for an admin at this level or higher who used the second factor.
create function public.is_admin(min_level text default 'content') returns boolean
language sql stable security definer set search_path = public as $$
  select public.used_second_factor() and exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and (level = 'owner' or level = min_level)
  )
$$;

revoke execute on function public.is_admin(text) from public, anon;
grant execute on function public.is_admin(text) to authenticated;

-- The audit log. Rows come only from admin functions; nobody edits them.
create table public.admin_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_id uuid not null,
  action text not null,
  target_id uuid,
  reason text not null check (length(trim(reason)) > 0),
  details jsonb not null default '{}'::jsonb
);

create index admin_log_at on public.admin_log (at desc);
create index admin_log_admin on public.admin_log (admin_id, at desc);

alter table public.admin_log enable row level security;
revoke all on public.admin_log from anon, authenticated;
grant select on public.admin_log to authenticated;
create policy "owners read the log" on public.admin_log for select using (public.is_admin('owner'));

-- Even the database owner can't change or delete a row once written.
create function public.admin_log_is_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'the admin log cannot be changed';
end
$$;

create trigger admin_log_no_update before update or delete on public.admin_log
  for each row execute function public.admin_log_is_append_only();
create trigger admin_log_no_truncate before truncate on public.admin_log
  for each statement execute function public.admin_log_is_append_only();

-- Writes one log row. Called only from the admin functions below.
create function public.write_admin_log(act text, target uuid, why text, extra jsonb default '{}'::jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if why is null or length(trim(why)) = 0 then
    raise exception 'a reason is needed';
  end if;
  insert into public.admin_log (admin_id, action, target_id, reason, details)
  values (auth.uid(), act, target, trim(why), extra);
end
$$;

revoke execute on function public.write_admin_log(text, uuid, text, jsonb) from public, anon, authenticated;

-- Stops a change that would leave no owner, so nobody locks everyone out.
create function public.keep_one_owner() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from public.user_roles where level = 'owner') then
    raise exception 'there must be at least one owner';
  end if;
  return null;
end
$$;

create constraint trigger user_roles_keep_owner after update or delete on public.user_roles
  deferrable initially immediate
  for each row execute function public.keep_one_owner();

-- Owners only, with the second factor.
create function public.need_owner() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin('owner') then
    raise exception 'not allowed';
  end if;
end
$$;

revoke execute on function public.need_owner() from public, anon, authenticated;

-- The admin team with each admin's last action.
create function public.admin_team()
returns table (user_id uuid, email text, name text, level text, added_at timestamptz, last_action_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.need_owner();
  return query
    select r.user_id, u.email::text, coalesce(p.full_name, '')::text, r.level, r.added_at,
      (select max(l.at) from public.admin_log l where l.admin_id = r.user_id)
    from public.user_roles r
    join auth.users u on u.id = r.user_id
    left join public.profiles p on p.id = r.user_id
    order by r.level desc, r.added_at;
end
$$;

-- Adds an admin by the email of an existing account.
create function public.add_admin(person_email text, new_level text, why text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  person uuid;
begin
  perform public.need_owner();
  if new_level not in ('content', 'owner') then
    raise exception 'level not valid';
  end if;
  select id into person from auth.users where lower(email) = lower(trim(person_email));
  if person is null then
    raise exception 'no account with this email';
  end if;
  if exists (select 1 from public.user_roles where user_id = person) then
    raise exception 'already an admin';
  end if;
  insert into public.user_roles (user_id, level, added_by) values (person, new_level, auth.uid());
  perform public.write_admin_log('add admin', person, why, jsonb_build_object('level', new_level));
  return person;
end
$$;

create function public.set_admin_level(person uuid, new_level text, why text) returns void
language plpgsql security definer set search_path = public as $$
declare
  old_level text;
begin
  perform public.need_owner();
  if new_level not in ('content', 'owner') then
    raise exception 'level not valid';
  end if;
  select level into old_level from public.user_roles where user_id = person;
  if old_level is null then
    raise exception 'not an admin';
  end if;
  update public.user_roles set level = new_level where user_id = person;
  perform public.write_admin_log('change admin level', person, why, jsonb_build_object('from', old_level, 'to', new_level));
end
$$;

create function public.remove_admin(person uuid, why text) returns void
language plpgsql security definer set search_path = public as $$
declare
  old_level text;
begin
  perform public.need_owner();
  delete from public.user_roles where user_id = person returning level into old_level;
  if old_level is null then
    raise exception 'not an admin';
  end if;
  perform public.write_admin_log('remove admin', person, why, jsonb_build_object('level', old_level));
end
$$;

revoke execute on function public.admin_team(), public.add_admin(text, text, text), public.set_admin_level(uuid, text, text), public.remove_admin(uuid, text) from public, anon;
grant execute on function public.admin_team(), public.add_admin(text, text, text), public.set_admin_level(uuid, text, text), public.remove_admin(uuid, text) to authenticated;
