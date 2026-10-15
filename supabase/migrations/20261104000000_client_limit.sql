-- A limit on clients per coach (T-026i). Each coach can have up to 30 active
-- clients for now; the admin pages (T-042) will change it per coach.

alter table public.profiles add column client_limit int not null default 30 check (client_limit between 1 and 500);

-- Nobody changes their own limit; only security-definer functions run by the
-- owner (the admin pages later) may.
create function public.keep_client_limit() returns trigger
language plpgsql as $$
begin
  if new.client_limit <> old.client_limit and current_user in ('authenticated', 'anon') then
    raise exception 'client limit cannot be changed';
  end if;
  return new;
end
$$;

create trigger profiles_keep_client_limit before update of client_limit on public.profiles
  for each row execute function public.keep_client_limit();

-- True when the coach has fewer active clients than their limit.
create function public.coach_has_room(coach uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select (select count(*) from public.coach_clients where coach_id = coach and status = 'active')
    < (select client_limit from public.profiles where id = coach)
$$;

revoke execute on function public.coach_has_room(uuid) from public, anon;
grant execute on function public.coach_has_room(uuid) to authenticated;

-- A full coach can't make new codes.
create function public.invite_needs_room() returns trigger
language plpgsql as $$
begin
  if not public.coach_has_room(new.coach_id) then
    raise exception 'client limit reached';
  end if;
  return new;
end
$$;

create trigger coach_invites_need_room before insert on public.coach_invites
  for each row execute function public.invite_needs_room();

-- Joining checks the limit too, for codes made before the coach was full.
create or replace function public.join_coach(invite_code text) returns text
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  coach uuid;
begin
  if me is null or exists (select 1 from public.profiles where id = me and role = 'coach') then
    raise exception 'invite not valid';
  end if;
  select coach_id into coach from public.coach_invites
    where code = upper(regexp_replace(invite_code, '[^a-zA-Z0-9]', '', 'g')) and expires_at > now() and coach_id <> me;
  if coach is null then
    raise exception 'invite not valid';
  end if;
  -- Someone already with this coach is not counted twice.
  if not exists (select 1 from public.coach_clients where coach_id = coach and client_id = me and status = 'active')
     and not public.coach_has_room(coach) then
    raise exception 'coach is full';
  end if;
  delete from public.coach_invites where code = upper(regexp_replace(invite_code, '[^a-zA-Z0-9]', '', 'g'));
  update public.coach_clients set status = 'ended' where client_id = me and coach_id <> coach and status <> 'ended';
  insert into public.coach_clients (coach_id, client_id, status) values (coach, me, 'active')
    on conflict (coach_id, client_id) do update set status = 'active';
  return (select full_name from public.profiles where id = coach);
end
$$;

-- The coach reads their own limit from their profile row, like any other column.
