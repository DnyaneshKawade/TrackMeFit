-- "I want to coach" (spec T-103). A person asks on the Account page; an
-- owner sees it under Requests and can make them a coach. Nobody needs a
-- second account.

alter table public.data_requests
  add column kind text not null default 'change' check (kind in ('change', 'coach'));

-- One open coach request a person at a time.
create unique index data_requests_one_coach_ask on public.data_requests (person_id) where kind = 'coach' and status = 'open';

grant insert (note, kind) on public.data_requests to authenticated;

-- Only people who aren't coaches yet, and are 18 or older, ask to coach.
create policy "coach asks from adult people" on public.data_requests as restrictive for insert to authenticated
  with check (kind = 'change' or exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'user' and p.birth_date <= current_date - interval '18 years'));

-- The owner's list, now with the kind of each request.
drop function public.admin_requests(text, timestamptz, uuid, int);
create function public.admin_requests(status_filter text default 'open', after_at timestamptz default null, after_id uuid default null, lim int default 50)
returns table (
  id uuid, person_id uuid, email text, name text, note text, status text, answer text,
  created_at timestamptz, closed_at timestamptz, days_left int, kind text
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.need_owner();
  if status_filter not in ('open', 'closed') then
    raise exception 'status not valid';
  end if;
  return query
    select r.id, r.person_id, u.email::text, coalesce(p.full_name, '')::text, r.note, r.status, r.answer, r.created_at, r.closed_at,
      90 - (extract(epoch from now() - r.created_at) / 86400)::int, r.kind
    from public.data_requests r
    join auth.users u on u.id = r.person_id
    left join public.profiles p on p.id = r.person_id
    where r.status = status_filter
      and (after_at is null
        or (status_filter = 'open' and (r.created_at, r.id) > (after_at, coalesce(after_id, '00000000-0000-0000-0000-000000000000'::uuid)))
        or (status_filter = 'closed' and (r.created_at, r.id) < (after_at, coalesce(after_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid))))
    order by
      case when status_filter = 'open' then r.created_at end asc,
      case when status_filter = 'open' then r.id end asc,
      r.created_at desc, r.id desc
    limit least(greatest(lim, 1), 100);
end
$$;

-- Owners: makes the person a coach and closes their request with the answer.
-- A client of another coach ends that link first, so data isn't shared by surprise.
create function public.admin_make_coach(request uuid, answer_text text) returns void
language plpgsql security definer set search_path = public as $$
declare
  person uuid;
begin
  perform public.need_owner();
  select person_id into person from public.data_requests where id = request and status = 'open' and kind = 'coach';
  if person is null then
    raise exception 'request not open';
  end if;
  if exists (select 1 from public.coach_clients where client_id = person and status <> 'ended') then
    raise exception 'they have a coach';
  end if;
  perform public.admin_set_role(person, 'coach', answer_text);
  perform public.admin_close_request(request, answer_text);
end
$$;

revoke execute on function public.admin_requests(text, timestamptz, uuid, int), public.admin_make_coach(uuid, text) from public, anon;
grant execute on function public.admin_requests(text, timestamptz, uuid, int), public.admin_make_coach(uuid, text) to authenticated;
