-- View as a person (T-042a4). An owner signs in as a person to see and fix a
-- problem they report. DK decided (18 Oct 2026): full access, the person is
-- not asked, and the view ends after 30 minutes with no activity. Each view
-- is saved here and in the admin log. The sign-in itself is made by the
-- admin-view Edge Function, only after admin_start_view allows it.

create table public.view_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id) on delete cascade,
  person_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (length(trim(reason)) > 0),
  started_at timestamptz not null default now(),
  last_active_at timestamptz,
  ended_at timestamptz
);
create index view_sessions_admin on public.view_sessions (admin_id, started_at desc);
create index view_sessions_person on public.view_sessions (person_id, started_at desc);

alter table public.view_sessions enable row level security;
revoke all on public.view_sessions from anon, authenticated;
grant select on public.view_sessions to authenticated;
create policy "owners read views" on public.view_sessions for select using (public.is_admin('owner'));

-- Starts a view: checks the owner, refuses unsafe targets, logs it, and
-- returns the view id and the person's email for the one-time sign-in.
create function public.admin_start_view(person uuid, why text)
returns table (view_id uuid, email text)
language plpgsql security definer set search_path = public as $$
declare
  person_email text;
  is_confirmed boolean;
  new_id uuid;
begin
  perform public.need_owner();
  select u.email, u.email_confirmed_at is not null into person_email, is_confirmed from auth.users u where u.id = person;
  if person_email is null then
    raise exception 'no such account';
  end if;
  if person = auth.uid() then
    raise exception 'not on yourself';
  end if;
  if exists (select 1 from public.user_roles where user_id = person) then
    raise exception 'admins cannot be viewed';
  end if;
  if not is_confirmed then
    raise exception 'email not confirmed';
  end if;
  perform public.write_admin_log('view as', person, why);
  -- One view at a time per owner.
  update public.view_sessions set ended_at = now() where admin_id = auth.uid() and ended_at is null;
  insert into public.view_sessions (admin_id, person_id, reason) values (auth.uid(), person, trim(why)) returning id into new_id;
  return query select new_id, person_email;
end
$$;

-- Ends a view, run by the owner once signed back in. The end time is the
-- last activity when the view ran out, or now for Exit.
create function public.admin_end_view(view uuid, last_active timestamptz default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.need_owner();
  update public.view_sessions
    set last_active_at = least(coalesce(last_active, now()), now()),
        ended_at = least(coalesce(last_active, now()), now())
    where id = view and admin_id = auth.uid() and ended_at is null;
end
$$;

revoke execute on function public.admin_start_view(uuid, text), public.admin_end_view(uuid, timestamptz) from public, anon;
grant execute on function public.admin_start_view(uuid, text), public.admin_end_view(uuid, timestamptz) to authenticated;
