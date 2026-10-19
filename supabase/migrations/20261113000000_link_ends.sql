-- Tell the other side when a coach link ends (T-094). The database keeps
-- when a link ended and who ended it; people can't set these themselves.

alter table public.coach_clients add column ended_at timestamptz, add column ended_by uuid;

create function public.note_link_end() returns trigger
language plpgsql as $$
begin
  if new.status = 'ended' and old.status <> 'ended' then
    new.ended_at := now();
    -- Empty when the app or an owner ends it.
    new.ended_by := case when auth.uid() in (old.coach_id, old.client_id) then auth.uid() end;
  elsif new.status <> 'ended' then
    new.ended_at := null;
    new.ended_by := null;
  else
    new.ended_at := old.ended_at;
    new.ended_by := old.ended_by;
  end if;
  return new;
end
$$;
create trigger coach_clients_note_end before update on public.coach_clients
  for each row execute function public.note_link_end();

-- Links that ended in the last 30 days, for both sides, with the other
-- person's name. Ended links hide the other profile, so this reads it here.
create function public.recent_link_ends() returns table (link_id uuid, other_name text, ended_at timestamptz, ended_by_me boolean, ended_by_other boolean)
language sql stable security definer set search_path = public as $$
  select l.id,
         p.full_name,
         l.ended_at,
         l.ended_by = auth.uid(),
         l.ended_by is not null and l.ended_by <> auth.uid()
  from public.coach_clients l
  join public.profiles p on p.id = case when l.coach_id = auth.uid() then l.client_id else l.coach_id end
  where auth.uid() in (l.coach_id, l.client_id)
    and l.status = 'ended' and l.ended_at > now() - interval '30 days'
  order by l.ended_at desc
$$;
revoke execute on function public.recent_link_ends() from public, anon;
grant execute on function public.recent_link_ends() to authenticated;
