-- Ask before sharing with a coach (T-087). The app first looks up the
-- coach's name from the code, without using it. Only after the person taps
-- "Share with ..." does join_coach run, and it saves when they said yes.

alter table public.coach_clients add column consented_at timestamptz;

-- The coach's name for a code, with the same checks as joining. The code is
-- not used up, and nothing else about the coach is returned.
create function public.coach_for_code(invite_code text) returns text
language plpgsql stable security definer set search_path = public as $$
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
  if not public.coach_ok(coach) then
    raise exception 'coach not approved';
  end if;
  if not exists (select 1 from public.coach_clients where coach_id = coach and client_id = me and status = 'active')
     and not public.coach_has_room(coach) then
    raise exception 'coach is full';
  end if;
  return (select full_name from public.profiles where id = coach);
end
$$;
revoke execute on function public.coach_for_code(text) from public, anon;
grant execute on function public.coach_for_code(text) to authenticated;

-- Joining is the yes, so it saves the time of it.
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
  if not public.coach_ok(coach) then
    raise exception 'coach not approved';
  end if;
  -- Someone already with this coach is not counted twice.
  if not exists (select 1 from public.coach_clients where coach_id = coach and client_id = me and status = 'active')
     and not public.coach_has_room(coach) then
    raise exception 'coach is full';
  end if;
  delete from public.coach_invites where code = upper(regexp_replace(invite_code, '[^a-zA-Z0-9]', '', 'g'));
  update public.coach_clients set status = 'ended' where client_id = me and coach_id <> coach and status <> 'ended';
  insert into public.coach_clients (coach_id, client_id, status, consented_at) values (coach, me, 'active', now())
    on conflict (coach_id, client_id) do update set status = 'active', consented_at = now();
  return (select full_name from public.profiles where id = coach);
end
$$;

-- Only join_coach sets the time of the yes; people can't change it.
create function public.keep_consent_time() returns trigger
language plpgsql as $$
begin
  if new.consented_at is distinct from old.consented_at and current_user = 'authenticated' then
    raise exception 'the time of the yes cannot be changed';
  end if;
  return new;
end
$$;
create trigger coach_clients_keep_consent before update on public.coach_clients
  for each row execute function public.keep_consent_time();
