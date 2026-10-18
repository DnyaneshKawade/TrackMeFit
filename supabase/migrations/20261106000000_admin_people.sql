-- People page (T-042a2). Owners with the second step search accounts and act
-- on them. Each action writes one admin log row before it runs. The page
-- shows account facts only, never food logs, weights or health answers.
--
-- Block, unblock, delete and the confirm email also need the Auth admin API,
-- so they run in the admin-account Edge Function, which calls
-- admin_account_action below as the admin first.

-- Accounts newest first, 50 at a time. The next page starts after the last
-- row: its joined time and id (two people can join in the same instant).
create function public.admin_people(search text default '', before timestamptz default null, before_id uuid default null, lim int default 50)
returns table (
  user_id uuid, email text, phone text, name text, role text, joined_at timestamptz, last_active_at timestamptz,
  blocked boolean, confirmed boolean, onboarded boolean, coach_name text, admin_level text
)
language plpgsql stable security definer set search_path = public as $$
declare
  -- % and _ typed by the admin are plain characters, not wildcards.
  pattern text := '%' || replace(replace(replace(coalesce(trim(search), ''), '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  perform public.need_owner();
  return query
    select u.id, u.email::text, coalesce(u.phone, '')::text, coalesce(p.full_name, '')::text, coalesce(p.role, 'user')::text,
      u.created_at, u.last_sign_in_at, coalesce(u.banned_until > now(), false), u.email_confirmed_at is not null,
      p.onboarded_at is not null, c.full_name::text, r.level
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.user_roles r on r.user_id = u.id
    left join lateral (
      select cp.full_name from public.coach_clients cc join public.profiles cp on cp.id = cc.coach_id
      where cc.client_id = u.id and cc.status = 'active' limit 1
    ) c on true
    where (pattern = '%%' or u.email ilike pattern or p.full_name ilike pattern or u.phone ilike pattern)
      and (before is null or (u.created_at, u.id) < (before, coalesce(before_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)))
    order by u.created_at desc, u.id desc
    limit least(greatest(lim, 1), 100);
end
$$;

create index if not exists coach_clients_client on public.coach_clients (client_id, status);

-- Checks and logs an account action, then signs the person out where the
-- action needs it. Returns the person's email for the Edge Function.
create function public.admin_account_action(person uuid, act text, why text) returns text
language plpgsql security definer set search_path = public as $$
declare
  person_email text;
  confirmed boolean;
begin
  perform public.need_owner();
  if act not in ('block', 'unblock', 'delete', 'sign out', 'resend confirm') then
    raise exception 'action not valid';
  end if;
  select email, email_confirmed_at is not null into person_email, confirmed from auth.users where id = person;
  if person_email is null then
    raise exception 'no such account';
  end if;
  if act in ('block', 'delete') and person = auth.uid() then
    raise exception 'not on yourself';
  end if;
  if act in ('block', 'delete') and exists (select 1 from public.user_roles where user_id = person) then
    raise exception 'remove them as admin first';
  end if;
  if act = 'resend confirm' and confirmed then
    raise exception 'already confirmed';
  end if;
  perform public.write_admin_log(act, person, why);
  if act in ('block', 'sign out', 'delete') then
    delete from auth.sessions where user_id = person;
  end if;
  return person_email;
end
$$;

-- Ends the person's active coach link.
create function public.admin_end_coach_link(person uuid, why text) returns void
language plpgsql security definer set search_path = public as $$
declare
  coach uuid;
begin
  perform public.need_owner();
  update public.coach_clients set status = 'ended' where client_id = person and status = 'active' returning coach_id into coach;
  if coach is null then
    raise exception 'no coach link';
  end if;
  perform public.write_admin_log('end coach link', person, why, jsonb_build_object('coach', coach));
end
$$;

-- Moves an account between "For myself" and "I'm a coach".
create function public.admin_set_role(person uuid, new_role text, why text) returns void
language plpgsql security definer set search_path = public as $$
declare
  old_role text;
begin
  perform public.need_owner();
  if new_role not in ('user', 'coach') then
    raise exception 'role not valid';
  end if;
  select role into old_role from public.profiles where id = person;
  if old_role is null then
    raise exception 'no such account';
  end if;
  if old_role = new_role then
    raise exception 'already this role';
  end if;
  if old_role = 'coach' and exists (select 1 from public.coach_clients where coach_id = person and status = 'active') then
    raise exception 'coach has clients';
  end if;
  update public.profiles set role = new_role, role_chosen = true where id = person;
  perform public.write_admin_log('change role', person, why, jsonb_build_object('from', old_role, 'to', new_role));
end
$$;

revoke execute on function public.admin_people(text, timestamptz, uuid, int), public.admin_account_action(uuid, text, text),
  public.admin_end_coach_link(uuid, text), public.admin_set_role(uuid, text, text) from public, anon;
grant execute on function public.admin_people(text, timestamptz, uuid, int), public.admin_account_action(uuid, text, text),
  public.admin_end_coach_link(uuid, text), public.admin_set_role(uuid, text, text) to authenticated;
