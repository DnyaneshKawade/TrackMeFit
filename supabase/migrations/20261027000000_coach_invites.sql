-- Coach invite codes (spec T-026a). A coach makes a code and shares it; the
-- person who enters it joins that coach. A code works once, for 7 days.
create table public.coach_invites (
  code text primary key default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  coach_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);
create index coach_invites_coach on public.coach_invites (coach_id);

alter table public.coach_invites enable row level security;

create policy "coach sees own codes" on public.coach_invites for select to authenticated using (coach_id = auth.uid());
create policy "coach makes codes" on public.coach_invites for insert to authenticated
  with check (coach_id = auth.uid() and public.is_coach());
create policy "coach removes codes" on public.coach_invites for delete to authenticated using (coach_id = auth.uid());

grant select, insert, delete on public.coach_invites to authenticated;

-- Joins the coach whose code this is. Ends any other coach link first, so a
-- person has one coach at a time. Returns the coach's name.
create function public.join_coach(invite_code text) returns text
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  coach uuid;
begin
  if me is null or exists (select 1 from public.profiles where id = me and role = 'coach') then
    raise exception 'invite not valid';
  end if;
  delete from public.coach_invites
    where code = upper(regexp_replace(invite_code, '[^a-zA-Z0-9]', '', 'g')) and expires_at > now() and coach_id <> me
    returning coach_id into coach;
  if coach is null then
    raise exception 'invite not valid';
  end if;
  update public.coach_clients set status = 'ended' where client_id = me and coach_id <> coach and status <> 'ended';
  insert into public.coach_clients (coach_id, client_id, status) values (coach, me, 'active')
    on conflict (coach_id, client_id) do update set status = 'active';
  return (select full_name from public.profiles where id = coach);
end
$$;

revoke execute on function public.join_coach(text) from public, anon;
grant execute on function public.join_coach(text) to authenticated;
