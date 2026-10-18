-- Data requests (T-042a5). People download all their data and delete their
-- account themselves, as India's DPDP Act and both app stores expect. They
-- ask for a correction with a request that an owner answers within 90 days.

-- Deleting a coach used to fail when they had set a client's targets or
-- plans. Those rows belong to the client, so they stay with no coach name.
alter table public.diet_targets alter column set_by drop not null,
  drop constraint diet_targets_set_by_fkey,
  add constraint diet_targets_set_by_fkey foreign key (set_by) references public.profiles (id) on delete set null;
alter table public.check_ins drop constraint check_ins_replied_by_fkey,
  add constraint check_ins_replied_by_fkey foreign key (replied_by) references public.profiles (id) on delete set null;
alter table public.meal_plans alter column created_by drop not null,
  drop constraint meal_plans_created_by_fkey,
  add constraint meal_plans_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null;
alter table public.workout_plans alter column created_by drop not null,
  drop constraint workout_plans_created_by_fkey,
  add constraint workout_plans_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null,
  drop constraint workout_plans_updated_by_fkey,
  add constraint workout_plans_updated_by_fkey foreign key (updated_by) references public.profiles (id) on delete set null;

-- A person's request, such as "my weight from 3 Oct is wrong".
create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  note text not null check (length(trim(note)) between 1 and 1000),
  status text not null default 'open' check (status in ('open', 'closed')),
  answer text not null default '',
  closed_by uuid,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
-- The owner's list: open ones oldest first.
create index data_requests_status on public.data_requests (status, created_at, id);
create index data_requests_person on public.data_requests (person_id, created_at desc);

alter table public.data_requests enable row level security;
revoke all on public.data_requests from anon, authenticated;
grant select, insert (note) on public.data_requests to authenticated;
create policy "own requests" on public.data_requests for select to authenticated using (person_id = auth.uid());
create policy "ask for yourself" on public.data_requests for insert to authenticated with check (person_id = auth.uid());

-- Everything the signed-in person has, in one request. Every table that
-- holds a person's data is a key here; a test checks none is missing.
create function public.export_my_data() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  result jsonb;
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  select jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('email', u.email, 'phone', u.phone, 'joined_at', u.created_at) from auth.users u where u.id = me),
    'profiles', (select to_jsonb(x) from profiles x where x.id = me),
    'user_roles', (select to_jsonb(x) from user_roles x where x.user_id = me),
    'food_logs', (select coalesce(jsonb_agg(to_jsonb(x) order by x.logged_on, x.created_at), '[]') from food_logs x where x.user_id = me),
    'custom_foods', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from custom_foods x where x.owner_id = me),
    'meal_plans', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from meal_plans x where x.user_id = me),
    'diet_targets', (select coalesce(jsonb_agg(to_jsonb(x) order by x.starts_on), '[]') from diet_targets x where x.user_id = me),
    'weigh_ins', (select coalesce(jsonb_agg(to_jsonb(x) order by x.measured_on), '[]') from weigh_ins x where x.user_id = me),
    'measurements', (select coalesce(jsonb_agg(to_jsonb(x) order by x.measured_on), '[]') from measurements x where x.user_id = me),
    'progress_photos', (select coalesce(jsonb_agg(to_jsonb(x) order by x.taken_on), '[]') from progress_photos x where x.user_id = me),
    'workout_plans', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from workout_plans x where x.user_id = me),
    'plan_days', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from plan_days x join workout_plans p on p.id = x.plan_id where p.user_id = me),
    'plan_exercises', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from plan_exercises x join plan_days d on d.id = x.day_id
      join workout_plans p on p.id = d.plan_id where p.user_id = me),
    'workout_sessions', (select coalesce(jsonb_agg(to_jsonb(x) order by x.performed_on), '[]') from workout_sessions x where x.user_id = me),
    'set_logs', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from set_logs x join workout_sessions s on s.id = x.session_id where s.user_id = me),
    'muscle_feedback', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from muscle_feedback x join workout_sessions s on s.id = x.session_id where s.user_id = me),
    'custom_exercises', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from custom_exercises x where x.owner_id = me),
    'favourite_exercises', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from favourite_exercises x where x.user_id = me),
    'check_ins', (select coalesce(jsonb_agg(to_jsonb(x) order by x.week_start), '[]') from check_ins x where x.user_id = me),
    'coach_clients', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from coach_clients x where me in (x.coach_id, x.client_id)),
    'chat_messages', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from chat_messages x
      join coach_clients c on c.id = x.link_id where me in (c.coach_id, c.client_id)),
    'coach_invites', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from coach_invites x where x.coach_id = me),
    'coach_details', (select to_jsonb(x) from coach_details x where x.coach_id = me),
    'coach_certificates', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from coach_certificates x where x.coach_id = me),
    'data_requests', (select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at), '[]') from data_requests x where x.person_id = me)
  ) into result;
  return result;
end
$$;

-- Checked by the delete-account function before it deletes. An admin must
-- be removed as admin first, so there is always an owner.
create function public.prepare_delete_me() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if exists (select 1 from public.user_roles where user_id = auth.uid()) then
    raise exception 'remove them as admin first';
  end if;
end
$$;

revoke execute on function public.export_my_data(), public.prepare_delete_me() from public, anon;
grant execute on function public.export_my_data(), public.prepare_delete_me() to authenticated;

-- Owners: requests with one status, 50 at a time. Open ones come oldest
-- first with the days left out of 90; closed ones newest first.
create function public.admin_requests(status_filter text default 'open', after_at timestamptz default null, after_id uuid default null, lim int default 50)
returns table (
  id uuid, person_id uuid, email text, name text, note text, status text, answer text,
  created_at timestamptz, closed_at timestamptz, days_left int
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.need_owner();
  if status_filter not in ('open', 'closed') then
    raise exception 'status not valid';
  end if;
  return query
    select r.id, r.person_id, u.email::text, coalesce(p.full_name, '')::text, r.note, r.status, r.answer, r.created_at, r.closed_at,
      90 - (extract(epoch from now() - r.created_at) / 86400)::int
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

-- Owners: closes a request. The answer is shown to the person and logged.
create function public.admin_close_request(request uuid, answer_text text) returns void
language plpgsql security definer set search_path = public as $$
declare
  person uuid;
begin
  perform public.need_owner();
  select person_id into person from public.data_requests where id = request and status = 'open';
  if person is null then
    raise exception 'request not open';
  end if;
  perform public.write_admin_log('close request', person, answer_text, jsonb_build_object('request', request));
  update public.data_requests
    set status = 'closed', answer = trim(answer_text), closed_by = auth.uid(), closed_at = now()
    where id = request;
end
$$;

revoke execute on function public.admin_requests(text, timestamptz, uuid, int), public.admin_close_request(uuid, text) from public, anon;
grant execute on function public.admin_requests(text, timestamptz, uuid, int), public.admin_close_request(uuid, text) to authenticated;
