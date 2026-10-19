-- Choose what your coach sees (spec T-096). Photos and health answers are
-- shared only when the person turns them on. Both are off at first, and
-- again after a link ends.

alter table public.coach_clients
  add column share_photos boolean not null default false,
  add column share_health boolean not null default false;

-- Health answers move to their own table, so row-level security can hide
-- them from a coach. Profiles keep everything else.
create table public.health_answers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  medical jsonb not null default '{}'::jsonb,
  other_health text not null default '' check (char_length(other_health) <= 500),
  updated_at timestamptz not null default now()
);
insert into public.health_answers (user_id, medical, other_health)
  select id, medical, other_health from public.profiles where medical <> '{}'::jsonb or other_health <> '';
alter table public.profiles drop column medical, drop column other_health;

-- True for the person, or their active coach when the person shares this part.
create function public.can_see_part(person uuid, part text) returns boolean
language sql stable security definer set search_path = public as $$
  select person = auth.uid() or (public.is_coach_of(person) and exists (
    select 1 from public.coach_clients
    where coach_id = auth.uid() and client_id = person and status = 'active'
      and case part when 'photos' then share_photos when 'health' then share_health else false end))
$$;
revoke execute on function public.can_see_part(uuid, text) from public, anon;
grant execute on function public.can_see_part(uuid, text) to authenticated;

alter table public.health_answers enable row level security;
grant select, insert, update on public.health_answers to authenticated;
create policy "read" on public.health_answers for select to authenticated using (public.can_see_part(user_id, 'health'));
create policy "write own" on public.health_answers for insert to authenticated with check (user_id = auth.uid());
create policy "change own" on public.health_answers for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "parent says yes first" on public.health_answers as restrictive for insert to authenticated
  with check (not public.needs_parent(auth.uid()));
create policy "parent says yes first (change)" on public.health_answers as restrictive for update to authenticated
  using (not public.needs_parent(auth.uid()));

-- Photos: the person, or a coach they share photos with.
drop policy "read" on public.progress_photos;
create policy "read" on public.progress_photos for select to authenticated using (public.can_see_part(user_id, 'photos'));
drop policy "progress photos: read" on storage.objects;
create policy "progress photos: read" on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.progress_photos p where p.path = storage.objects.name and public.can_see_part(p.user_id, 'photos'))
  ));

-- Only set_coach_shares changes the switches. An ended link turns them off,
-- so joining again starts with nothing extra shared.
create function public.keep_coach_shares() returns trigger
language plpgsql as $$
begin
  if current_user = 'authenticated' and (new.share_photos is distinct from old.share_photos or new.share_health is distinct from old.share_health) then
    raise exception 'only the client changes what is shared';
  end if;
  if new.status = 'ended' then
    new.share_photos := false;
    new.share_health := false;
  end if;
  return new;
end
$$;
create trigger coach_clients_keep_shares before update on public.coach_clients
  for each row execute function public.keep_coach_shares();

-- The client turns photos and health answers on or off for their coach.
create function public.set_coach_shares(link uuid, photos boolean, health boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.coach_clients set share_photos = photos, share_health = health
    where id = link and client_id = auth.uid() and status = 'active';
  if not found then
    raise exception 'not your coach';
  end if;
end
$$;
revoke execute on function public.set_coach_shares(uuid, boolean, boolean) from public, anon;
grant execute on function public.set_coach_shares(uuid, boolean, boolean) to authenticated;

-- Download my data: health answers now have their own key.
create or replace function public.export_my_data() returns jsonb
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
    'health_answers', (select to_jsonb(x) from health_answers x where x.user_id = me),
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
