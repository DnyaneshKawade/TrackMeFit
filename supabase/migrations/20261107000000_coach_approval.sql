-- Coach approval (T-042a3). Every coach has a status. Only an Approved coach
-- can make codes, take clients, read or change client data, or chat. One
-- switch, "coach approval", decides whether new coaches start Approved
-- (off, the default) or Waiting for an owner to check them (on).

-- Switches by name. Everyone signed in reads them; only admin_set_switch
-- below writes them.
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  changed_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to authenticated;
create policy "read switches" on public.app_settings for select to authenticated using (true);
insert into public.app_settings (key, value) values ('coach approval', 'false');

-- Coaches working today stay Approved.
alter table public.profiles
  add column coach_status text not null default 'approved'
    check (coach_status in ('approved', 'waiting', 'needs more', 'not approved', 'paused')),
  -- The owner's note the coach sees: what is missing, or why.
  add column coach_status_note text not null default '',
  add column coach_status_at timestamptz not null default now(),
  -- False until the coach has seen the latest decision.
  add column coach_status_seen boolean not null default true;

-- The Coaches page lists one status at a time, by time.
create index profiles_coach_status on public.profiles (coach_status, coach_status_at, id) where role = 'coach';

-- A new coach starts by the switch: Approved when off, Waiting when on. This
-- covers email sign-up, the Google role choice and an owner's role change.
create function public.coach_status_from_switch() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'coach' and (tg_op = 'INSERT' or old.role <> 'coach') then
    new.coach_status := case
      when coalesce((select value = 'true'::jsonb from public.app_settings where key = 'coach approval'), false) then 'waiting'
      else 'approved' end;
    new.coach_status_note := '';
    new.coach_status_at := now();
    new.coach_status_seen := true;
  end if;
  return new;
end
$$;

create trigger profiles_coach_status_new before insert or update of role on public.profiles
  for each row execute function public.coach_status_from_switch();

-- Nobody changes their own status; only the functions below may.
create function public.keep_coach_status() returns trigger
language plpgsql as $$
begin
  if (new.coach_status, new.coach_status_note, new.coach_status_at, new.coach_status_seen)
     is distinct from (old.coach_status, old.coach_status_note, old.coach_status_at, old.coach_status_seen)
     and current_user in ('authenticated', 'anon') then
    raise exception 'coach status cannot be changed';
  end if;
  return new;
end
$$;

create trigger profiles_keep_coach_status before update of coach_status, coach_status_note, coach_status_at, coach_status_seen
  on public.profiles for each row execute function public.keep_coach_status();

-- True when this coach may work with clients.
create function public.coach_ok(coach uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = coach and role = 'coach' and coach_status = 'approved')
$$;
revoke execute on function public.coach_ok(uuid) from public, anon;
grant execute on function public.coach_ok(uuid) to authenticated;

-- Making codes and invites needs Approved.
create or replace function public.is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select public.coach_ok(auth.uid())
$$;

-- Reading and changing client data needs Approved. Every client rule uses this.
create or replace function public.is_coach_of(client uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.coach_clients
    where coach_id = auth.uid() and client_id = client and status = 'active'
  ) and public.coach_ok(auth.uid())
$$;

-- Chat is closed while the coach is not Approved, for both sides.
create or replace function public.in_link(link uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.coach_clients
    where id = link and status = 'active' and auth.uid() in (coach_id, client_id) and public.coach_ok(coach_id)
  )
$$;

-- Joining needs an Approved coach too, for codes made before a pause.
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
  insert into public.coach_clients (coach_id, client_id, status) values (coach, me, 'active')
    on conflict (coach_id, client_id) do update set status = 'active';
  return (select full_name from public.profiles where id = coach);
end
$$;

-- True for any coach account, whatever its status.
create function public.is_coach_role() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'coach')
$$;
revoke execute on function public.is_coach_role() from public, anon;
grant execute on function public.is_coach_role() to authenticated;

-- The coach's details for review. Only the coach reads and writes them;
-- owners read them through admin_coach.
create table public.coach_details (
  coach_id uuid primary key default auth.uid() references public.profiles (id) on delete cascade,
  phone text not null default '' check (length(phone) <= 20),
  city text not null default '' check (length(city) <= 80),
  years int check (years between 0 and 60),
  link text not null default '' check (length(link) <= 200),
  -- The coach's answer to "Needs more".
  answer text not null default '' check (length(answer) <= 1000),
  updated_at timestamptz not null default now()
);
alter table public.coach_details enable row level security;
revoke all on public.coach_details from anon, authenticated;
grant select, insert (coach_id, phone, city, years, link, updated_at), update (phone, city, years, link, updated_at) on public.coach_details to authenticated;
create policy "own details" on public.coach_details for all to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and public.is_coach_role());

create table public.coach_certificates (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  path text not null unique check (path like coach_id::text || '/%'),
  created_at timestamptz not null default now()
);
create index coach_certificates_coach on public.coach_certificates (coach_id, created_at);
alter table public.coach_certificates enable row level security;
revoke all on public.coach_certificates from anon, authenticated;
grant select, insert, delete on public.coach_certificates to authenticated;
create policy "own certificates" on public.coach_certificates for all to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid() and public.is_coach_role());

-- Private bucket for certificate photos, at <coach id>/<id>.jpg.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coach-certificates', 'coach-certificates', false, 3145728, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "certificates: add own" on storage.objects for insert to authenticated
  with check (bucket_id = 'coach-certificates' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "certificates: remove own" on storage.objects for delete to authenticated
  using (bucket_id = 'coach-certificates' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "certificates: read" on storage.objects for select to authenticated
  using (bucket_id = 'coach-certificates' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin('owner')));

-- The coach sends their details back: from Needs more with an answer, or from
-- Not approved once 30 days have passed. Returns the new status.
create function public.coach_send_details(answer text default '') returns text
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  s text;
  s_at timestamptz;
begin
  select coach_status, coach_status_at into s, s_at from public.profiles where id = me and role = 'coach';
  if s is null then
    raise exception 'not a coach';
  end if;
  if s = 'needs more' and length(trim(coalesce(answer, ''))) = 0 then
    raise exception 'answer is empty';
  end if;
  if s = 'not approved' and s_at > now() - interval '30 days' then
    raise exception 'too soon';
  end if;
  if s not in ('needs more', 'not approved', 'waiting') then
    raise exception 'nothing to send';
  end if;
  insert into public.coach_details (coach_id, answer) values (me, trim(coalesce(answer, '')))
    on conflict (coach_id) do update set answer = excluded.answer, updated_at = now();
  if s <> 'waiting' then
    update public.profiles set coach_status = 'waiting', coach_status_note = '', coach_status_at = now(), coach_status_seen = true where id = me;
  end if;
  return 'waiting';
end
$$;

-- The coach has seen the latest decision.
create function public.coach_saw_status() returns void
language sql security definer set search_path = public as $$
  update public.profiles set coach_status_seen = true where id = auth.uid() and not coach_status_seen
$$;

revoke execute on function public.coach_send_details(text), public.coach_saw_status() from public, anon;
grant execute on function public.coach_send_details(text), public.coach_saw_status() to authenticated;

-- Owners: coaches with one status, 50 at a time. Waiting (with Needs more)
-- comes oldest first, so nobody waits forever; the rest newest first. The
-- next page starts after the last row shown.
create function public.admin_coaches(status_group text, after_at timestamptz default null, after_id uuid default null, lim int default 50)
returns table (
  user_id uuid, email text, name text, status text, status_at timestamptz, clients int, client_limit int, has_details boolean
)
language plpgsql stable security definer set search_path = public as $$
declare
  wanted text[] := case when status_group = 'waiting' then array['waiting', 'needs more'] else array[status_group] end;
  n int := least(greatest(lim, 1), 100);
begin
  perform public.need_owner();
  if status_group not in ('waiting', 'approved', 'paused', 'not approved') then
    raise exception 'status not valid';
  end if;
  return query
    select p.id, u.email::text, p.full_name, p.coach_status, p.coach_status_at,
      (select count(*)::int from public.coach_clients c where c.coach_id = p.id and c.status = 'active'),
      p.client_limit,
      exists (select 1 from public.coach_details d where d.coach_id = p.id)
        or exists (select 1 from public.coach_certificates c where c.coach_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'coach' and p.coach_status = any (wanted)
      and (after_at is null
        or (status_group = 'waiting' and (p.coach_status_at, p.id) > (after_at, coalesce(after_id, '00000000-0000-0000-0000-000000000000'::uuid)))
        or (status_group <> 'waiting' and (p.coach_status_at, p.id) < (after_at, coalesce(after_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid))))
    order by
      case when status_group = 'waiting' then p.coach_status_at end asc,
      case when status_group = 'waiting' then p.id end asc,
      p.coach_status_at desc, p.id desc
    limit n;
end
$$;

-- Owners: one coach's details and certificates for review.
create function public.admin_coach(coach uuid)
returns table (
  user_id uuid, email text, name text, status text, status_note text, status_at timestamptz, clients int, client_limit int,
  phone text, city text, years int, link text, answer text, certificates jsonb
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.need_owner();
  return query
    select p.id, u.email::text, p.full_name, p.coach_status, p.coach_status_note, p.coach_status_at,
      (select count(*)::int from public.coach_clients c where c.coach_id = p.id and c.status = 'active'),
      p.client_limit, coalesce(d.phone, ''), coalesce(d.city, ''), d.years, coalesce(d.link, ''), coalesce(d.answer, ''),
      coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'path', c.path) order by c.created_at)
        from public.coach_certificates c where c.coach_id = p.id), '[]'::jsonb)
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.coach_details d on d.coach_id = p.id
    where p.id = coach and p.role = 'coach';
  if not found then
    raise exception 'not a coach';
  end if;
end
$$;

-- Owners: approve, ask for more, decline, pause. The reason is also the note
-- the coach sees.
create function public.admin_coach_decision(coach uuid, decision text, why text) returns text
language plpgsql security definer set search_path = public as $$
declare
  old_status text;
  new_status text;
begin
  perform public.need_owner();
  select coach_status into old_status from public.profiles where id = coach and role = 'coach';
  if old_status is null then
    raise exception 'not a coach';
  end if;
  new_status := case decision
    when 'approve' then case when old_status <> 'approved' then 'approved' end
    when 'ask more' then case when old_status in ('waiting', 'needs more') then 'needs more' end
    when 'decline' then case when old_status in ('waiting', 'needs more') then 'not approved' end
    when 'pause' then case when old_status = 'approved' then 'paused' end
  end;
  if new_status is null then
    raise exception 'decision not valid';
  end if;
  perform public.write_admin_log('coach ' || decision, coach, why, jsonb_build_object('from', old_status, 'to', new_status));
  update public.profiles
    set coach_status = new_status, coach_status_note = trim(why), coach_status_at = now(), coach_status_seen = false
    where id = coach;
  return new_status;
end
$$;

create function public.admin_set_client_limit(coach uuid, new_limit int, why text) returns void
language plpgsql security definer set search_path = public as $$
declare
  old_limit int;
begin
  perform public.need_owner();
  select client_limit into old_limit from public.profiles where id = coach and role = 'coach';
  if old_limit is null then
    raise exception 'not a coach';
  end if;
  if new_limit is null or new_limit not between 1 and 500 then
    raise exception 'limit not valid';
  end if;
  perform public.write_admin_log('set client limit', coach, why, jsonb_build_object('from', old_limit, 'to', new_limit));
  update public.profiles set client_limit = new_limit where id = coach;
end
$$;

create function public.admin_set_switch(switch_key text, turn_on boolean, why text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.need_owner();
  if switch_key not in ('coach approval') or turn_on is null then
    raise exception 'switch not valid';
  end if;
  perform public.write_admin_log('set switch', null, why, jsonb_build_object('switch', switch_key, 'on', turn_on));
  update public.app_settings set value = to_jsonb(turn_on), changed_at = now() where key = switch_key;
end
$$;

revoke execute on function public.admin_coaches(text, timestamptz, uuid, int), public.admin_coach(uuid),
  public.admin_coach_decision(uuid, text, text), public.admin_set_client_limit(uuid, int, text),
  public.admin_set_switch(text, boolean, text) from public, anon;
grant execute on function public.admin_coaches(text, timestamptz, uuid, int), public.admin_coach(uuid),
  public.admin_coach_decision(uuid, text, text), public.admin_set_client_limit(uuid, int, text),
  public.admin_set_switch(text, boolean, text) to authenticated;
